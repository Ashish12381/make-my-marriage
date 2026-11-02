import type { RequestHandler, Response } from 'express';
import type {
  AuthUser,
  CreateMembershipInviteInput,
  MemberAccessInput,
} from '@make-my-marriage/contracts';
import { membershipService } from './memberships.service.js';
type Input = {
  params: { weddingId: string; membershipId: string; inviteId: string; token: string };
  body: CreateMembershipInviteInput & MemberAccessInput;
};
const input = (res: Response) => res.locals.validated as Input;
const user = (res: Response) => (res.locals.user as AuthUser).id;
const reply = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, meta: { requestId: res.locals.requestId } });
export const listMembers: RequestHandler = async (_req, res) => {
  reply(res, await membershipService.list(input(res).params.weddingId, user(res)));
};
export const listInvites: RequestHandler = async (_req, res) => {
  reply(res, { invites: await membershipService.invites(input(res).params.weddingId, user(res)) });
};
export const createInvite: RequestHandler = async (_req, res) => {
  reply(
    res,
    await membershipService.create(input(res).params.weddingId, user(res), input(res).body),
    201,
  );
};
export const changeMember: RequestHandler = async (_req, res) => {
  const { params, body } = input(res);
  await membershipService.change(params.weddingId, user(res), params.membershipId, body);
  res.status(204).end();
};
export const removeMember: RequestHandler = async (_req, res) => {
  const { params } = input(res);
  await membershipService.change(params.weddingId, user(res), params.membershipId, null);
  res.status(204).end();
};
export const revokeInvite: RequestHandler = async (_req, res) => {
  const { params } = input(res);
  await membershipService.revoke(params.weddingId, user(res), params.inviteId);
  res.status(204).end();
};
export const previewInvite: RequestHandler = async (_req, res) => {
  reply(res, await membershipService.preview(input(res).params.token));
};
export const acceptInvite: RequestHandler = async (_req, res) => {
  reply(res, await membershipService.respond(input(res).params.token, 'ACCEPTED', user(res)));
};
export const declineInvite: RequestHandler = async (_req, res) => {
  await membershipService.respond(input(res).params.token, 'DECLINED');
  res.status(204).end();
};
