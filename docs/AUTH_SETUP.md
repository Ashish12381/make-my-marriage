# Authentication setup and implementation

Updated 2026-10-16. Scope: signup, login, session lookup and logout. Read [PROJECT_STATUS.md](PROJECT_STATUS.md) for remaining PRD work.

## Local setup

1. Copy `apps/api/.env.example` to `apps/api/.env` only if the latter is absent. Never overwrite configured credentials.
2. Set `MONGODB_URI` to the Atlas URI for the intended database. URL-encode username/password components and retain `authSource=admin` if supplied by Atlas. Give the database user `readWrite` on that database and allow the application's current network IP.
3. Set `AUTH_SECRET` to an independently generated cryptographically random value of at least 32 characters. Do not reuse a database password, commit the secret, or expose it through a public frontend variable. It signs CSRF tokens and HMAC-redacts throttle identifiers.
4. Use `WEB_ORIGIN=http://localhost:3000`, API port 4000, and the frontend's default API URL `http://localhost:4000/api/v1`. Optional `SESSION_DAYS` defaults to 7 (1–30).
5. Run `npm run dev`, then visit `/signup` or `/login`. Atlas connection and auth collection/index initialization happen before serving auth operations. Missing credentials produce a safe 503 rather than simulated success. Health still runs without a database.

The current local Atlas connection was verified. Local credentials are intentionally absent from this document and the tracked environment template.

## Behavior and security

| Endpoint relative to `/api/v1` | Behavior |
| --- | --- |
| `GET /auth/csrf` | Issues/reuses a signed one-hour CSRF token and matching host-only HttpOnly cookie; no-store |
| `POST /auth/signup` | Validated name/email/password; creates the user only; 201 without a login session; no verification email |
| `POST /auth/login` | Normalized email lookup, generic credential failure; creates a new session; optional 30-day persistence |
| `GET /auth/me` | Resolves active user from an unexpired, unrevoked stored session; returns only public profile fields |
| `POST /auth/logout` | Revokes the presented session and clears its cookie; idempotent 204 |

All writes require exact `Origin: WEB_ORIGIN` and the `X-CSRF-Token` matching the signed cookie. Session tokens never appear in JSON or browser storage. Passwords use bcrypt cost 12 and reject inputs exceeding bcrypt's 72-byte UTF-8 limit. Signup requires at least eight characters with a letter and a number. Unknown fields, including privilege injection, are rejected by shared Zod schemas. Suspended accounts cannot log in or resolve sessions.

Session cookies are host-only, HttpOnly, SameSite=Lax and Secure in production. Standard cookies last for the browser session while their server record expires after `SESSION_DAYS`; Remember Me uses a persistent 30-day cookie. MongoDB's TTL index is housekeeping, not the authorization check. Passwords and raw session/CSRF tokens must not be logged.

Shared throttling records a redacted `AUTH_ATTEMPT` in the existing `audit_logs` collection before counting majority-committed attempts in fixed 15-minute windows. Limits are 40 per IP and 10 per normalized email across signup/login; throttling returns 429 and Retry-After. Concurrent calls may be conservatively rejected. This adds auth-attempt actions and indexed redacted metadata within the approved audit schema, not another collection. Define audit retention before production; do not treat these append-only events as a process-local cache.

Before deployment, configure the frontend/API under a same-site cookie topology, HTTPS, and exact CORS origin. `AUTH_TRUST_PROXY_HOPS` defaults to 0; set it to 1 only when exactly one trusted proxy supplies/normalizes the client address. Never trust arbitrary client-supplied forwarded headers. Add deployment-level abuse controls and verify this topology before public launch. Rotate AUTH_SECRET deliberately: it invalidates CSRF tokens and changes rate-limit HMAC identifiers, but does not itself revoke existing sessions.

## Design references and boundaries

Stitch project: `9065562061050388454`.

- Signup: `93bf1f6a977b4e42938edded2e1d1ef3`.
- Login: `e3c87dfdac3349c1932f8f76014d51fc`.
- Account-created reference: `869d682db3db464fb40deb99d26f56a9`.

Auth cards retain the warm centered layout, Manrope typography, terracotta controls, home navigation, show/hide password and Remember Me direction. External scripts, simulated signup timers, nonfunctional legal/support links, and a required terms acceptance without approved policy content were not copied. Scoped auth styles preserve the existing homepage tokens.

Successful signup redirects to `/login?registered=1` with an account-created notice. The user must enter credentials to sign in. Only successful login creates a session and redirects to the homepage (`/`). Visiting signup/login with a valid existing session also redirects home. `/account` remains an optional profile/sign-out page, not the post-login destination. It does not create a wedding, grant wedding membership, fabricate a dashboard, or expose protected wedding records. `/auth/me` does not yet aggregate wedding summaries; that requires the memberships public interface. Password recovery, profile editing and session listing/individual session-management routes remain pending. The Forgot Password page explains recovery is unavailable; it does not pretend to send mail. No Resend/email verification calls occur in this milestone.

## Verification

Homepage navigation now resolves the session on the server and shows Sign Out in the desktop header, mobile menu, footer and closing section for authenticated users. Login/signup redirect existing sessions before rendering a form. Login and logout perform a fresh homepage navigation so cached signed-in links cannot survive the session change. Logout waits for API revocation and displays a retryable error if it fails.

The signed-in hero action is now Your Account (`/account`), while signed-out Start Planning still opens signup. Wedding setup is pending, so this does not imply an implemented onboarding workflow. Account visits require a validated server session. Open account tabs revalidate through `/auth/me` on BroadcastChannel session-change hints, window focus, visibility restoration and browser history restoration. A 401 clears the profile and navigates to login. Superseded requests and unmounted listeners cannot restore old profile data. Successful signup/login/logout announce a session change without broadcasting tokens or storing auth state in browser storage. Browsers without BroadcastChannel still revalidate when a tab becomes active.

The server-rendered navigation requires the session cookie to reach the web server as well as the API. Localhost ports 3000/4000 share the same cookie hostname. Before deploying to separate hostnames, configure a same-origin API proxy and verify cookie forwarding; host-only API cookies on a sibling subdomain do not reach the web server. Do not assume that same-site alone meets this requirement or broaden the cookie domain implicitly.

- Offline suite: `npm run test` (19 API tests and 26 frontend session/navigation tests; Atlas test skipped).
- Explicit Atlas suite, PowerShell: set `$env:RUN_ATLAS_AUTH_TESTS='1'`, run `npm run test`, then remove that environment variable. The command must exit successfully; do not infer success from the cleanup command's exit status.
- The Atlas test refuses database names not ending in `_dev`. It creates one UUID-named synthetic account, verifies persisted password/session hashes, concurrent duplicate handling, login, expiry, revocation and suspension, and removes only that test account's user/session/attempt records. Never replace cleanup with a database-wide delete.
- With the web/API dev servers running, also set `RUN_AUTH_WEB_TESTS=1` alongside `RUN_ATLAS_AUTH_TESTS=1` to verify signed-in/out homepage HTML, login/signup HTTP redirects without forms, and navigation after revocation against `WEB_ORIGIN`. Remove both flags afterward. This is an HTTP integration check, not browser interaction coverage.
- Lint, strict typecheck, production build and format checks are required. Stop the dev server before building if Next.js encounters shared-cache issues on Windows.
- Browser visual/interaction QA for the auth pages has not completed: Computer Use stopped because the active URL could not be established confidently. The production build and HTTP/Atlas tests are verified independently; they are not a substitute for browser QA.

## Product-owner signup flow revision

On 2026-10-16, the product owner explicitly requested separate registration and login. This overrides the original automatic-session signup example in API_Design.md sections 3.1/4.1 and acceptance case API-01. Signup creates no session document or active session cookie. If a successful registration request presents an old session, it is revoked and its cookie cleared so the explicit login step is not bypassed. Login, Remember Me, session expiry/revocation, and sign-out behavior are unchanged. Email verification is still not required.

On 2026-10-16, the product owner also requested that successful login redirect to the public homepage rather than the interim account page. Signup still redirects to login and does not authenticate.

On 2026-10-29, initial wedding onboarding was implemented. Login still returns home, but the signed-in hero/header and account page now link to My Weddings (`/weddings`) rather than using the account page as the planning destination. The dashboard layout requires a validated session; wedding API calls additionally enforce actual active memberships and Admin-only editing. See WEDDING_ONBOARDING.md for transactional creation and current scope. Earlier references in this document to wedding setup being pending describe the original authentication milestone.
