import type { ClientSession } from 'mongoose';
import {
  createEventSchema,
  weddingEventSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from '@make-my-marriage/contracts';
import { AppError } from '../../common/errors/app-error.js';
import { recordEventLifecycle } from '../audit/audit.service.js';
import { initializeEventAlbums, ensureDefaultEventAlbum } from '../gallery/gallery.service.js';
import { requireWeddingFeature, validateActiveWeddingMembers } from '../memberships/index.js';
import {
  lockWeddingMembershipChanges,
  updateDefaultEventExpiry,
} from '../weddings/weddings.queries.js';
import { eventsRepository, finalScheduledEvent } from './events.repository.js';

let ready: Promise<void> | undefined;
export function initializeEvents() {
  ready ??= Promise.all([eventsRepository.initialize(), initializeEventAlbums()])
    .then(() => {})
    .catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  return ready;
}

type StoredEvent = NonNullable<Awaited<ReturnType<typeof eventsRepository.find>>>;
function publicEvent(event: StoredEvent) {
  const venue = event.venue;
  const coordinates = venue?.location?.coordinates;
  return weddingEventSchema.parse({
    id: event.id,
    name: event.name,
    type: event.type,
    description: event.description ?? undefined,
    timezone: event.timezone,
    startAt: event.startAt?.toISOString() ?? null,
    endAt: event.endAt?.toISOString() ?? null,
    venue: venue
      ? {
          name: venue.name ?? undefined,
          address: venue.address ?? undefined,
          mapUrl: venue.mapUrl ?? undefined,
          ...(coordinates?.length === 2
            ? { longitude: coordinates[0], latitude: coordinates[1] }
            : {}),
        }
      : null,
    organizerIds: event.organizerIds.map((id) => id.toString()),
    status: event.status,
  });
}

async function requireEvent(weddingId: string, eventId: string, session?: ClientSession) {
  const event = await eventsRepository.find(weddingId, eventId, session);
  if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'This event is unavailable.');
  return event;
}

function applyDetails(event: StoredEvent, input: CreateEventInput, status: string) {
  if (
    (!input.startAt && (input.endAt || status === 'SCHEDULED' || status === 'COMPLETED')) ||
    (input.startAt && input.endAt && Date.parse(input.endAt) <= Date.parse(input.startAt))
  ) {
    throw new AppError(
      422,
      'INVALID_EVENT_SCHEDULE',
      'Enter a start time before scheduling an event and an end time after its start.',
    );
  }
  const { venue, organizerIds, ...details } = input;
  event.set({
    ...details,
    status,
    organizerIds: [...new Set(organizerIds ?? [])],
    venue: venue
      ? {
          name: venue.name,
          address: venue.address,
          mapUrl: venue.mapUrl,
          ...(venue.latitude !== undefined && venue.longitude !== undefined
            ? { location: { type: 'Point', coordinates: [venue.longitude, venue.latitude] } }
            : {}),
        }
      : undefined,
  });
}

async function eventWrite<T>(
  weddingId: string,
  userId: string,
  operation: (session: ClientSession, role: 'WEDDING_ADMIN' | 'ORGANIZER') => Promise<T>,
) {
  await requireWeddingFeature(weddingId, userId, 'events');
  await initializeEvents();
  return eventsRepository.transaction(async (session) => {
    await lockWeddingMembershipChanges(weddingId, session);
    const access = await requireWeddingFeature(weddingId, userId, 'events', session);
    const result = await operation(session, access.role);
    await updateDefaultEventExpiry(
      weddingId,
      await finalScheduledEvent(weddingId, session),
      session,
    );
    return result;
  });
}

export const eventsService = {
  async list(weddingId: string, userId: string) {
    await requireWeddingFeature(weddingId, userId, 'events');
    return (await eventsRepository.list(weddingId)).map(publicEvent);
  },
  async get(weddingId: string, userId: string, eventId: string) {
    await requireWeddingFeature(weddingId, userId, 'events');
    return { event: publicEvent(await requireEvent(weddingId, eventId)) };
  },
  create(weddingId: string, userId: string, input: CreateEventInput) {
    return eventWrite(weddingId, userId, async (session) => {
      await validateActiveWeddingMembers(weddingId, input.organizerIds ?? [], session);
      const event = eventsRepository.newEvent(weddingId, userId);
      applyDetails(event, input, input.startAt ? 'SCHEDULED' : 'DRAFT');
      await event.save({ session });
      const defaultAlbumId = await ensureDefaultEventAlbum(
        weddingId,
        event.id,
        event.name,
        userId,
        session,
      );
      return { event: publicEvent(event), defaultAlbumId };
    });
  },
  update(weddingId: string, userId: string, eventId: string, input: UpdateEventInput) {
    return eventWrite(weddingId, userId, async (session, role) => {
      const event = await requireEvent(weddingId, eventId, session);
      if (event.status === 'CANCELLED') {
        if (input.status === 'CANCELLED' && Object.keys(input).length === 1)
          return { event: publicEvent(event) };
        throw new AppError(409, 'EVENT_CANCELLED', 'Cancelled events are available for reference.');
      }
      const { id: _id, status: previousStatus, ...current } = publicEvent(event);
      const { status, venuePatch, expectedTimezone, ...changes } = input;
      if (expectedTimezone !== undefined && expectedTimezone !== current.timezone) {
        throw new AppError(
          409,
          'EVENT_TIMEZONE_CHANGED',
          'The event time zone changed while you were editing. Close the editor, reload the event page, and review the schedule before saving.',
        );
      }
      if (venuePatch) {
        const venue = { ...current.venue };
        for (const key of ['name', 'address', 'mapUrl'] as const) {
          const value = venuePatch[key];
          if (value === null) delete venue[key];
          else if (value !== undefined) venue[key] = value;
        }
        changes.venue =
          venue.name || venue.address || venue.mapUrl || venue.latitude !== undefined
            ? venue
            : null;
      }
      const details = createEventSchema.parse({ ...current, ...changes });
      const timestamp = (value?: string | null) => (value ? Date.parse(value) : null);
      const scheduleChanged =
        timestamp(details.startAt) !== timestamp(current.startAt) ||
        timestamp(details.endAt) !== timestamp(current.endAt);
      const nextStatus =
        status ??
        (previousStatus === 'COMPLETED' || !scheduleChanged
          ? previousStatus
          : details.startAt
            ? 'SCHEDULED'
            : 'DRAFT');
      if (nextStatus === 'CANCELLED' && Object.keys(changes).length) {
        throw new AppError(
          422,
          'INVALID_EVENT_CHANGE',
          'Cancel the event separately from other changes.',
        );
      }
      if (changes.organizerIds !== undefined)
        await validateActiveWeddingMembers(weddingId, changes.organizerIds, session);
      applyDetails(event, details, nextStatus);
      await event.save({ session });
      if (nextStatus === 'CANCELLED')
        await recordEventLifecycle(weddingId, userId, role, eventId, 'EVENT_CANCELLED', session);
      return { event: publicEvent(event) };
    });
  },
  archive(weddingId: string, userId: string, eventId: string) {
    return eventWrite(weddingId, userId, async (session, role) => {
      const event = await requireEvent(weddingId, eventId, session);
      event.deletedAt = new Date();
      await event.save({ session });
      await recordEventLifecycle(weddingId, userId, role, eventId, 'EVENT_ARCHIVED', session);
    });
  },
};
