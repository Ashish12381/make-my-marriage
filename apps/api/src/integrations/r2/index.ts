import { z } from 'zod';
import { env } from '../../config/env.js';
import { parseIntegrationConfiguration } from '../configuration.js';

const configurationSchema = z.object({
  accountId: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  bucketName: z.string().min(1),
  endpoint: z.url({ protocol: /^https$/ }),
});

/** Configuration only; add an S3-compatible client when uploads are implemented. */
export function getR2Configuration() {
  return parseIntegrationConfiguration('Cloudflare R2', configurationSchema, {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    endpoint: env.R2_ENDPOINT,
  });
}
