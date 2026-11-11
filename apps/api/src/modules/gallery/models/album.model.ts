import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    eventId: Schema.Types.ObjectId,
    type: { type: String, enum: ['EVENT', 'CUSTOM'], required: true },
    title: { type: String, required: true },
    description: String,
    coverMediaAssetId: Schema.Types.ObjectId,
    visibility: {
      type: String,
      enum: ['PUBLIC', 'INVITED_GUESTS', 'ORGANIZERS_ONLY'],
      required: true,
    },
    guestUploadEnabled: { type: Boolean, required: true },
    sharedUploadTokenHash: String,
    sharedUploadExpiresAt: Date,
    createdBy: { type: Schema.Types.ObjectId, required: true },
    deletedAt: Date,
  },
  { collection: 'albums', timestamps: true, strict: 'throw', autoCreate: false, autoIndex: false },
);
schema.index({ weddingId: 1, eventId: 1 });
schema.index({ weddingId: 1, visibility: 1 });
schema.index(
  { weddingId: 1, eventId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'EVENT', deletedAt: null },
  },
);
export const AlbumModel = model('Album', schema);
