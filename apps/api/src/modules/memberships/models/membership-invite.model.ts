import { Schema, model } from 'mongoose';
const flags = Object.fromEntries(
  [
    'events',
    'tasks',
    'expenses',
    'vendors',
    'guests',
    'invitations',
    'gallery',
    'website',
    'livestream',
    'members',
  ].map((key) => [key, { type: Boolean, default: false, required: true }]),
);
const schema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    invitedEmailNormalized: { type: String, required: true, maxlength: 254 },
    role: { type: String, enum: ['WEDDING_ADMIN', 'ORGANIZER'], required: true },
    permissions: { type: new Schema(flags, { _id: false, strict: 'throw' }), default: () => ({}) },
    tokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED'],
      default: 'PENDING',
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, required: true },
    acceptedBy: Schema.Types.ObjectId,
    acceptedAt: Date,
  },
  {
    collection: 'membership_invites',
    timestamps: true,
    strict: 'throw',
    autoCreate: false,
    autoIndex: false,
  },
);
schema.index({ tokenHash: 1 }, { unique: true });
schema.index({ weddingId: 1, invitedEmailNormalized: 1, status: 1 });
export const MembershipInviteModel = model('MembershipInvite', schema);
