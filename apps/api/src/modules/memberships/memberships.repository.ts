import type { ClientSession } from 'mongoose';
import { WeddingMembership } from './models/wedding-membership.model.js';
export const membershipsRepository = {
  async initialize() {
    await WeddingMembership.createCollection();
    await WeddingMembership.createIndexes();
  },
  async createInitialAdmin(weddingId: string, userId: string, session: ClientSession) {
    await WeddingMembership.create(
      [{ weddingId, userId, role: 'WEDDING_ADMIN', status: 'ACTIVE', joinedAt: new Date() }],
      { session },
    );
  },
  async activeForUser(userId: string) {
    return WeddingMembership.find({ userId, status: 'ACTIVE' })
      .select('weddingId role')
      .lean()
      .exec();
  },
  async activeForWedding(weddingId: string, userId: string, session?: ClientSession) {
    return WeddingMembership.findOne({ weddingId, userId, status: 'ACTIVE' })
      .session(session ?? null)
      .lean()
      .exec();
  },
};
