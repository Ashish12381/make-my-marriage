import { Schema, model } from 'mongoose';
import { eventStatusSchema, eventTypeSchema } from '@make-my-marriage/contracts';

const venue = new Schema(
  {
    name: String,
    address: String,
    mapUrl: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { _id: false, strict: 'throw' },
);

const schema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: eventTypeSchema.options, required: true },
    description: String,
    startAt: Date,
    endAt: Date,
    timezone: { type: String, required: true },
    venue,
    organizerIds: { type: [Schema.Types.ObjectId], default: [] },
    status: { type: String, enum: eventStatusSchema.options, required: true },
    livestream: { enabled: { type: Boolean, default: false }, youtubeUrl: String },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    deletedAt: Date,
  },
  { collection: 'events', timestamps: true, strict: 'throw', autoCreate: false, autoIndex: false },
);
schema.index({ weddingId: 1, startAt: 1 });
schema.index({ weddingId: 1, status: 1 });
export const EventModel = model('WeddingEvent', schema);
