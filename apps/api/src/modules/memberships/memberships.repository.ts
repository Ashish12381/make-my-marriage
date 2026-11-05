import mongoose, { type ClientSession } from 'mongoose';
import type { MemberAccessInput, CreateMembershipInviteInput } from '@make-my-marriage/contracts';
import { WeddingMembership } from './models/wedding-membership.model.js';
import { MembershipInviteModel } from './models/membership-invite.model.js';
export const membershipsRepository = {
  async initialize() {
    await WeddingMembership.createCollection();
    await WeddingMembership.createIndexes();
    await MembershipInviteModel.createCollection();
    await MembershipInviteModel.createIndexes();
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
  transaction<T>(operation: (session: ClientSession) => Promise<T>) {
    return mongoose.connection.transaction(operation);
  },
  listMembers(weddingId: string) {
    return WeddingMembership.find({ weddingId, status: 'ACTIVE' })
      .sort({ joinedAt: 1, _id: 1 })
      .lean()
      .exec();
  },
  listInvites(weddingId: string) {
    return MembershipInviteModel.find({ weddingId }).sort({ createdAt: -1 }).lean().exec();
  },
  findMember(weddingId: string, id: string, session: ClientSession) {
    return WeddingMembership.findOne({ weddingId, _id: id, status: 'ACTIVE' })
      .session(session)
      .lean()
      .exec();
  },
  countAdmins(weddingId: string, session: ClientSession) {
    return WeddingMembership.countDocuments({
      weddingId,
      role: 'WEDDING_ADMIN',
      status: 'ACTIVE',
    }).session(session);
  },
  pendingInvite(weddingId: string, email: string, session: ClientSession) {
    return MembershipInviteModel.exists({
      weddingId,
      invitedEmailNormalized: email,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    }).session(session);
  },
  recentInvites(weddingId: string, session: ClientSession) {
    return MembershipInviteModel.countDocuments({
      weddingId,
      createdAt: { $gt: new Date(Date.now() - 3600000) },
    }).session(session);
  },
  async createInvite(
    weddingId: string,
    userId: string,
    input: CreateMembershipInviteInput,
    tokenHash: string,
    session: ClientSession,
  ) {
    const [invite] = await MembershipInviteModel.create(
      [
        {
          weddingId,
          invitedBy: userId,
          invitedEmailNormalized: input.email,
          role: input.role,
          permissions: { ...input.permissions, members: false },
          tokenHash,
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      ],
      { session },
    );
    return invite!;
  },
  findInviteToken(tokenHash: string, session?: ClientSession) {
    return MembershipInviteModel.findOne({ tokenHash })
      .session(session ?? null)
      .lean()
      .exec();
  },
  findInvite(weddingId: string, id: string, session: ClientSession) {
    return MembershipInviteModel.findOne({ weddingId, _id: id }).session(session).lean().exec();
  },
  async consumeInvite(
    id: string,
    status: 'ACCEPTED' | 'DECLINED' | 'REVOKED',
    session: ClientSession,
    userId?: string,
  ) {
    return MembershipInviteModel.updateOne(
      { _id: id, status: 'PENDING', expiresAt: { $gt: new Date() } },
      {
        $set: {
          status,
          ...(status === 'ACCEPTED' ? { acceptedBy: userId, acceptedAt: new Date() } : {}),
        },
      },
      { session },
    );
  },
  async activateMember(
    weddingId: string,
    userId: string,
    invite: { role: string; permissions?: unknown; invitedBy: unknown },
    session: ClientSession,
  ) {
    if (await WeddingMembership.exists({ weddingId, userId, status: 'ACTIVE' }).session(session))
      return;
    await WeddingMembership.findOneAndUpdate(
      { weddingId, userId },
      {
        $set: {
          role: invite.role,
          permissions: invite.permissions,
          status: 'ACTIVE',
          joinedAt: new Date(),
          invitedBy: invite.invitedBy,
        },
        $unset: { revokedAt: '' },
      },
      { upsert: true, session, runValidators: true },
    );
  },
  async changeMember(
    weddingId: string,
    id: string,
    access: MemberAccessInput | null,
    session: ClientSession,
  ) {
    await WeddingMembership.updateOne(
      { weddingId, _id: id, status: 'ACTIVE' },
      {
        $set: access
          ? { role: access.role, permissions: { ...access.permissions, members: false } }
          : { status: 'REVOKED', revokedAt: new Date() },
      },
      { session, runValidators: true },
    );
  },
};
