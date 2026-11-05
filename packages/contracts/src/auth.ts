import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254);
// bcrypt consumes at most 72 UTF-8 bytes. Reject longer input instead of silently truncating it.
const boundedPassword = z
  .string()
  .min(1, 'Enter your password.')
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    'Use a password of at most 72 UTF-8 bytes.',
  );
export const signupSchema = z.strictObject({
  displayName: z
    .string()
    .trim()
    .min(1, 'Enter your full name.')
    .max(100, 'Use at most 100 characters.'),
  email: emailSchema,
  password: boundedPassword.refine(
    (value) => value.length >= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value),
    'Use at least 8 characters, including a letter and a number.',
  ),
});
export const loginSchema = z.strictObject({
  email: emailSchema,
  password: boundedPassword,
  rememberMe: z.boolean().default(false),
});
export const authUserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
});
export const authDataSchema = z.object({ user: authUserSchema });
export const authResponseSchema = z.object({ success: z.literal(true), data: authDataSchema });
export const csrfResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ csrfToken: z.string() }),
});
export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
