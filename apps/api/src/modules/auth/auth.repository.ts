import type { Types } from 'mongoose';
import type { SignupInput } from '@make-my-marriage/contracts';
import { User } from './models/user.model.js';
import { Session } from './models/session.model.js';

export const authRepository = {
  async initialize() {
    await Promise.all([User.createCollection(), Session.createCollection()]);
    await Promise.all([User.createIndexes(), Session.createIndexes()]);
  },
  async createAccount(input: SignupInput, passwordHash: string) {
    return User.create({
      displayName: input.displayName,
      email: input.email,
      emailNormalized: input.email.toLowerCase(),
      passwordHash,
    });
  },
  async findByEmail(emailNormalized: string) {
    return User.findOne({ emailNormalized }).select('+passwordHash').exec();
  },
  async createSession(userId: Types.ObjectId, tokenHash: string, expiresAt: Date) {
    await Session.create({ userId, tokenHash, expiresAt });
    await User.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
  },
  async findSession(tokenHash: string, now: Date) {
    return Session.findOne({ tokenHash, expiresAt: { $gt: now }, revokedAt: null }).exec();
  },
  async findActiveUser(userId: Types.ObjectId) {
    return User.findOne({ _id: userId, status: 'ACTIVE' }).exec();
  },
  async revokeSession(tokenHash: string) {
    await Session.updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } });
  },
};
