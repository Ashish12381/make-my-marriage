import { AppError } from '../../common/errors/app-error.js';
import { membershipsRepository } from './memberships.repository.js';
import { createHash, randomBytes } from 'node:crypto';
import type { ClientSession } from 'mongoose';
import {
  type WeddingRole,
  type OrganizerPermission,
  type CreateMembershipInviteInput,
  type MemberAccessInput,
} from '@make-my-marriage/contracts';
import { publicPermissions } from './memberships.permissions.js';
import { getMemberProfiles, getUserIdForInvite } from '../auth/auth.queries.js';
import {
  requireActiveWedding,
  lockWeddingMembershipChanges,
} from '../weddings/weddings.queries.js';
import { recordMembershipChange } from '../audit/index.js';
import { sendMembershipInvitation } from '../email/email.public.js';
import { membershipDeliveryStatuses } from '../email/email.queries.js';
import { env } from '../../config/env.js';
let ready: Promise<void> | undefined;
export const initializeMemberships = () => {
  ready ??= membershipsRepository.initialize().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  return ready;
};
export const createInitialWeddingAdmin = membershipsRepository.createInitialAdmin;
export async function listActiveWeddingMemberships(userId: string) {
  const memberships = await membershipsRepository.activeForUser(userId);
  return memberships.map((member) => ({
    weddingId: member.weddingId.toString(),
    role: member.role as WeddingRole,
  }));
}
export async function requireWeddingMembership(weddingId: string, userId: string) {
  const membership = await membershipsRepository.activeForWedding(weddingId, userId);
  if (!membership)
    throw new AppError(
      404,
      'WEDDING_NOT_FOUND',
      'This wedding is unavailable or you do not have access.',
    );
  return {
    role: membership.role as WeddingRole,
    permissions: publicPermissions(membership.permissions),
  };
}

export async function requireWeddingFeature(
  weddingId: string,
  userId: string,
  feature: OrganizerPermission,
) {
  await requireActiveWedding(weddingId);
  const membership = await requireWeddingMembership(weddingId, userId);
  if (membership.role !== 'WEDDING_ADMIN' && !membership.permissions[feature])
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this area.');
  return membership;
}
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
function usable(invite: Awaited<ReturnType<typeof membershipsRepository.findInviteToken>>) {
  if (!invite || invite.status === 'REVOKED' || invite.expiresAt <= new Date())
    throw new AppError(
      410,
      'INVITE_UNAVAILABLE',
      'This invitation is invalid, expired or revoked. Ask a Wedding Admin for a new invitation.',
    );
  if (invite.status !== 'PENDING')
    throw new AppError(
      409,
      'INVITE_ALREADY_USED',
      'This invitation has already been used. Check My Weddings if you accepted it.',
    );
  return invite;
}
function publicInvite(
  invite: NonNullable<Awaited<ReturnType<typeof membershipsRepository.findInviteToken>>>,
) {
  return {
    id: invite._id.toString(),
    email: invite.invitedEmailNormalized,
    role: invite.role,
    permissions: publicPermissions(invite.permissions),
    status:
      invite.status === 'PENDING' && invite.expiresAt <= new Date() ? 'EXPIRED' : invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
  };
}
async function admin(weddingId: string, userId: string, session?: ClientSession) {
  const member = await membershipsRepository.activeForWedding(weddingId, userId, session);
  if (!member)
    throw new AppError(
      404,
      'WEDDING_NOT_FOUND',
      'This wedding is unavailable or you do not have access.',
    );
  if (member.role !== 'WEDDING_ADMIN')
    throw new AppError(403, 'FORBIDDEN', 'Only Wedding Admins can manage the team.');
}
export const membershipService = {
  async list(weddingId: string, userId: string) {
    const access = await requireWeddingMembership(weddingId, userId);
    await requireActiveWedding(weddingId);
    const rows = await membershipsRepository.listMembers(weddingId);
    const profiles = await getMemberProfiles(rows.map((row) => row.userId.toString()));
    const users = new Map(profiles.map((profile) => [profile._id.toString(), profile]));
    return {
      currentUserId: userId,
      role: access.role,
      members: rows.map((row) => {
        const profile = users.get(row.userId.toString());
        const showAccess = access.role === 'WEDDING_ADMIN' || row.userId.toString() === userId;
        return {
          id: row._id.toString(),
          userId: row.userId.toString(),
          displayName: profile?.displayName ?? 'Unavailable account',
          role: row.role,
          ...(showAccess
            ? { email: profile?.email, permissions: publicPermissions(row.permissions) }
            : {}),
        };
      }),
    };
  },
  async invites(weddingId: string, userId: string) {
    await admin(weddingId, userId);
    await requireActiveWedding(weddingId);
    const rows = await membershipsRepository.listInvites(weddingId);
    const delivery = await membershipDeliveryStatuses(
      weddingId,
      rows.map((row) => row._id.toString()),
    );
    return rows.map((row) => ({
      ...publicInvite(row),
      emailStatus: delivery.get(row._id.toString()) ?? 'UNKNOWN',
    }));
  },
  async create(weddingId: string, userId: string, input: CreateMembershipInviteInput) {
    const token = randomBytes(32).toString('base64url');
    const result = await membershipsRepository.transaction(async (session) => {
      const wedding = await lockWeddingMembershipChanges(weddingId, session);
      await admin(weddingId, userId, session);
      const existingUser = await getUserIdForInvite(input.email, session);
      if (
        existingUser &&
        (await membershipsRepository.activeForWedding(weddingId, existingUser, session))
      )
        throw new AppError(
          409,
          'ALREADY_A_MEMBER',
          'This person is already a member of this wedding.',
        );
      if (await membershipsRepository.pendingInvite(weddingId, input.email, session))
        throw new AppError(
          409,
          'INVITE_PENDING',
          'A pending invitation already exists for this email.',
        );
      if ((await membershipsRepository.recentInvites(weddingId, session)) >= 20)
        throw new AppError(
          429,
          'INVITE_RATE_LIMIT',
          'Too many invitations were created for this wedding. Please try again later.',
        );
      const invite = await membershipsRepository.createInvite(
        weddingId,
        userId,
        input,
        hashToken(token),
        session,
      );
      await recordMembershipChange(
        weddingId,
        userId,
        'MEMBER_INVITED',
        invite._id.toString(),
        session,
      );
      return { invite: publicInvite(invite.toObject()), title: wedding.title };
    });
    // Provider calls must never run inside a retried database transaction.
    let emailStatus: 'SENT' | 'FAILED' | 'UNKNOWN' = 'UNKNOWN';
    try {
      emailStatus = await sendMembershipInvitation({
        weddingId,
        inviteId: result.invite.id,
        email: input.email,
        title: result.title,
        role: input.role,
        url: `${new URL(env.WEB_ORIGIN).origin}/invite/member/${token}`,
      });
    } catch {
      /* Creation succeeded; delivery could not be confirmed. */
    }
    return { invite: result.invite, emailStatus };
  },
  async preview(token: string) {
    const invite = usable(await membershipsRepository.findInviteToken(hashToken(token)));
    const wedding = await requireActiveWedding(invite.weddingId.toString());
    return {
      weddingId: wedding.id,
      invitedEmail: invite.invitedEmailNormalized,
      accountExists: Boolean(await getUserIdForInvite(invite.invitedEmailNormalized)),
      title: wedding.title,
      role: invite.role,
      permissions: publicPermissions(invite.permissions),
      expiresAt: invite.expiresAt.toISOString(),
    };
  },
  async respond(token: string, status: 'ACCEPTED' | 'DECLINED', userId?: string) {
    if (status === 'ACCEPTED' && !userId)
      throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to accept this invitation.');
    const snapshot = usable(await membershipsRepository.findInviteToken(hashToken(token)));
    return membershipsRepository.transaction(async (session) => {
      const weddingId = snapshot.weddingId.toString();
      await lockWeddingMembershipChanges(weddingId, session);
      const invite = usable(await membershipsRepository.findInviteToken(hashToken(token), session));
      if (
        status === 'ACCEPTED' &&
        (await getUserIdForInvite(invite.invitedEmailNormalized, session)) !== userId
      )
        throw new AppError(
          403,
          'INVITE_EMAIL_MISMATCH',
          'Sign in with the email address that received this invitation. Switch accounts to continue. The invitation has not been used.',
        );
      if (
        status === 'ACCEPTED' &&
        (await membershipsRepository.activeForWedding(weddingId, userId!, session))
      )
        throw new AppError(
          409,
          'ALREADY_A_MEMBER',
          'This signed-in account already belongs to this wedding. Switch accounts to accept for a new member. The invitation has not been used.',
        );
      const updated = await membershipsRepository.consumeInvite(
        invite._id.toString(),
        status,
        session,
        userId,
      );
      if (updated.modifiedCount !== 1)
        throw new AppError(409, 'INVITE_ALREADY_USED', 'This invitation has already been used.');
      if (status === 'ACCEPTED')
        await membershipsRepository.activateMember(weddingId, userId!, invite, session);
      const actor = userId
        ? await membershipsRepository.activeForWedding(weddingId, userId, session)
        : null;
      await recordMembershipChange(
        weddingId,
        userId,
        `MEMBER_INVITE_${status}`,
        invite._id.toString(),
        session,
        actor?.role ?? 'SYSTEM',
      );
      return { weddingId };
    });
  },
  async revoke(weddingId: string, userId: string, inviteId: string) {
    await membershipsRepository.transaction(async (session) => {
      await lockWeddingMembershipChanges(weddingId, session);
      await admin(weddingId, userId, session);
      const invite = usable(await membershipsRepository.findInvite(weddingId, inviteId, session));
      const changed = await membershipsRepository.consumeInvite(
        invite._id.toString(),
        'REVOKED',
        session,
      );
      if (changed.modifiedCount !== 1)
        throw new AppError(409, 'INVITE_ALREADY_USED', 'This invitation has already been used.');
      await recordMembershipChange(weddingId, userId, 'MEMBER_INVITE_REVOKED', inviteId, session);
    });
  },
  async change(
    weddingId: string,
    userId: string,
    memberId: string,
    access: MemberAccessInput | null,
  ) {
    await membershipsRepository.transaction(async (session) => {
      await lockWeddingMembershipChanges(weddingId, session);
      await admin(weddingId, userId, session);
      const member = await membershipsRepository.findMember(weddingId, memberId, session);
      if (!member) throw new AppError(404, 'MEMBER_NOT_FOUND', 'This member is unavailable.');
      if (
        member.role === 'WEDDING_ADMIN' &&
        access?.role !== 'WEDDING_ADMIN' &&
        (await membershipsRepository.countAdmins(weddingId, session)) <= 1
      )
        throw new AppError(
          409,
          'LAST_WEDDING_ADMIN',
          'At least one active Wedding Admin must remain. Add another Admin before changing this access.',
        );
      await membershipsRepository.changeMember(weddingId, memberId, access, session);
      await recordMembershipChange(
        weddingId,
        userId,
        access ? 'MEMBER_ACCESS_CHANGED' : 'MEMBER_REMOVED',
        memberId,
        session,
      );
    });
  },
};
