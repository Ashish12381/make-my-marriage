import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emailRepository } from '../src/modules/email/email.repository.js';
import { EmailDeliveryModel } from '../src/modules/email/models/email-delivery.model.js';
import { getResendConfiguration } from '../src/integrations/resend/index.js';
import { sendMembershipInvitation } from '../src/modules/email/email.service.js';
vi.mock('../src/integrations/resend/index.js', () => ({ getResendConfiguration: vi.fn() }));
vi.mock('../src/modules/email/email.repository.js', () => ({
  emailRepository: { initialize: vi.fn(), create: vi.fn(), sending: vi.fn(), finish: vi.fn() },
}));
const input = {
  weddingId: 'a'.repeat(24),
  inviteId: 'b'.repeat(24),
  email: 'parent@example.invalid',
  title: 'A & B',
  role: 'ORGANIZER',
  url: `https://example.invalid/invite/member/${'t'.repeat(43)}`,
};
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.mocked(emailRepository.initialize).mockResolvedValue();
  vi.stubGlobal('fetch', fetchMock);
  vi.mocked(getResendConfiguration).mockReturnValue({
    apiKey: 'test-key',
    fromEmail: 'sender@example.invalid',
  });
  vi.mocked(emailRepository.create).mockResolvedValue(
    new EmailDeliveryModel({ kind: 'MEMBER_INVITE', recipientEmail: input.email }),
  );
});
afterEach(() => vi.unstubAllGlobals());
describe('bounded membership email delivery', () => {
  it('records provider acceptance with an idempotency key and no stored bearer URL', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ id: 'provider-id' }));
    expect(await sendMembershipInvitation(input)).toBe('SENT');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Idempotency-Key': `member-invite/${input.inviteId}` }),
      }),
    );
    expect(emailRepository.finish).toHaveBeenLastCalledWith(
      expect.any(String),
      'SENT',
      'provider-id',
      undefined,
    );
    expect(JSON.stringify(vi.mocked(emailRepository.create).mock.calls)).not.toContain(input.url);
  });
  it('records missing provider settings without making a provider call', async () => {
    vi.mocked(getResendConfiguration).mockImplementationOnce(() => {
      throw new Error('not configured');
    });
    expect(await sendMembershipInvitation(input)).toBe('FAILED');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(emailRepository.sending).not.toHaveBeenCalled();
  });
  it.each([400, 429])(
    'records explicit provider rejection %s as failed without retrying',
    async (status) => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status }));
      expect(await sendMembershipInvitation(input)).toBe('FAILED');
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );
  it('keeps ambiguous timeout/network failure unknown rather than retrying blindly', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error with private details'));
    expect(await sendMembershipInvitation(input)).toBe('UNKNOWN');
    expect(emailRepository.finish).toHaveBeenLastCalledWith(
      expect.any(String),
      'UNKNOWN',
      undefined,
      'EMAIL_SEND_UNCONFIRMED',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it('treats server errors and malformed success responses as unknown', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ unexpected: true }));
    expect(await sendMembershipInvitation(input)).toBe('UNKNOWN');
    expect(await sendMembershipInvitation(input)).toBe('UNKNOWN');
  });
});
