export function suggestWeddingTitles(bride: string, groom: string): string[] {
  const brideName = bride.trim().split(/\s+/)[0];
  const groomName = groom.trim().split(/\s+/)[0];
  if (!brideName || !groomName) return [];
  const couple = `${brideName} & ${groomName}`;
  const suggestions = [
    `${couple}’s Wedding`,
    `Celebrating ${couple}`,
    `${couple} — Our Forever Begins`,
  ].filter((title) => title.length <= 120);
  return suggestions.length ? suggestions : ['Our Wedding', 'Our Forever Begins'];
}

export function suggestWeddingSlug(bride: string, groom: string) {
  return `${bride.split(' ')[0] ?? ''}-${groom.split(' ')[0] ?? ''}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');
}
export function formatWeddingDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
export function weddingCountdown(date: string, timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const days = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000,
  );
  if (days === 0) return 'It’s your wedding day!';
  return days > 0
    ? `${days} ${days === 1 ? 'day' : 'days'} to go`
    : `Celebrated ${-days} ${days === -1 ? 'day' : 'days'} ago`;
}
