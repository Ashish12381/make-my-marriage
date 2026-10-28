import { createHmac } from 'node:crypto';
import { env } from '../../config/env.js';
import { auditRepository } from './audit.repository.js';
export const initializeAudit = () => auditRepository.initialize();
export async function allowAuthenticationAttempt(ip: string, email: string) {
  const windowMs = 15 * 60 * 1000;
  const window = Math.floor(Date.now() / windowMs);
  const digest = (value: string) =>
    createHmac('sha256', env.AUTH_SECRET ?? '')
      .update(value)
      .digest('hex');
  const counts = await auditRepository.recordAuthAttempt(
    digest(`ip:${ip}`),
    digest(`email:${email.trim().toLowerCase()}`),
    window,
  );
  return {
    allowed: counts.ipAttempts <= 40 && counts.emailAttempts <= 10,
    retryAfter: Math.ceil(((window + 1) * windowMs - Date.now()) / 1000),
  };
}
