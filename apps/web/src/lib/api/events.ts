import {
  apiErrorSchema,
  csrfResponseSchema,
  eventResponseSchema,
  eventsResponseSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from '@make-my-marriage/contracts';
import { ApiError, apiFetch } from './client';

export async function classifyEventsLoadError(
  error: unknown,
): Promise<'access-rejected' | 'restricted' | 'unavailable'> {
  if (!(error instanceof ApiError)) return 'unavailable';
  const { status } = error.response;
  if (status === 401) return 'access-rejected';
  if (status === 403) return 'restricted';
  if (status === 404) {
    // An older API can return a route-level 404 for Events while the wedding remains accessible.
    const body: unknown = await error.response.json().catch(() => null);
    const result = apiErrorSchema.safeParse(body);
    if (
      result.success &&
      ['WEDDING_NOT_FOUND', 'EVENT_NOT_FOUND'].includes(result.data.error.code)
    ) {
      return 'access-rejected';
    }
  }
  return 'unavailable';
}

const path = (weddingId: string) => '/weddings/' + encodeURIComponent(weddingId) + '/events';
const eventPath = (weddingId: string, id: string) => path(weddingId) + '/' + encodeURIComponent(id);
export async function listEvents(weddingId: string, signal?: AbortSignal) {
  const response = await apiFetch(path(weddingId), { cache: 'no-store', signal: signal ?? null });
  return eventsResponseSchema.parse(await response.json()).data.events;
}
export async function getEvent(weddingId: string, id: string, signal?: AbortSignal) {
  const response = await apiFetch(eventPath(weddingId, id), {
    cache: 'no-store',
    signal: signal ?? null,
  });
  return eventResponseSchema.parse(await response.json()).data.event;
}
async function write(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: CreateEventInput | UpdateEventInput,
) {
  const csrf = csrfResponseSchema.parse(
    await (await apiFetch('/auth/csrf', { cache: 'no-store' })).json(),
  ).data.csrfToken;
  return apiFetch(url, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: body ? JSON.stringify(body) : null,
  });
}
export async function saveEvent(
  weddingId: string,
  input: CreateEventInput | UpdateEventInput,
  id?: string,
) {
  const response = id
    ? await write(eventPath(weddingId, id), 'PATCH', input)
    : await write(path(weddingId), 'POST', input);
  return eventResponseSchema.parse(await response.json()).data.event;
}
export async function archiveEvent(weddingId: string, id: string) {
  await write(eventPath(weddingId, id), 'DELETE');
}
