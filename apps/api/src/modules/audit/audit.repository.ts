import { AuditLog } from './models/audit-log.model.js';
export const auditRepository = {
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
