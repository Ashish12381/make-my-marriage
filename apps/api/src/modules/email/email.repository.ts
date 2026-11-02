import { EmailDeliveryModel } from './models/email-delivery.model.js';
export const emailRepository = {
  statusForInvites(weddingId: string, inviteIds: string[]) {
    return EmailDeliveryModel.find({
      weddingId,
      kind: 'MEMBER_INVITE',
      membershipInviteId: { $in: inviteIds },
    })
      .select('membershipInviteId status')
      .lean()
      .exec();
  },
  async initialize() {
    await EmailDeliveryModel.createCollection();
    await EmailDeliveryModel.createIndexes();
  },
  async create(weddingId: string, inviteId: string, email: string) {
    return EmailDeliveryModel.create({
      weddingId,
      membershipInviteId: inviteId,
      recipientEmail: email,
      kind: 'MEMBER_INVITE',
      dedupeKey: `member-invite/${inviteId}`,
    });
  },
  async sending(id: string) {
    await EmailDeliveryModel.updateOne(
      { _id: id, status: 'PENDING' },
      { $set: { status: 'SENDING', lastAttemptAt: new Date() }, $inc: { attemptCount: 1 } },
    );
  },
  async finish(
    id: string,
    status: 'SENT' | 'FAILED' | 'UNKNOWN',
    messageId?: string,
    error?: string,
  ) {
    await EmailDeliveryModel.updateOne(
      { _id: id },
      { $set: { status, resendMessageId: messageId, lastError: error } },
    );
  },
};
