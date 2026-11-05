# Make My Marriage — Project Status

**Last updated:** 2026-11-02

**Latest milestone:** Family & Team invitation/account guidance and signed-in navbar identity are implemented. Local QA on 2 November confirmed an invited recipient appearing in Members after acceptance, email prefill, account switching, permission updates and cross-tab logout. One low-priority dialog warning remains (QA-03). See [the latest QA report](MANUAL_QA_2026-11-02.md).

**Current local commit:** `a9fe7d4` — `feat(weddings): add onboarding and workspace management`. Family & Team and its related code/documentation changes are currently uncommitted. Recheck Git status when resuming; this document does not establish remote push or CI status.

**Current stage:** Public homepage, Atlas-backed authentication, wedding onboarding, and the first Family & Team milestone are implemented. Planning-team invitations, acceptance, Admin-only access changes and last-Admin protection are built; events and the remaining planning workflows are pending. The user confirmed receiving a development invitation in Spam on 2 November; production sender setup and broader rollout QA remain pending.

Local email testing uses `onboarding@resend.dev`, restricted to the email registered with the Resend account. A real invitation was received and accepted; sending to other recipients still requires a verified owned domain. Old invitation history is preserved. No production deployment is recorded.

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
| Email | Bounded membership email integration and delivery records implemented; development invitation received in Spam using the restricted test sender | Verify an owned domain for other recipients; complete broader delivery testing |
| Media and vendor discovery | R2 and Google Places configuration foundations only | Implement and verify each integration when its feature is built |

Deployment and public release remain separate follow-up work. No deployment was performed as part of onboarding or the logout fixes. Production readiness still requires the remaining release/security and operational checks; the current PRD scope is not complete.

## What is implemented

### Project foundation

- npm workspaces: `apps/web`, `apps/api`, and `packages/contracts`.
- Next.js App Router, React, strict TypeScript, Tailwind CSS, local Inter/Manrope fonts, and shared design tokens.
- Express modular monolith with separate exported application and local server startup.
- API liveness endpoint: `GET /api/v1/health` returns `{ "status": "ok" }`.
- Helmet, credential-aware frontend CORS, JSON body limits, cookie parsing, request validation infrastructure, not-found handling, and sanitized error handling.
- Zod environment validation and optional MongoDB connection at startup. The scaffold can run without a configured database.
- Auth, wedding creation/list/read/update, and membership/invitation routes are mounted. Other business routers remain unmounted.
- Session authentication validates hashed tokens, expiry, revocation, and active users. Wedding and membership services enforce active memberships and Admin-only mutations. A public Organizer feature guard exists for future business modules. The old scaffold wedding-access middleware is not used to grant access.
- R2 and Google Places configuration-validation foundations; bounded Resend membership email integration with persisted delivery attempts. The initial send failed sender-domain verification; a later development invitation reached Spam using the restricted test sender.
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

The public marketing homepage, signup/login, wedding onboarding and initial Family & Team milestones are implemented. Marketing samples do not complete the corresponding business modules.

| PRD area | Current status | Remaining implementation |
| --- | --- | --- |
| 6.1 / FR-01 — Authentication & Wedding Setup | Auth, signed-in navbar identity, invitation-linked email prefill, My Weddings, atomic wedding creation, initial Admin membership, overview, detail editing and switching implemented | Password reset, profile editing, cover uploads, later slug editing, expected-size schema reconciliation, and broader invite/first-event onboarding |
| 6.2 / FR-02 — Family & Organizer Management | Members/Invitations UI, email-matched token acceptance, recipient signup/login guidance, role/permission changes, removal/revocation, audit records, concurrent last-admin protection and public feature guard implemented | QA-03 stale validation message, event-specific responsibilities, enforcement in future modules, member activity UI, production sender setup and broader rollout QA |
| 6.3 / FR-03 — Multiple Wedding Events | Scaffold only | Event CRUD, organizers, related records, default albums, and published event updates |
| 6.4 / FR-04 — Wedding Dashboard | Real initial wedding overview and calculated countdown | Authorized planning aggregates, family RSVP summaries, expense totals, tasks, activity and quick actions |
| 6.5 / FR-05 — Task Planner | Route placeholder; interactive homepage sample | Persistent tasks, assignment, checklist/comments, views/filters, templates, and reminders |
| 6.6 / FR-06 — Expenses & Payment Records | Route placeholder; sample charts/cards | Expenses, payments, paise calculations, attachments, reports, CSV export, and linked vendor ledger |
| 6.7 / FR-07 — Vendor Discovery & Management | Route placeholder; illustrative vendor cards | Google Places discovery, filters/map, manual vendors, shortlist/status, notes, quotations, and expense links |
| 6.8 / FR-08 — Guests & Family RSVP | Route placeholder; sample invitation | Family records/import, event invitations, guest access tokens, per-event responses/deadlines, and exports |
| 6.9 / FR-09 — Invitations & Email | Planning-team invitation template, bounded Resend sends and persisted delivery status implemented; one recipient lifecycle checked | Guest/event invitation campaigns, confirmations, reminders, preferences, approved retry/resend behavior and production sender setup |
| 6.10 / FR-10 — Gallery | Route placeholder; R2 configuration validation | Albums, compression/thumbnails, upload reservations/verification, privacy enforcement, QR links, quotas, and downloads |
| 6.11 / FR-11 — Wedding Website | Management route placeholder; homepage sample | Templates/settings, slug-based guest website, publish/unpublish, authorized content, and English/Hindi guest labels |
| 6.12 / FR-12 — YouTube Links | Homepage demonstration only | Per-event URL validation/storage, enable/disable, visibility checks, and real outbound live/recording links |
| 6.13 / FR-13 — Platform Admin | Backend module structure only | Protected admin UI, operational capabilities, strengthened access, and audited intervention |
| PRD non-functional and release acceptance requirements | Foundation checks only | End-to-end security, tenant isolation, provider behavior, accessibility/performance, operational readiness, and release scenarios |

Concrete users/sessions, weddings, wedding memberships/invites, email delivery history, unpublished website settings and audit schemas are implemented. Wedding creation and membership mutations use public module interfaces and transactions. Other business schemas/workflows, guest website routes, and platform administration remain pending. An existing route returning HTTP 200 does not mean its feature is complete.

## Decisions to preserve

Use the complete rules in AGENTS.md and the design documents. Particularly:

- Wedding is the tenant boundary. Enforce authorization and same-wedding references in services and scoped queries.
- Retain the modular monolith and exactly 18 core collections from the Database Design. Do not introduce extra livestream/admin collections or queue infrastructure.
- Authentication uses bcrypt and revocable opaque sessions in secure HTTP-only cookies, with hashed tokens in MongoDB. No JWTs or browser token storage. Signup/member acceptance does not require email verification.
- Allow multiple Wedding Admins and module-specific Organizer permissions; protect the last active admin. Membership acceptance requires a valid invitation token and the invited normalized account email; matching email alone grants no access.
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

Resolve QA-03: switching an invalid zero-permission Organizer invitation to Wedding Admin should clear the obsolete Organizer warning. Complete remaining Family & Team checks, especially new-recipient signup continuation, direct Organizer use, actual revocation/removal/reinvitation and failure recovery. The latest [QA report](MANUAL_QA_2026-11-02.md) confirms the existing-recipient happy path; it does not cover all release scenarios. Then design and implement wedding events, followed by tasks, using the existing feature guard. Events must create their default album through the gallery interface and replace wedding-date guest-expiry fallback with the final scheduled event; event-specific team responsibilities belong to that slice. A verified owned sender domain is needed for arbitrary email recipients. Password recovery still needs its approved persistence design. See [FAMILY_TEAM.md](FAMILY_TEAM.md), [AUTH_SETUP.md](AUTH_SETUP.md) and [WEDDING_ONBOARDING.md](WEDDING_ONBOARDING.md).

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

Latest verification: **2026-11-02**. The navbar change passed lint, typecheck, formatting, production build and 116 offline tests (50 API, 66 frontend). The subsequent documentation/manual-QA pass reran lint, typecheck, tests and formatting successfully; it did not rerun the build. The isolated Atlas membership lifecycle passed earlier on the email-matching/recipient-guidance revisions; Atlas tests were not rerun for email prefill, navbar identity or the later browser pass. See [MANUAL_QA_2026-11-02.md](MANUAL_QA_2026-11-02.md) for the latest browser results and [MANUAL_QA.md](MANUAL_QA.md) for historical evidence.

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test` | 116 offline tests passed: 50 API and 66 frontend; three opt-in Atlas tests skipped in the latest run. Earlier isolated Atlas membership coverage passed for token/email matching, recipient guidance, atomic rollback, scoped roles, removal/reactivation and last-Admin races. Provider calls in automated tests are mocked |
| `npm run build` | Passed for contracts, API, and web |
| `npm run format:check` | Passed |
| Browser checks | Latest local pass checked navbar identity, recipient email prefill, wrong-account guidance/switching, accepted membership from the Admin view, permission edits, responsive invitation dialog and cross-tab logout. User performed recipient acceptance; the QA agent independently observed Members 2 and Accepted history. One low-priority finding QA-03 remains. Earlier onboarding coverage is retained in MANUAL_QA.md |

These checks do not validate unimplemented PRD workflows. Manual QA reuses the dedicated account and retained weddings. The latest report records one authorized real email and a retained Organizer membership with Events and Tasks access; no further sends are implied by this status update. The QA agent did not operate the recipient's acceptance UI or read-only Organizer view. New-recipient signup continuation, actual decline/revocation/removal/reinvitation, expiry, concurrent Admin changes and failure injection remain manually unverified. Automated coverage is separate evidence. Browser restart and 30-day Remember Me persistence were not time-tested. GitHub CI and production deployment remain unverified.

From the repository root, run `npm run dev`. Web: `http://localhost:3000`; API: `http://localhost:4000`; health: `http://localhost:4000/api/v1/health`. See [README.md](../README.md) for prerequisites and environment setup. Do not overwrite existing local environment files or copy secrets into this document.

## Known limitations and follow-ups

- QA-03 (low): after submitting an Organizer invitation with no selected permissions, switching to Wedding Admin leaves the obsolete permission warning visible. Admin sending was not tested in that state; see MANUAL_QA_2026-11-02.md. This status update does not fix the issue.
- Atlas-backed auth, weddings and membership persistence are implemented. Other business workflows and production deployment remain pending.
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
| Initial wedding setup and workspace access | Implemented 2026-10-29; Family & Team added 2026-10-30 |
| Family & Team membership milestone | Implemented 2026-10-30; recipient guidance/email matching and an accepted membership verified locally on 2026-11-02; QA-03 remains |
| Invitation account guidance and email prefill | Implemented 2026-11-02; existing-recipient switching/login/prefill checked; new-recipient signup flow needs browser QA |
| Signed-in navbar identity | Implemented 2026-11-02; desktop name/email, compact mobile name and My Account link; local QA checked identity/logout |
| Wedding title suggestions and duplicate protection | Implemented; unit, browser and scoped Atlas duplicate/concurrency coverage passed |
| Manual QA and logout regression fixes | QA-01/QA-02 fixed and independently rechecked 2026-10-29; reusable account and two synthetic weddings retained |
| Staging/production deployment | Pending; local run/build verified, public deployment not recorded or verified |

After each milestone, update the date and repository reference, revise the PRD status rows, record checks actually run, add any unresolved decisions, and adjust the next milestone. Mark a PRD feature complete only when its real behavior and authorization are implemented and verified; UI previews and scaffold files are insufficient.

## Family & Team and account clarity — 2026-11-02

- Invitation acceptance requires both a valid pending/unexpired token and a signed-in account with the invited normalized email. Other accounts receive `403 INVITE_EMAIL_MISMATCH` without consuming it. Already-active matching members cannot consume another invitation.
- Valid token preview returns the invited email and account-existence guidance. New recipients see Create account; registered recipients see Sign in; only the matching signed-in account sees Accept. A different browser account is explained with an explicit switch action, without showing that other account's email.
- Invitation-linked login/signup prefill the email from a fresh validated server preview. The field remains editable, but the API still enforces the invited email. Signup requires a separate login; the invitation continuation survives both steps. Normal login stays blank; unavailable invitations do not prevent manual login.
- Admins can revoke pending invitations or remove joined members through Members → Manage access → Remove member. Removal preserves the app account/history and permits reinvitation/reactivation. Accepted history alone does not block a new invitation. The last Admin is protected.
- Homepage/workspace navigation shows the signed-in name/email and initial avatar on desktop, with a compact name on mobile. It links to My Account. The auth/account header also resolves identity. Existing session signals/focus revalidate it and confirmed logout clears it.
- Latest browser QA used the saved manual QA account and retained weddings. The recipient accepted outside the agent's browser; Admin-side verification showed the new Organizer, Accepted history, and persistent Events/Tasks access. QA-03 is the only reported finding in that pass; remaining limits are listed above.
- Current development servers were restarted after the successful production build. No commits, pushes or production deployment were made. The earlier Windows generated-cache build failure was resolved by clearing only the verified `.next` directory with dev stopped.
