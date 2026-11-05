# Manual QA — 29 October 2026

Latest full browser pass: [2 November 2026 report](MANUAL_QA_2026-11-02.md), including Family & Team and one explicitly authorized real invitation email. The original findings and limits below are historical; use the latest report for current coverage.

Browser interaction QA against the local application at `http://localhost:3000`, using its configured development API and Atlas persistence. This report describes observed behavior in the current working tree, including existing uncommitted onboarding changes. Application code was not changed to fix findings.

## Reusable account

The product owner requested one dedicated account for all future manual QA. Reuse it rather than creating another account per run.

- Display name: **QA Manual Tester**.
- Email: `qa.manual.20261029@example.com`.
- Credentials and local base URL: root **`.env.qa.local`**, confirmed ignored by Git. Read this file locally when running QA; do not paste its password into tracked documentation or reports.
- Created through the real signup form; confirmed signup requires a separate login.
- The earlier `qa.auth.20261016.01@example.com` account was not modified. Its supplied bcrypt hash cannot serve as a login password.

Two synthetic weddings were retained for repeatable QA; no existing user weddings were modified or deleted:

| Wedding | ID | Reserved slug | Date |
| --- | --- | --- | --- |
| QA Asha & Arjun Celebration | `6ae2d4182232fb93951e36d9` | `qa-manual-asha-arjun-20261029` | 2027-02-01 |
| QA Meera & Dev Past Wedding | `6ae2d4692232fb93951e36de` | `qa-manual-meera-dev-20261029` | 2026-01-01 |

The first wedding has Asha QA / Arjun QA, QA Updated Venue, Jaipur, Rajasthan. The second has Meera QA / Dev QA and no venue. Both use Asia/Kolkata. Both websites remain unpublished. Sessions used for this pass were signed out at completion.

## Findings

### QA-01 — Medium: another open homepage retains signed-in controls after logout

Reproduced twice.

1. Log in and leave the homepage open in tab A.
2. In tab B, open Account or My Weddings and sign out.
3. Return to tab A and interact with its homepage section links.

**Actual:** tab A retains My Weddings and Sign Out in its header, hero, closing section, and footer as applicable. In the desktop reproduction there were three Sign Out buttons and no Sign In links. Reloading tab A corrects the state.

**Expected:** session-change/focus revalidation updates the homepage to the signed-out navigation and signup calls to action.

**Impact:** misleading session status and an extra login round-trip. Clicking the stale My Weddings link correctly redirects to login; this test did not reveal access to private wedding data after logout. An open wedding overview/edit dialog correctly clears and redirects on logout from another tab.

Relevant implementation: the marketing page passes a server-resolved `signedIn` value into the landing components; the landing shell does not subscribe to the session-change mechanism used by the private pages. This is supporting code inspection, not a substitute for the browser reproduction.

Local screenshot evidence (ignored generated files):

- `tmp/manual-qa-2026-10-29/stale-homepage-after-logout.jpg`.
- `tmp/manual-qa-2026-10-29/signed-out-account-tab.jpg`.

### QA-02 — Low: sign-out destination differs across screens

1. Log in, open `/account`, and click Sign Out. Repeat from a wedding workspace.
2. Compare with logging in and clicking the homepage Sign Out control.

**Actual:** Account and workspace sign-out landed on `/login`. Homepage sign-out landed on `/` with signed-out navigation. Account behavior was observed twice.

**Expected:** a consistent destination. The existing sign-out implementations request `/`, so the Account/workspace result differs from that intention.

**Impact:** a confusing redirect, with no observed failure to revoke the session. Code inspection suggests the private-page session recheck can redirect to login while the logout handler is navigating home; this cause is an inference and needs a focused regression test when fixed.

## Fix verification — QA-01 and QA-02

Both findings were fixed and checked in a focused browser pass on 29 October 2026, after the original report above. The homepage now listens for session-change, focus, visibility and history-restoration hints and refreshes its server-resolved session props. All sign-out controls share one logout/navigation operation; local 401 callbacks cannot override its homepage destination. Other documents still clear private content and go to login on session loss.

Using the existing reusable account, with no account or wedding creation/modification:

- A homepage left open while logging in elsewhere updated to signed-in controls without a reload.
- Account logout landed on `/`. The existing homepage changed to Sign In/signup controls without a reload, and a third tab showing the retained wedding redirected to `/login`.
- After signing in again, logout from the retained wedding overview also landed on `/`; the other homepage updated correctly again.
- The QA session was signed out at completion. Existing synthetic weddings and ignored credentials were retained.

Four automated regression tests cover in-flight 401 versus local logout, ordinary session loss, failed-logout retry, and repeated clicks. The existing session-signal tests cover cross-tab hints and focus/visibility/history fallback. Default tests now total 75 passing tests (36 API, 39 frontend); 2 opt-in Atlas tests were skipped for this frontend-only change. Organizer/cross-account manual coverage remains outside this focused pass.

## Independent follow-up cross-check — 29 October 2026

At the product owner's request, both fixes were independently retested against the running local app using the saved QA account. **QA-01 and QA-02 passed this follow-up.**

- Login in another tab updated the already-open homepage to My Weddings/Sign Out without a reload. This passed on repeated logins.
- Account logout returned to `/`. The other homepage changed to three Sign In links with zero Sign Out buttons and zero My Weddings links, without a reload.
- A third tab with the retained wedding's edit dialog open cleared its private content and redirected to `/login` after Account logout.
- Desktop wedding workspace logout, 390px mobile workspace menu logout, and homepage logout each returned to `/` and synchronized the other homepage correctly.
- Direct navigation to the retained wedding after logout redirected to `/login`. The existing hub still listed both synthetic weddings before logout; opening the original wedding and cancelling its edit dialog worked.
- No accounts or wedding data were created or modified. All QA sessions were signed out and the temporary viewport override was reset.
- Fresh checks passed: `npm run lint`, `npm run typecheck`, `npm run test` (36 API + 39 frontend = 75 passing; 2 opt-in Atlas tests skipped), and `npm run format:check`. No application errors were present in the sampled homepage console logs.

Evidence: `tmp/manual-qa-2026-10-29/verified-homepage-after-cross-tab-logout.jpg`. This was a focused regression pass for the reported session issues and adjacent navigation; the broader limitations below still apply.

## Browser coverage — original pass

| Area | Checks and observed result |
| --- | --- |
| Signup | Empty fields, password mismatch, valid signup, success notice, separate login: passed |
| Login | Empty fields, malformed email, incorrect password, password show/hide, successful login to homepage: passed |
| Remember Me | Checkbox selection and login with it selected: passed; 30-day persistence was not time-tested |
| Existing session | Direct `/login` and `/signup` visits redirect to homepage: passed |
| Account | Correct display name/email, My Weddings navigation, sign-out revocation: passed; destination issue QA-02 |
| Password recovery | Forgot Password explains recovery is unavailable and returns to login: passed for current scope |
| Homepage | Signed-in/out calls to action, section navigation, all five sample event selectors with updated titles/leads/tasks and pressed state: passed; cross-tab issue QA-01 |
| Empty hub | New account sees No weddings yet and can start creation: passed |
| Wedding details | Required-field validation, locally generated title suggestions, valid date and default timezone: passed |
| Creation steps | Step 1/2 back-forward controls retain names, title, date, venue, and custom slug: passed |
| Website address | Invalid slug rejected; existing reserved slug reported taken; custom available slug accepted: passed |
| Creation | Real save, confirmation, Admin label, unpublished website state, opening workspace: passed |
| Multiple weddings | Distinct second wedding with no venue saved; both cards listed and original reopened: passed |
| Duplicate protection | Same couple with different casing/title/date/slug rejected; editing into the other existing couple also rejected, with entered values retained: passed |
| Overview | Saved details, future countdown (95 days), past countdown (301 days), venue empty state: passed |
| Editing | Prefilled dialog, Cancel discards edits, title and venue save, reload persistence, unchanged slug: passed |
| Mobile | Creation and dialog interaction at narrow default viewport; 390px workspace menu, Account navigation, Escape dismissal: passed |
| Desktop | Wedding navigation, hub cards, homepage controls exercised with desktop viewport override: passed |
| Session loss | Logout in Account clears another open wedding/edit tab and redirects it to login; direct signed-out `/weddings` navigation redirects to login: passed |
| Missing wedding | Signed-in request for a nonexistent 24-character ID shows Wedding unavailable with return navigation: passed |
| Console | No application errors observed in sampled tab logs; one Next.js development warning about missing `data-scroll-behavior="smooth"` was observed |

## Background-refresh draft preservation — 30 October 2026

Review identified a P2 issue: a network/5xx response during tab-activation refresh cleared the wedding and unmounted the edit form. Fixed by preserving the loaded wedding/editor on temporary errors and displaying an inline retry warning. Retry does not reset the form. Rejected access clears private data and closes editing, and a refreshed Organizer role closes editing. Switching wedding IDs resets page state.

Six automated state-transition regressions cover failure/retry/recovery, access rejection, reduced permissions, initial-load errors and Cancel/save. Default tests pass 81 cases (36 API + 45 frontend); 2 Atlas tests are skipped. Browser failure injection and Atlas tests were not run for this frontend-only fix. The earlier browser results above remain historical evidence, not a manual verification of temporary refresh failures.

## Family & Team milestone — 30 October 2026

The new planning-team screens and invitation/access-management backend are implemented. Browser automation failed to initialize, including after reset, so desktop/mobile/keyboard interaction checks for this feature were not performed in this run. Do not treat earlier onboarding browser results as Family & Team coverage.

All 104 automated tests passed across verification with the three Atlas flags enabled (53 API, 51 frontend). The final parallel run encountered an auth-infrastructure 503 at CSRF initialization; its isolated retry passed. Membership coverage uses isolated synthetic fixtures with email mocked and scoped cleanup; it verifies token privacy/possession, duplicate invites, forced-write rollback, concurrent acceptance, Organizer restrictions, role changes, last-Admin races, revocation/reactivation, expiry/decline, saved email status, CSRF and audit. Existing reusable manual QA credentials and the two retained weddings were preserved.

The user explicitly authorized one real test invitation from the first retained QA wedding to the address configured as `RESEND_FROM_EMAIL`. The saved QA account was reused; no new manual QA account was created. The API returned 201 and retained pending invitation `6ae4306b3acc55ea465821d1`, but Resend rejected the email because the sender domain is not verified. The delivery record is FAILED. No inbox delivery or automatic retry occurred; the smoke-test session was revoked. After correcting the sender configuration, revoke this pending test invitation before creating a replacement. Do not paste its private token or credentials into this report.

Next manual checks: members/empty invitations, visible email field, all nine initially unchecked permissions, role switching, validation and cancellation, mobile full-screen dialog and focus handling, acceptance through signup/login, permission changes/removal, read-only Organizer view, session loss and transient-refresh draft preservation. Use an explicitly authorized email recipient for delivery testing. See FAMILY_TEAM.md for scope and setup.

## Invitation accepted under an existing account — 2 November 2026

The user confirmed receiving the development invitation in Spam. Read-only diagnosis of invitation `6ae816299c675633386871c2` found it was accepted by QA Manual Tester, already an active Admin of the second retained QA wedding. No separate recipient account membership was created. Accepted invitation history remains valid history; it does not imply another person joined.

The API now rejects acceptance by an active member with `409 ALREADY_A_MEMBER` before consuming the invitation. The invitation page retains its controls and offers Switch account, returning to the invitation after login. A lifecycle regression checks that the invitation stays pending after the existing Admin's attempt and remains redeemable by a new member. Historical records and retained manual QA accounts were not modified, and no replacement email was sent. Browser interaction verification of Switch account remains pending.

## Limits

2 November follow-up: the owner approved restricting acceptance to the invited normalized email, in addition to valid token possession and login. The lifecycle regression now rejects both a wrong-account Admin and a wrong-account nonmember without consuming the invitation, then exercises the intended recipient's acceptance. Existing removal coverage checks loss of wedding access and reinvitation/reactivation without duplicate memberships. The member-management markup test checks the Remove member control for a non-final Admin. Browser interaction QA of the revised flow remains pending. No retained manual QA account, wedding, membership or invitation was reset, and no real email was sent for this change.

Lint, typecheck, formatting, 102 offline tests and the isolated Atlas membership lifecycle passed for the email-restriction revision. A read-only check found that the recipient of the earlier accepted QA invitation has no app account, membership or pending invitation in that wedding. A fresh invite can be created without deleting anything; the recipient must register/sign in with that address before accepting. The other two Atlas suites were not rerun.

This is one Chromium-based in-app browser pass, not a release/security certification or a full device matrix. No manual Organizer, revoked-membership, suspended-user, stranger-account, expired-session, concurrent-edit, or API-failure injection scenarios were performed. Browser restart persistence, cookie attributes, transaction rollback and 30-day expiry were not manually validated. Existing automated coverage is separate evidence.

Events, member invitations, tasks, expenses/payments, guests/RSVP, gallery/media, vendor discovery, email delivery, published websites and livestream configuration are not implemented product workflows yet; marketing examples and route scaffolds were not counted as working features. No provider calls, email sends, media uploads, deployment, commits, or pushes were performed.

Verification for recipient guidance: lint, typecheck, formatting, production build, 107 offline tests (50 API, 57 frontend), and the isolated Atlas membership lifecycle passed. Five new UI cases cover new/registered signed-out recipients, both wrong-account states and matching-account acceptance. Atlas verifies existing/new recipient preview guidance and unavailable-token rejection. The other two Atlas tests and browser interaction QA were not run. No real email was sent or retained QA data modified.

Email-prefill verification, 2 November 2026: lint, typecheck, formatting and production build passed. The offline suites passed 113 tests (50 API, 63 frontend) across runs. Six added auth-navigation cases cover validated invitation prefill, signup-to-login continuation, ordinary/untrusted paths, unavailable invitations, malformed responses and network failure. An initial test reused a consumed mock Response; correcting the mock to return a fresh response made the frontend suite pass. Atlas tests and browser interaction checks were not rerun for this frontend change. No provider calls or real emails were made.

Navbar identity verification, 2 November 2026: lint, typecheck, formatting, 116 offline tests (50 API, 66 frontend) and production build passed. Three new markup regressions cover homepage identity, workspace identity and signed-out omission. A strict optional-prop type error was corrected; a subsequent Windows ENOTEMPTY cache error was resolved by clearing only the verified generated apps/web/.next directory with dev stopped. Browser/mobile interaction checks and Atlas tests were not rerun. Existing session watcher coverage remains separate evidence; no real email or retained QA data changes were made.
