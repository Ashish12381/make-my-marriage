# Shared contracts

This package is intentionally almost empty. Add shared DTOs, enums, and Zod schemas only when
both applications need them. Add Zod as a dependency when the first shared schema is introduced.

Do not import application code, Express, Next.js, Mongoose models, or database utilities here.
Expose shared contracts through `src/index.ts` and import `@make-my-marriage/contracts` from
consumers. Root development and build scripts compile this package before starting applications.
