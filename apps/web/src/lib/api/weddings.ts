import {
  csrfResponseSchema,
  weddingResponseSchema,
  weddingsResponseSchema,
  slugAvailabilityResponseSchema,
  type CreateWeddingInput,
  type UpdateWeddingInput,
} from '@make-my-marriage/contracts';
import { apiFetch } from './client';
async function weddingWrite(
  path: string,
  method: 'POST' | 'PATCH',
  body: CreateWeddingInput | UpdateWeddingInput,
) {
  const csrf = csrfResponseSchema.parse(
    await (await apiFetch('/auth/csrf', { cache: 'no-store' })).json(),
  ).data.csrfToken;
  const response = await apiFetch(path, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body),
  });
  return weddingResponseSchema.parse(await response.json()).data.wedding;
}
export const createWedding = (body: CreateWeddingInput) => weddingWrite('/weddings', 'POST', body);
export const updateWedding = (id: string, body: UpdateWeddingInput) =>
  weddingWrite(`/weddings/${id}`, 'PATCH', body);
export async function listWeddings(signal?: AbortSignal) {
  const response = await apiFetch('/weddings', {
    cache: 'no-store',
    ...(signal ? { signal } : {}),
  });
  return weddingsResponseSchema.parse(await response.json()).data.weddings;
}
export async function getWedding(id: string, signal?: AbortSignal) {
  const response = await apiFetch(`/weddings/${id}`, {
    cache: 'no-store',
    ...(signal ? { signal } : {}),
  });
  return weddingResponseSchema.parse(await response.json()).data.wedding;
}
export async function checkWeddingSlug(slug: string, signal?: AbortSignal) {
  const response = await apiFetch(`/weddings/slug-availability?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
    ...(signal ? { signal } : {}),
  });
  return slugAvailabilityResponseSchema.parse(await response.json()).data.available;
}
