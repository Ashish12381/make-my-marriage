import { emailRepository } from './email.repository.js';
export async function membershipDeliveryStatuses(weddingId: string, inviteIds: string[]) {
  const rows = await emailRepository.statusForInvites(weddingId, inviteIds);
  return new Map(
    rows
      .filter((row) => row.membershipInviteId)
      .map((row) => [row.membershipInviteId!.toString(), row.status]),
  );
}
