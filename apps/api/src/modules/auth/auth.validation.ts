import { z } from 'zod';
import { signupSchema, loginSchema } from '@make-my-marriage/contracts';
export const signupRequestSchema = z.object({ body: signupSchema });
export const loginRequestSchema = z.object({ body: loginSchema });
