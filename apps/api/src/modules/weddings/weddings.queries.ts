import type { ClientSession } from 'mongoose';
import { AppError } from '../../common/errors/app-error.js';
import { weddingsRepository } from './weddings.repository.js';

export async function requireActiveWedding(id: string, session?: ClientSession) {
  const wedding = await weddingsRepository.find(id, session);
  if (!wedding)
    throw new AppError(
      404,
      'WEDDING_NOT_FOUND',
      'This wedding is unavailable or you do not have access.',
    );
  return { id: wedding._id.toString(), title: wedding.title };
}
// Serialize membership mutations on the tenant document. Transaction retries recheck roles/counts.
export async function lockWeddingMembershipChanges(id: string, session: ClientSession) {
  if (!(await weddingsRepository.lockMembershipChanges(id, session)))
    throw new AppError(
      404,
      'WEDDING_NOT_FOUND',
      'This wedding is unavailable or you do not have access.',
    );
  return requireActiveWedding(id, session);
}
