import { describe, expect, it } from 'vitest';
import {
  createMembershipInviteSchema,
  memberAccessSchema,
  membershipInviteTokenSchema,
  organizerPermissionsSchema,
} from '@make-my-marriage/contracts';
import { publicPermissions } from '../src/modules/memberships/memberships.permissions.js';
describe('membership boundary rules', () => {
  it('requires an explicit Organizer area and defaults all other permissions to false', () => {
    expect(memberAccessSchema.safeParse({ role: 'ORGANIZER' }).success).toBe(false);
    const input = memberAccessSchema.parse({ role: 'ORGANIZER', permissions: { tasks: true } });
    expect(Object.values(input.permissions).filter(Boolean)).toHaveLength(1);
    expect(input.permissions.expenses).toBe(false);
    expect(Object.values(organizerPermissionsSchema.parse({})).some(Boolean)).toBe(false);
  });
  it('accepts Admin role without depending on individual flags', () => {
    expect(memberAccessSchema.parse({ role: 'WEDDING_ADMIN' }).role).toBe('WEDDING_ADMIN');
  });
  it.each([{ members: true }, { expenses: 'true' }, { arbitrary: true }])(
    'rejects permission injection %j',
    (permissions) => {
      expect(memberAccessSchema.safeParse({ role: 'ORGANIZER', permissions }).success).toBe(false);
    },
  );
  it('normalizes invitation emails and rejects client-owned persistence fields', () => {
    const input = { email: '  Parent@Example.com  ', role: 'WEDDING_ADMIN' };
    expect(createMembershipInviteSchema.parse(input).email).toBe('parent@example.com');
    for (const extra of [
      { weddingId: 'a'.repeat(24) },
      { tokenHash: 'secret' },
      { expiresAt: '2100-01-01' },
      { invitedBy: 'b'.repeat(24) },
    ])
      expect(createMembershipInviteSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
  it('does not expose the canonical reserved members flag in permission DTOs', () => {
    expect(publicPermissions({ members: true, events: true, expenses: 'true' })).toMatchObject({
      events: true,
      expenses: false,
    });
    expect(publicPermissions({ members: true })).not.toHaveProperty('members');
  });
  it('rejects malformed or unbounded bearer tokens', () => {
    expect(membershipInviteTokenSchema.safeParse('a'.repeat(43)).success).toBe(true);
    for (const token of ['', '../secret', 'a'.repeat(1000), 'a'.repeat(42)])
      expect(membershipInviteTokenSchema.safeParse(token).success).toBe(false);
  });
});
