# Make My Marriage — Project Status

**Last updated:** 2026-10-30

**Current local commit:** `7498788` — `feat(auth): implement account registration and session authentication`. Wedding onboarding, duplicate protection, logout fixes, QA documentation and other working-tree changes remain uncommitted. Recheck Git status when resuming; this document does not establish remote push or CI status.

**Current stage:** Public homepage, Atlas-backed authentication, and the first wedding-onboarding milestone are implemented. Family invitations/permissions and the remaining planning workflows are pending.

Wedding creation and editing now offer optional title suggestions from the couple’s first names. Selecting a suggestion fills the editable title; changing names preserves any existing title.

Manual QA findings QA-01/QA-02 are fixed: open homepages refresh session-dependent controls after logout elsewhere, and local logout consistently returns home without competing private-page redirects. Focused browser verification reused the dedicated QA account and retained weddings; see [MANUAL_QA.md](MANUAL_QA.md).

On 2026-10-30, background-refresh error handling was fixed to preserve the loaded wedding and mounted edit form after temporary network/5xx failures. An inline warning offers retry without discarding the draft. Rejected access (401/403/404) clears private data; loss of Admin permissions closes editing. Changing wedding IDs starts fresh state. Six state-transition regression tests cover recovery and access rejection; browser failure injection was not run.

Duplicate protection rejects creation/name edits for the same normalized full-name pair under the same original creator, regardless of title/date/slug, with a database constraint for concurrent writes and a legacy-record check. Multiple distinct weddings remain allowed without a configured per-user count limit. Matching names across accounts are not globally blocked; existing records are not automatically deleted or merged.

This document is a development handoff for recovering context. It records implemented behavior, remaining PRD work, verification, and the recommended next milestone. It does not replace the requirements or define new scope. The user reported pushing the latest code to GitHub; this snapshot was checked against the local repository, not remote CI or deployment.

## Start here when resuming

1. Read this document and [AGENTS.md](../AGENTS.md).
2. Read the relevant requirements in [PRD.md](PRD.md), [SYSTEM_Design.md](SYSTEM_Design.md), [DATABASE_Design.md](DATABASE_Design.md), and [API_Design.md](API_Design.md) before implementing a feature.
3. Inspect the current code and Git changes. This status is a dated snapshot; code may have changed afterward.
4. Preserve the approved homepage design. Agree on the next feature and obtain its approved UI reference where needed.
5. Update this document after completing each milestone, including actual behavior, checks, and unresolved items.
6. For manual QA, reuse the account and retained synthetic weddings documented in [MANUAL_QA.md](MANUAL_QA.md). Credentials are in the ignored root `.env.qa.local`; never copy them into tracked documents or create another account for routine QA.

## Deployment status

The verified application runs locally. A successful production build has been completed, but no staging/production deployment or public application URL is recorded or verified in this work. Cloud-hosted development MongoDB does not mean the web application or API has been deployed.

| Component | Verified status | Deployment work remaining |
| --- | --- | --- |
| Web application | Local Next.js app at `http://localhost:3000`; production build passed | Create/configure the planned web Vercel project, environment values and domain; deploy and smoke-test |
| API | Local Express app at `http://localhost:4000`; health and implemented auth/wedding flows checked | Complete and verify its separate Vercel project/serverless entry and environment configuration; deploy and smoke-test |
| MongoDB Atlas | Connected development database `make_my_marriage_dev`; auth and wedding persistence tested | Establish production database/access configuration and backup/restore procedures before rollout |
| Browser sessions | Working locally across localhost ports; cross-tab logout regressions fixed | Verify production cookie hostname/proxy topology, credentialed requests, exact allowed Origin and CSRF behavior over HTTPS |
| CI | GitHub Actions verification workflow exists | Remote workflow results for the current changes have not been checked; the workflow does not deploy |
| Email, media, vendor discovery | Resend, R2 and Google Places configuration foundations only | Implement and configure each provider when its feature is built; no operational integration has been verified |

Deployment and public release remain separate follow-up work. No deployment was performed as part of onboarding or the logout fixes. Production readiness still requires the remaining release/security and operational checks; the current PRD scope is not complete.

## What is implemented

### Project foundation

- npm workspaces: `apps/web`, `apps/api`, and `packages/contracts`.
- Next.js App Router, React, strict TypeScript, Tailwind CSS, local Inter/Manrope fonts, and shared design tokens.
- Express modular monolith with separate exported application and local server startup.
- API liveness endpoint: `GET /api/v1/health` returns `{ "status": "ok" }`.
- Helmet, credential-aware frontend CORS, JSON body limits, cookie parsing, request validation infrastructure, not-found handling, and sanitized error handling.
- Zod environment validation and optional MongoDB connection at startup. The scaffold can run without a configured database.
- Auth and wedding creation/list/read/update routes are mounted. Other business routers remain unmounted.
- Session authentication validates hashed tokens, expiry, revocation, and active users. Wedding onboarding checks active memberships and Admin-only editing in backend services. Feature-specific organizer permissions and membership mutation endpoints remain pending; the old scaffold wedding-access middleware is not used to grant access.
- R2, Resend, and Google Places configuration-validation foundations; no provider operations.
- Browser API client configured to include credentials. No browser token storage or JWT authentication.
- Formatting, lint, typecheck, tests, build scripts, and CI configuration.
- Shared contracts contain Zod signup/login and wedding validators, public auth/wedding DTOs, and response schemas consumed by both applications.

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

The public marketing homepage, signup/login and initial wedding-onboarding milestones are implemented. Marketing samples do not complete the corresponding business modules.

| PRD area | Current status | Remaining implementation |
| --- | --- | --- |
| 6.1 / FR-01 — Authentication & Wedding Setup | Auth, My Weddings, atomic wedding creation, initial Admin membership, overview, detail editing and switching implemented | Password reset, profile editing, cover uploads, later slug editing, expected-size schema reconciliation, and broader invite/first-event onboarding |
| 6.2 / FR-02 — Family & Organizer Management | Initial Admin membership, scoped reads and Admin-only detail updates | Invitations/acceptance, role/permission mutations, responsibilities, last-admin protection and member activity UI |
| 6.3 / FR-03 — Multiple Wedding Events | Scaffold only | Event CRUD, organizers, related records, default albums, and published event updates |
| 6.4 / FR-04 — Wedding Dashboard | Real initial wedding overview and calculated countdown | Authorized planning aggregates, family RSVP summaries, expense totals, tasks, activity and quick actions |
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

Concrete users/sessions, weddings, wedding memberships, unpublished website settings and audit schemas are implemented. Wedding creation uses public module interfaces and one transaction. Other business schemas/workflows, guest website routes, and platform administration remain pending. An existing route returning HTTP 200 does not mean its feature is complete.

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
- Per the product owner’s additional revision, successful login and existing-session visits to auth pages redirect to the homepage (`/`). Signup still redirects to login. `/account` remains an optional page that resolves the real profile and links to My Weddings; it is not a completed planning dashboard.
- Homepage desktop/mobile navigation, footer and closing section now show Sign Out for validated sessions. Auth pages check sessions before rendering, eliminating the brief login form flash. Login/logout refresh the homepage after cookies change. Server-rendered session navigation requires a shared cookie hostname or a same-origin API proxy before deployment; see AUTH_SETUP.md.
- The earlier Your Account planning destination was superseded by My Weddings (`/weddings`) during onboarding. Account pages validate sessions on the server and recheck active tabs after session-change hints or focus/visibility/history restoration. Session loss clears the profile and navigates to login. Local logout consistently returns home; cross-tab hints refresh homepage controls through the authoritative server session. No tokens or authentication state are stored in browser storage.
- No email verification is required. Password reset is not yet implemented; the Forgot Password destination explains that limitation rather than pretending to send an email.
- Unapproved legal/support links and the design's required terms checkbox were not shipped without approved policy content. The post-auth screen does not repeat the Stitch transition's out-of-scope budget wording or offer a dead setup action.
- Live credentials were removed from the modified tracked `.env.example`; working credentials remain in ignored `.env`. A random AUTH_SECRET was generated locally without printing it.

## Recommended next milestone

Implement member invitations/acceptance and feature permissions, including single-use invite tokens, last-admin protection and audited role changes. Then implement events and tasks. Events must create their default album through the gallery interface and replace wedding-date guest-expiry fallback with the final scheduled event. Password recovery still needs its approved persistence design and Resend configuration. See [AUTH_SETUP.md](AUTH_SETUP.md) and [WEDDING_ONBOARDING.md](WEDDING_ONBOARDING.md).

## Wedding onboarding milestone — 2026-10-29

- Signed-in homepage actions open My Weddings; login still returns home. My Weddings has real empty/loading/error/populated states and lists active authorized weddings.
- Two-step creation retains entered values, validates real civil dates/IANA timezones, checks slug availability and handles duplicate conflicts without pretending availability reserves an address.
- Optional editable title suggestions use the couple’s first names. Duplicate full-name pairs under the same original creator are rejected on creation and edits, including concurrent requests and legacy-record checks. Distinct weddings remain allowed without a configured per-account count limit.
- A single transaction saves wedding, first Wedding Admin membership, unpublished invitation-only website defaults, and audit record. Public module interfaces retain collection ownership. Failures roll back all writes.
- Confirmation, overview, calculated timezone-aware countdown, switching, and Admin-only editing use real Atlas data. Organizers can read authorized details but cannot edit. Unrelated or revoked users cannot access the wedding.
- Mobile navigation and the native editing dialog were checked at 390px, including scrolling and Cancel. Browser creation, back/forward form steps, saving an edit, and persistence after reload were verified with a synthetic account and scoped cleanup.
- No uploaded/fabricated venue images, fake planning metrics, budget fields, public publishing or simulated business actions. Cover uploads, later slug changes and the PRD's optional expected-size/schema discrepancy remain explicit follow-ups. Storage quota starts at zero until media implementation chooses a configured value.
- See [WEDDING_ONBOARDING.md](WEDDING_ONBOARDING.md) for endpoints, design references, scope boundaries and live-test instructions.

## Verification and local development

Last automated application verification: **2026-10-30**, after the transient background-refresh fix. Earlier onboarding/logout browser coverage and the independent cross-check are recorded in [MANUAL_QA.md](MANUAL_QA.md); those browser checks were performed on 2026-10-29.

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test` | Passed: 36 offline API tests and 45 frontend tests (81 total); 2 opt-in Atlas lifecycle tests skipped for the refresh UI fix. Earlier Atlas onboarding coverage includes duplicate detection, legacy records, cross-account independence and concurrent creation; see WEDDING_ONBOARDING.md for the opt-in command |
| `npm run build` | Passed for contracts, API, and web |
| `npm run format:check` | Passed |
| Browser checks | Signup/login validation, creation, suggestions, duplicates, switching, editing/Cancel, persistence, countdowns and mobile navigation passed. QA-01/QA-02 fixes passed focused and independent follow-up checks: homepage sync, clearing another private/edit tab, and consistent desktop/mobile/homepage logout destinations. See MANUAL_QA.md for reproduction details and limits |

These checks do not validate unimplemented PRD workflows. Earlier automated Atlas tests cover authentication and wedding persistence, authorization and atomic rollback; their isolated fixtures were cleaned up. Manual QA now reuses one dedicated account and two retained synthetic weddings, as requested. Frontend regression tests cover session resolution/signals, auth navigation, logout races/retry, form markup and calendar rules. Manual Organizer, stranger-account, revoked-membership, expired-session and failure-injection scenarios remain unverified; automated coverage is separate evidence. Browser restart and 30-day Remember Me persistence were not time-tested. GitHub CI results and production deployment were not verified.

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
| Signup/login/session/logout | Implemented; Atlas lifecycle and 2026-10-29 manual browser flows checked |
| Initial wedding setup and workspace access | Implemented 2026-10-29; broader membership/invitation workflow pending |
| Wedding title suggestions and duplicate protection | Implemented; unit, browser and scoped Atlas duplicate/concurrency coverage passed |
| Manual QA and logout regression fixes | QA-01/QA-02 fixed and independently rechecked 2026-10-29; reusable account and two synthetic weddings retained |
| Staging/production deployment | Pending; local run/build verified, public deployment not recorded or verified |

After each milestone, update the date and repository reference, revise the PRD status rows, record checks actually run, add any unresolved decisions, and adjust the next milestone. Mark a PRD feature complete only when its real behavior and authorization are implemented and verified; UI previews and scaffold files are insufficient.
