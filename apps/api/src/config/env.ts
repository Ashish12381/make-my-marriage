import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

// Resolve from this module so local .env loading also works from compiled dist/.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional(),
);

const origin = z.url().refine((value) => {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}, 'Must be an HTTP(S) origin without a path, query, or credentials');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: origin.default('http://localhost:3000'),
  MONGODB_URI: optionalString.pipe(
    z
      .string()
      .regex(/^mongodb(?:\+srv)?:\/\//, 'Must be a MongoDB connection URI')
      .optional(),
  ),
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_ENDPOINT: optionalString,
  GOOGLE_PLACES_API_KEY: optionalString,
  CRON_SECRET: optionalString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Invalid API environment configuration. Check: ${fields}`);
}

export const env = parsed.data;
