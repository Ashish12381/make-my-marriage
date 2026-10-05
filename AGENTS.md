# Working instructions for Make My Marriage

Make My Marriage is a collaborative wedding planning SaaS. This repository contains the V1 project foundation. Implement approved requirements incrementally; preserve existing user files and the documents in `docs/`. Read the relevant PRD, system design, database design, and API design before implementing a feature. Explicit current task instructions take precedence when documents disagree; flag material discrepancies instead of inventing a resolution or a new feature.

## Architecture and ownership

- Use npm workspaces: `apps/web`, `apps/api`, and `packages/contracts`.
- Web uses Next.js App Router, React, TypeScript, and Tailwind CSS. Retain the approved design direction and central design tokens. Do not invent replacements for the approved page designs.
- API uses an Express modular monolith, TypeScript, MongoDB Atlas/Mongoose, and Zod. Keep `app.ts` independent of the local HTTP listener in `server.ts`.
- Contracts contain genuinely shared enums, DTO types, and Zod schemas only. Never add Mongoose models, repositories, database logic, Express code, Next.js code, or secrets there.
- Do not introduce NestJS, Prisma, SQL, GraphQL, microservices, or unnecessary monorepo tooling. No Redis, Kafka, RabbitMQ, BullMQ, or background worker infrastructure for V1.

Each backend module owns its business logic and persistence. Follow the existing module naming and file structure:

| Layer            | Responsibility                                            |
| ---------------- | --------------------------------------------------------- |
| Routes           | HTTP routing only                                         |
| Controllers      | Translate HTTP input/output; no database queries          |
| Services         | Business rules and authorization-aware orchestration      |
| Repositories     | Mongoose/database access                                  |
| Validation       | Zod request schemas at API boundaries                     |
| Models           | Mongoose models belonging to the owning module            |
| Public interface | Explicit service/query capabilities used by other modules |

A module must not directly manipulate another module's Mongoose model. Call that module's service or public query interface. For example, expenses must use an events public interface when event information is needed. Avoid circular dependencies and exposing persistence internals through module exports.

## Canonical database ownership

V1 has exactly these **18 core collections**. Use these names, including `guest_access_tokens`; do not add a separate livestream or platform-admin collection.

| Module        | Owned collections                           |
| ------------- | ------------------------------------------- |
| `auth`        | `users`, `sessions`                         |
| `weddings`    | `weddings`                                  |
| `memberships` | `wedding_memberships`, `membership_invites` |
| `events`      | `events`                                    |
| `tasks`       | `tasks`                                     |
| `expenses`    | `expenses`, `expense_payments`              |
| `guests`      | `guest_groups`                              |
| `invitations` | `event_invitations`, `guest_access_tokens`  |
| `vendors`     | `vendor_selections`                         |
| `gallery`     | `albums`, `media_assets`                    |
| `website`     | `website_settings`                          |
| `email`       | `email_deliveries`                          |
| `audit`       | `audit_logs`                                |

`platform-admin` coordinates approved capabilities through public module interfaces and owns no additional core collection. Concrete schemas must come from the Database Design document; do not invent incomplete schemas for scaffold placeholders.

## Tenant isolation

- Wedding is the tenant boundary. Every wedding-owned record is scoped by `weddingId`.
- Never trust `weddingId` merely because the client supplied it. Server-side authorization and database queries must enforce wedding ownership.
- Verify that referenced entities belong to the same wedding, including event, expense, guest group, vendor selection, and album references.
- Enforce authorization in services and scoped persistence queries, not only in frontend navigation or route parameters.

## Users, sessions, and roles

- Registered users are Wedding Admins, Organizers, or platform users. Guests do not create accounts.
- Authentication uses email/password and bcrypt password hashing.
- Use opaque, revocable sessions. Store token hashes in MongoDB and the session token in a secure HTTP-only cookie.
- Do not use JWT authentication for V1. Do not store authentication tokens in `localStorage` or `sessionStorage`.
- Browser API requests support credentials. Configure CORS for the allowed frontend origin and credentials.
- Email verification is not required for signup or member acceptance in V1. Accepting membership still requires possession of its valid invitation token; a matching email alone must not grant wedding access.
- Users may participate in multiple weddings. Multiple Wedding Admins are allowed.
- Organizers may have restricted or module-specific permissions. Prevent removal of the last active Wedding Admin when implementing membership changes.
- Scaffold authentication and wedding-access middleware are structural placeholders. Do not mount them as if authorization is implemented, or allow placeholders to grant access.

## Guests and invitations

- One family is one `guest_groups` record. Do not create individual family-member or +1 records.
- Do not collect RSVP headcount/Pax in V1 or derive attendance counts from family RSVP.
- One family receives one active guest access link per wedding.
- RSVP is independent for each invited event, with `PENDING`, `YES`, or `NO` status. A family may respond only for its invited events.

## Expenses

- No budgets, spending caps, or over-budget alerts.
- Store money in integer paise. Actual payments belong in `expense_payments`.
- A vendor serving multiple events under one combined price may have one wedding-wide expense.
- Do not duplicate wedding-wide costs into individual event totals.

## Media and gallery privacy

- Image binary data never belongs in MongoDB. Cloudflare R2 stores compressed main images and thumbnails; MongoDB stores metadata and object keys.
- Do not retain original uncompressed files in V1.
- No photo approval or moderation workflow. Use technical upload states only.
- Successful, valid uploads become available according to album access rules. Wedding Admins and authorized Organizers may delete photos.
- Supported album visibility is `PUBLIC`, `INVITED_GUESTS`, or `ORGANIZERS_ONLY`.
- `INVITED_GUESTS` means an actively invited family for the wedding; the family does not need an invitation to the album's particular event.

## Livestream, email, and vendors

- An event may contain optional YouTube livestream configuration. Make My Marriage does not host video. Do not create a livestream collection, microservice, or video infrastructure.
- Use Resend for email. Send bounded, small batches and store delivery attempts/status in `email_deliveries`.
- Daily RSVP reminders are triggered through Vercel Cron. Do not introduce a queue or process-local scheduling infrastructure for V1.
- Nearby vendor discovery uses Google Places. `vendor_selections` stores wedding-specific shortlist and manual metadata; do not copy a full Google Places directory into MongoDB.

## Implementation and verification

- Prefer small, reviewable changes, understandable naming, strict TypeScript, and clear imports. Avoid premature abstractions and meaningless boilerplate.
- Do not invent features outside the approved PRD or implement deferred features to populate the scaffold.
- Avoid `any`, `@ts-ignore`, and unsafe global declarations unless necessary and explicitly documented.
- Use Zod at API boundaries and for backend environment validation. Optional provider secrets must not be required merely to start the local scaffold; validate them when the integration is used.
- Never commit secrets or expose backend credentials through public frontend variables or shared packages. Environment examples contain placeholders only.
- Do not make real provider calls, send email, or upload media without authorization for the relevant implementation or operation.
- Run `npm run lint`, `npm run typecheck`, and `npm run test` after modifications. Run `npm run build` for application or configuration changes, and `npm run format:check` before completing work.
- Add meaningful tests for implemented behavior. Do not add fake unit tests for unimplemented business modules.
- Preserve the separation between the exported Express application and local server startup. `apps/web` and `apps/api` will become separate Vercel projects; deployment is outside the scaffold phase.
- Do not commit or push unless the user explicitly asks.
