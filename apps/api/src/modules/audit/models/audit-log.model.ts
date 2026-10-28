import { Schema, model } from 'mongoose';
const auditLogSchema = new Schema(
  {
    weddingId: Schema.Types.ObjectId,
    actorUserId: Schema.Types.ObjectId,
    actorType: {
      type: String,
      enum: ['PLATFORM_ADMIN', 'WEDDING_ADMIN', 'ORGANIZER', 'SYSTEM'],
      required: true,
    },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed,
    reason: String,
  },
  { collection: 'audit_logs', timestamps: { createdAt: true, updatedAt: false }, strict: 'throw' },
);
auditLogSchema.index({ weddingId: 1, createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, 'metadata.window': 1, 'metadata.ipHash': 1 });
auditLogSchema.index({ action: 1, 'metadata.window': 1, 'metadata.emailHash': 1 });
export const AuditLog = model('AuditLog', auditLogSchema);
