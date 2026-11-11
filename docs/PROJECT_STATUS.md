# Make My Marriage — Project Status

**Last updated:** 2026-11-11

**Latest milestone:** Core Task Planner is implemented locally. The wedding dashboard shows live pending task totals and tasks requiring attention.

**Application baseline for this update:** `95c7c7b` on `dev`. The local `origin/dev` tracking ref matches this commit. Wedding Events, Task Planner, and their follow-up fixes are in the working tree.

**Current stage:** The public demo is deployed. The latest dashboard, Wedding Events, and Task Planner changes have been verified locally. Their public rollout still needs verification.

The early local email test used the restricted Resend test sender. The user later verified the custom sending domain in Resend and reported receiving an invitation from it. Acceptance for that deployed invitation remains to be tested.

Wedding creation and editing now offer optional title suggestions from the couple’s first names. Selecting a suggestion fills the editable title; changing names preserves any existing title.

Manual QA findings QA-01/QA-02 are fixed: open homepages refresh session-dependent controls after logout elsewhere, and local logout consistently returns home without competing private-page redirects. Focused browser verification reused the dedicated QA account and retained weddings; see [MANUAL_QA.md](MANUAL_QA.md).

Background refresh preserves the loaded wedding and unsaved draft on temporary errors. Confirmed access rejection from the wedding or team request clears the dashboard and editor. Local Chrome failure injection verified draft preservation on a team `503` and clearing on a team `404`.

Duplicate protection rejects creation/name edits for the same normalized full-name pair under the same original creator, regardless of title/date/slug, with a database constraint for concurrent writes and a legacy-record check. Multiple distinct weddings remain allowed without a configured per-user count limit. Matching names across accounts are not globally blocked; existing records are not automatically deleted or merged.

This document is a development handoff. Use it alongside the PRD and design documents for requirements, implementation status, and the evidence behind each milestone.

## Start here when resuming

1. Read this document and [AGENTS.md](../AGENTS.md).
2. Read the relevant requirements in [PRD.md](PRD.md), [SYSTEM_Design.md](SYSTEM_Design.md), [DATABASE_Design.md](DATABASE_Design.md), and [API_Design.md](API_Design.md) before implementing a feature.
3. Inspect the current code and Git changes. This status is a dated snapshot; code may have changed afterward.
4. Preserve the approved homepage design. Agree on the next feature and obtain its approved UI reference where needed.
5. Update this document after completing each milestone, including actual behavior, checks, and unresolved items.
6. For manual QA, reuse the account and retained synthetic weddings documented in [MANUAL_QA.md](MANUAL_QA.md). Credentials are in the ignored root `.env.qa.local`; never copy them into tracked documents or create another account for routine QA.

## Deployment status

The web app and Express API are deployed as separate Vercel projects for the public demo. The owner chose `main` as the production branch after merging PR #1. The latest dashboard, Events, and Tasks rollout is pending. Verify the branch and deployed commit in both projects before the release smoke test.

| Component | Verified status | Deployment work remaining |
| --- | --- | --- |
| Web application | Public demo at [planyourwedding.online](https://planyourwedding.online/) | Confirm the deployed revision and smoke-test the dashboard, Events, Tasks, and alias redirect |
| API | Separate Vercel Express deployment. Health and custom-domain auth were verified on 10 November | Release the Events and Tasks routes with the matching web changes and verify authenticated list, detail, and creation requests |
| MongoDB Atlas | Separate development and demo databases; demo account sign-in and session lookup verified | Confirm backup and restore procedures before broader rollout |
| Browser sessions | Custom-domain sign-in, session lookup and sign-out succeeded on 10 November. The old Vercel alias reproduced `ORIGIN_REJECTED` | The alias redirect is in the current source. Verify path and query preservation on the deployed site |
| CI | GitHub Actions verification workflow exists | Remote workflow results for the current changes have not been checked; the workflow does not deploy |
| Email | Bounded Resend sends and delivery history implemented. The owner verified the custom sending domain and reported receiving a deployed invitation | Retest deployed acceptance with a new recipient and confirm delivery across mail providers before broader rollout |
| Media and vendor discovery | R2 and Google Places configuration foundations only | Implement and verify each integration when its feature is built |

## What is implemented

### Project foundation

- npm workspaces: `apps/web`, `apps/api`, and `packages/contracts`.
- Next.js App Router, React, strict TypeScript, Tailwind CSS, local Inter/Manrope fonts, and shared design tokens.
- Express modular monolith with separate exported application and local server startup.
- API liveness endpoint: `GET /api/v1/health` returns `{ "status": "ok" }`.
- Helmet, credential-aware frontend CORS, JSON body limits, cookie parsing, request validation infrastructure, not-found handling, and sanitized error handling.
- Zod environment validation and optional MongoDB connection at startup. The scaffold can run without a configured database.
- The mounted API covers authentication, wedding setup and editing, membership and invitations, Wedding Events, and Task Planner.
- Session authentication validates hashed tokens, expiry, revocation, and active users. Wedding and membership services enforce active membership and Admin-only mutations. Events uses the Organizer feature guard for reads and writes.
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

The dashboard uses live event counts and upcoming events. Other planning areas have sample figures for local review.

| PRD area | Current status | Remaining implementation |
| --- | --- | --- |
| 6.1 / FR-01 — Authentication & Wedding Setup | Auth, signed-in navbar identity, invitation-linked email prefill, My Weddings, atomic wedding creation, initial Admin membership, overview, detail editing and switching implemented | Password reset, profile editing, cover uploads, later slug editing, expected-size schema reconciliation, and broader invite/first-event onboarding |
| 6.2 / FR-02 — Family & Organizer Management | Member and invitation management, email-matched token acceptance, role and permission changes, removal, revocation, and last-admin protection. QA-03 fixed and rechecked locally | Member activity UI and deployed new-recipient acceptance |
| 6.3 / FR-03 — Multiple Wedding Events | Presets, custom events, drafts, scheduling, organizer assignment, editing, cancellation, archiving, and private default albums. Core flows passed local QA | Two concurrent-edit findings, public rollout, and integrations for covers, livestreams, guest invitations, and publishing |
| 6.4 / FR-04 — Wedding Dashboard | Responsive workspace with live wedding details, countdown, team roster, event totals, upcoming events, pending task totals, and tasks requiring attention | RSVP, expense, and activity data, plus deployed revision verification |
| 6.5 / FR-05 — Task Planner | Persistent wedding-wide and event-linked tasks, team assignments, checklists, due dates, lifecycle actions, search, and filters | Calendar view, comments and activity history UI, templates, reminders, and public rollout |
| 6.6 / FR-06 — Expenses & Payment Records | Route placeholder; sample charts/cards | Expenses, payments, paise calculations, attachments, reports, CSV export, and linked vendor ledger |
| 6.7 / FR-07 — Vendor Discovery & Management | Route placeholder; illustrative vendor cards | Google Places discovery, filters/map, manual vendors, shortlist/status, notes, quotations, and expense links |
| 6.8 / FR-08 — Guests & Family RSVP | Route placeholder; sample invitation | Family records/import, event invitations, guest access tokens, per-event responses/deadlines, and exports |
| 6.9 / FR-09 — Invitations & Email | Planning-team invitation template, bounded Resend sends and persisted delivery status implemented; recipient acceptance verified locally and custom sender delivery reported on the demo | Deployed new-recipient acceptance, guest/event invitation campaigns, confirmations, reminders, preferences and approved retry/resend behavior |
| 6.10 / FR-10 — Gallery | Each new event creates a private default album through the Gallery module. R2 configuration validation is in place | Gallery UI, custom albums, compression/thumbnails, upload reservations/verification, privacy enforcement, QR links, quotas, and downloads |
| 6.11 / FR-11 — Wedding Website | Management route placeholder; homepage sample | Templates/settings, slug-based guest website, publish/unpublish, authorized content, and English/Hindi guest labels |
| 6.12 / FR-12 — YouTube Links | Homepage demonstration only | Per-event URL validation/storage, enable/disable, visibility checks, and real outbound live/recording links |
| 6.13 / FR-13 — Platform Admin | Backend module structure only | Protected admin UI, operational capabilities, strengthened access, and audited intervention |
| PRD non-functional and release acceptance requirements | Foundation checks only | End-to-end security, tenant isolation, provider behavior, accessibility/performance, operational readiness, and release scenarios |

Implemented schemas cover users and sessions, weddings, memberships and invites, events, albums, email delivery history, unpublished website settings, and audit records. Wedding creation, membership mutations, and event creation use public module interfaces and transactions.

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

1. Release matching web and API revisions from `main` and smoke-test the dashboard, Events, Tasks, and alias redirect on the public demo.
2. Proposed next V1 feature is **Expenses & Payment Records (FR-06)**. Start with wedding-wide or event-linked expenses, payments recorded separately in integer paise, and live paid and outstanding totals on the dashboard.

## Task Planner milestone — 2026-11-11

- Open **My Weddings → Open Wedding → Tasks** or select **View tasks** on the dashboard. Planners can create, edit, assign, complete, reopen, cancel, and remove tasks. Checklist progress persists independently of task completion.
- Tasks can be wedding-wide or linked to an event in the same wedding. Assignments use active planning-team members. The API enforces wedding isolation and the Tasks permission for Organizers.
- Search and filters for event, assignee, status, priority, and due date apply before pagination. The dashboard uses live task totals and deadlines.

## Wedding Events milestone — 2026-11-10

- The user confirmed creating an event locally. Open **My Weddings → Open Wedding → Events → Add event**, or use **Add event** in the dashboard's **Upcoming Events** panel.
- Wedding Events supports presets and custom names, undated drafts, time-zone-aware schedules including overnight events, venues and map links, and assignment to active members of the same wedding. Editing, cancellation, and archiving have dedicated flows. Cancellation and archiving preserve history.
- The API follows the PRD permission matrix for event reads and writes. Admins have access and Organizers require the Events permission. Each event and its private default album are created in one transaction. Schedule changes recalculate the default guest-access expiry and preserve custom expiry values.
- A stale local API returned route-level `404` responses for Events while both QA weddings still opened through the API. The dashboard and Events page now distinguish this service failure from confirmed access rejection. After restarting the API with the current build, authenticated checks returned `200` for Events in both QA weddings. The authenticated web route also received the create-form flag.

## Wedding dashboard milestone — 2026-11-10

- The private overview opens from My Weddings and shows the real wedding title, venue, countdown, planning team, and Admin edit controls. The sidebar, compact metrics, and prioritized Events and Tasks panels adapt to mobile. Motion respects reduced-motion preferences.
- Event totals, upcoming events, pending task totals, and tasks requiring attention use live data in the current workspace. Remaining sample figures are labeled in local development. The separate design preview is development-only.
- Follow-up fixes close the mobile menu on Escape and restore toggle focus. A team access rejection clears cached details and closes the editor, while a temporary team failure preserves the draft.

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

Latest application verification was on **2026-11-11**. See [local Tasks and Events QA](MANUAL_QA_LOCAL_2026-11-11.md), [Events rollout QA](MANUAL_QA_EVENTS_2026-11-10.md), and [dashboard browser QA](MANUAL_QA_2026-11-10.md).

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| Automated tests | 130 offline tests and 3 development Atlas tests passed. Two other opt-in tests were outside that run |
| Production build | Contracts, API, and the Webpack frontend build passed locally. The default Turbopack build previously failed in the Windows CSS worker |
| `npm run format:check` | Passed |
| Browser checks | Local QA passed task lifecycle and checklist persistence, Events scheduling and archiving, wedding switching, and mobile navigation at 390 px. QA-03 permission validation and QA-06 event timezone grouping passed revalidation. Live invitation delivery and acceptance were outside this pass |

Manual QA reuses the dedicated accounts and retained synthetic weddings. Custom-domain authentication was retested on the deployed demo, while the updated dashboard was verified locally. Remote CI and the exact deployed dashboard revision still need checking. Deployed new-recipient acceptance, the broader Organizer scenarios, and 30-day Remember Me persistence remain open QA items.

From the repository root, run `npm run dev`. Web: `http://localhost:3000`; API: `http://localhost:4000`; health: `http://localhost:4000/api/v1/health`. See [README.md](../README.md) for prerequisites and environment setup. Do not overwrite existing local environment files or copy secrets into this document.

## Known limitations and follow-ups

- Two Events concurrency findings remain open. Saving a timezone change can overwrite a newer start or end time. Saving an organizer checkbox change can replace another planner’s assignment.
- Event cover uploads, YouTube livestreams, guest invitations and notifications, and published event updates remain follow-ups under their respective modules.
- Auth responses and API errors now include the designed success/error envelope and request ID. Health retains its existing `{ status: "ok" }` liveness payload.
- Confirm the matching Vercel deployments and smoke-test Events and Tasks. The 10 November public check still showed the earlier overview.
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
| Family & Team membership milestone | Implemented 2026-10-30; recipient guidance/email matching and an accepted membership verified locally on 2026-11-02; QA-03 fixed and rechecked locally on 2026-11-11 |
| Invitation account guidance and email prefill | Implemented 2026-11-02; existing-recipient switching/login/prefill checked; new-recipient signup flow needs browser QA |
| Signed-in navbar identity | Implemented 2026-11-02; desktop name/email, compact mobile name and My Account link; local QA checked identity/logout |
| Wedding title suggestions and duplicate protection | Implemented; unit, browser and scoped Atlas duplicate/concurrency coverage passed |
| Manual QA and logout regression fixes | QA-01/QA-02 fixed and independently rechecked 2026-10-29; reusable account and two synthetic weddings retained |
| Public Vercel demo | Live on the custom domain; demo authentication verified on 10 November |
| Wedding dashboard | Accepted locally on 10 November. Live Events data is connected. Remaining planning integrations and deployed revision verification are pending |
| Wedding Events | Core flow implemented locally on 10 November. Local browser QA and QA-06 revalidation passed. Two concurrent-edit findings and public rollout remain open |
| Task Planner | Core flow implemented locally on 11 November. Local browser and development Atlas checks passed. Public rollout and remaining FR-05 capabilities are pending |

After each milestone, update the date and repository reference, revise the PRD status rows, record checks actually run, add any unresolved decisions, and adjust the next milestone. Mark a PRD feature complete only when its real behavior and authorization are implemented and verified; UI previews and scaffold files are insufficient.

## Family & Team and account clarity — 2026-11-02

- Invitation acceptance requires both a valid pending/unexpired token and a signed-in account with the invited normalized email. Other accounts receive `403 INVITE_EMAIL_MISMATCH` without consuming it. Already-active matching members cannot consume another invitation.
- Valid token preview returns the invited email and account-existence guidance. New recipients see Create account; registered recipients see Sign in; only the matching signed-in account sees Accept. A different browser account is explained with an explicit switch action, without showing that other account's email.
- Invitation-linked login/signup prefill the email from a fresh validated server preview. The field remains editable, but the API still enforces the invited email. Signup requires a separate login; the invitation continuation survives both steps. Normal login stays blank; unavailable invitations do not prevent manual login.
- Admins can revoke pending invitations or remove joined members through Members → Manage access → Remove member. Removal preserves the app account/history and permits reinvitation/reactivation. Accepted history alone does not block a new invitation. The last Admin is protected.
- Homepage/workspace navigation shows the signed-in name/email and initial avatar on desktop, with a compact name on mobile. It links to My Account. The auth/account header also resolves identity. Existing session signals/focus revalidate it and confirmed logout clears it.
- The 2 November browser QA used the saved manual QA account and retained weddings. The recipient accepted outside the agent's browser; Admin-side verification showed the new Organizer, Accepted history, and persistent Events/Tasks access. That pass reported QA-03, which passed local revalidation on 11 November.
- Current development servers were restarted after the successful production build. No commits, pushes or production deployment were made. The earlier Windows generated-cache build failure was resolved by clearing only the verified `.next` directory with dev stopped.
