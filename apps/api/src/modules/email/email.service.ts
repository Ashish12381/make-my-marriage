import { z } from 'zod';
import { getResendConfiguration } from '../../integrations/resend/index.js';
import { emailRepository } from './email.repository.js';

let ready: Promise<void> | undefined;
export async function sendMembershipInvitation(input: {
  weddingId: string;
  inviteId: string;
  email: string;
  title: string;
  url: string;
  role: string;
}): Promise<'SENT' | 'FAILED' | 'UNKNOWN'> {
  ready ??= emailRepository.initialize().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  await ready;
  const delivery = await emailRepository.create(input.weddingId, input.inviteId, input.email);
  const id = delivery._id.toString();
  let config: ReturnType<typeof getResendConfiguration>;
  try {
    config = getResendConfiguration();
  } catch {
    await emailRepository.finish(id, 'FAILED', undefined, 'EMAIL_NOT_CONFIGURED');
    return 'FAILED';
  }
  await emailRepository.sending(id);
  let status: 'SENT' | 'FAILED' | 'UNKNOWN' = 'UNKNOWN';
  let messageId: string | undefined;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `member-invite/${input.inviteId}`,
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [input.email],
        subject: 'Your Make My Marriage team invitation',
        text: `You have been invited to help plan ${input.title} as ${input.role === 'WEDDING_ADMIN' ? 'a Wedding Admin' : 'an Organizer'}.\n\nSign in or create an account using the email address that received this invitation, then accept or decline using this private link:\n${input.url}\n\nThis link expires in seven days. Acceptance requires this link and a signed-in account with the invited email address; keep the link private. If you were not expecting this invitation, you can ignore it.`,
      }),
    });
    if (response.ok) {
      messageId = z.object({ id: z.string().min(1) }).parse(await response.json()).id;
      status = 'SENT';
    } else status = response.status >= 500 ? 'UNKNOWN' : 'FAILED';
  } catch {
    status = 'UNKNOWN';
  }
  await emailRepository.finish(
    id,
    status,
    messageId,
    status === 'SENT' ? undefined : 'EMAIL_SEND_UNCONFIRMED',
  );
  return status;
}
