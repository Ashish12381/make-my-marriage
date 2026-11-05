// Civil dates, not UTC-midnight instants. Binary search handles DST transitions.
export function defaultGuestExpiry(weddingDate: string, timezone: string): Date {
  const date = new Date(`${weddingDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 30);
  const target = date.toISOString().slice(0, 10);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const localDate = (instant: number) => {
    const parts = formatter.formatToParts(instant);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
  let low = date.getTime() - 36 * 3600000;
  let high = date.getTime() + 60 * 3600000;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (localDate(middle) <= target) low = middle + 1;
    else high = middle;
  }
  return new Date(low - 1);
}
