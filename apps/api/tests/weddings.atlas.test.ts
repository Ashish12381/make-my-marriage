// Opt-in development-only integration tests. Cleanup is scoped to these synthetic records.
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
import { WeddingMembership } from '../src/modules/memberships/models/wedding-membership.model.js';
import { WebsiteSettings } from '../src/modules/website/models/website-settings.model.js';
import { websiteRepository } from '../src/modules/website/website.repository.js';
import { AuditLog } from '../src/modules/audit/models/audit-log.model.js';
const run = process.env.RUN_ATLAS_WEDDING_TESTS === '1';
const tag = `wedding-test-${randomUUID()}`;
const slugs = [
  `${tag}-one`,
  `${tag}-two`,
  `${tag}-rollback`,
  `${tag}-race`,
  `${tag}-duplicate`,
  `${tag}-other-owner`,
  `${tag}-race-two`,
];
const userIds: string[] = [];
const cookies: string[] = [];
const origin = new URL(env.WEB_ORIGIN).origin;
const input = {
  title: 'Synthetic onboarding wedding',
  brideName: 'Test Bride',
  groomName: 'Test Groom',
  weddingDate: '2027-02-14',
  timezone: 'Asia/Kolkata',
};
async function write(method: 'post' | 'patch', path: string, body: object, cookie: string) {
  const csrf = await request(app).get('/api/v1/auth/csrf').set('Origin', origin);
  expect(csrf.status).toBe(200);
  const values: unknown = csrf.headers['set-cookie'];
  const csrfCookie = Array.isArray(values)
    ? (values.find((v: unknown) => typeof v === 'string' && v.startsWith('mmm_csrf=')) as
        string | undefined)
    : undefined;
  if (!csrfCookie) throw new Error('Missing CSRF cookie');
  return request(app)
    [method](`/api/v1/weddings${path}`)
    .set('Origin', origin)
    .set('Cookie', [cookie, csrfCookie.split(';')[0] ?? ''])
    .set('X-CSRF-Token', String(csrf.body.data.csrfToken))
    .send(body);
}
describe.skipIf(!run)('Atlas wedding onboarding and isolation', () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI || !new URL(env.MONGODB_URI).pathname.slice(1).endsWith('_dev'))
      throw new Error('Wedding tests require a configured *_dev database.');
    await connectDatabase(env.MONGODB_URI);
    await authRepository.initialize();
    for (let index = 0; index < 3; index++) {
      const email = `${tag}-${index}@example.invalid`;
      const user = await User.create({
        displayName: 'Synthetic onboarding planner',
        email,
        emailNormalized: email,
        passwordHash: 'synthetic-session-only-account',
      });
      userIds.push(user._id.toString());
      const token = randomBytes(32).toString('base64url');
      await Session.create({
        userId: user._id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 3600000),
      });
      cookies.push(`mmm_session=${token}`);
    }
  }, 30000);
  afterAll(async () => {
    vi.restoreAllMocks();
    if (userIds.length) {
      const records = await WeddingModel.find({
        slug: { $in: slugs },
        createdBy: { $in: userIds },
      }).select('_id');
      const ids = records.map((w) => w._id);
      await WeddingMembership.deleteMany({ weddingId: { $in: ids } });
      await WebsiteSettings.deleteMany({ weddingId: { $in: ids } });
      await AuditLog.deleteMany({
        actorUserId: { $in: userIds },
        action: { $in: ['WEDDING_CREATED', 'WEDDING_UPDATED'] },
      });
      await WeddingModel.deleteMany({ _id: { $in: ids }, createdBy: { $in: userIds } });
      await Session.deleteMany({ userId: { $in: userIds } });
      await User.deleteMany({ _id: { $in: userIds }, emailNormalized: { $regex: `^${tag}-` } });
    }
    await disconnectDatabase();
  }, 30000);
  it('creates, reopens, switches and edits only authorized weddings, with atomic defaults', async () => {
    const ownerCookie = cookies[0]!;
    const organizerCookie = cookies[1]!;
    const strangerCookie = cookies[2]!;
    expect((await request(app).get('/api/v1/weddings')).status).toBe(401);
    const first = await write('post', '', { ...input, slug: slugs[0] }, ownerCookie);
    expect(first.status).toBe(201);
    const id = String(first.body.data.wedding.id);
    expect(
      await WeddingMembership.countDocuments({
        weddingId: id,
        userId: userIds[0]!,
        role: 'WEDDING_ADMIN',
        status: 'ACTIVE',
      }),
    ).toBe(1);
    const website = await WebsiteSettings.findOne({ weddingId: id });
    expect(website).toMatchObject({ published: false, privacy: 'INVITATION_ONLY' });
    expect((await WeddingModel.findById(id))?.guestAccessExpiresAt.toISOString()).toBe(
      '2027-03-16T18:29:59.999Z',
    );
    expect((await write('post', '', { ...input, slug: slugs[0] }, ownerCookie)).status).toBe(409);
    expect(
      (
        await write(
          'post',
          '',
          {
            ...input,
            brideName: 'Another Bride',
            title: 'Second synthetic wedding',
            slug: slugs[1],
          },
          ownerCookie,
        )
      ).status,
    ).toBe(201);
    // Legacy records are protected too, without a destructive data migration.
    await WeddingModel.updateOne({ _id: id }, { $unset: { coupleKey: '' } });
    const duplicate = await write(
      'post',
      '',
      {
        ...input,
        brideName: ' test   BRIDE ',
        groomName: 'TEST groom',
        title: 'Different title',
        weddingDate: '2028-01-01',
        slug: slugs[4],
      },
      ownerCookie,
    );
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('DUPLICATE_WEDDING');
    expect(await WeddingModel.countDocuments({ slug: slugs[4]! })).toBe(0);
    // Identical names in another account neither reveal nor block private weddings.
    expect((await write('post', '', { ...input, slug: slugs[5] }, strangerCookie)).status).toBe(
      201,
    );
    const listing = await request(app).get('/api/v1/weddings').set('Cookie', ownerCookie);
    expect(listing.body.data.weddings).toHaveLength(2);
    expect(
      (await request(app).get(`/api/v1/weddings/${id}`).set('Cookie', ownerCookie)).body.data
        .wedding.title,
    ).toBe(input.title);
    expect(
      (await request(app).get(`/api/v1/weddings/${id}`).set('Cookie', strangerCookie)).status,
    ).toBe(404);
    expect(
      (await request(app).get('/api/v1/weddings').set('Cookie', strangerCookie)).body.data.weddings,
    ).toHaveLength(1);
    const second = listing.body.data.weddings.find((w: { id: string }) => w.id !== id);
    expect((await write('patch', `/${second.id}`, input, ownerCookie)).status).toBe(409);
    expect(
      (await write('patch', `/${id}`, { ...input, title: 'Unauthorized' }, strangerCookie)).status,
    ).toBe(404);
    await WeddingMembership.create({
      weddingId: id,
      userId: userIds[1]!,
      role: 'ORGANIZER',
      status: 'ACTIVE',
    });
    expect(
      (await request(app).get(`/api/v1/weddings/${id}`).set('Cookie', organizerCookie)).status,
    ).toBe(200);
    expect(
      (await write('patch', `/${id}`, { ...input, title: 'Organizer edit' }, organizerCookie))
        .status,
    ).toBe(403);
    expect(
      (await write('patch', `/${id}`, { ...input, slug: 'injected-slug' }, ownerCookie)).status,
    ).toBe(422);
    const update = await write(
      'patch',
      `/${id}`,
      {
        ...input,
        title: 'Updated synthetic wedding',
        weddingDate: '2027-03-01',
        defaultVenue: { name: 'Test Hall', address: 'Jaipur' },
      },
      ownerCookie,
    );
    expect(update.status).toBe(200);
    expect(update.body.data.wedding.defaultVenue.name).toBe('Test Hall');
    expect((await WeddingModel.findById(id))?.guestAccessExpiresAt.toISOString()).toBe(
      '2027-03-31T18:29:59.999Z',
    );
    expect(await AuditLog.countDocuments({ weddingId: id, action: 'WEDDING_UPDATED' })).toBe(1);
    expect(
      (
        await request(app)
          .post('/api/v1/weddings')
          .set('Cookie', ownerCookie)
          .set('Origin', origin)
          .send({ ...input, slug: slugs[2] })
      ).status,
    ).toBe(403);
    const availability = await request(app)
      .get(`/api/v1/weddings/slug-availability?slug=${slugs[0]}`)
      .set('Cookie', ownerCookie);
    expect(availability.body.data).toEqual({ available: false });
    const race = await Promise.all(
      [slugs[3], slugs[6]].map((slug) =>
        write('post', '', { ...input, brideName: 'Race Bride', slug }, ownerCookie),
      ),
    );
    expect(race.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(race.find((r) => r.status === 409)?.body.error.code).toBe('DUPLICATE_WEDDING');
    expect(await WeddingModel.countDocuments({ slug: { $in: [slugs[3]!, slugs[6]!] } })).toBe(1);
    const countBefore = await WeddingMembership.countDocuments({ userId: userIds[0]! });
    const failing = vi
      .spyOn(websiteRepository, 'createUnpublished')
      .mockRejectedValueOnce(new Error('Synthetic failure'));
    try {
      expect(
        (
          await write(
            'post',
            '',
            { ...input, brideName: 'Rollback Bride', slug: slugs[2] },
            ownerCookie,
          )
        ).status,
      ).toBe(500);
      expect(await WeddingModel.countDocuments({ slug: slugs[2]! })).toBe(0);
      expect(await WeddingMembership.countDocuments({ userId: userIds[0]! })).toBe(countBefore);
    } finally {
      failing.mockRestore();
    }
    await WeddingMembership.updateOne(
      { weddingId: id, userId: userIds[1]! },
      { $set: { status: 'REVOKED' } },
    );
    expect(
      (await request(app).get(`/api/v1/weddings/${id}`).set('Cookie', organizerCookie)).status,
    ).toBe(404);
  }, 60000);
});
