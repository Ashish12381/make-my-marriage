import { z } from 'zod';
import {
  createMembershipInviteSchema,
  memberAccessSchema,
  membershipIdSchema,
  membershipInviteTokenSchema,
} from '@make-my-marriage/contracts';
const empty = z.strictObject({});
const wedding = { weddingId: membershipIdSchema };
export const teamRequest = z.object({ params: z.strictObject(wedding), query: empty });
export const inviteRequest = z.object({
  params: z.strictObject(wedding),
  query: empty,
  body: createMembershipInviteSchema,
});
export const changeMemberRequest = z.object({
  params: z.strictObject({ ...wedding, membershipId: membershipIdSchema }),
  query: empty,
  body: memberAccessSchema,
});
export const removeMemberRequest = z.object({
  params: z.strictObject({ ...wedding, membershipId: membershipIdSchema }),
  query: empty,
  body: empty.optional(),
});
export const revokeInviteRequest = z.object({
  params: z.strictObject({ ...wedding, inviteId: membershipIdSchema }),
  query: empty,
  body: empty.optional(),
});
export const tokenRequest = z.object({
  params: z.strictObject({ token: membershipInviteTokenSchema }),
  query: empty,
});
export const tokenWriteRequest = tokenRequest.extend({ body: empty.optional() });
