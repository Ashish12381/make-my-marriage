import { Schema, model } from 'mongoose';
const permissions = Object.fromEntries(
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
const membershipSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ['WEDDING_ADMIN', 'ORGANIZER'], required: true },
    permissions: {
      type: new Schema(permissions, { _id: false, strict: 'throw' }),
      required: true,
      default: () => ({}),
    },
    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE', required: true },
    joinedAt: Date,
    revokedAt: Date,
    invitedBy: Schema.Types.ObjectId,
  },
  {
    collection: 'wedding_memberships',
    timestamps: true,
    strict: 'throw',
    autoCreate: false,
    autoIndex: false,
  },
);
membershipSchema.index({ weddingId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1, status: 1 });
membershipSchema.index({ weddingId: 1, role: 1, status: 1 });
export const WeddingMembership = model('WeddingMembership', membershipSchema);
