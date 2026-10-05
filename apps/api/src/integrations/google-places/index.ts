import { z } from 'zod';
import { env } from '../../config/env.js';
import { parseIntegrationConfiguration } from '../configuration.js';

const configurationSchema = z.object({ apiKey: z.string().min(1) });

/** Configuration only; future discovery requests should use native fetch. */
export function getGooglePlacesConfiguration() {
  return parseIntegrationConfiguration('Google Places', configurationSchema, {
    apiKey: env.GOOGLE_PLACES_API_KEY,
  });
}
