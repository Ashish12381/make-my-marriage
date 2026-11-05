import type { ClientSession } from 'mongoose';
import { authRepository } from './auth.repository.js';

// Public query interface: never expose password hashes, sessions or account directory search.
export async function getMemberProfiles(ids: string[], session?: ClientSession) {
  return authRepository.getMemberProfiles(ids, session);
}
export async function getUserIdForInvite(emailNormalized: string, session?: ClientSession) {
  return authRepository.getUserIdForInvite(emailNormalized, session);
}
