import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { authResponseSchema } from '@make-my-marriage/contracts';
import { env } from '../env';

// Only the API can validate a session. Never infer authentication from cookie presence.
export const getServerUser = cache(async () => {
  const token = (await cookies()).get('mmm_session')?.value;
  if (!token) return null;
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
      headers: { Cookie: `mmm_session=${encodeURIComponent(token)}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const result = authResponseSchema.safeParse(await response.json());
    return result.success ? result.data.data.user : null;
  } catch {
    // Public pages remain available when the account service is unavailable.
    return null;
  }
});
