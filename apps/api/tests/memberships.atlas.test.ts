// Development-only transaction/security coverage; email is mocked and all fixture records are scoped.
import request from 'supertest';
import { randomBytes, randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { hashSessionToken } from '../src/modules/auth/auth.service.js';
import { User } from '../src/modules/auth/models/user.model.js';
import { Session } from '../src/modules/auth/models/session.model.js';
import { WeddingModel } from '../src/modules/weddings/models/wedding.model.js';
import { WebsiteSettings } from '../src/modules/website/models/website-settings.model.js';
import { WeddingMembership } from '../src/modules/memberships/models/wedding-membership.model.js';
import { MembershipInviteModel } from '../src/modules/memberships/models/membership-invite.model.js';
import { requireWeddingFeature } from '../src/modules/memberships/memberships.service.js';
import { membershipsRepository } from '../src/modules/memberships/memberships.repository.js';
import { AuditLog } from '../src/modules/audit/models/audit-log.model.js';
import { EmailDeliveryModel } from '../src/modules/email/models/email-delivery.model.js';
import { emailRepository } from '../src/modules/email/email.repository.js';
import { sendMembershipInvitation } from '../src/modules/email/email.public.js';
vi.mock('../src/modules/email/email.public.js', () => ({ sendMembershipInvitation: vi.fn() }));
const run = process.env.RUN_ATLAS_MEMBERSHIP_TESTS === '1';
const tag = `team-test-${randomUUID()}`;
const users: string[] = [];
const cookies: string[] = [];
const capturedTokens: string[] = [];
let weddingId = '';
const origin = new URL(env.WEB_ORIGIN).origin;
async function write(
  method: 'post' | 'patch' | 'delete',
  path: string,
  body: object = {},
  cookie = '',
) {
  const csrf = await request(app).get('/api/v1/auth/csrf').set('Origin', origin);
  const values: unknown = csrf.headers['set-cookie'];
  const csrfCookie = Array.isArray(values)
    ? (values.find(
        (value: unknown) => typeof value === 'string' && value.startsWith('mmm_csrf='),
      ) as string | undefined)
    : undefined;
  if (!csrfCookie) throw new Error('CSRF initialization failed');
  return request(app)
    [method](`/api/v1${path}`)
    .set('Origin', origin)
    .set('Cookie', [cookie, csrfCookie.split(';')[0] ?? ''].filter(Boolean))
    .set('X-CSRF-Token', String(csrf.body.data.csrfToken))
    .send(body);
}
describe.skipIf(!run)('Atlas family and team lifecycle', () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI || !new URL(env.MONGODB_URI).pathname.slice(1).endsWith('_dev'))
      throw new Error('Membership tests require a *_dev database.');
    await connectDatabase(env.MONGODB_URI);
    await authRepository.initialize();
    await emailRepository.initialize();
    for (let i = 0; i < 3; i++) {
      const email = `${tag}-${i}@example.invalid`;
      const user = await User.create({
        displayName: `Team QA ${i}`,
        email,
        emailNormalized: email,
        passwordHash: 'synthetic-session-only',
      });
      users.push(user._id.toString());
      const token = randomBytes(32).toString('base64url');
      await Session.create({
        userId: user._id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 3600000),
      });
      cookies.push(`mmm_session=${token}`);
    }
    vi.mocked(sendMembershipInvitation).mockImplementation(async (input) => {
      capturedTokens.push(new URL(input.url).pathname.split('/').at(-1)!);
      return 'SENT';
    });
    const created = await write(
      'post',
      '/weddings',
      {
        title: 'Synthetic team wedding',
        brideName: 'Test Bride',
        groomName: 'Test Groom',
        weddingDate: '2027-02-14',
        timezone: 'Asia/Kolkata',
        slug: tag,
      },
      cookies[0],
    );
    expect(created.status).toBe(201);
    weddingId = String(created.body.data.wedding.id);
  }, 30000);
  afterAll(async () => {
    vi.restoreAllMocks();
    if (weddingId) {
      await MembershipInviteModel.deleteMany({ weddingId });
      await EmailDeliveryModel.deleteMany({ weddingId });
      await WeddingMembership.deleteMany({ weddingId });
      await WebsiteSettings.deleteMany({ weddingId });
      await AuditLog.deleteMany({ weddingId });
      await WeddingModel.deleteMany({ _id: weddingId, createdBy: users[0]! });
    }
    if (users.length) {
      await Session.deleteMany({ userId: { $in: users } });
      await User.deleteMany({ _id: { $in: users }, emailNormalized: { $regex: `^${tag}-` } });
    }
    await disconnectDatabase();
  }, 30000);
  it('enforces invitation possession, atomic acceptance, scoped roles, expiry, audit and concurrent last-admin protection', async () => {
    const base = `/weddings/${weddingId}`;
    expect((await request(app).get(`/api/v1${base}/members`)).status).toBe(401);
    expect(
      (await request(app).get(`/api/v1${base}/members`).set('Cookie', cookies[1]!)).status,
    ).toBe(404);
    expect(
      (
        await write(
          'post',
          `${base}/membership-invites`,
          { email: `${tag}-1@example.invalid`, role: 'ORGANIZER', permissions: { events: true } },
          cookies[2],
        )
      ).status,
    ).toBe(404);
    const created = await write(
      'post',
      `${base}/membership-invites`,
      { email: `${tag}-1@EXAMPLE.INVALID`, role: 'ORGANIZER', permissions: { events: true } },
      cookies[0],
    );
    expect(created.status).toBe(201);
    expect(created.body.data.invite.email).toBe(`${tag}-1@example.invalid`);
    expect(created.body.data.emailStatus).toBe('SENT');
    const token = capturedTokens.at(-1)!;
    for (const index of [0, 2]) {
      const wrongAccount = await write(
        'post',
        `/membership-invites/${token}/accept`,
        {},
        cookies[index],
      );
      expect(wrongAccount.status).toBe(403);
      expect(wrongAccount.body.error.code).toBe('INVITE_EMAIL_MISMATCH');
    }
    expect((await MembershipInviteModel.findById(created.body.data.invite.id))?.status).toBe(
      'PENDING',
    );
    expect(await WeddingMembership.countDocuments({ weddingId, userId: users[0]! })).toBe(1);
    expect(await WeddingMembership.countDocuments({ weddingId, userId: users[2]! })).toBe(0);
    await EmailDeliveryModel.create({
      weddingId,
      membershipInviteId: created.body.data.invite.id,
      recipientEmail: `${tag}-1@example.invalid`,
      kind: 'MEMBER_INVITE',
      status: 'FAILED',
      attemptCount: 1,
    });
    const history = await request(app)
      .get(`/api/v1${base}/membership-invites`)
      .set('Cookie', cookies[0]!);
    expect(history.status).toBe(200);
    expect(history.body.data.invites[0].emailStatus).toBe('FAILED');
    expect(JSON.stringify(created.body)).not.toContain(token);
    expect(JSON.stringify(created.body)).not.toContain('tokenHash');
    expect(
      (await request(app).get(`/api/v1${base}/members`).set('Cookie', cookies[1]!)).status,
    ).toBe(404); // Matching email grants nothing.
    expect(
      (
        await write(
          'post',
          `${base}/membership-invites`,
          { email: `${tag}-1@example.invalid`, role: 'WEDDING_ADMIN' },
          cookies[0],
        )
      ).body.error.code,
    ).toBe('INVITE_PENDING');
    const preview = await request(app).get(`/api/v1/membership-invites/${token}/preview`);
    expect(preview.status).toBe(200);
    expect(preview.headers['cache-control']).toContain('no-store');
    expect(preview.body.data.invitedEmail).toBe(`${tag}-1@example.invalid`);
    expect(preview.body.data.accountExists).toBe(true);
    expect(preview.body.data).not.toHaveProperty('userId');
    expect(
      (await request(app).get(`/api/v1/membership-invites/${'x'.repeat(43)}/preview`)).status,
    ).toBe(410);
    expect((await write('post', `/membership-invites/${token}/accept`)).status).toBe(401);
    const failingActivation = vi
      .spyOn(membershipsRepository, 'activateMember')
      .mockRejectedValueOnce(new Error('Synthetic membership failure'));
    try {
      expect(
        (await write('post', `/membership-invites/${token}/accept`, {}, cookies[1])).status,
      ).toBe(500);
      expect((await MembershipInviteModel.findById(created.body.data.invite.id))?.status).toBe(
        'PENDING',
      );
      expect(await WeddingMembership.countDocuments({ weddingId, userId: users[1]! })).toBe(0);
    } finally {
      failingActivation.mockRestore();
    }
    const accepted = await Promise.all(
      [1, 2].map(() => write('post', `/membership-invites/${token}/accept`, {}, cookies[1])),
    );
    expect(accepted.map((result) => result.status).sort()).toEqual([200, 409]);
    expect(
      await WeddingMembership.countDocuments({ weddingId, userId: users[1]!, status: 'ACTIVE' }),
    ).toBe(1);
    const team = await request(app).get(`/api/v1${base}/members`).set('Cookie', cookies[1]!);
    expect(team.status).toBe(200);
    expect(team.body.data.role).toBe('ORGANIZER');
    expect(
      team.body.data.members.find((member: { userId: string }) => member.userId === users[0]),
    ).not.toHaveProperty('email');
    expect(
      (await request(app).get(`/api/v1${base}/membership-invites`).set('Cookie', cookies[1]!))
        .status,
    ).toBe(403);
    expect(
      (
        await write(
          'post',
          `${base}/membership-invites`,
          { email: `${tag}-2@example.invalid`, role: 'WEDDING_ADMIN' },
          cookies[1],
        )
      ).status,
    ).toBe(403);
    await expect(requireWeddingFeature(weddingId, users[1]!, 'expenses')).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(requireWeddingFeature(weddingId, users[1]!, 'events')).resolves.toMatchObject({
      role: 'ORGANIZER',
    });
    const members = await WeddingMembership.find({ weddingId }).lean();
    const ownerId = members.find((member) => member.userId.toString() === users[0])!._id.toString();
    const otherId = members.find((member) => member.userId.toString() === users[1])!._id.toString();
    expect(
      (await write('delete', `${base}/members/${ownerId}`, {}, cookies[0])).body.error.code,
    ).toBe('LAST_WEDDING_ADMIN');
    expect(
      (
        await write(
          'patch',
          `${base}/members/${ownerId}`,
          { role: 'ORGANIZER', permissions: { events: true } },
          cookies[0],
        )
      ).body.error.code,
    ).toBe('LAST_WEDDING_ADMIN');
    expect(
      (await write('patch', `${base}/members/${otherId}`, { role: 'WEDDING_ADMIN' }, cookies[0]))
        .status,
    ).toBe(204);
    // Both admins attempt to leave at once. The tenant lock makes the final-admin check race-safe.
    const removal = await Promise.all([
      write('delete', `${base}/members/${ownerId}`, {}, cookies[0]),
      write('delete', `${base}/members/${otherId}`, {}, cookies[1]),
    ]);
    expect(removal.map((result) => result.status).sort()).toEqual([204, 409]);
    expect(
      await WeddingMembership.countDocuments({
        weddingId,
        role: 'WEDDING_ADMIN',
        status: 'ACTIVE',
      }),
    ).toBe(1);
    const remaining = await WeddingMembership.findOne({
      weddingId,
      role: 'WEDDING_ADMIN',
      status: 'ACTIVE',
    });
    const adminCookie = cookies[users.indexOf(remaining!.userId.toString())]!;
    const removedIndex = users.indexOf(remaining!.userId.toString()) === 0 ? 1 : 0;
    expect(
      (await request(app).get(`/api/v1${base}/members`).set('Cookie', cookies[removedIndex]!))
        .status,
    ).toBe(404);
    const reInvite = await write(
      'post',
      `${base}/membership-invites`,
      {
        email: `${tag}-${removedIndex}@example.invalid`,
        role: 'ORGANIZER',
        permissions: { tasks: true },
      },
      adminCookie,
    );
    expect(reInvite.status).toBe(201);
    const reInviteToken = capturedTokens.at(-1)!;
    expect(
      (
        await write(
          'post',
          `/membership-invites/${reInviteToken}/accept`,
          {},
          cookies[removedIndex],
        )
      ).status,
    ).toBe(200);
    expect(
      await WeddingMembership.countDocuments({ weddingId, userId: users[removedIndex]! }),
    ).toBe(1);
    const another = await write(
      'post',
      `${base}/membership-invites`,
      { email: `${tag}-2@example.invalid`, role: 'ORGANIZER', permissions: { tasks: true } },
      adminCookie,
    );
    expect(another.status).toBe(201);
    const revokedToken = capturedTokens.at(-1)!;
    expect(
      (
        await write(
          'post',
          `${base}/membership-invites/${another.body.data.invite.id}/revoke`,
          {},
          adminCookie,
        )
      ).status,
    ).toBe(204);
    expect(
      (await write('post', `/membership-invites/${revokedToken}/accept`, {}, cookies[2])).status,
    ).toBe(410);
    const expiring = await write(
      'post',
      `${base}/membership-invites`,
      { email: `${tag}-expired@example.invalid`, role: 'WEDDING_ADMIN' },
      adminCookie,
    );
    const expiredToken = capturedTokens.at(-1)!;
    const newRecipient = await request(app).get(
      `/api/v1/membership-invites/${expiredToken}/preview`,
    );
    expect(newRecipient.body.data.accountExists).toBe(false);
    expect(newRecipient.body.data.invitedEmail).toBe(`${tag}-expired@example.invalid`);
    await MembershipInviteModel.updateOne(
      { _id: expiring.body.data.invite.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
    expect(
      (await request(app).get(`/api/v1/membership-invites/${expiredToken}/preview`)).status,
    ).toBe(410);
    const declining = await write(
      'post',
      `${base}/membership-invites`,
      { email: `${tag}-decline@example.invalid`, role: 'WEDDING_ADMIN' },
      adminCookie,
    );
    expect(declining.status).toBe(201);
    const declinedToken = capturedTokens.at(-1)!;
    expect((await write('post', `/membership-invites/${declinedToken}/decline`)).status).toBe(204);
    expect(
      (await write('post', `/membership-invites/${declinedToken}/accept`, {}, cookies[2])).status,
    ).toBe(409);
    expect(await AuditLog.countDocuments({ weddingId, action: 'MEMBER_ACCESS_CHANGED' })).toBe(1);
    expect(
      await AuditLog.countDocuments({
        weddingId,
        action: 'MEMBER_INVITE_ACCEPTED',
        actorType: 'ORGANIZER',
      }),
    ).toBe(2);
    expect(await AuditLog.countDocuments({ weddingId, action: 'MEMBER_REMOVED' })).toBe(1);
    expect(
      (
        await request(app)
          .post(`/api/v1${base}/membership-invites`)
          .set('Cookie', adminCookie)
          .set('Origin', origin)
          .send({ email: 'csrf@example.invalid', role: 'WEDDING_ADMIN' })
      ).status,
    ).toBe(403);
  }, 90000);
});
