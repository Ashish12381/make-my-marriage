import { AppError } from '../../common/errors/app-error.js';
import { membershipsRepository } from './memberships.repository.js';
import type { WeddingRole } from '@make-my-marriage/contracts';
export const initializeMemberships = () => membershipsRepository.initialize();
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
  return { role: membership.role as WeddingRole };
}
