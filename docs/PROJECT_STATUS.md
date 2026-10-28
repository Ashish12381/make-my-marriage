# Make My Marriage — Project Status

**Last updated:** 2026-10-16

**Homepage baseline (auth changes are currently uncommitted):** `16e49fd` — `feat(web): add public wedding planning homepage`

**Current stage:** Public homepage plus Atlas-backed signup/login/session/logout implemented; wedding setup and the remaining business workflows are pending.

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
- Backend module structure remains in place. Auth routes are mounted; other business routers remain unmounted.
- Session authentication validates hashed tokens, expiry, revocation, and active users. Wedding membership authorization remains a fail-closed placeholder.
- R2, Resend, and Google Places configuration-validation foundations; no provider operations.
- Browser API client configured to include credentials. No browser token storage or JWT authentication.
- Formatting, lint, typecheck, tests, build scripts, and CI configuration.
- Shared contracts contain Zod signup/login validators, public auth DTOs, and response schemas consumed by both applications.

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

**Boundary:** Sample task lists, payments, RSVP selections, vendor cards, website, and stream panels are marketing demonstrations. They do not read or write product data, call providers, submit RSVP, edit tasks, shortlist vendors, or play a real stream. Signup and login links now lead to implemented auth forms.

## Status against the PRD

The public marketing homepage and signup/login milestone are implemented. Marketing samples do not complete the corresponding business modules.

| PRD area | Current status | Remaining implementation |
| --- | --- | --- |
| 6.1 / FR-01 — Authentication & Wedding Setup | Signup/login/current profile/logout implemented | Password reset, profile editing, wedding setup/onboarding, and wedding switching remain pending |
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

Concrete users/sessions schemas, auth repositories/services, and audit-backed throttling are implemented. Other business schemas/workflows, guest website routes, and platform administration remain pending. An existing route returning HTTP 200 does not mean its feature is complete.

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
- Preserve approved designs. Auth screens were read directly from Stitch (project `9065562061050388454`); see AUTH_SETUP.md for screen references. Other approved screen exports are not stored in the repository.

## Signup/login milestone — 2026-10-16

- Responsive Stitch-based `/signup` and `/login` forms, shared validation, password visibility, confirm-password validation, loading/error feedback, and a 30-day Remember Me option.
- Atlas-backed user registration without auto-login; session creation occurs only on explicit login; bcrypt cost 12; normalized email uniqueness; safe public profile responses.
- Opaque 256-bit session tokens with SHA-256 hashes in MongoDB; host-only HttpOnly/SameSite=Lax cookies, Secure in production. Standard sessions expire after seven days by default; remembered sessions after 30 days. Expiry/revocation are checked in code as well as TTL cleanup.
- Signed double-submit CSRF plus exact Origin checks; redacted attempt records in the existing `audit_logs` collection provide shared throttling. No new collection or queue was introduced.
- Per the product owner’s 2026-10-16 revision, signup now redirects to login with an account-created notice, without issuing a session. This supersedes the original automatic-login signup contract in API_Design.md; see AUTH_SETUP.md.
- Per the product owner’s additional revision, successful login and existing-session visits to auth pages redirect to the homepage (`/`). Signup still redirects to login. `/account` is no longer the post-login destination; it remains an optional page that resolves the real session and offers working sign-out. It explicitly explains that wedding setup is the next feature; it is not a completed dashboard.
- Homepage desktop/mobile navigation, footer and closing section now show Sign Out for validated sessions. Auth pages check sessions before rendering, eliminating the brief login form flash. Login/logout refresh the homepage after cookies change. Server-rendered session navigation requires a shared cookie hostname or a same-origin API proxy before deployment; see AUTH_SETUP.md.
- Signed-in hero navigation now says Your Account and opens `/account` directly, avoiding the signup/home loop. Account pages validate sessions on the server and recheck active tabs after session-change hints or focus/visibility/history restoration. Invalid sessions clear the profile and navigate to login; no tokens or authentication state are stored in browser storage. Wedding onboarding remains pending.
- No email verification is required. Password reset is not yet implemented; the Forgot Password destination explains that limitation rather than pretending to send an email.
- Unapproved legal/support links and the design's required terms checkbox were not shipped without approved policy content. The post-auth screen does not repeat the Stitch transition's out-of-scope budget wording or offer a dead setup action.
- Live credentials were removed from the modified tracked `.env.example`; working credentials remain in ignored `.env`. A random AUTH_SECRET was generated locally without printing it.

## Recommended next milestone

Implement wedding setup and initial Wedding Admin membership atomically, followed by memberships/permissions and events/tasks. Password recovery needs its approved token-persistence design and Resend configuration; the current user/session schemas do not silently invent password-reset fields or a nineteenth collection. Profile editing and the full session-management API are also pending. See [AUTH_SETUP.md](AUTH_SETUP.md).

## Verification and local development

Last application verification: **2026-10-16**, after signup/login implementation. Final checks are recorded below.

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test` | Passed: 19 offline API tests, 26 frontend session/navigation tests and 1 opt-in Atlas lifecycle test (46 total). Default runs skip the Atlas test. Live HTTP checks verified signed-in account navigation, account access/redirects before and after revocation, and auth redirects without form rendering |
| `npm run build` | Passed for contracts, API, and web |
| `npm run format:check` | Passed |
| Browser checks | Homepage checks passed on 2026-10-08. Auth visual/browser interaction inspection was blocked on 2026-10-16 because Computer Use could not establish the active URL confidently; do not claim auth browser QA passed |

These checks do not validate unimplemented PRD workflows. Atlas testing verified actual bcrypt storage, sessions, duplicate signup races, case-insensitive login, expiry, revocation, and account suspension. The synthetic account/session/attempt records were removed afterward. Frontend regression tests cover server session resolution, rendered auth navigation and auth-page redirects; browser click/visual coverage remains pending. GitHub CI results and production deployment were not verified in this milestone.

From the repository root, run `npm run dev`. Web: `http://localhost:3000`; API: `http://localhost:4000`; health: `http://localhost:4000/api/v1/health`. See [README.md](../README.md) for prerequisites and environment setup. Do not overwrite existing local environment files or copy secrets into this document.

## Known limitations and follow-ups

- Atlas is configured locally and the auth persistence lifecycle passed against `make_my_marriage_dev`. Other core workflows, provider operations, and deployment remain pending.
- Auth responses and API errors now include the designed success/error envelope and request ID. Health retains its existing `{ status: "ok" }` liveness payload.
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
| Signup/login/session/logout | Implemented and tested against Atlas on 2026-10-16; browser visual QA pending |
| Wedding setup and membership workflow | Pending |

After each milestone, update the date and repository reference, revise the PRD status rows, record checks actually run, add any unresolved decisions, and adjust the next milestone. Mark a PRD feature complete only when its real behavior and authorization are implemented and verified; UI previews and scaffold files are insufficient.
