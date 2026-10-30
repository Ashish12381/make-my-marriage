// Opt-in only: RUN_ATLAS_AUTH_TESTS=1. Uses one synthetic account in the configured *_dev database.
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createHmac, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { User } from '../src/modules/auth/models/user.model.js';
import { Session } from '../src/modules/auth/models/session.model.js';
import { AuditLog } from '../src/modules/audit/models/audit-log.model.js';
import { hashSessionToken } from '../src/modules/auth/auth.service.js';

const run = process.env.RUN_ATLAS_AUTH_TESTS === '1';
const checkWeb = process.env.RUN_AUTH_WEB_TESTS === '1';
const email = `auth-test-${randomUUID()}@example.invalid`;
const password = `Test${randomUUID()}!`;
const origin = env.WEB_ORIGIN;
function namedCookie(response: request.Response, name: string) {
  const cookies: unknown = response.headers['set-cookie'];
  if (!Array.isArray(cookies)) throw new Error('No cookies returned');
  const found: unknown = cookies.find(
    (value: unknown) => typeof value === 'string' && value.startsWith(`${name}=`),
  );
  if (typeof found !== 'string') throw new Error('Missing expected cookie');
  return found.split(';')[0] ?? '';
}
async function write(path: string, body: object, session = '') {
  const csrf = await request(app).get('/api/v1/auth/csrf').set('Origin', origin);
  expect(csrf.status).toBe(200);
  return request(app)
    .post(`/api/v1/auth/${path}`)
    .set('Origin', origin)
    .set('Cookie', [namedCookie(csrf, 'mmm_csrf'), ...(session ? [session] : [])])
    .set('X-CSRF-Token', String(csrf.body.data.csrfToken))
    .send(body);
}

async function checkHomepage(cookie: string, signedIn: boolean) {
  const response = await fetch(origin, { headers: { Cookie: cookie } });
  expect(response.status).toBe(200);
  const html = await response.text();
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  expect(header).toBeDefined();
  if (signedIn) {
    expect(header).toContain('Sign Out');
    expect(header).not.toContain('href="/login"');
    expect(html).toContain('href="/weddings"');
    expect(html).not.toContain('href="/signup"');
  } else {
    expect(header).toContain('href="/login"');
    expect(header).not.toContain('Sign Out');
  }
}
describe.skipIf(!run)('Atlas account lifecycle (opt-in)', () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI) throw new Error('Configure the development database first.');
    const name = new URL(env.MONGODB_URI).pathname.slice(1);
    if (!name.endsWith('_dev'))
      throw new Error('Atlas auth tests require a database name ending in _dev.');
    await connectDatabase(env.MONGODB_URI);
  }, 30000);
  afterAll(async () => {
    if (mongoose.connection.readyState !== 1) return;
    const user = await User.findOne({ emailNormalized: email });
    if (user) {
      await Session.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id, emailNormalized: email });
    }
    const emailHash = createHmac('sha256', env.AUTH_SECRET ?? '')
      .update(`email:${email}`)
      .digest('hex');
    await AuditLog.deleteMany({ action: 'AUTH_ATTEMPT', 'metadata.emailHash': emailHash });
    await disconnectDatabase();
  }, 30000);
  it('persists bcrypt credentials, blocks duplicates, authenticates, expires and revokes sessions', async () => {
    const signup = await write('signup', { displayName: 'Synthetic Auth Test', email, password });
    expect(signup.status).toBe(201);
    expect(signup.headers['set-cookie']).toBeUndefined();
    const user = await User.findOne({ emailNormalized: email }).select('+passwordHash');
    expect(user).not.toBeNull();
    if (!user) throw new Error('Signup did not persist the test account.');
    expect(await bcrypt.compare(password, user?.passwordHash ?? '')).toBe(true);
    expect(user?.platformRole).toBe('USER');
    expect(await Session.countDocuments({ userId: user._id })).toBe(0);
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
    const duplicate = await Promise.all(
      [1, 2].map(() =>
        write('signup', { displayName: 'Duplicate', email: email.toUpperCase(), password }),
      ),
    );
    expect(duplicate.map((response) => response.status)).toEqual([409, 409]);
    expect(await User.countDocuments({ emailNormalized: email })).toBe(1);
    expect((await write('login', { email, password: 'Incorrect123!' })).status).toBe(401);
    const firstLogin = await write('login', { email, password });
    expect(firstLogin.status).toBe(200);
    const cookie = namedCookie(firstLogin, 'mmm_session');
    const raw = cookie.slice('mmm_session='.length);
    expect(await Session.findOne({ tokenHash: hashSessionToken(raw) })).not.toBeNull();
    expect((await request(app).get('/api/v1/auth/me').set('Cookie', cookie)).status).toBe(200);
    if (checkWeb) {
      await checkHomepage('', false);
      await checkHomepage(cookie, true);
      for (const path of ['/login', '/signup']) {
        const response = await fetch(`${origin}${path}`, {
          headers: { Cookie: cookie },
          redirect: 'manual',
        });
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('/');
        expect(await response.text()).not.toContain('<form');
      }
      const signedOutAccount = await fetch(`${origin}/account`, { redirect: 'manual' });
      expect(signedOutAccount.status).toBe(307);
      expect(signedOutAccount.headers.get('location')).toBe('/login');
      const account = await fetch(`${origin}/account`, { headers: { Cookie: cookie } });
      expect(account.status).toBe(200);
    }
    const login = await write('login', { email: email.toUpperCase(), password, rememberMe: true });
    expect(login.status).toBe(200);
    const loginCookie = namedCookie(login, 'mmm_session');
    expect((await write('logout', {}, loginCookie)).status).toBe(204);
    expect((await request(app).get('/api/v1/auth/me').set('Cookie', loginCookie)).status).toBe(401);
    if (checkWeb) {
      await checkHomepage(loginCookie, false);
      const account = await fetch(`${origin}/account`, {
        headers: { Cookie: loginCookie },
        redirect: 'manual',
      });
      expect(account.status).toBe(307);
      expect(account.headers.get('location')).toBe('/login');
    }
    // TTL cleanup is asynchronous; application checks must reject an expired record still in MongoDB.
    await Session.updateOne(
      { tokenHash: hashSessionToken(raw) },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
    expect((await request(app).get('/api/v1/auth/me').set('Cookie', cookie)).status).toBe(401);
    await User.updateOne({ emailNormalized: email }, { $set: { status: 'SUSPENDED' } });
    expect((await write('login', { email, password })).status).toBe(401);
  }, 60000);
});
