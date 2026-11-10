# Vercel deployment QA — 5 November 2026

Target: [Make My Marriage demo](https://make-my-marriage-nine-rho.vercel.app/). Checks below were performed against the deployed site in the browser unless marked local. The deployed revision was not independently identified.

## Follow-up after demo QA provisioning

The owner confirmed that the demo has a separate database and authorized a dedicated demo account. Signup and login then succeeded with `qa.demo.20261105@example.com`. Reuse the existing account from ignored root `.env.qa.demo.local` for this deployment. The original access blocker below is historical.

- Two synthetic weddings were created and listed. Wedding title editing persisted across reload; the form retained its draft across steps, and taken-slug and duplicate-couple checks passed.
- Family & Team loaded, keyboard tabs worked, and the sole Admin could not be demoted or removed. QA-03 reproduced: the Organizer warning remained after switching to Wedding Admin.
- The owner authorized one real invitation to their test inbox. The deployment created the record but displayed **Email could not be sent**. The failed attempt remained in history; cancellation and confirmed revocation worked. The revoked record is on the synthetic wedding `6aec3bfe1ff70d8d52d7898e`. The provider cause and recipient acceptance were not verified. No second email was attempted.
- See the [10 November report](MANUAL_QA_2026-11-10.md) for the later deployed login retest and local dashboard QA.

## Access blocker

The saved reusable QA credentials were rejected with “Email or password is incorrect.” To reproduce, open the deployed `/login` and submit the QA account from `.env.qa.local`. The deployment guide specifies a separate demo database, so the account may need provisioning there. This is a blocker for QA, not evidence that login fails for existing deployment users. A deployment QA account or authorization to register the dedicated account is needed before private testing can continue.

## Verified on Vercel

| Area | Result |
| --- | --- |
| Homepage | Loaded; all five sample event selectors changed the active preview; How It Works link reached its section; ceremony image loaded when in view |
| Mobile homepage | 390px layout had no horizontal overflow; menu opened and closed on Escape and on selecting Features |
| Signup | Required name/email/password, short password, and confirmation mismatch rejected locally; no account created |
| Login | Empty-field validation and invalid-credentials feedback shown; successful login not yet verified |
| Password recovery | Explains that email-based recovery is unavailable and links back to login, as expected for current scope |
| API and proxy | `/api/v1/health` returned `status: ok`; `/api/v1/auth/csrf` initialized successfully through the web hostname |
| Signed-out access | `/weddings` redirected to login; `/api/v1/weddings` and `/api/v1/auth/me` returned `UNAUTHENTICATED` |
| Invalid team invitation | Synthetic invalid token showed the invalid/expired/revoked message with no acceptance control |

No new product bug was confirmed in the public checks. QA-03, the obsolete Organizer warning recorded in the previous local pass, has not been retested on Vercel.

## Pending coverage

Successful registration/login and cookie persistence, account identity and logout, wedding creation and editing, Family & Team, invitation creation and acceptance, Organizer permissions, and removal/revocation remain unverified on this deployment. The previous localhost results do not count as deployment coverage. No invitation email was sent to a real inbox in this pass. The one-send authorization from the previous localhost pass was already used.

Local regression suite: 116 passed; three opt-in Atlas tests skipped. No application code changed and no issue was filed externally.
