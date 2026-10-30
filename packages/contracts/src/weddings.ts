import { z } from 'zod';

export const weddingRoleSchema = z.enum(['WEDDING_ADMIN', 'ORGANIZER']);
export const civilDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid wedding date.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Choose a real calendar date.');
export const timezoneSchema = z
  .string()
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, 'Choose a valid timezone.');
export const weddingSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens.');
export const weddingVenueSchema = z
  .strictObject({
    name: z.string().trim().max(200).optional(),
    address: z.string().trim().max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine(
    (v) => (v.latitude === undefined) === (v.longitude === undefined),
    'Supply both latitude and longitude.',
  );
export const createWeddingSchema = z.strictObject({
  title: z.string().trim().min(1, 'Enter a wedding title.').max(120),
  brideName: z.string().trim().min(1, 'Enter the bride’s name.').max(100),
  groomName: z.string().trim().min(1, 'Enter the groom’s name.').max(100),
  weddingDate: civilDateSchema,
  timezone: timezoneSchema,
  slug: weddingSlugSchema,
  defaultVenue: weddingVenueSchema.optional(),
});
// This milestone does not change slugs or accept client-owned publication/storage fields.
export const updateWeddingSchema = createWeddingSchema.omit({ slug: true });
export const weddingSchema = createWeddingSchema.extend({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  role: weddingRoleSchema,
  status: z.literal('ACTIVE'),
});
export const weddingResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ wedding: weddingSchema }),
});
export const weddingsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ weddings: z.array(weddingSchema) }),
});
export const slugAvailabilityResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ available: z.boolean() }),
});
export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
export type Wedding = z.infer<typeof weddingSchema>;
export type WeddingRole = z.infer<typeof weddingRoleSchema>;
