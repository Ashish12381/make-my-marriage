import { describe, expect, it } from 'vitest';
import { createEventSchema, weddingEventSchema } from '@make-my-marriage/contracts';
import {
  eventFormInput,
  eventInstant,
  eventSchedule,
  groupEvents,
  isUpcomingEvent,
} from '../src/lib/events';
import { ApiError } from '../src/lib/api/client';
import { classifyEventsLoadError } from '../src/lib/api/events';

describe('Dashboard Events failures', () => {
  it('keeps the wedding available when the Events route is missing', async () => {
    const missingRoute = Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } },
      { status: 404 },
    );
    await expect(classifyEventsLoadError(new ApiError(missingRoute))).resolves.toBe('unavailable');
    const proxyResponse = new Response('<h1>Not Found</h1>', { status: 404 });
    await expect(classifyEventsLoadError(new ApiError(proxyResponse))).resolves.toBe('unavailable');
  });

  it('distinguishes wedding access loss from Events-only restrictions', async () => {
    const missingWedding = Response.json(
      { success: false, error: { code: 'WEDDING_NOT_FOUND', message: 'Wedding unavailable.' } },
      { status: 404 },
    );
    await expect(classifyEventsLoadError(new ApiError(missingWedding))).resolves.toBe(
      'access-rejected',
    );
    await expect(
      classifyEventsLoadError(new ApiError(new Response(null, { status: 401 }))),
    ).resolves.toBe('access-rejected');
    await expect(
      classifyEventsLoadError(new ApiError(new Response(null, { status: 403 }))),
    ).resolves.toBe('restricted');
  });
});

describe('Wedding event schedules', () => {
  const draft = {
    id: '507f1f77bcf86cd799439011',
    name: 'Sangeet',
    type: 'SANGEET',
    timezone: 'Asia/Kolkata',
    status: 'DRAFT',
    organizerIds: [],
  };
  it('omits stale form values when saving a venue-only edit after a refresh', () => {
    const fields = new FormData();
    fields.set('name', 'Original Sangeet');
    fields.set('description', 'Old description');
    fields.set('startAt', '2027-04-12T20:00');
    fields.set('address', 'Old address');
    fields.set('venue', 'New hall');
    const refreshed = weddingEventSchema.parse({
      ...draft,
      name: 'Renamed Sangeet',
      startAt: '2027-04-13T14:30:00.000Z',
      description: 'Updated description',
      venue: { name: 'Original hall', address: 'Updated address' },
    });
    expect(eventFormInput(fields, new Set(['venue']), draft.timezone, refreshed)).toEqual({
      venuePatch: { name: 'New hall' },
    });
    expect(eventFormInput(fields, new Set(), draft.timezone, refreshed)).toEqual({});
  });

  it('preserves displayed start and overnight end times when only the timezone changes', () => {
    const fields = new FormData();
    fields.set('timezone', 'America/New_York');
    fields.set('startAt', '2027-04-12T18:00');
    fields.set('endAt', '2027-04-13T01:00');
    const event = weddingEventSchema.parse({
      ...draft,
      startAt: '2027-04-12T12:30:00.000Z',
      endAt: '2027-04-12T19:30:00.000Z',
    });
    expect(eventFormInput(fields, new Set(['timezone']), draft.timezone, event)).toEqual({
      timezone: 'America/New_York',
      expectedTimezone: draft.timezone,
      startAt: '2027-04-12T22:00:00.000Z',
      endAt: '2027-04-13T05:00:00.000Z',
    });
  });

  it('sends explicitly cleared fields in an edit', () => {
    const fields = new FormData();
    const event = weddingEventSchema.parse({ ...draft, description: 'Old description' });
    expect(
      eventFormInput(
        fields,
        new Set(['description', 'endAt', 'address']),
        draft.timezone,
        event,
        [],
      ),
    ).toEqual({
      description: '',
      endAt: null,
      expectedTimezone: draft.timezone,
      organizerIds: [],
      venuePatch: { address: null },
    });
  });
  it('blocks stale schedule edits while allowing an organizer-only save', () => {
    const fields = new FormData();
    fields.set('startAt', '2027-04-12T18:00');
    const event = weddingEventSchema.parse({ ...draft, timezone: 'America/New_York' });
    expect(() => eventFormInput(fields, new Set(['startAt']), draft.timezone, event)).toThrow(
      /time zone changed/,
    );
    expect(eventFormInput(fields, new Set(), draft.timezone, event, [draft.id])).toEqual({
      organizerIds: [draft.id],
    });
  });
  it('converts wedding-local times and labels a next-day finish', () => {
    const startAt = eventInstant('2027-04-12T20:00', draft.timezone);
    const endAt = eventInstant('2027-04-13T01:00', draft.timezone);
    expect(startAt).toBe('2027-04-12T14:30:00.000Z');
    expect(endAt).toBe('2027-04-12T19:30:00.000Z');
    expect(
      eventSchedule(weddingEventSchema.parse({ ...draft, startAt, endAt, status: 'SCHEDULED' })),
    ).toContain('next day');
  });
  it('rejects skipped times and resolves repeated times in daylight saving zones', () => {
    expect(() => eventInstant('2027-03-14T02:30', 'America/New_York')).toThrow(/does not exist/);
    expect(eventInstant('2027-11-07T01:30', 'America/New_York')).toBe('2027-11-07T05:30:00.000Z');
  });
  it('groups an event under the same local date shown on its card', () => {
    const event = weddingEventSchema.parse({
      ...draft,
      timezone: 'America/New_York',
      startAt: '2027-12-24T04:15:00.000Z',
      status: 'SCHEDULED',
    });
    expect(groupEvents([event])).toEqual([['2027-12-23', [event]]]);
    expect(eventSchedule(event)).toContain('23 Dec 2027');
  });
  it('keeps drafts and cancelled events out of Upcoming even when a date is in the future', () => {
    const event = weddingEventSchema.parse({ ...draft, startAt: '2027-04-12T14:30:00.000Z' });
    const now = Date.parse('2027-04-10T00:00:00.000Z');
    expect(isUpcomingEvent(event, now)).toBe(false);
    expect(isUpcomingEvent({ ...event, status: 'CANCELLED' }, now)).toBe(false);
    expect(isUpcomingEvent({ ...event, status: 'SCHEDULED' }, now)).toBe(true);
  });
  it('only accepts HTTP and HTTPS map links', () => {
    expect(
      createEventSchema.safeParse({
        name: 'Sangeet',
        type: 'SANGEET',
        timezone: draft.timezone,
        venue: { mapUrl: 'javascript:alert(1)' },
      }).success,
    ).toBe(false);
  });
});
