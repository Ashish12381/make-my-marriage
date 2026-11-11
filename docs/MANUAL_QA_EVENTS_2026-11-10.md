# Wedding Events QA — 10 November 2026

The Events implementation was tested in the local working tree with the retained development QA account and synthetic weddings. The public demo was checked separately at [planyourwedding.online](https://planyourwedding.online/) with the existing demo QA account.

## QA-06 — Medium: date heading and event card disagree across timezones

1. Open an `Asia/Kolkata` wedding.
2. Create or edit an event with timezone `America/New_York`, start `23 December 2026 23:15`, and end `24 December 2026 01:00`.
3. Open the Events list and find the event, optionally by searching its venue.

The card displays **23 Dec 2026 · 11:15 pm – 1:00 am next day**, under **Thursday, 24 December 2026**. The card does not identify its timezone, so readers have no context for the conflicting dates. The detail screen correctly shows the event timezone. The list groups using the wedding timezone and formats the card using the event timezone. Use one timezone for both dates or label both explicitly. This is a presentation issue; the saved event time persisted correctly.

Evidence: ignored `tmp/events-qa-2026-11-10/mixed-timezone-date.jpg`. The event was synthetic and was archived after verification.

## Development-only usability note

At 1280×720, the Next.js development indicator covered the left side of the Events sidebar's Sign Out control after scrolling it into view. Pointer clicks at the control's center did not sign out; keyboard activation did, and the other private tab cleared. The overlap is visible in the same screenshot. This was observed in development and is not a deployed sign-out failure.

## Local browser coverage

| Flow | Result |
| --- | --- |
| Dashboard and entry | Real Haldi schedule and next-event summary shown; Add event opened creation |
| Create and assign | Mehendi preset filled its name; custom draft saved with an assigned QA organizer |
| Edit and schedule | Reversed times and `javascript:` map URL rejected; overnight schedule, venue, map link, and organizer persisted across reload |
| Search and filters | Venue search and Upcoming, Drafts, Past, and Cancelled filters responded as expected |
| Wedding isolation | Event ID was unavailable under the other QA wedding |
| Cancel and archive | Back dismissed confirmation without changing status; confirmation moved the event to Cancelled and removed Edit; archive removed it from the list and its direct URL became unavailable. Existing Haldi was untouched |
| Mobile | Events list and form had no horizontal overflow at 390px; Escape closed sidebar and returned focus; Go back closed the form |
| Adjacent flows | Login, empty signup validation, wedding edit Cancel, Family & Team roster and invitation history, keyboard tabs, and cross-tab logout passed |

## Deployed smoke test

Custom-domain sign-in, wedding overview, Family & Team, and sign-out passed. The custom domain still showed the earlier overview; new Events behavior was not verified on Vercel. A request to the old Vercel alias with a query stayed on the alias, so the canonical redirect was not observed live.

## Automated verification and limits

- Default suite: **125 passed**, four opt-in tests skipped.
- Development Atlas wedding suite: **2 passed** separately, including allowed and denied Organizer access, rollback on album failure, default private album creation and retention, guest-access expiry, event cancellation, and archive.
- Signup and wedding creation were not repeated with new records for this pass. Live invitation sending, recipient acceptance, and direct Organizer browser testing were not rerun. No new QA accounts or weddings were created, and no email was sent. Future task, expense, guest, and media modules were not counted as implemented coverage.
- No application code changed in this pass.
