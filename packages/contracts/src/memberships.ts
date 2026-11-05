import { z } from 'zod';
import { weddingRoleSchema } from './weddings.js';

export const organizerPermissionKeys = [
  'events',
  'tasks',
  'expenses',
  'vendors',
  'guests',
  'invitations',
  'gallery',
  'website',
  'livestream',
] as const;
export type OrganizerPermission = (typeof organizerPermissionKeys)[number];
export const organizerPermissionsSchema = z.strictObject({
  events: z.boolean().default(false),
  tasks: z.boolean().default(false),
  expenses: z.boolean().default(false),
  vendors: z.boolean().default(false),
  guests: z.boolean().default(false),
  invitations: z.boolean().default(false),
  gallery: z.boolean().default(false),
  website: z.boolean().default(false),
  livestream: z.boolean().default(false),
});
export type OrganizerPermissions = z.infer<typeof organizerPermissionsSchema>;
export const memberAccessSchema = z
  .strictObject({
    role: weddingRoleSchema,
    permissions: organizerPermissionsSchema.default(() => organizerPermissionsSchema.parse({})),
  })
  .refine((v) => v.role === 'WEDDING_ADMIN' || Object.values(v.permissions).some(Boolean), {
    path: ['permissions'],
    message: 'Select at least one area this Organizer can access.',
  });
export const createMembershipInviteSchema = memberAccessSchema.safeExtend({
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email())
    .transform((v) => v.toLowerCase()),
});
export type MemberAccessInput = z.infer<typeof memberAccessSchema>;
export type CreateMembershipInviteInput = z.infer<typeof createMembershipInviteSchema>;
export const membershipInviteTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
export const membershipIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/)
  .transform((v) => v.toLowerCase());
export const teamMemberSchema = z.object({
  id: membershipIdSchema,
  userId: membershipIdSchema,
  displayName: z.string(),
  email: z.email().optional(),
  role: weddingRoleSchema,
  permissions: organizerPermissionsSchema.optional(),
});
export const membershipInviteSchema = z.object({
  emailStatus: z.enum(['PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN']).optional(),
  id: membershipIdSchema,
  email: z.email(),
  role: weddingRoleSchema,
  permissions: organizerPermissionsSchema,
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED']),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export const teamResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    currentUserId: membershipIdSchema,
    role: weddingRoleSchema,
    members: z.array(teamMemberSchema),
  }),
});
export const membershipInvitesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ invites: z.array(membershipInviteSchema) }),
});
export const membershipInviteCreatedSchema = z.object({
  success: z.literal(true),
  data: z.object({
    invite: membershipInviteSchema,
    emailStatus: z.enum(['SENT', 'FAILED', 'UNKNOWN']),
  }),
});
export const membershipInvitePreviewSchema = z.object({
  success: z.literal(true),
  data: z.object({
    invitedEmail: z.email(),
    accountExists: z.boolean(),
    weddingId: membershipIdSchema,
    title: z.string(),
    role: weddingRoleSchema,
    permissions: organizerPermissionsSchema,
    expiresAt: z.iso.datetime(),
  }),
});
export const membershipAcceptedSchema = z.object({
  success: z.literal(true),
  data: z.object({ weddingId: membershipIdSchema }),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type MembershipInvite = z.infer<typeof membershipInviteSchema>;
export type Team = z.infer<typeof teamResponseSchema>['data'];
export type MembershipInvitePreview = z.infer<typeof membershipInvitePreviewSchema>['data'];
