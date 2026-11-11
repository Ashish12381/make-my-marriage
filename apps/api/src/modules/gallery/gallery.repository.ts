import type { ClientSession } from 'mongoose';
import { AlbumModel } from './models/album.model.js';

export const galleryRepository = {
  async initialize() {
    await AlbumModel.createCollection();
    await AlbumModel.createIndexes();
  },
  async ensureEventAlbum(
    weddingId: string,
    eventId: string,
    title: string,
    createdBy: string,
    session: ClientSession,
  ) {
    const album = await AlbumModel.findOneAndUpdate(
      { weddingId, eventId, type: 'EVENT', deletedAt: null },
      {
        $setOnInsert: {
          title,
          createdBy,
          visibility: 'ORGANIZERS_ONLY',
          guestUploadEnabled: false,
        },
      },
      { upsert: true, returnDocument: 'after', session, runValidators: true },
    );
    return album._id.toString();
  },
};
