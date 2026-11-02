import {
  teamResponseSchema,
  membershipInvitesResponseSchema,
  membershipInviteCreatedSchema,
  membershipInvitePreviewSchema,
  membershipAcceptedSchema,
  type CreateMembershipInviteInput,
  type MemberAccessInput,
} from '@make-my-marriage/contracts';
import { csrfResponseSchema } from '@make-my-marriage/contracts';
import { apiFetch } from './client';
async function write(path: string, method: 'POST' | 'PATCH' | 'DELETE', body: unknown = {}) {
  const { csrfToken } = csrfResponseSchema.parse(
    await (await apiFetch('/auth/csrf', { cache: 'no-store' })).json(),
  ).data;
  return apiFetch(path, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(body),
  });
}
export async function getTeam(id: string, signal?: AbortSignal) {
  return teamResponseSchema.parse(
    await (
      await apiFetch(`/weddings/${id}/members`, {
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      })
    ).json(),
  ).data;
}
export async function getTeamInvites(id: string, signal?: AbortSignal) {
  return membershipInvitesResponseSchema.parse(
    await (
      await apiFetch(`/weddings/${id}/membership-invites`, {
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      })
    ).json(),
  ).data.invites;
}
export async function inviteMember(id: string, body: CreateMembershipInviteInput) {
  return membershipInviteCreatedSchema.parse(
    await (await write(`/weddings/${id}/membership-invites`, 'POST', body)).json(),
  ).data;
}
export async function changeMemberAccess(id: string, memberId: string, body: MemberAccessInput) {
  await write(`/weddings/${id}/members/${memberId}`, 'PATCH', body);
}
export async function removeTeamMember(id: string, memberId: string) {
  await write(`/weddings/${id}/members/${memberId}`, 'DELETE');
}
export async function revokeTeamInvite(id: string, inviteId: string) {
  await write(`/weddings/${id}/membership-invites/${inviteId}/revoke`, 'POST');
}
export async function previewTeamInvite(token: string, signal?: AbortSignal) {
  return membershipInvitePreviewSchema.parse(
    await (
      await apiFetch(`/membership-invites/${token}/preview`, {
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      })
    ).json(),
  ).data;
}
export async function acceptTeamInvite(token: string) {
  return membershipAcceptedSchema.parse(
    await (await write(`/membership-invites/${token}/accept`, 'POST')).json(),
  ).data;
}
export async function declineTeamInvite(token: string) {
  await write(`/membership-invites/${token}/decline`, 'POST');
}
