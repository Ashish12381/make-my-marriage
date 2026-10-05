**PRODUCT REQUIREMENTS DOCUMENT / FINAL V1 PRODUCT SCOPE**

# Make My Marriage

*One wedding. Both families. One shared experience.*

> **VERSION 1.0  |  FINAL PRODUCT REQUIREMENTS**  
> Prepared for   Ashish Pal / Product Owner  
> Document date   24 September 2026  
> Status   Product scope confirmed; implementation choices noted separately  
> Scope baseline   13 finalized functional modules  
> Audience   Product, design, engineering and QA

## Document purpose

Define the finalized V1 product scope, user experiences, functional behavior, security boundaries and testable acceptance criteria. The product owner confirmed the feature scope in conversation on 24 September 2026. Engineering decisions and launch readiness remain subject to implementation and testing.

> **Scope principle**
> Keep family RSVP intentionally simple: one family record, one invitation link, and a separate Yes/No response for each invited event. No guest login, individual family-member profiles, or attendance headcounts in V1.

# 1. Document control & review

| **Item** | **Value** |
| --- | --- |
| **Product** | Make My Marriage - responsive web application |
| **Document version** | 1.0 final |
| **Review status** | Final feature scope confirmed by product owner; implementation and QA pending |
| **Product owner** | Ashish Pal |
| **Primary users** | Couples planning their own weddings; selected members of both families |
| **Guest access** | Password-free wedding website and personalized invitation links |
| **Operational users** | Platform Super Admin; Wedding Admins; Family Organizers |
| **Initial channel** | Email invitations; optional manually copied invitation links |
| **Release scope** | All 13 modules described in Section 6; no spending caps; YouTube URL livestreaming |

## Revision record

| Version | Date | Change |
| --- | --- | --- |
| 1.0 final | 24 September 2026 | Product scope confirmed; replaced all budget-setting and spending-limit functions with pure expense/payment tracking; simplified streaming to event-specific YouTube URLs with a Watch Live link. |

# 2. Executive summary

Planning an Indian wedding commonly involves multiple functions, two families, shared responsibilities, vendor coordination, expense tracking, invitations and a large volume of photographs. Make My Marriage consolidates those workflows into one private planning workspace linked to a guest-facing wedding website.

The V1 product serves couples and their selected family administrators, regardless of wedding size. Guests receive a single family invitation link and respond Yes/No for each event to which they are invited. They can view permitted wedding details, photo albums and livestreams without signing in.

**PRODUCT GOALS**

- Reduce fragmented planning across messages, spreadsheets and separate invitation tools.
- Allow couples and selected members of both families to administer one wedding together.
- Make digital invitations and event-specific family RSVPs exceptionally simple.
- Connect planning data to a configurable wedding website, gallery and remote viewing experience.
- Validate an end-to-end, potentially commercial product while keeping development practical for learning.

# 3. Product principles & fixed decisions

| **Decision** | **V1 requirement** |
| --- | --- |
| **Target audience** | Couples organizing their weddings, with both families collaborating; support small through large weddings. |
| **Administrative model** | Multiple Wedding Admins per wedding: the couple and invited family members. Separate Platform Super Admin. |
| **Money tracking** | Record actual wedding expenses and payments with event/category breakdowns. No required total budget, spending cap, event allocation or over-budget warning. |
| **RSVP unit** | One family/guest-group record, one personalized invitation link, independent Yes/No per invited event. |
| **Guest friction** | Guests require no account, login, password or application installation. |
| **Communication** | Email is the integrated V1 channel; organizers may manually share links via other apps. |
| **Media** | Collaborative event-wise photo gallery included in V1; valid uploads become available after technical verification according to album access rules, without photo approval or moderation. |
| **Streaming** | An organizer supplies a YouTube livestream URL per event; guests click Watch Live to open YouTube. No video hosting, YouTube API or required player embed in V1. |
| **Website** | Personalized, responsive, configurable public or invitation-only wedding website. |
| **Vendors** | Nearby search and shortlisting with booking/payment tracking; not a transactional marketplace. |

# 4. Users and access model

| **Actor** | **Purpose and permitted access** |
| --- | --- |
| **Platform Super Admin** | Operates the application: accounts, wedding statuses, reported content, system health, usage and settings. No routine access to private family content. |
| **Wedding Admin** | Couple or invited family member. Full control within one wedding, including co-admin invitations and organizer permissions. |
| **Family Organizer** | Signed-in collaborator with wedding-specific permissions delegated by a Wedding Admin. |
| **Guest / invited family** | No account. Uses a personalized link to view permitted content and respond per invited event. Public pages may be browsed without an invitation. |

> **Isolation rule**
> Wedding-level roles do not grant privileges across other weddings. Platform administrators and wedding administrators are distinct security roles.

# 5. Scope at a glance

| **ID** | **V1 module** | **Principal outcome** |
| --- | --- | --- |
| **01** | Authentication & Wedding Setup | Create an account and a wedding workspace. |
| **02** | Family & Organizer Management | Enable shared administration by the couple and family. |
| **03** | Multiple Wedding Events | Organize individual wedding functions. |
| **04** | Wedding Dashboard | See progress and issues in one place. |
| **05** | Task Planner | Assign and complete wedding work. |
| **06** | Expense Tracker & Payment Records | Record money paid, event/category spending and remaining vendor balances without setting budgets. |
| **07** | Nearby Vendor Discovery & Management | Find nearby vendors and manage booked providers. |
| **08** | Guest Management & Event-wise Family RSVP | One invitation link per family; independent event RSVPs. |
| **09** | Digital Invitations & Email Notifications | Send invites, confirmations and reminders by email. |
| **10** | Collaborative Photo Gallery | Collect and share event-wise wedding photographs. |
| **11** | Personalized Wedding Website | Publish a branded website from planning data. |
| **12** | YouTube Wedding Livestream Links | Give remote guests an event-specific Watch Live link. |
| **13** | Platform Admin Panel | Operate and moderate the overall platform. |

# 6. Functional requirements

The requirements below are all in V1 unless expressly marked conditional on a supported third-party provider or the family's privacy configuration. IDs support traceability to design, implementation and QA.

## 6.1 Authentication & Wedding Setup

*A signed-in couple creates a wedding and enters a shared planning workspace.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-01.01** | Register and sign in using email/password; support password reset and secure logout. Email verification is not required for signup or member acceptance in V1. |
| **FR-01.02** | Maintain user profile: name, email, optional phone and profile image. |
| **FR-01.03** | Create a wedding with couple names, date, location, cover image and optional expected size; do not require a budget or spending limit. |
| **FR-01.04** | Provide step-by-step onboarding and a clear first-action path: invite partner/family and create a first event. |
| **FR-01.05** | Allow users to belong to multiple weddings and switch between authorized workspaces. |
| **FR-01.06** | Generate immutable internal wedding ID and an editable/unique public website slug. |
| **FR-01.07** | Allow authorized admins to edit wedding details; do not expose private planning data on public pages. |

**MINIMUM ACCEPTANCE CRITERIA**

- Given a registered, signed-in user, creating a wedding assigns them Wedding Admin for that wedding without requiring email verification.
- A member of two weddings can switch without seeing one wedding's private records in the other.
- A duplicate website slug is rejected with a clear alternative.

## 6.2 Family & Organizer Management

*Multiple invited members of both families can administer the same wedding.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-02.01** | Wedding Admins can invite the partner and selected relatives as additional Wedding Admins or Family Organizers via email. |
| **FR-02.02** | Invitees accept or decline their invitations; repeat invitations do not create duplicate memberships. |
| **FR-02.03** | A Wedding Admin can grant/revoke organizer permissions by feature area and assign event-specific responsibilities. |
| **FR-02.04** | Wedding Admins have equivalent management rights for their own wedding, regardless of bride/groom family designation. |
| **FR-02.05** | At least one active Wedding Admin must remain; prevent removal or departure of the last admin. |
| **FR-02.06** | Allow admin role changes/removal and record important membership and permission changes in the activity log. |
| **FR-02.07** | Enforce wedding-specific permissions on backend endpoints and media access, not just in the interface. |

**MINIMUM ACCEPTANCE CRITERIA**

- An invited parent can accept Wedding Admin access and manage the wedding independently.
- An organizer without finance permission cannot read or edit expense or payment endpoints.
- The application prevents deletion of the wedding's final active Admin.

## 6.3 Multiple Wedding Events

*Functions such as Haldi, Mehendi, Sangeet, wedding and reception have separate schedules and connected records.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-03.01** | Create predefined or custom events with name, description, date/time, time zone, venue, location/map link and cover image. |
| **FR-03.02** | Edit, cancel or archive events, subject to assigned organizer permissions. |
| **FR-03.03** | Assign event organizers. Associate expenses with the event for reporting, without requiring budget allocations. |
| **FR-03.04** | Associate households, tasks, vendors, expenses and event-specific invitations with each event. |
| **FR-03.05** | Create a default photo album for each new event, with optional custom albums. |
| **FR-03.06** | Allow permitted organizers to configure a YouTube livestream URL for any selected event. |
| **FR-03.07** | Reflect published event updates on the wedding website and flag material changes for guest notifications. |

**MINIMUM ACCEPTANCE CRITERIA**

- Creating a Sangeet produces an event and its default photo album.
- The same household can be invited to the Sangeet but not the Haldi.
- Changing a published event time updates authorized guest-facing views.

## 6.4 Wedding Dashboard

*The private home screen reports wedding-wide progress with role-appropriate visibility.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-04.01** | Show wedding countdown, upcoming events and event status. |
| **FR-04.02** | Report invited, confirmed, declined and pending FAMILY/GROUP counts by event; do not imply individual attendance. |
| **FR-04.03** | Show total amounts paid, spending by event and category, recorded agreed vendor costs and unpaid balances where the viewer has finance permission. Do not show budget limits or remaining-budget calculations. |
| **FR-04.04** | Display assigned and overdue tasks, approaching vendor payment dates and pending guest responses. |
| **FR-04.05** | Show recent authorized organizer activity and relevant alerts. |
| **FR-04.06** | Provide quick actions for events, guests, tasks, expenses and invitations, subject to permissions. |

**MINIMUM ACCEPTANCE CRITERIA**

- Family RSVP counts match event invitation records; no fabricated individual headcount is displayed.
- An organizer without finance access does not see monetary dashboard panels.
- A modified RSVP is reflected in the corresponding event summary.

## 6.5 Task Planner

*Family members coordinate work across functions and track ownership.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-05.01** | Create, update, assign, complete, cancel and remove authorized wedding or event-level tasks. |
| **FR-05.02** | Support title, description, priority, due date, assignee(s), status and optional checklist. |
| **FR-05.03** | Provide list and calendar views plus search/filter by assignee, event, date and status. |
| **FR-05.04** | Allow comments and basic task activity history. |
| **FR-05.05** | Provide editable templates for common wedding preparations. |
| **FR-05.06** | Send email assignment and deadline reminders according to notification preferences. |

**MINIMUM ACCEPTANCE CRITERIA**

- Assigning a task to a family organizer displays it in their authorized task list.
- Completing a checklist does not automatically change a task unless the status rule is configured.
- A due-date reminder is not sent repeatedly for the same scheduled occurrence.

## 6.6 Expense Tracker & Payment Records

*Track every wedding expense and payment without requiring a budget, setting a spending limit or restricting spending by event.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-06.01** | Create an expense with amount/agreed cost, description, date, category and optional associated event and vendor. An event may have any number of expenses and no spending cap. |
| **FR-06.02** | Provide configurable expense categories (for example catering, decoration, venue, travel, photography) and support overall-wedding expenses that do not belong to one event. |
| **FR-06.03** | Record zero, one or multiple payments against an expense, including amount and date, so advances and installments are reflected accurately. |
| **FR-06.04** | Calculate **total paid** as the sum of recorded payments, and **outstanding** as the unpaid portion of an agreed cost when known. If payments exceed the previously recorded cost, display the discrepancy for correction without imposing a spending cap. Distinguish agreed costs from money actually paid. |
| **FR-06.05** | Attach receipts, bills or contracts to authorized financial records; support edit/delete with appropriate activity history. |
| **FR-06.06** | Show total paid and event-, category- and vendor-wise spending charts; display pending vendor payments and due dates when recorded. Do not count a shared vendor expense against multiple events unless the organizer records distinct event-specific expenses. |
| **FR-06.07** | Search/filter expenses and payments by event, vendor, category, status and date, and export permitted records to CSV. |
| **FR-06.08** | A booked vendor linked to an expense must share the same payment records; do not create duplicate finance ledgers. V1 records payments but does not process or transfer money. |
| **FR-06.09** | Never block expense entry because of amount and never display mandatory budget setup, allocation limits, remaining-budget meters or over-budget alerts. |

**MINIMUM ACCEPTANCE CRITERIA**

- A Wedding Admin can add expenses to Haldi and Sangeet without entering any total or event budget; spending is never capped.
- For a photographer with agreed cost ₹100,000 and an advance payment of ₹30,000, total paid increases by ₹30,000 and that expense shows ₹70,000 outstanding, without treating the unpaid amount as already spent.
- Adding two payments to an expense records each payment only once; event and overall paid totals reconcile with the payment ledger.
- Wedding-wide costs can be recorded without associating them with a particular event.
- Unauthorized organizers and guests cannot access financial records or exports.

## 6.7 Nearby Vendor Discovery & Management

*Couples explore local services, shortlist providers and manage their selected vendors.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-07.01** | Default discovery location to wedding city/venue; allow searches by another selected location. |
| **FR-07.02** | Provide category and text search for photographers, venues, decorators, caterers, makeup, mehendi, music, transport and similar services. |
| **FR-07.03** | Show list and map views with available provider-supplied names, addresses, images, ratings, directions and contact links. |
| **FR-07.04** | Support category, distance and available-rating filters without fabricating missing provider data. |
| **FR-07.05** | Allow authorized members to shortlist a result or manually add an unlisted vendor. |
| **FR-07.06** | Track internal status: shortlisted, contacted, negotiating, booked or rejected; add organizer notes and manually received quotations. |
| **FR-07.07** | Link booked vendors to one or more events, agreed cost, payment schedule and expense records. |
| **FR-07.08** | Implement external places integration under applicable display, attribution, storage, quota and billing terms. |

**MINIMUM ACCEPTANCE CRITERIA**

- Searching near Jaipur displays available relevant local business results or a useful empty/error state.
- Shortlisting a vendor does not imply a booking or initiate payment.
- A booked vendor can be linked to a Sangeet expense without duplicate payment records.

## 6.8 Guest Management & Event-wise Family RSVP

*A guest entry represents an invited family or other guest group, not its individual members.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-08.01** | Create one guest/family record with display name, email if available, optional phone and optional classification/tag. |
| **FR-08.02** | Add, edit, delete, search and CSV-import family guest records; flag potential duplicates for organizer review. |
| **FR-08.03** | Select the specific events to which each family is invited; an event not assigned to that family is not shown in its private invitation. |
| **FR-08.04** | Generate ONE personalized invitation link per family/wedding that contains all its invited events. |
| **FR-08.05** | Store one independent response per family/event: Pending, Yes or No; initial state is Pending. |
| **FR-08.06** | Guests submit Yes or No for each invited event without signing in; allow permitted corrections until event RSVP deadline. |
| **FR-08.07** | Organizers may record phone/verbal responses or override an RSVP after the deadline. |
| **FR-08.08** | Show and export family-level invited/confirmed/declined/pending summaries per event. |
| **FR-08.09** | Do NOT capture individual family-member details, number invited, attendees, plus-ones or catering headcounts in V1. |

**MINIMUM ACCEPTANCE CRITERIA**

- Sharma Family receives one link covering Haldi and wedding, with independently saved Yes/No selections.
- Changing the Haldi RSVP never changes the wedding RSVP for the same family.
- The UI and reports state family/guest-group counts, never estimated people counts.

## 6.9 Digital Invitations & Email Notifications

*Send a family one clear invitation with personalized access to event-specific RSVPs.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-09.01** | Provide selectable email invitation designs with couple name, wedding imagery and applicable event details. |
| **FR-09.02** | Preview invitations and send one personalized message/link to each selected family email address. |
| **FR-09.03** | For families without email, allow an organizer to copy/share their secure link manually or record RSVP by phone. |
| **FR-09.04** | Record sending attempts and available delivery status; handle retries without duplicate unintended invitations. |
| **FR-09.05** | Send RSVP confirmations, configurable reminders for pending responses and important event-change notices. |
| **FR-09.06** | Support notification preferences and suppress unnecessary repeat reminders. |
| **FR-09.07** | Integrate email in V1; automated WhatsApp/SMS messaging remains out of scope. |

**MINIMUM ACCEPTANCE CRITERIA**

- A family invited to three functions gets one personalized email showing those three functions.
- An uninvited event is not revealed on the private RSVP page.
- A failed email can be retried and its status is visible to an authorized organizer.

## 6.10 Collaborative Photo Gallery

*Collect, protect and display wedding memories, organized by function.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-10.01** | Automatically create event-wise albums; allow additional custom albums with title, cover and description. |
| **FR-10.02** | Allow permitted organizers and guests to upload multiple supported image files with progress/failure feedback. |
| **FR-10.03** | Create guest upload links and event-specific QR codes without requiring guests to register. |
| **FR-10.04** | Offer PUBLIC, INVITED_GUESTS and ORGANIZERS_ONLY album visibility, independently configurable per album. INVITED_GUESTS means an actively invited family for the wedding, not necessarily for the album's event. |
| **FR-10.05** | Successful valid uploads become available according to album access rules after technical verification; there is no photo approval or moderation workflow. Wedding Admins and authorized Organizers may delete photos. |
| **FR-10.06** | Provide responsive grids, fullscreen view, sorting and individual image downloads where allowed. |
| **FR-10.07** | Use Cloudflare R2 for compressed main images and thumbnails, signed uploads, file validation and configurable size/volume quotas. MongoDB stores metadata and object keys only; do not retain original uncompressed files in V1. |
| **FR-10.08** | Protect restricted media URLs; strip location metadata from publicly served derivatives and provide report/removal tools. |

**MINIMUM ACCEPTANCE CRITERIA**

- An event QR code lets a guest upload a supported image without opening a planning account.
- A successful valid guest upload becomes available after technical verification according to album access rules, without waiting for photo approval.
- A user without access to a private album cannot retrieve its compressed main image or thumbnail via a copied URL.

## 6.11 Personalized Wedding Website

*A couple publishes a mobile-first guest-facing site powered by its wedding data.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-11.01** | Select a predefined template and customize theme colors, cover image, welcome copy and couple story. |
| **FR-11.02** | Preview, publish, edit and unpublish a website with a unique wedding slug and managed URL. |
| **FR-11.03** | Support welcome, countdown, permitted events/venues and map links, invited-family RSVP, gallery and an event-specific Watch Live on YouTube link where configured. |
| **FR-11.04** | Configure website-level public or invitation-only access plus supported section/album visibility settings. |
| **FR-11.05** | Read event dates, venues and guest access from wedding records; avoid manually duplicating content. |
| **FR-11.06** | Keep personal invitation tokens out of publicly indexed pages, analytics and third-party link previews. |
| **FR-11.07** | Provide mobile-first guest pages and essential English/Hindi guest-facing navigation/RSVP labels. |

**MINIMUM ACCEPTANCE CRITERIA**

- Publishing creates a responsive URL with only the sections that the family made visible.
- An event venue updated by an Admin is reflected on relevant website pages.
- A guest can view public information without a login, while private RSVP needs the unique invite link.

## 6.12 YouTube Wedding Livestream Links

*Make remote attendance simple: a Wedding Admin pastes an event-specific YouTube livestream URL, and guests select Watch Live from the wedding website.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-12.01** | Allow a Wedding Admin or permitted organizer to enable a livestream link for any selected event by pasting a valid HTTPS YouTube or YouTube Live URL. |
| **FR-12.02** | Validate the URL's supported YouTube host and format, and allow organizers to view, edit, replace, disable or remove the saved link. |
| **FR-12.03** | When a link is configured and the event is visible to the visitor, show a prominent **Watch Live on YouTube** button on the wedding website's relevant event page. |
| **FR-12.04** | Open the supplied URL on YouTube; viewing does not require a Make My Marriage account, our own video player or a YouTube API integration. YouTube's own availability and sign-in rules still apply. |
| **FR-12.05** | Use the event's saved date/time to display its schedule, and provide a clear state when no link is configured or the organizer has disabled it. |
| **FR-12.06** | Keep the link out of guest-facing sections for unpublished or unauthorized private events. Explain to organizers that public and unlisted YouTube URLs can be forwarded; limiting the website section does not make a YouTube stream truly private. |
| **FR-12.07** | If the organizer later supplies a YouTube recording URL, show an optional **Watch Recording** link after the event. Recording creation, storage and availability are handled by YouTube, not the app. |

**MINIMUM ACCEPTANCE CRITERIA**

- An admin pastes a valid event-specific YouTube Live URL; an eligible guest sees a Watch Live button that opens that exact URL.
- Invalid or non-YouTube URLs are rejected with a helpful message; removal or disabling hides the button.
- A guest does not need to log in to Make My Marriage to follow the link; the product does not promise that forwarded/unlisted YouTube URLs are private.
- A second event can have its own different YouTube link without affecting the first event.

## 6.13 Platform Admin Panel

*Platform operations are separate from wedding-level administration.*

| **Req ID** | **V1 requirement** |
| --- | --- |
| **FR-13.01** | Provide a separate /admin area accessible only to Platform Super Admins using strengthened authentication. |
| **FR-13.02** | Show platform-wide counts of users, weddings, events, invitation sending status, media and storage utilization. |
| **FR-13.03** | Search users and weddings by operational metadata; suspend/reactivate accounts or wedding sites with documented reasons. |
| **FR-13.04** | Review reported public websites/images and remove violating content with an auditable decision trail. |
| **FR-13.05** | Monitor email failures, background jobs, third-party integration health, storage and configurable upload quotas. |
| **FR-13.06** | Manage supported provider and platform settings and maintain immutable administrative audit logs. |
| **FR-13.07** | Exclude routine browsing of private family galleries, guest lists or financial data; exceptional intervention is least-privilege and audited. |

**MINIMUM ACCEPTANCE CRITERIA**

- A Wedding Admin cannot open /admin or call platform-admin APIs.
- A platform moderator can act on a reported photo with the action logged.
- An admin audit entry identifies the actor, scope, action, timestamp and reason.

# 7. End-to-end user journeys

## 7.1 Create and organize a wedding

1. A couple member signs up and creates a wedding without having to verify email or specify a budget.
2. The creator invites their partner and selected relatives as co-admins; others may have restricted organizer roles.
3. Admins create functions and assign tasks, vendor records, event-linked expenses and photo albums.
4. The dashboard aggregates tasks, family RSVP counts and finances according to each user's permissions.

## 7.2 Invite one family and collect event-specific RSVPs

1. An organizer creates Sharma Family as one record with an email address, then selects Haldi, Sangeet and Wedding.
2. The system generates one random household invitation token and sends one email containing the invited events.
3. The family opens the link without logging in and chooses Yes or No separately for each invited function.
4. Responses persist independently and can be corrected until the relevant RSVP deadline.
5. An organizer sees family-level status per event, may record a phone response, and sends reminders only for pending responses.

## 7.3 Share a guest-uploaded photograph

1. When an event is created, its album becomes available in the admin workspace.
2. An organizer prints the event upload QR code or shares a permitted upload link.
3. A guest opens the lightweight page, reviews the upload guidance and submits images without registering.
4. The system validates and uploads compressed main images and thumbnails to Cloudflare R2, then completes technical verification without retaining original uncompressed files.
5. Successful valid images become available immediately according to album privacy settings; Wedding Admins and authorized Organizers may delete photos afterward.

## 7.4 Publish site and watch a ceremony remotely

1. The couple selects a website template, sets visibility rules and publishes approved wedding information.
2. A Wedding Admin pastes a YouTube livestream URL into the appropriate event and saves it.
3. An eligible remote guest opens the wedding website (through their invitation link if the event is private), then clicks **Watch Live on YouTube**.
4. The YouTube page handles playback. The family may optionally add a separate recording URL after the ceremony.

## 7.5 Discover and manage a vendor

1. An organizer searches a location near a wedding event venue and filters a wedding-services category.
2. They review available externally supplied information and shortlist a suitable vendor.
3. After contacting the provider outside the app, the organizer adds a quotation and marks the vendor as Booked.
4. They link it to events and a single expense record, then manually record partial payments.

# 8. Permissions and visibility

| **Capability** | **Platform Admin** | **Wedding Admin** | **Family Organizer** | **Guest** |
| --- | --- | --- | --- | --- |
| **Manage platform users/sites** | Yes | No | No | No |
| **Manage wedding roles** | No routine access | Yes | No | No |
| **Events / tasks** | No routine access | Full | Granted only | View permitted events |
| **Expenses & payment records** | No routine access | Full | Granted only | No |
| **Guest directory & RSVP** | No routine access | Full | Granted only | Own invitation responses |
| **Vendor booking records** | No routine access | Full | Granted only | No |
| **Photo access and removal** | Reported content only | Full | Granted only | Upload/view if permitted |
| **Website / stream settings** | Platform safeguards | Full | Granted only | View if permitted |

Permission checks must be enforced by backend resource scope (wedding ID, event ID and album access policy). Invitation links authorize only the intended family's invited-event views/updates, not administrative operations.

# 9. Information architecture & conceptual data model

## 9.1 Organizer navigation

| **Private app** | **Primary screens** |
| --- | --- |
| **Wedding home** | Dashboard, upcoming functions, quick actions and recent activity |
| **Planning** | Events, task list/calendar, organizer assignments |
| **People** | Family/guest directory, event invitations and RSVP status |
| **Money & vendors** | Expense tracker, payment records, nearby vendor search, shortlist and booking records |
| **Memories & website** | Albums, guest uploads and album access, website builder and livestream settings |
| **Administration** | Wedding settings, organizer permissions, notification configuration |

## 9.2 Guest-facing navigation

A public or personalized wedding website offers Home, Events, RSVP (invited families only), Gallery, Watch Live and Venue/Directions where published. Avoid showing organizer navigation, guest directories or finances.

## 9.3 Key entities and relationships

| **Entity / relationship** | **Purpose** |
| --- | --- |
| **User → WeddingMembership → Wedding** | Signed-in couple/family roles are assigned per wedding; a user may join several weddings. |
| **Wedding → Event** | A wedding owns multiple named functions with date, time and venue. |
| **Wedding → GuestGroup** | One family/guest group record; no child/member table is required in V1. |
| **GuestGroup ↔ EventInvitation ↔ Event** | Join records store invitation eligibility, deadline and independent Pending/Yes/No RSVP per event. |
| **GuestGroup → InvitationLink / Delivery** | A wedding-level unique token covers invited events; email sends and retry history tracked separately. |
| **Wedding → Expense / Payment** | Actual spending and payment records, optional event/vendor associations and category breakdowns using `expense.category` metadata; no Budget or BudgetAllocation is required in V1. |
| **Wedding → VendorSelection** | Shortlisted/provider place ID or manual record; contract, event links and payment association. |
| **Event → Album → MediaAsset** | Event-wise photo albums, upload provenance, visibility, status and object-storage key. |
| **Wedding → WebsiteSettings / Event → YouTubeLink** | Published slug, sections, privacy settings and optional validated YouTube livestream or recording URLs. |
| **AuditLog** | Relevant admin and organizer changes scoped by actor, wedding/entity and timestamp. |

> **Data integrity requirement**
> The EventInvitation (family × event) is the source of truth for RSVP. A family's one wedding-level invitation token grants access only to EventInvitation rows created for that family. No per-person household records or headcounts are required.

# 10. Security, privacy and operational behavior

## 10.1 Guest links and access

- Use long unpredictable tokens; store only hashed values when feasible, support revocation and regeneration, and set explicit validity windows.
- Public website access may be open, but private events, RSVPs, albums and media require appropriate guest token/access checks.
- Because links can be forwarded, offer optional extra verification for especially private weddings; do not imply a forwarded link is identity-proof.
- Prevent guest tokens from entering public page metadata, referrer URLs, logs and third-party tracking where feasible.

## 10.2 Uploaded content and media

- Validate file type, file size and authorization before issuing short-lived signed upload URLs.
- Store only compressed main images and thumbnails in Cloudflare R2, with metadata/object keys in MongoDB; do not retain original uncompressed files. Keep images and thumbnails private by default; use signed delivery or equivalent checks for restricted media.
- Enforce technical upload validation and album access rules, report/removal workflow, upload throttling and configurable wedding storage quotas; there is no photo approval or moderation workflow.
- Disclose photo-upload permissions to guests and strip embedded location data from publicly served derivatives.

## 10.3 Financial and administrative data

- Apply least privilege to expenses, attachments, exports and organizer access.
- Use protected sessions, server-side authorization and strong authentication for Platform Admin accounts.
- Log sensitive administrative operations without making guest content routinely visible to platform staff.
- Provide wedding export/deletion workflows that respect retention rules and applicable legal requirements.

## 10.4 Third-party integrations

- External maps, email and storage providers require credentials, cost controls, rate limits and clear degraded-mode behavior. YouTube streaming in V1 requires only a validated link; Make My Marriage does not ingest or host the video.
- Review provider restrictions before storing place details; explain that hiding a YouTube link on the website does not prevent onward sharing of that YouTube URL.
- Email retries should be idempotent, and provider downtime should not block basic planning and manually recorded RSVPs.

# 11. Non-functional requirements

| **Category** | **Proposed V1 quality target / validation** |
| --- | --- |
| **Responsive UX** | Organizer dashboard works on desktop/tablet/mobile; guest website and RSVP are mobile-first with accessible tap targets. |
| **Accessibility** | Target WCAG 2.2 AA for core guest and organizer flows; keyboard operability, labels, contrast and error feedback. |
| **Localization** | English and Hindi for essential guest invitation/RSVP navigation and labels; full additional language coverage deferred. |
| **Performance** | Measure public-page load, RSVP submit and 1,000+ family-record list filtering on typical mobile networks; fix significant regressions before launch. |
| **Capacity** | No product-imposed small-wedding limit; test bulk imports, pagination and album browsing with large realistic datasets. |
| **Reliability** | Graceful provider outage states, retryable email/image actions, transaction-safe RSVP and expense writes, recoverable backups. |
| **Observability** | Structured errors, email integration health, YouTube URL validation errors, storage metrics, content-removal/audit logs and alertable background job failures. |
| **Privacy** | Private data isolated by wedding; data minimization for guest records; access-controlled compressed images, thumbnails and invoices. |
| **Security** | Server-side authorization, secure sessions, token revocation, upload validation, throttling and protected admin routes. |

Targets are proposed acceptance-test directions, not an availability SLA. Exact hosting, storage caps and performance thresholds are review items before engineering estimation.

# 12. Release approach and major dependencies

| **Build order** | **Delivery slice** | **Dependencies / proof** |
| --- | --- | --- |
| **1** | Foundation: accounts, wedding setup and multi-admin permissions | Users create a wedding, grant family Admin rights and navigate isolated workspaces. |
| **2** | Events, tasks, expense tracking and basic organizer dashboard | Core planning records produce accurate permission-aware amounts paid and outstanding balances without budget setup. |
| **3** | Family guest records, event invitation join and email RSVP | One link per family; separate Yes/No responses and manual organizer updates. |
| **4** | Nearby vendor discovery and booked-vendor financial tracking | Provider integration spike, quotas, map display and single ledger integration. |
| **5** | Photo albums, guest upload QR, secure media and technical verification | Cloudflare R2, image compression and private media controls. |
| **6** | Wedding website and YouTube livestream links | Guest visibility tested end-to-end across website, gallery, RSVP and event-specific Watch Live links. |
| **7** | Platform Admin panel, hardening and end-to-end launch testing | Operational visibility, moderation safeguards, import scale and accessibility passes. |

# 13. Release acceptance: critical scenarios

**AT-01**   An account creates a wedding; both partners and a selected parent are independently active Wedding Admins.

**AT-02**   A restricted organizer cannot elevate themselves, read financial records or access another wedding.

**AT-03**   A wedding has at least four overlapping functions, each with different guest-group invitations.

**AT-04**   One family receives one link, answers Yes to Haldi and No to Sangeet, and later changes only Haldi.

**AT-05**   Guest and dashboard counts remain FAMILY counts; no screen or export incorrectly infers number of individuals.

**AT-06**   A no-email family can have its RSVP recorded manually or receive a copied private link.

**AT-07**   An authorized finance user records one partial vendor payment; expense and dashboard paid/outstanding totals reconcile without any budget limit.

**AT-08**   Nearby vendor search handles success, empty results, quota exhaustion and provider outage gracefully.

**AT-09**   A guest scans an event QR and uploads compressed images and thumbnails; after successful technical verification, photos become available immediately according to album access rules without approval.

**AT-10**   A private album cannot be retrieved by an unauthorized visitor even with an old media URL.

**AT-11**   A guest accesses the published wedding website without a login and sees only approved public/invited sections.

**AT-12**   An eligible guest clicks Watch Live to open the correct event-specific YouTube URL without a Make My Marriage login; the app does not claim unlisted URLs are private.

**AT-13**   Platform Super Admin can act on reported content and account status without browsing private wedding records by default.

**AT-14**   The essential guest journey works on a low-end mobile layout with readable English/Hindi controls.

# 14. Out of scope for Version 1

| **Deferred feature** | **V1 boundary** |
| --- | --- |
| **Per-person guest details** | No household-member names, individual confirmations, invitation caps or attendee counts. |
| **Automated WhatsApp/SMS** | Manual sharing of an existing link is allowed; automatic messaging comes later. |
| **Vendor marketplace / checkout** | No in-app vendor self-service, live inventory, contractual booking or payment collection. |
| **Guest accommodation / travel** | No hotel allocations, airport transfers or pickup management. |
| **Seating / QR venue check-in** | No table plan or on-site attendance scanning. |
| **Advanced gallery** | No video uploads, biometric face recognition or AI guest-photo matching. |
| **Advanced live video** | No embedded-player requirement, streaming API, proprietary ingest, transcoding, multi-camera director or live chat. |
| **Advanced website & commerce** | No custom domains, paid subscriptions, online vendor payments or premium template marketplace. |
| **AI planning assistant** | No automated planning agent or AI vendor recommendations in V1. |

# 15. Assumptions, dependencies and risks

| **Area** | **Assumption / risk** | **Mitigation** |
| --- | --- | --- |
| **Guest email** | Some invitees may not use email. | Offer manual sharing and organizer-entered RSVP. |
| **Guest link forwarding** | Anyone with a shared invitation link may be able to impersonate its family. | Opaque revocable tokens; optional extra verification for private events. |
| **Family-level RSVPs** | Counts represent families, not caterer-ready attendee numbers. | Label reports clearly; do not infer headcounts. |
| **Nearby discovery** | External provider may lack listings/contact details or incur usage costs. | Manual vendor fallback; quota and cost alerts; provider-compliant display. |
| **YouTube link forwarding** | Unlisted video URLs can be forwarded, and website access checks do not secure playback on YouTube. | Display organizer guidance; never market V1 YouTube livestreams as access-controlled private streams. |
| **Media costs and abuse** | Large guest uploads can grow storage cost and abuse-handling burden. | Quotas, signed uploads, throttling, audited content removal and lifecycle policies. |
| **Scope breadth** | 13 modules are substantial for a learning-led project. | Deliver in vertical slices while retaining the agreed V1 functional scope. |

# 16. Implementation decisions to resolve during delivery

The V1 **feature scope is final**. The following are technical configuration and launch choices to resolve before their respective implementation milestones. They do not authorize adding or removing features without a documented scope change.

| **ID** | **Review item** | **Proposed default** |
| --- | --- | --- |
| **D-01** | Preferred framework and deployment | Next.js/React + TypeScript frontend and Node/Express + TypeScript API as separate Vercel projects; MongoDB Atlas with Mongoose; modular monolith in an npm-workspace monorepo with apps/web, apps/api and packages/contracts. |
| **D-02** | Vendor discovery provider and external API spending controls | Use Google Places; complete terms/cost integration spike. These are operating-cost controls, not wedding expense limits. |
| **D-03** | Email provider, sending domain and deliverability | Use Resend and configure SPF/DKIM/DMARC and bounce handling; send bounded small batches and trigger daily RSVP reminders through Vercel Cron. No queue infrastructure in V1. |
| **D-04** | Image storage, upload size and free quota | Use Cloudflare R2 for compressed main images and thumbnails, with metadata/object keys in MongoDB and no original uncompressed retention; set configurable upload and album limits. |
| **D-05** | YouTube URL validation and presentation | YouTube only; validate supported URLs and use a Watch Live link. No mandatory embed, YouTube API, or private-stream promise. |
| **D-06** | Private-site extra verification | Default opaque invitation link; offer optional additional email check for highly private weddings. |
| **D-07** | User-facing language depth | English/Hindi essential guest journey; confirm whether organizer UI launches English-only. |
| **D-08** | Data deletion and retention periods | Define user-requested export/deletion, guest token expiry, wedding archive and media retention rules. |
| **D-09** | Initial rollout and success criteria | Pilot with synthetic weddings first; recruit real planning couples before public commercial rollout. |

# 17. Product scope confirmation & change control

> **Status: Final product-scope baseline, V1.0.** The product owner confirmed that the agreed features look correct and requested this final Markdown PRD on 24 September 2026. This acknowledges the *requirements scope*, not production launch readiness, vendor contract approval, or completion of implementation decisions in Section 16.

**Confirmed V1 decisions**

- [x] All 13 feature modules, including nearby vendor discovery, collaborative gallery, wedding website and separate platform administration, are included.
- [x] The couple and selected family members can all be Wedding Admins; other organizers have configurable permissions.
- [x] Guests require no Make My Marriage account. One family receives one invitation link and submits independent Yes/No RSVPs for each invited event; no individual member data or headcounts.
- [x] Finance is **expense and payment tracking only**. No total budget requirement, event/category cap, allocation or over-budget alert.
- [x] Each event may contain a **YouTube Live URL** and a guest-facing Watch Live link. In-page embedding and native streaming are not required.
- [x] Public/private wedding website and gallery choices remain configurable, subject to the forwarding limitations of access links and YouTube URLs.
- [x] The deferred feature list in Section 14 remains outside V1.

| **Approval field** | **Status** |
| --- | --- |
| **Product owner** | Ashish Pal |
| **Feature-scope review** | Confirmed in conversation, 24 September 2026 |
| **Document** | Make My Marriage — PRD v1.0 Final |
| **Technical configuration** | Complete Section 16 decisions at the relevant development milestones |
| **Release authorization** | Separate engineering, security and QA acceptance required before launch |

**Change-control rule:** Any additional module or material behavior change after this baseline requires a written PRD revision (for example v1.1), a change summary, and updated acceptance tests. Fixes that clarify existing requirements without changing scope may be made as documented errata.

## Appendix A. Terminology

| **Term** | **Meaning** |
| --- | --- |
| **Wedding** | One workspace containing events, admins, invited families, finances and published website. |
| **GuestGroup / family** | One invited record such as "Sharma Family"; NOT a list of individual attendees. |
| **EventInvitation** | One family's eligibility and Yes/No/Pending state for exactly one event. |
| **Invitation link** | One household-specific access link spanning all events the family is invited to. |
| **Wedding Admin** | Couple or selected family member with full access to one wedding. |
| **Family Organizer** | A registered collaborator whose access is configured by a Wedding Admin. |
| **Platform Super Admin** | Privileged operator of Make My Marriage, separate from wedding administration. |
| **Guest** | A non-registered visitor using a public site or personalized invitation link. |
