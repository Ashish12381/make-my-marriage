import { z } from 'zod';
import { env } from '../../config/env.js';
import { parseIntegrationConfiguration } from '../configuration.js';

const configurationSchema = z.object({
  apiKey: z.string().min(1),
  fromEmail: z.email(),
});

/** Validate lazily when the bounded email service is used. */
export function getResendConfiguration() {
  return parseIntegrationConfiguration('Resend', configurationSchema, {
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.RESEND_FROM_EMAIL,
  });
}
