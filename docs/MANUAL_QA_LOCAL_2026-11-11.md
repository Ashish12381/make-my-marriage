# Local manual QA — 11 November 2026

Tested the current working tree at localhost with the retained QA account and two synthetic weddings.

## Fix revalidation — 11 November 2026

- **QA-03 passed.** An Organizer invitation with zero permissions still shows the warning. Selecting Tasks clears it. Removing the selection and submitting again restores the warning. Switching to Wedding Admin also clears it. No invitation email was sent.
- **QA-06 passed.** A New York event starting December 23 at 11:15 pm in the Kolkata wedding appeared under Wednesday, December 23. Its card and details both showed the 1:00 am next-day finish and the America/New_York timezone. The synthetic event was archived and the QA session signed out.

## Original QA-03 finding — Low severity

1. Open Family & Team and select **Invite Member**.
2. Enter a valid test email, keep **Organizer** selected, and submit with every area unchecked.
3. Select **Tasks**.

The checkbox is checked, but the alert still says “Select at least one area this Organizer can access.” The alert should clear when an area is selected. This reproduces the existing stale-warning issue through permission selection. The dialog was closed without resubmitting, so delivery was not exercised.

## Browser coverage

| Area | Result |
| --- | --- |
| Homepage and account | Haldi selector updated the sample, signup displayed required-field errors, QA login and logout worked, and a private task URL redirected to sign-in after logout |
| Weddings and dashboard | Both retained weddings opened, live Haldi data appeared, the Add event and View tasks links worked, a title suggestion filled the edit form, Cancel discarded it, and onboarding rejected a duplicate couple with a different title, date, and slug |
| Family & Team | Admin and Organizer roster and invitation history loaded. Organizer permission validation triggered and reproduced QA-03 |
| Events | Scheduled a New York event overnight in the Kolkata wedding. The card and detail showed the timezone and next-day finish. The list grouped the event under December 23, so QA-06 passed. Cancel and archive worked |
| Task Planner | Created a task linked to Haldi and assigned to the QA user, checked the overdue label, completed a checklist item and verified persistence after reload, edited the task, completed and reopened it, dismissed then confirmed cancellation, verified the Cancelled group, and removed the synthetic task. The second wedding showed its own empty task list |
| Mobile | Task list and open add form had no page-level horizontal overflow at 390 px. Escape from a menu link closed the menu and returned focus to Menu. Mobile sign-out passed |

The default suite passed 130 tests with five opt-in tests skipped. The separate development Atlas wedding suite passed all three tests, including task assignment, wedding isolation, and Organizer permissions.

Successful signup and unique wedding creation were covered by automated checks in this pass. Fresh signup and unique wedding creation were not repeated in the browser. Live email delivery and fresh invitation acceptance were not exercised. The synthetic event was archived, the synthetic task was removed, and the QA browser sessions were signed out.
