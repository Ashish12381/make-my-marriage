import { Schema, model } from 'mongoose';

const venueSchema = new Schema(
  {
    name: String,
    address: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { _id: false, strict: 'throw' },
);
const weddingSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    brideName: { type: String, required: true, maxlength: 100 },
    groomName: { type: String, required: true, maxlength: 100 },
    coupleKey: { type: String, select: false },
    weddingDate: { type: String, required: true },
    timezone: { type: String, required: true },
    slug: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'SUSPENDED'],
      required: true,
      default: 'ACTIVE',
    },
    defaultVenue: { type: venueSchema, default: undefined },
    coverImageKey: String,
    guestAccessExpiryMode: {
      type: String,
      enum: ['DEFAULT', 'CUSTOM'],
      required: true,
      default: 'DEFAULT',
    },
    guestAccessExpiresAt: { type: Date, required: true },
    storageQuotaBytes: { type: Number, required: true, min: 0 },
    storageUsedBytes: { type: Number, required: true, default: 0, min: 0 },
    storageReservedBytes: { type: Number, required: true, default: 0, min: 0 },
    deletedAt: Date,
  },
  {
    collection: 'weddings',
    timestamps: true,
    strict: 'throw',
    autoCreate: false,
    autoIndex: false,
  },
);
weddingSchema.index({ slug: 1 }, { unique: true });
weddingSchema.index({ createdBy: 1, createdAt: -1 });
weddingSchema.index(
  { createdBy: 1, coupleKey: 1 },
  {
    name: 'unique_creator_couple',
    unique: true,
    partialFilterExpression: { coupleKey: { $type: 'string' }, deletedAt: null },
  },
);
weddingSchema.index({ status: 1 });
export const WeddingModel = model('Wedding', weddingSchema);
