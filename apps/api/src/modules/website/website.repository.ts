import type { ClientSession } from 'mongoose';
import { WebsiteSettings } from './models/website-settings.model.js';
export const websiteRepository = {
  async initialize() {
    await WebsiteSettings.createCollection();
    await WebsiteSettings.createIndexes();
  },
  async createUnpublished(weddingId: string, session: ClientSession) {
    await WebsiteSettings.create([{ weddingId, published: false }], { session });
  },
};
