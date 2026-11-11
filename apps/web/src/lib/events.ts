import {
  timezoneSchema,
  type UpdateEventInput,
  type WeddingEvent,
} from '@make-my-marriage/contracts';

export function eventFormInput(
  fields: FormData,
  edited: ReadonlySet<string>,
  displayedZone: string,
  event?: WeddingEvent,
  organizerIds?: string[],
): UpdateEventInput {
  const field = (name: string) => String(fields.get(name) ?? '').trim();
  const include = (name: string) => !event || edited.has(name);
  const input: UpdateEventInput = {};
  if (include('name')) input.name = field('name');
  if (include('type')) input.type = field('type') as WeddingEvent['type'];
  if (include('description')) input.description = field('description');
  if (include('timezone')) {
    const result = timezoneSchema.safeParse(field('timezone'));
    if (!result.success) throw new Error('Enter a valid time zone, such as Asia/Kolkata.');
    if (!event || result.data !== displayedZone) input.timezone = result.data;
  }
  const timezoneChanged = input.timezone !== undefined && input.timezone !== displayedZone;
  if (event && (timezoneChanged || edited.has('startAt') || edited.has('endAt'))) {
    if (event.timezone !== displayedZone) {
      throw new Error(
        'The event time zone changed while you were editing. Close the editor, reload the event page, and review the schedule before saving.',
      );
    }
    input.expectedTimezone = displayedZone;
  }
  for (const key of ['startAt', 'endAt'] as const) {
    if (!include(key) && !timezoneChanged) continue;
    const value = field(key);
    const original = event?.[key];
    input[key] =
      !timezoneChanged && original && value === localEventTime(original, displayedZone)
        ? original
        : value
          ? eventInstant(value, input.timezone ?? displayedZone)
          : null;
  }
  if (input.startAt !== undefined || input.endAt !== undefined) {
    const startAt = input.startAt === undefined ? event?.startAt : input.startAt;
    const endAt = input.endAt === undefined ? event?.endAt : input.endAt;
    if (endAt && (!startAt || Date.parse(endAt) <= Date.parse(startAt))) {
      throw new Error('Enter a start time and choose an end time after it.');
    }
  }
  if (!event) {
    const venue = {
      name: field('venue') || undefined,
      address: field('address') || undefined,
      mapUrl: field('mapUrl') || undefined,
    };
    input.venue = venue.name || venue.address || venue.mapUrl ? venue : null;
  } else {
    const venuePatch: NonNullable<UpdateEventInput['venuePatch']> = {};
    if (include('venue')) venuePatch.name = field('venue') || null;
    if (include('address')) venuePatch.address = field('address') || null;
    if (include('mapUrl')) venuePatch.mapUrl = field('mapUrl') || null;
    if (Object.keys(venuePatch).length) input.venuePatch = venuePatch;
  }
  if (organizerIds !== undefined) input.organizerIds = organizerIds;
  return input;
}

export const eventTypes = {
  HALDI: { label: 'Haldi', icon: '✺' },
  MEHENDI: { label: 'Mehendi', icon: '❋' },
  SANGEET: { label: 'Sangeet', icon: '♫' },
  WEDDING: { label: 'Wedding Ceremony', icon: '♡' },
  RECEPTION: { label: 'Reception', icon: '✦' },
  CUSTOM: { label: 'Custom', icon: '◇' },
};

export function localEventTime(instant: string | number, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value;
  return `${part('year')?.padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function eventInstant(local: string, timezone: string) {
  const wallClock = Date.parse(local + 'Z');
  if (!Number.isFinite(wallClock)) throw new Error('Enter a valid date and time.');
  // Sample both sides of a possible clock change. Pick the earlier instant for repeated times.
  const candidates = [-1, 0, 1]
    .map((day) => {
      const sample = wallClock + day * 86400000;
      const offset = Date.parse(localEventTime(sample, timezone) + 'Z') - sample;
      return wallClock - offset;
    })
    .filter((instant) => localEventTime(instant, timezone) === local);
  if (!candidates.length)
    throw new Error('That local time does not exist in this time zone. Choose another time.');
  return new Date(Math.min(...candidates)).toISOString();
}

export function groupEvents(events: WeddingEvent[]) {
  const days = new Map<string, WeddingEvent[]>();
  for (const event of events) {
    const date = event.startAt ? localEventTime(event.startAt, event.timezone).slice(0, 10) : '';
    const group = days.get(date) ?? [];
    group.push(event);
    days.set(date, group);
  }
  return [...days].sort(([first], [second]) =>
    first === '' ? 1 : second === '' ? -1 : first.localeCompare(second),
  );
}

export function eventSchedule(event: WeddingEvent) {
  if (!event.startAt) return 'Date to be decided';
  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: event.timezone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: event.timezone,
    hour: 'numeric',
    minute: '2-digit',
  });
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;
  const day = date.format(start);
  if (!end) return day + ' · ' + time.format(start);
  const endDay = date.format(end);
  const nextDate = new Date(localEventTime(event.startAt, event.timezone).slice(0, 10) + 'T00:00Z');
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const nextDay =
    localEventTime(end.getTime(), event.timezone).slice(0, 10) ===
    nextDate.toISOString().slice(0, 10);
  return (
    day +
    ' · ' +
    time.format(start) +
    ' – ' +
    (endDay !== day && !nextDay ? endDay + ', ' : '') +
    time.format(end) +
    (nextDay ? ' next day' : '')
  );
}

export function isUpcomingEvent(event: WeddingEvent, now = Date.now()) {
  return (
    event.status === 'SCHEDULED' &&
    !!event.startAt &&
    Date.parse(event.endAt ?? event.startAt) >= now
  );
}
