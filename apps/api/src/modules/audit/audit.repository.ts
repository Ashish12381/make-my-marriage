import { AuditLog } from './models/audit-log.model.js';
import type { ClientSession } from 'mongoose';
export const auditRepository = {
  async recordMembershipChange(
    weddingId: string,
    actorUserId: string | undefined,
    action: string,
    resourceId: string,
    session: ClientSession,
    actorType: 'WEDDING_ADMIN' | 'ORGANIZER' | 'SYSTEM' = actorUserId ? 'WEDDING_ADMIN' : 'SYSTEM',
  ) {
    await AuditLog.create(
      [
        {
          weddingId,
          ...(actorUserId ? { actorUserId } : {}),
          actorType,
          action,
          resourceType: 'membership',
          resourceId,
        },
      ],
      { session },
    );
  },
  async recordWeddingChange(
    weddingId: string,
    actorUserId: string,
    action: 'WEDDING_CREATED' | 'WEDDING_UPDATED',
    session: ClientSession,
  ) {
    await AuditLog.create(
      [
        {
          weddingId,
          actorUserId,
          actorType: 'WEDDING_ADMIN',
          action,
          resourceType: 'wedding',
          resourceId: weddingId,
        },
      ],
      { session },
    );
  },
  async initialize() {
    await AuditLog.createCollection();
    await AuditLog.createIndexes();
  },
  async recordAuthAttempt(ipHash: string, emailHash: string, window: number) {
    await new AuditLog({
      actorType: 'SYSTEM',
      action: 'AUTH_ATTEMPT',
      resourceType: 'auth',
      metadata: { ipHash, emailHash, window },
    }).save({ w: 'majority' });
    // Insert before counting: concurrent attempts may be conservatively denied, not over-admitted.
    const base = { action: 'AUTH_ATTEMPT', 'metadata.window': window };
    const [ipAttempts, emailAttempts] = await Promise.all([
      AuditLog.countDocuments({ ...base, 'metadata.ipHash': ipHash })
        .read('primary')
        .readConcern('majority'),
      AuditLog.countDocuments({ ...base, 'metadata.emailHash': emailHash })
        .read('primary')
        .readConcern('majority'),
    ]);
    return { ipAttempts, emailAttempts };
  },
};
