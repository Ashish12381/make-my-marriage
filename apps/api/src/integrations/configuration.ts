import type { z } from 'zod';

export function parseIntegrationConfiguration<T>(
  name: string,
  schema: z.ZodType<T>,
  input: unknown,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    // Never include input values or provider secrets in configuration errors.
    throw new Error(`${name} is not configured correctly. Check: ${fields}`);
  }
  return result.data;
}
