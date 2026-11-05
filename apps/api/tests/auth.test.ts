import request from 'supertest';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    WEB_ORIGIN: 'http://localhost:3000',
    AUTH_SECRET: 'a'.repeat(64),
    MONGODB_URI: 'mongodb://unused.test/auth',
    SESSION_DAYS: 7,
    AUTH_TRUST_PROXY_HOPS: 0,
  },
}));
vi.mock('../src/config/database.js', () => ({ connectDatabase: vi.fn() }));
vi.mock('../src/modules/auth/auth.repository.js', () => ({
  authRepository: {
    initialize: vi.fn(),
    createAccount: vi.fn(),
    findByEmail: vi.fn(),
    createSession: vi.fn(),
    findSession: vi.fn(),
    findActiveUser: vi.fn(),
    revokeSession: vi.fn(),
  },
}));
vi.mock('../src/modules/audit/audit.repository.js', () => ({
  auditRepository: {
    initialize: vi.fn(),
    recordAuthAttempt: vi.fn(),
  },
}));
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { auditRepository } from '../src/modules/audit/audit.repository.js';
import { User } from '../src/modules/auth/models/user.model.js';
import { Session } from '../src/modules/auth/models/session.model.js';
import { hashSessionToken } from '../src/modules/auth/auth.service.js';

const origin = 'http://localhost:3000';
const input = { displayName: 'Test Family', email: 'Family@Example.com', password: 'Ceremony123!' };
const user = new User({
  displayName: input.displayName,
  email: input.email,
  emailNormalized: 'family@example.com',
  passwordHash: 'set in test',
});
const repo = vi.mocked(authRepository);
const audit = vi.mocked(auditRepository);
function cookie(response: request.Response, name: string): string {
  const cookies: unknown = response.headers['set-cookie'];
  if (!Array.isArray(cookies)) throw new Error('Expected response cookies');
  const value: unknown = cookies.find(
    (item: unknown) => typeof item === 'string' && item.startsWith(`${name}=`),
  );
  if (typeof value !== 'string') throw new Error('Expected named cookie');
  return value;
}
async function csrf() {
  const response = await request(app).get('/api/v1/auth/csrf').set('Origin', origin);
  return {
    token: String(response.body.data.csrfToken),
    cookie: cookie(response, 'mmm_csrf').split(';')[0] ?? '',
  };
}
async function post(path: string, body: object, sessionCookie?: string) {
  const credential = await csrf();
  return request(app)
    .post(`/api/v1/auth/${path}`)
    .set('Origin', origin)
    .set('X-CSRF-Token', credential.token)
    .set('Cookie', [credential.cookie, ...(sessionCookie ? [sessionCookie] : [])])
    .send(body);
}
beforeEach(() => {
  vi.clearAllMocks();
  audit.recordAuthAttempt.mockResolvedValue({ ipAttempts: 1, emailAttempts: 1 });
  repo.createAccount.mockResolvedValue(user);
  repo.findByEmail.mockResolvedValue(null);
  repo.findSession.mockResolvedValue(null);
  repo.findActiveUser.mockResolvedValue(null);
});
describe('Authentication request security', () => {
  it('issues a non-cached, HttpOnly CSRF cookie and rejects a foreign origin', async () => {
    const response = await request(app).get('/api/v1/auth/csrf').set('Origin', origin);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(cookie(response, 'mmm_csrf')).toContain('HttpOnly');
    expect(
      (await request(app).get('/api/v1/auth/csrf').set('Origin', 'https://other.example')).status,
    ).toBe(403);
  });
  it('rejects missing or incorrect Origin and missing or forged CSRF before writes', async () => {
    expect((await request(app).post('/api/v1/auth/signup').send(input)).status).toBe(403);
    expect(
      (await request(app).post('/api/v1/auth/signup').set('Origin', origin).send(input)).status,
    ).toBe(403);
    expect(
      (
        await request(app)
          .post('/api/v1/auth/signup')
          .set('Origin', 'https://evil.example')
          .send(input)
      ).status,
    ).toBe(403);
    const c = await csrf();
    const forged = c.token.slice(0, -1) + (c.token.endsWith('x') ? 'y' : 'x');
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .set('Origin', origin)
      .set('Cookie', c.cookie)
      .set('X-CSRF-Token', forged)
      .send(input);
    expect(response.status).toBe(403);
    expect(repo.createAccount).not.toHaveBeenCalled();
  });
  it.each([
    { ...input, platformRole: 'SUPER_ADMIN' },
    { ...input, email: 'invalid' },
    { ...input, password: 'weak' },
    { ...input, password: `a1${'😀'.repeat(18)}` },
  ])('rejects invalid fields and privilege injection', async (body) => {
    expect((await post('signup', body)).status).toBe(422);
    expect(repo.createAccount).not.toHaveBeenCalled();
  });
  it('uses shared redacted attempts and returns Retry-After when throttled', async () => {
    audit.recordAuthAttempt.mockResolvedValue({ ipAttempts: 1, emailAttempts: 11 });
    const response = await post('login', { email: input.email, password: input.password });
    expect(response.status).toBe(429);
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
    const args = audit.recordAuthAttempt.mock.calls[0];
    expect(args?.[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(args?.[1]).toMatch(/^[a-f0-9]{64}$/);
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });
});
describe('Signup and login', () => {
  it('hashes the password and creates no session until explicit login', async () => {
    const response = await post('signup', input);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { user: { displayName: input.displayName, email: input.email }, weddings: [] },
      meta: { requestId: expect.any(String) },
    });
    const args = repo.createAccount.mock.calls[0];
    expect(args).toBeDefined();
    expect(await bcrypt.compare(input.password, args?.[1] ?? '')).toBe(true);
    expect(args).toHaveLength(2);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(repo.createSession).not.toHaveBeenCalled();
    expect(response.body.data).not.toHaveProperty('token');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });
  it('clears a prior browser session after successful registration instead of auto-login', async () => {
    const token = randomBytes(32).toString('base64url');
    const response = await post('signup', input, `mmm_session=${token}`);
    expect(response.status).toBe(201);
    expect(repo.revokeSession).toHaveBeenCalledWith(hashSessionToken(token));
    expect(cookie(response, 'mmm_session')).toContain('Expires=Thu, 01 Jan 1970');
    expect(repo.createSession).not.toHaveBeenCalled();
  });
  it('maps the unique email index conflict to a useful signup error', async () => {
    repo.createAccount.mockRejectedValueOnce({ code: 11000 });
    const response = await post('signup', input);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('ACCOUNT_EXISTS');
  });
  it('normalizes email lookup and persists a 30-day session only when requested', async () => {
    const active = new User({
      displayName: input.displayName,
      email: input.email,
      emailNormalized: 'family@example.com',
      passwordHash: await bcrypt.hash(input.password, 4),
    });
    repo.findByEmail.mockResolvedValue(active);
    const remembered = await post('login', {
      email: ' Family@Example.com ',
      password: input.password,
      rememberMe: true,
    });
    expect(remembered.status).toBe(200);
    expect(repo.findByEmail).toHaveBeenCalledWith('family@example.com');
    expect(cookie(remembered, 'mmm_session')).toContain('Expires=');
    const expires = repo.createSession.mock.calls[0]?.[2];
    expect(expires?.getTime()).toBeGreaterThan(Date.now() + 29 * 86400000);
    const standard = await post('login', { email: input.email, password: input.password });
    expect(cookie(standard, 'mmm_session')).not.toContain('Expires=');
  });
  it('uses the same error for unknown, wrong-password, and suspended accounts', async () => {
    const missing = await post('login', { email: input.email, password: input.password });
    const active = new User({
      displayName: input.displayName,
      email: input.email,
      emailNormalized: 'family@example.com',
      passwordHash: await bcrypt.hash(input.password, 4),
    });
    repo.findByEmail.mockResolvedValue(active);
    const wrong = await post('login', { email: input.email, password: 'Wrong123!' });
    active.status = 'SUSPENDED';
    const suspended = await post('login', { email: input.email, password: input.password });
    for (const response of [missing, wrong, suspended]) {
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
    }
    expect(repo.createSession).not.toHaveBeenCalled();
  });
});
describe('Session resolution and sign-out', () => {
  it('rejects missing, forged, expired/revoked sessions and suspended users', async () => {
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
    expect(
      (await request(app).get('/api/v1/auth/me').set('Cookie', 'mmm_session=forged')).status,
    ).toBe(401);
    const token = randomBytes(32).toString('base64url');
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', `mmm_session=${token}`);
    expect(response.status).toBe(401);
    expect(repo.findSession).toHaveBeenCalledWith(hashSessionToken(token), expect.any(Date));
    repo.findSession.mockResolvedValue(
      new Session({
        userId: user._id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 60000),
      }),
    );
    expect(
      (await request(app).get('/api/v1/auth/me').set('Cookie', `mmm_session=${token}`)).status,
    ).toBe(401);
  });
  it('resolves valid profiles and revokes the presented session on logout', async () => {
    const token = randomBytes(32).toString('base64url');
    repo.findSession.mockResolvedValue(
      new Session({
        userId: user._id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 60000),
      }),
    );
    repo.findActiveUser.mockResolvedValue(user);
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', `mmm_session=${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(user._id.toString());
    const logout = await post('logout', {}, `mmm_session=${token}`);
    expect(logout.status).toBe(204);
    expect(repo.revokeSession).toHaveBeenCalledWith(hashSessionToken(token));
    expect(cookie(logout, 'mmm_session')).toContain('Expires=Thu, 01 Jan 1970');
  });
});
