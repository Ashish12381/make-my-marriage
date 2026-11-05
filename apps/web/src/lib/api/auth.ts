import {
  apiErrorSchema,
  authResponseSchema,
  csrfResponseSchema,
  type LoginInput,
  type SignupInput,
} from '@make-my-marriage/contracts';
import { apiFetch, ApiError } from './client';
import { notifySessionChanged } from '../auth/session-events';
export async function getCurrentUser(signal?: AbortSignal) {
  const response = await apiFetch('/auth/me', { cache: 'no-store', ...(signal ? { signal } : {}) });
  return authResponseSchema.parse(await response.json()).data.user;
}
async function authWrite(path: string, body?: SignupInput | LoginInput) {
  const csrfResponse = await apiFetch('/auth/csrf', { cache: 'no-store' });
  const { csrfToken } = csrfResponseSchema.parse(await csrfResponse.json()).data;
  return apiFetch(`/auth/${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
export async function submitAuth(mode: 'login' | 'signup', body: LoginInput | SignupInput) {
  const response = await authWrite(mode, body);
  const user = authResponseSchema.parse(await response.json()).data.user;
  notifySessionChanged();
  return user;
}
export async function signOut() {
  await authWrite('logout');
  notifySessionChanged();
}
export async function authErrorMessage(
  error: unknown,
  fallback = 'We could not reach the account service. Please try again.',
): Promise<{ message: string; fields: Record<string, string> }> {
  if (error instanceof ApiError) {
    try {
      const result = apiErrorSchema.safeParse(await error.response.json());
      if (result.success)
        return {
          message: result.data.error.message,
          fields: Object.fromEntries(
            (result.data.error.details ?? []).map((item) => [
              item.path.replace(/^body\./, ''),
              item.message,
            ]),
          ),
        };
    } catch {
      /* Unexpected response bodies get the safe fallback below. */
    }
  }
  return { message: fallback, fields: {} };
}
