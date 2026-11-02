import { Schema, model } from 'mongoose';
const schema = new Schema(
  {
    weddingId: Schema.Types.ObjectId,
    guestGroupId: Schema.Types.ObjectId,
    membershipInviteId: Schema.Types.ObjectId,
    kind: {
      type: String,
      enum: [
        'MEMBER_INVITE',
        'GUEST_INVITE',
        'RSVP_CONFIRMATION',
        'RSVP_REMINDER',
        'EVENT_UPDATE',
        'PASSWORD_RESET',
      ],
      required: true,
    },
    recipientEmail: { type: String, required: true },
    dedupeKey: String,
    resendMessageId: String,
    status: {
      type: String,
      enum: ['PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN'],
      required: true,
      default: 'PENDING',
    },
    attemptCount: { type: Number, required: true, default: 0 },
    lastAttemptAt: Date,
    lastError: String,
    reminderWindow: String,
    claimedUntil: Date,
  },
  {
    collection: 'email_deliveries',
    timestamps: true,
    strict: 'throw',
    autoCreate: false,
    autoIndex: false,
  },
);
schema.index(
  { dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } },
);
schema.index({ weddingId: 1, kind: 1, createdAt: -1 });
schema.index({ status: 1, claimedUntil: 1 });
schema.index({ guestGroupId: 1, kind: 1, createdAt: -1 });
export const EmailDeliveryModel = model('EmailDelivery', schema);
