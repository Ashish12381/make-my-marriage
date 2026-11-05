# Wedding onboarding — 29 October 2026

This milestone creates a private wedding workspace. It does not complete family invitations, events, the dashboard aggregates, media uploads, or website publishing.

## Implemented journey

Login still redirects home. Signed-in homepage navigation and the hero lead to `/weddings`; `/account` also links there. A new user sees a real empty state. `/weddings/new` collects details in two steps, preserves entries when going back, checks slug availability, and creates the wedding. Success opens `/weddings/:id/ready`, then `/weddings/:id`. My Weddings lists only active authorized weddings, enabling switching without client-stored tenant credentials. Admins can edit details in an accessible native dialog; Organizers can read but cannot edit.

UI follows the five revised Stitch screens in project `9065562061050388454`: hub `6252ce8bb0e64948acbe0f881a8c0fab`, step 1 `e37070b7a11f48f6ba798fd5b0a975ba`, step 2 `96472c8cb96c4d7aa6cb6e461e35fb5b`, confirmation `35a18ea91c3a486e821ad61af3e387c2`, overview/edit `c150db8f6e704231968a3d647b8c5f70`. Implementation corrects preview artifacts, fake metrics, security promises, budgets, demonstration controls and incomplete mobile navigation. Card artwork is decorative; it does not imply an uploaded venue photo.

Wedding titles offer optional suggestions based on the couple’s first names after both names are entered, during creation and editing. Selecting one fills the editable title; name changes never overwrite a title. Suggestions run locally without a provider call.

## Backend and persistence

All endpoints are under `/api/v1/weddings`, require an active session, and return `private, no-store`:

| Method/path | Behavior |
| --- | --- |
| GET `/` | List weddings through the caller's active memberships; exclude inactive/deleted weddings |
| POST `/` | Strict validated creation with CSRF and exact Origin |
| GET `/slug-availability?slug=...` | Authenticated availability hint only; exposes no wedding details and does not reserve a slug |
| GET `/:weddingId` | Read an authorized active wedding; inaccessible weddings return 404 |
| PATCH `/:weddingId` | Admin-only full update of title, couple names, date, timezone and optional venue; strict fields, CSRF and exact Origin |

Creation uses one Atlas transaction for the wedding, first active Wedding Admin membership, unpublished website settings, and audit record. Failure rolls back all writes. Unique indexes enforce slug, membership and website-settings uniqueness. Duplicate slug returns 409 `SLUG_TAKEN`; the form preserves input. Repeating a creation with the same slug cannot create a second wedding.

Each module owns its model/repository. The weddings service invokes membership, website and audit public capabilities with the transaction session. Public responses expose a minimal wedding DTO and the caller's role, not storage counters, creator internals, other members or secrets.

Complete schemas for `weddings`, `wedding_memberships`, and `website_settings` follow the Database Design. Website settings begin unpublished, invitation-only, with sections disabled and internal template identifier `CLASSIC`; this does not implement a public template or publishing operation. `WEDDING_STORAGE_QUOTA_BYTES` defaults to zero until media work chooses an operational quota. Used/reserved counters start at zero. No R2, Resend or Google Places operation occurs here.

Default guest-link expiry is the end of the wedding date plus 30 civil days in the selected IANA timezone. Date/timezone edits recompute DEFAULT expiry; CUSTOM expiry is retained. No guest-access settings or events endpoints are mounted yet. When events are implemented, replace the wedding-date fallback with the final scheduled event through the events public interface before enabling event/date changes. Custom expiry validation/review belongs to that milestone too.

## Scope decisions and limitations

- Multiple distinct weddings are allowed; no per-user creation count limit is configured. Creation and name edits reject a duplicate full-name pair under the same original creator (`409 DUPLICATE_WEDDING`), ignoring title/date/slug, casing, whitespace, Unicode composition and name order. A partial unique index protects concurrent writes. Legacy rows without the server-only key are checked without deleting or merging existing data. Matching names across accounts are allowed; this does not establish real-world identity.
- Cover uploads await the shared R2 media workflow. Optional expected size appears in the PRD but has no canonical database field; it is not collected pending reconciliation.
- Slugs are editable during creation and read-only afterward in this milestone. The PRD's later slug editing remains pending; the UI does not claim slugs can never change.
- No future-only date restriction was invented. Past dates have an appropriate countdown state.
- Listing currently returns all active authorized weddings. Pagination is a follow-up before high-volume rollout.
- Sign-out/session-change and tab activation revalidate private wedding data. Successful refreshes and transient network/5xx failures preserve the mounted edit form; temporary failures show an inline retry warning. Retry retains the draft. Rejected access (401/403/404) clears the overview and closes editing; reduced Organizer permissions close editing. Wedding ID changes start fresh state. Session changes do not transmit tokens or use browser storage.
- Host-only session cookies must reach both the web and API. Localhost ports share a hostname; production needs a verified same-origin proxy/cookie topology as described in AUTH_SETUP.md.
- Family invite/role-change/removal endpoints remain unmounted. Last-admin protection must be implemented before those mutations are enabled.
- Account pages cannot serve as a completed planning dashboard. Future planning features are not shown as working controls.

## Verification

Run lint, typecheck, tests, build and format checks from the repository root. `npm run test` includes 36 offline API tests and 45 frontend tests; two development integration tests are opt-in. QA-01/QA-02 logout fixes share a homepage destination across local logout controls while preserving private-tab session-loss redirects; focused browser results are recorded in MANUAL_QA.md. Six overview state-transition regressions added on 30 October cover temporary refresh failure/retry, access rejection, role reduction, initial-load failure, Cancel and save. Browser failure-injection coverage is still pending.

For live onboarding coverage, set `RUN_ATLAS_WEDDING_TESTS=1`, run `npm run test --workspace=@make-my-marriage/api -- weddings.atlas.test.ts`, then remove the flag and retain the test exit status. The test refuses databases not ending `_dev`. It seeds isolated synthetic accounts/sessions and verifies atomic defaults, listing/reopening, multiple weddings, stranger/Organizer restrictions, CSRF, malformed mutations, concurrent duplicate slugs, edit persistence, expiry, audit, revoked membership and forced-write rollback. Cleanup targets only those test users and weddings.

Browser checks use a separate synthetic account and scoped cleanup. Do not delete or alter real users or weddings to test this feature. Broader rollout, provider operations and production deployment are not verified by this milestone.
