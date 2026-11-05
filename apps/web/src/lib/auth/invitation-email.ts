import 'server-only';
import { membershipInvitePreviewSchema } from '@make-my-marriage/contracts';
import { env } from '../env';
import { invitationReturnPath } from './return-path';

export async function getInvitationEmail(returnTo: string): Promise<string> {
  const path = invitationReturnPath(returnTo);
  if (path === '/') return '';
  const token = path.split('/').at(-1)!;
  try {
    const response = await fetch(`${env.apiBaseUrl}/membership-invites/${token}/preview`, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return '';
    const result = membershipInvitePreviewSchema.safeParse(await response.json());
    return result.success ? result.data.data.invitedEmail : '';
  } catch {
    // Keep authentication available if the invitation cannot be checked.
    return '';
  }
}
