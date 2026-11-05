import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { AuthUser, LoginInput, SignupInput } from '@make-my-marriage/contracts';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/app-error.js';
import { authRepository } from './auth.repository.js';

export const hashSessionToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
const publicUser = (user: {
  _id: { toString(): string };
  displayName: string;
  email: string;
}): AuthUser => ({
  id: user._id.toString(),
  displayName: user.displayName,
  email: user.email,
});
function sessionDetails(rememberMe = false) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 : env.SESSION_DAYS) * 86400000);
  return { token, tokenHash: hashSessionToken(token), expiresAt };
}
let dummyHash: Promise<string> | undefined;
export const authService = {
  async signup(input: SignupInput) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const user = await authRepository.createAccount(input, passwordHash);
      return { user: publicUser(user) };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new AppError(
          409,
          'ACCOUNT_EXISTS',
          'An account with this email already exists. Sign in instead.',
        );
      }
      throw error;
    }
  },
  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email.toLowerCase());
    dummyHash ??= bcrypt.hash(randomBytes(32).toString('hex'), 12);
    const matches = await bcrypt.compare(input.password, user?.passwordHash ?? (await dummyHash));
    if (!user || !matches || user.status !== 'ACTIVE') {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }
    const session = sessionDetails(input.rememberMe);
    await authRepository.createSession(user._id, session.tokenHash, session.expiresAt);
    return { user: publicUser(user), token: session.token, expiresAt: session.expiresAt };
  },
  async authenticate(token: unknown) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
    }
    const session = await authRepository.findSession(hashSessionToken(token), new Date());
    const user = session ? await authRepository.findActiveUser(session.userId) : null;
    if (!user)
      throw new AppError(401, 'UNAUTHENTICATED', 'Your session has expired. Sign in again.');
    return publicUser(user);
  },
  async logout(token: unknown) {
    if (typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      await authRepository.revokeSession(hashSessionToken(token));
    }
  },
};
