import { Schema, model } from 'mongoose';
const websiteSettingsSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, required: true },
    published: { type: Boolean, required: true, default: false },
    templateId: { type: String, required: true, default: 'CLASSIC' },
    theme: {
      type: new Schema({ primaryColor: String, secondaryColor: String }, { _id: false }),
      default: () => ({}),
    },
    heroImageKey: String,
    welcomeMessage: String,
    coupleStory: String,
    privacy: {
      type: String,
      enum: ['PUBLIC', 'INVITATION_ONLY'],
      default: 'INVITATION_ONLY',
      required: true,
    },
    sections: {
      type: new Schema(
        Object.fromEntries(
          ['story', 'events', 'rsvp', 'gallery', 'livestream', 'venue'].map((key) => [
            key,
            { type: Boolean, required: true, default: false },
          ]),
        ),
        { _id: false },
      ),
      default: () => ({}),
      required: true,
    },
    contactInfo: {
      type: new Schema(
        { visible: { type: Boolean, required: true }, name: String, phone: String, email: String },
        { _id: false },
      ),
      default: undefined,
    },
  },
  {
    collection: 'website_settings',
    timestamps: true,
    strict: 'throw',
    autoCreate: false,
    autoIndex: false,
  },
);
websiteSettingsSchema.index({ weddingId: 1 }, { unique: true });
export const WebsiteSettings = model('WebsiteSettings', websiteSettingsSchema);
