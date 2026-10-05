import { env } from '../env';

export class ApiError extends Error {
  constructor(public readonly response: Response) {
    super(`API request failed (${response.status} ${response.statusText}).`);
    this.name = 'ApiError';
  }
}

/** Return the native response so callers can validate their own shared DTO/schema. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('API paths must start with a single slash.');
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response);
  }

  return response;
}
