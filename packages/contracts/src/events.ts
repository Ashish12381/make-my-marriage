import { z } from 'zod';
import { timezoneSchema, weddingVenueSchema } from './weddings.js';

export const eventIdSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/i)
  .transform((id) => id.toLowerCase());
export const eventTypeSchema = z.enum([
  'HALDI',
  'MEHENDI',
  'SANGEET',
  'WEDDING',
  'RECEPTION',
  'CUSTOM',
]);
export const eventStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'COMPLETED', 'CANCELLED']);
const eventVenueSchema = weddingVenueSchema.safeExtend({
  mapUrl: z
    .url({ protocol: /^https?$/ })
    .max(2048)
    .optional(),
});
const eventFields = z.strictObject({
  name: z.string().trim().min(1, 'Enter an event name.').max(120),
  type: eventTypeSchema,
  description: z.string().trim().max(2000).optional(),
  timezone: timezoneSchema,
  startAt: z.iso.datetime().nullish(),
  endAt: z.iso.datetime().nullish(),
  venue: eventVenueSchema.nullish(),
  organizerIds: z.array(eventIdSchema).max(100).optional(),
});
export const createEventSchema = eventFields;
export const updateEventSchema = eventFields
  .partial()
  .extend({
    status: eventStatusSchema.optional(),
    expectedTimezone: timezoneSchema.optional(),
    venuePatch: z
      .strictObject({
        name: eventVenueSchema.shape.name.nullable(),
        address: eventVenueSchema.shape.address.nullable(),
        mapUrl: eventVenueSchema.shape.mapUrl.nullable(),
      })
      .refine((input) => Object.keys(input).length > 0, 'Enter at least one venue change.')
      .optional(),
  })
  .refine(
    (input) => input.venuePatch === undefined || input.venue === undefined,
    'Supply either a venue or venue changes.',
  )
  .refine(
    (input) => Object.keys(input).some((key) => key !== 'expectedTimezone'),
    'Enter at least one change.',
  );
export const weddingEventSchema = eventFields.extend({
  id: eventIdSchema,
  status: eventStatusSchema,
  organizerIds: z.array(eventIdSchema),
});
export const eventResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ event: weddingEventSchema, defaultAlbumId: eventIdSchema.optional() }),
});
export const eventsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ events: z.array(weddingEventSchema) }),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type WeddingEvent = z.infer<typeof weddingEventSchema>;
