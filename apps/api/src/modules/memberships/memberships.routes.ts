import { Router } from 'express';
import type { RequestHandler } from 'express';
import { authSession } from '../../common/middleware/auth-session.js';
import { validate } from '../../common/middleware/validate.js';
import { requireAuthInfrastructure, protectAuthWrite } from '../auth/auth.security.js';
import { initializeMemberships } from './memberships.service.js';
import * as controller from './memberships.controller.js';
import * as schema from './memberships.validation.js';
export const membershipsRouter = Router();
const privateResponse: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
};
const ready: RequestHandler = async (_req, _res, next) => {
  await initializeMemberships();
  next();
};
const member = [privateResponse, requireAuthInfrastructure, authSession, ready];
const publicInvite = [privateResponse, requireAuthInfrastructure, ready];
membershipsRouter.get(
  '/weddings/:weddingId/members',
  ...member,
  validate(schema.teamRequest),
  controller.listMembers,
);
membershipsRouter.get(
  '/weddings/:weddingId/membership-invites',
  ...member,
  validate(schema.teamRequest),
  controller.listInvites,
);
membershipsRouter.post(
  '/weddings/:weddingId/membership-invites',
  ...member,
  protectAuthWrite,
  validate(schema.inviteRequest),
  controller.createInvite,
);
membershipsRouter.patch(
  '/weddings/:weddingId/members/:membershipId',
  ...member,
  protectAuthWrite,
  validate(schema.changeMemberRequest),
  controller.changeMember,
);
membershipsRouter.delete(
  '/weddings/:weddingId/members/:membershipId',
  ...member,
  protectAuthWrite,
  validate(schema.removeMemberRequest),
  controller.removeMember,
);
membershipsRouter.post(
  '/weddings/:weddingId/membership-invites/:inviteId/revoke',
  ...member,
  protectAuthWrite,
  validate(schema.revokeInviteRequest),
  controller.revokeInvite,
);
membershipsRouter.get(
  '/membership-invites/:token/preview',
  ...publicInvite,
  validate(schema.tokenRequest),
  controller.previewInvite,
);
membershipsRouter.post(
  '/membership-invites/:token/accept',
  ...member,
  protectAuthWrite,
  validate(schema.tokenWriteRequest),
  controller.acceptInvite,
);
membershipsRouter.post(
  '/membership-invites/:token/decline',
  ...publicInvite,
  protectAuthWrite,
  validate(schema.tokenWriteRequest),
  controller.declineInvite,
);
