import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types, type ClientSession } from 'mongoose';
import { createWeddingSchema, updateWeddingSchema } from '@make-my-marriage/contracts';
import { AppError } from '../src/common/errors/app-error.js';
import { defaultGuestExpiry } from '../src/modules/weddings/wedding-dates.js';
import { weddingCoupleKey } from '../src/modules/weddings/wedding-identity.js';
vi.mock('../src/modules/weddings/weddings.repository.js', () => ({
  weddingsRepository: {
    initialize: vi.fn(),
    transaction: vi.fn(),
    create: vi.fn(),
    coupleExists: vi.fn(),
    slugExists: vi.fn(),
    list: vi.fn(),
    find: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('../src/modules/memberships/index.js', () => ({
  initializeMemberships: vi.fn(),
  createInitialWeddingAdmin: vi.fn(),
  listActiveWeddingMemberships: vi.fn(),
  requireWeddingMembership: vi.fn(),
}));
vi.mock('../src/modules/website/index.js', () => ({
  initializeWebsiteSettings: vi.fn(),
  createUnpublishedWebsite: vi.fn(),
}));
vi.mock('../src/modules/audit/index.js', () => ({
  recordWeddingChange: vi.fn(),
  initializeAudit: vi.fn(),
  allowAuthenticationAttempt: vi.fn(),
}));
vi.mock('../src/modules/auth/auth.service.js', () => ({ authService: { authenticate: vi.fn() } }));
vi.mock('../src/modules/auth/auth.security.js', () => ({
  requireAuthInfrastructure: (_req: unknown, _res: unknown, next: () => void) => next(),
  protectAuthWrite: (_req: unknown, _res: unknown, next: () => void) => next(),
  readCookie: () => 'test-session',
  SESSION_COOKIE: 'mmm_session',
  issueCsrf: vi.fn(),
  throttleAuthentication: vi.fn(),
}));
import { app } from '../src/app.js';
import { weddingsService } from '../src/modules/weddings/weddings.service.js';
import { weddingsRepository } from '../src/modules/weddings/weddings.repository.js';
import {
  requireWeddingMembership,
  createInitialWeddingAdmin,
  listActiveWeddingMemberships,
} from '../src/modules/memberships/index.js';
import { createUnpublishedWebsite } from '../src/modules/website/index.js';
import { authService } from '../src/modules/auth/auth.service.js';
const repo = vi.mocked(weddingsRepository);
const id = new Types.ObjectId();
const userId = new Types.ObjectId().toString();
const input = {
  title: 'Test Wedding',
  brideName: 'Priya',
  groomName: 'Rahul',
  weddingDate: '2027-02-14',
  timezone: 'Asia/Kolkata',
  slug: 'priya-rahul',
};
const stored = {
  _id: id,
  ...input,
  createdBy: new Types.ObjectId(userId),
  status: 'ACTIVE' as const,
  guestAccessExpiryMode: 'DEFAULT' as const,
  guestAccessExpiresAt: new Date(),
  storageQuotaBytes: 0,
  storageUsedBytes: 0,
  storageReservedBytes: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0,
};
const session = {} as ClientSession;
beforeEach(() => {
  vi.resetAllMocks();
  repo.transaction.mockImplementation(async (operation) => operation(session));
  vi.mocked(authService.authenticate).mockResolvedValue({
    id: userId,
    displayName: 'Planner',
    email: 'test@example.com',
  });
  vi.mocked(requireWeddingMembership).mockResolvedValue({ role: 'WEDDING_ADMIN' } as NonNullable<
    Awaited<ReturnType<typeof requireWeddingMembership>>
  >);
});
describe('wedding contracts and calendar rules', () => {
  it('matches full couple names independent of casing, spacing, order and Unicode composition', () => {
    expect(weddingCoupleKey('  RAJ  Kapoor ', 'Simran Singh')).toBe(
      weddingCoupleKey('simran singh', 'raj\tKapoor'),
    );
    expect(weddingCoupleKey('Zoë', 'André')).toBe(weddingCoupleKey('Zoe\u0308', 'Andre\u0301'));
    expect(weddingCoupleKey('Raj Kapoor', 'Simran Singh')).not.toBe(
      weddingCoupleKey('Raj Sharma', 'Simran Singh'),
    );
  });
  it('rejects invalid civil dates and timezone identifiers', () => {
    expect(createWeddingSchema.safeParse({ ...input, weddingDate: '2027-02-29' }).success).toBe(
      false,
    );
    expect(createWeddingSchema.safeParse({ ...input, timezone: 'Not/AZone' }).success).toBe(false);
    expect(createWeddingSchema.safeParse({ ...input, weddingDate: '2028-02-29' }).success).toBe(
      true,
    );
  });
  it('rejects ownership, role, budget and storage injection', () => {
    for (const extra of [
      { createdBy: userId },
      { coupleKey: 'client-controlled-identity' },
      { role: 'WEDDING_ADMIN' },
      { budget: 1000 },
      { storageQuotaBytes: 999 },
    ])
      expect(createWeddingSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
  it('keeps slug immutable in this milestone and coordinates paired', () => {
    expect(updateWeddingSchema.safeParse(input).success).toBe(false);
    expect(
      createWeddingSchema.safeParse({ ...input, defaultVenue: { latitude: 20 } }).success,
    ).toBe(false);
  });
  it('expires guest access at local end-of-day thirty civil days later', () => {
    expect(defaultGuestExpiry('2026-12-14', 'Asia/Kolkata').toISOString()).toBe(
      '2027-01-13T18:29:59.999Z',
    );
    expect(defaultGuestExpiry('2026-02-08', 'America/New_York').toISOString()).toBe(
      '2026-03-11T03:59:59.999Z',
    );
    expect(defaultGuestExpiry('2028-02-01', 'UTC').toISOString()).toBe('2028-03-02T23:59:59.999Z');
  });
});
describe('wedding orchestration and tenant boundaries', () => {
  it('blocks the same couple before creating any dependent records, despite a changed title, date or slug', async () => {
    repo.coupleExists.mockResolvedValue(true);
    await expect(
      weddingsService.create(userId, {
        ...input,
        title: 'New title',
        weddingDate: '2028-01-01',
        slug: 'another-address',
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'DUPLICATE_WEDDING' });
    expect(repo.coupleExists).toHaveBeenCalledWith(
      userId,
      input.brideName,
      input.groomName,
      session,
    );
    expect(repo.create).not.toHaveBeenCalled();
    expect(createInitialWeddingAdmin).not.toHaveBeenCalled();
    expect(createUnpublishedWebsite).not.toHaveBeenCalled();
  });
  it('translates concurrent couple-index conflicts into the duplicate-wedding response', async () => {
    repo.create.mockRejectedValue({ code: 11000, keyPattern: { createdBy: 1, coupleKey: 1 } });
    await expect(weddingsService.create(userId, input)).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_WEDDING',
    });
  });
  it('blocks edits that would duplicate another wedding using its creator scope', async () => {
    repo.find.mockResolvedValue(stored);
    repo.coupleExists.mockResolvedValue(true);
    const { slug: _slug, ...update } = input;
    await expect(weddingsService.update(userId, id.toString(), update)).rejects.toMatchObject({
      code: 'DUPLICATE_WEDDING',
    });
    expect(repo.coupleExists).toHaveBeenCalledWith(
      stored.createdBy.toString(),
      input.brideName,
      input.groomName,
      session,
      id.toString(),
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
  it('creates the wedding, admin and website within the same transaction', async () => {
    repo.create.mockResolvedValue({ ...stored, toObject: () => stored } as Awaited<
      ReturnType<typeof repo.create>
    >);
    const wedding = await weddingsService.create(userId, input);
    expect(createInitialWeddingAdmin).toHaveBeenCalledWith(id.toString(), userId, session);
    expect(createUnpublishedWebsite).toHaveBeenCalledWith(id.toString(), session);
    expect(wedding).toMatchObject({ id: id.toString(), role: 'WEDDING_ADMIN' });
    expect(wedding).not.toHaveProperty('storageQuotaBytes');
  });
  it('does not report success when a dependent write fails', async () => {
    repo.create.mockResolvedValue({ ...stored, toObject: () => stored } as Awaited<
      ReturnType<typeof repo.create>
    >);
    vi.mocked(createUnpublishedWebsite).mockRejectedValue(new Error('website write failed'));
    await expect(weddingsService.create(userId, input)).rejects.toThrow('website write failed');
  });
  it('returns a recoverable duplicate slug error', async () => {
    repo.create.mockRejectedValue({ code: 11000 });
    await expect(weddingsService.create(userId, input)).rejects.toMatchObject({
      statusCode: 409,
      code: 'SLUG_TAKEN',
    });
  });
  it('does not query a wedding when the user has no membership', async () => {
    vi.mocked(requireWeddingMembership).mockRejectedValue(
      new AppError(404, 'WEDDING_NOT_FOUND', 'Unavailable'),
    );
    await expect(weddingsService.get(userId, id.toString())).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repo.find).not.toHaveBeenCalled();
  });
  it('blocks organizer edits before writing', async () => {
    vi.mocked(requireWeddingMembership).mockResolvedValue({ role: 'ORGANIZER' } as NonNullable<
      Awaited<ReturnType<typeof requireWeddingMembership>>
    >);
    const { slug: _slug, ...update } = input;
    await expect(weddingsService.update(userId, id.toString(), update)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(repo.update).not.toHaveBeenCalled();
  });
  it('lists only wedding ids supplied by active memberships', async () => {
    vi.mocked(listActiveWeddingMemberships).mockResolvedValue([
      { weddingId: id.toString(), role: 'ORGANIZER' },
    ] as Awaited<ReturnType<typeof listActiveWeddingMemberships>>);
    repo.list.mockResolvedValue([stored]);
    expect(await weddingsService.list(userId)).toMatchObject([
      { id: id.toString(), role: 'ORGANIZER' },
    ]);
    expect(repo.list).toHaveBeenCalledWith([id.toString()]);
  });
});
describe('wedding HTTP boundaries', () => {
  it('rejects unauthenticated wedding requests', async () => {
    vi.mocked(authService.authenticate).mockRejectedValue(
      new AppError(401, 'UNAUTHENTICATED', 'Sign in'),
    );
    expect((await request(app).get('/api/v1/weddings')).status).toBe(401);
  });
  it('validates ids and denies unknown fields before writes', async () => {
    expect((await request(app).get('/api/v1/weddings/not-an-id')).status).toBe(422);
    expect(
      (
        await request(app)
          .post('/api/v1/weddings')
          .send({ ...input, published: true })
      ).status,
    ).toBe(422);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('returns availability without exposing existing wedding data', async () => {
    repo.slugExists.mockResolvedValue(true);
    const response = await request(app).get('/api/v1/weddings/slug-availability?slug=priya-rahul');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ available: false });
    expect(response.headers['cache-control']).toContain('no-store');
  });
});
