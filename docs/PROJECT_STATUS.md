# Make My Marriage — Project Status

**Last updated:** 2026-10-08  
**Repository snapshot:** `16e49fd` — `feat(web): add public wedding planning homepage`  
**Current stage:** V1 foundation and public homepage complete; core product development pending.

This document is a development handoff for recovering context. It records implemented behavior, remaining PRD work, verification, and the recommended next milestone. It does not replace the requirements or define new scope. The user reported pushing the latest code to GitHub; this snapshot was checked against the local repository, not remote CI or deployment.

## Start here when resuming

1. Read this document and [AGENTS.md](../AGENTS.md).
2. Read the relevant requirements in [PRD.md](PRD.md), [SYSTEM_Design.md](SYSTEM_Design.md), [DATABASE_Design.md](DATABASE_Design.md), and [API_Design.md](API_Design.md) before implementing a feature.
3. Inspect the current code and Git changes. This status is a dated snapshot; code may have changed afterward.
4. Preserve the approved homepage design. Agree on the next feature and obtain its approved UI reference where needed.
5. Update this document after completing each milestone, including actual behavior, checks, and unresolved items.

## What is implemented

### Project foundation

- npm workspaces: `apps/web`, `apps/api`, and `packages/contracts`.
- Next.js App Router, React, strict TypeScript, Tailwind CSS, local Inter/Manrope fonts, and shared design tokens.
- Express modular monolith with separate exported application and local server startup.
- API liveness endpoint: `GET /api/v1/health` returns `{ "status": "ok" }`.
- Helmet, credential-aware frontend CORS, JSON body limits, cookie parsing, request validation infrastructure, not-found handling, and sanitized error handling.
- Zod environment validation and optional MongoDB connection at startup. The scaffold can run without a configured database.
- Backend module locations, empty routers, model-directory placeholders, and public-interface locations. These are structure only; business routers are unmounted.
- Authentication and wedding-access middleware placeholders fail closed if invoked; they do not authenticate or authorize users.
- R2, Resend, and Google Places configuration-validation foundations; no provider operations.
- Browser API client configured to include credentials. No browser token storage or JWT authentication.
- Formatting, lint, typecheck, tests, build scripts, and CI configuration.
- Shared contracts entry point exists but intentionally contains no product contracts yet.

### Public homepage

The user reviewed the homepage and accepted it as suitable for now. The implementation follows the supplied Google Stitch export, `stitch_make_my_marriage_landing_page.zip`, with PRD-aligned copy. The original export is an external design reference and is not stored under `docs/`.

Implemented sections: hero/dashboard preview, feature overview, family collaboration, expenses, family RSVP, wedding website, gallery, vendors, YouTube livestream, how it works, closing call to action, and footer.

- Warm cream/sand surfaces, terracotta accents, rounded cards, and the approved typography direction.
- Responsive header and mobile menu. The menu closes after navigation and supports Escape.
- Working section links, home links, signup links, and sign-in links.
- Interactive collaboration event selectors: Haldi, Mehendi, Sangeet Night, Wedding, and Reception. Selecting an event updates its sample title, date/venue, family leads, and three tasks with example statuses. Sangeet is selected initially.
- Keyboard-operable event buttons, selected-state semantics, announced content changes, visible focus indicators, skip link, and reduced-motion styling.
- Clearly labeled sample panels; static sample actions have reduced hover affordances. The collaboration preview does not offer a working Add Task action.
- Sample finance totals distinguish agreed costs, actual payments, and outstanding balances. Wedding-wide payments are shown separately and counted once.
- Gallery copy reflects technical upload verification and album visibility, without promising an approval workflow. Livestream copy describes opening a supplied YouTube link.
- Homepage metadata and local SVG icons. The ceremony preview image currently uses the external Google-hosted asset from the Stitch export.

**Boundary:** Sample task lists, payments, RSVP selections, vendor cards, website, and stream panels are marketing demonstrations. They do not read or write product data, call providers, submit RSVP, edit tasks, shortlist vendors, or play a real stream. Signup and login links work as navigation, but their destination pages are placeholders.

## Status against the PRD

The public marketing homepage is complete for the current milestone. It demonstrates the following modules but does not complete their functional requirements.

| PRD area | Current status | Remaining implementation |
| --- | --- | --- |
| 6.1 / FR-01 — Authentication & Wedding Setup | Scaffold only | Signup/login/logout/reset, profiles, opaque sessions, wedding creation/editing, onboarding, and wedding switching |
| 6.2 / FR-02 — Family & Organizer Management | Scaffold plus homepage demonstration | Member invitations/acceptance, roles, permissions, responsibilities, last-admin protection, and activity records |
| 6.3 / FR-03 — Multiple Wedding Events | Scaffold only | Event CRUD, organizers, related records, default albums, and published event updates |
| 6.4 / FR-04 — Wedding Dashboard | Route placeholder; homepage sample dashboard | Authorized aggregates, family RSVP summaries, expense totals, tasks, activity, and quick actions |
| 6.5 / FR-05 — Task Planner | Route placeholder; interactive homepage sample | Persistent tasks, assignment, checklist/comments, views/filters, templates, and reminders |
| 6.6 / FR-06 — Expenses & Payment Records | Route placeholder; sample charts/cards | Expenses, payments, paise calculations, attachments, reports, CSV export, and linked vendor ledger |
| 6.7 / FR-07 — Vendor Discovery & Management | Route placeholder; illustrative vendor cards | Google Places discovery, filters/map, manual vendors, shortlist/status, notes, quotations, and expense links |
| 6.8 / FR-08 — Guests & Family RSVP | Route placeholder; sample invitation | Family records/import, event invitations, guest access tokens, per-event responses/deadlines, and exports |
| 6.9 / FR-09 — Invitations & Email | Route placeholder; Resend configuration validation | Invitation templates, delivery records, bounded sends/retries, confirmations, reminders, and preferences |
| 6.10 / FR-10 — Gallery | Route placeholder; R2 configuration validation | Albums, compression/thumbnails, upload reservations/verification, privacy enforcement, QR links, quotas, and downloads |
| 6.11 / FR-11 — Wedding Website | Management route placeholder; homepage sample | Templates/settings, slug-based guest website, publish/unpublish, authorized content, and English/Hindi guest labels |
| 6.12 / FR-12 — YouTube Links | Homepage demonstration only | Per-event URL validation/storage, enable/disable, visibility checks, and real outbound live/recording links |
| 6.13 / FR-13 — Platform Admin | Backend module structure only | Protected admin UI, operational capabilities, strengthened access, and audited intervention |
| PRD non-functional and release acceptance requirements | Foundation checks only | End-to-end security, tenant isolation, provider behavior, accessibility/performance, operational readiness, and release scenarios |

No concrete MongoDB business schemas, repositories, business services, persistence workflows, guest website routes, or functioning platform-admin screen have been implemented. An existing route returning HTTP 200 does not mean its feature is complete.

## Decisions to preserve

Use the complete rules in AGENTS.md and the design documents. Particularly:

- Wedding is the tenant boundary. Enforce authorization and same-wedding references in services and scoped queries.
- Retain the modular monolith and exactly 18 core collections from the Database Design. Do not introduce extra livestream/admin collections or queue infrastructure.
- Authentication uses bcrypt and revocable opaque sessions in secure HTTP-only cookies, with hashed tokens in MongoDB. No JWTs or browser token storage. Signup/member acceptance does not require email verification.
- Allow multiple Wedding Admins and module-specific Organizer permissions; protect the last active admin.
- Guests do not register. One family record and active access link per wedding; independent `PENDING`, `YES`, or `NO` per invited event. No individual attendance/headcount tracking.
- Record money in integer paise and actual payments separately. No budgets, caps, payment processing, or duplicated wedding-wide costs.
- Store compressed images/thumbnails in R2 and metadata in MongoDB. No retained originals or photo approval workflow. `INVITED_GUESTS` means an actively invited family for the wedding.
- Use Google Places for discovery, Resend for bounded email batches, and Vercel Cron for daily RSVP reminders. YouTube hosts video; the app stores and opens event links.
- Preserve approved designs. No approved authentication/dashboard design reference has been added to the repository at this snapshot.

## Recommended next milestone

**Recommendation, not a recorded user approval:** implement authentication and initial wedding setup before building data-backed dashboards or additional business features.

1. Align the API response envelope, validation, and errors with the API Design; implement the approved auth UI and users/sessions schemas.
2. Implement signup/login/logout with password hashing, session expiry/revocation, cookie protections, and the required request security controls. Build password reset with the approved email integration when authorized.
3. Implement wedding creation and the initial admin membership together, enforcing tenant isolation from the start.
4. Verify the first usable journey: register, sign in, create a wedding, access its authorized workspace, sign out, and reject unauthorized access.
5. Continue with memberships/permissions, events/tasks, family invitations/RSVP, expense records, email/reminders, vendors, gallery, wedding website/YouTube links, and platform operations according to the technical dependencies.

The next session should confirm the desired feature and approved UI reference before starting it. The homepage does not require further redesign to proceed.

## Verification and local development

Last application verification: **2026-10-08**, after the interactive event preview implementation.

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test` | Passed: 5 API tests across 2 files; health and error handling only |
| `npm run build` | Passed for contracts, API, and web |
| `npm run format:check` | Passed |
| Browser checks | Homepage at desktop/tablet/mobile widths; no horizontal overflow at checked widths; navigation, menu, signup/login destinations, image loading, all five event selectors, and keyboard activation verified |

These checks do not validate unimplemented PRD workflows. Homepage interaction checks were manual browser checks; there is no automated frontend interaction suite yet. GitHub CI results and production deployment were not verified in this milestone.

From the repository root, run `npm run dev`. Web: `http://localhost:3000`; API: `http://localhost:4000`; health: `http://localhost:4000/api/v1/health`. See [README.md](../README.md) for prerequisites and environment setup. Do not overwrite existing local environment files or copy secrets into this document.

## Known limitations and follow-ups

- Core workflows, database persistence, provider calls, and production deployment remain pending. MongoDB was disabled during the recorded local verification because its URI was not configured.
- The scaffold health response and error envelopes are not yet the full API Design envelope; align them before implementing business APIs.
- Next.js on this Windows workspace encountered generated-cache/compiler failures during verification. A clean build with the dev server stopped passed. Avoid running builds against the same generated output concurrently; clear only the verified generated `.next` directory when recovery is needed.
- The ceremony preview depends on an external Stitch image URL. Review asset availability and hosting before production release.
- Legal/contact pages and links were not invented to populate the footer. Add them when their content and scope are approved.
- No deployment, real email send, media upload, live vendor search, or payment operation was performed during homepage development.

## Milestone history and maintenance

| Milestone | Status |
| --- | --- |
| V1 project scaffold | Complete; local routes, API liveness, and development tooling verified |
| Approved public homepage | Complete; user reviewed and accepted for now |
| Interactive homepage event examples | Complete; five event selectors and sample task panels verified |
| Project status handoff | Created on 2026-10-08 |
| Core authentication and wedding workflow | Pending |

After each milestone, update the date and repository reference, revise the PRD status rows, record checks actually run, add any unresolved decisions, and adjust the next milestone. Mark a PRD feature complete only when its real behavior and authorization are implemented and verified; UI previews and scaffold files are insufficient.
