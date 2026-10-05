# Modular monolith boundaries

Modules export their public interface from `index.ts`. Empty routers are intentionally
unmounted in `app.ts`; no business route or persistence schema is implemented yet.

Add layers as a feature needs them:

| Layer                    | Responsibility                                               |
| ------------------------ | ------------------------------------------------------------ |
| `<module>.routes.ts`     | HTTP routing and middleware only                             |
| `<module>.controller.ts` | Translate HTTP input/output; no database queries             |
| `<module>.service.ts`    | Business rules and authorization-aware orchestration         |
| `<module>.repository.ts` | Module-owned Mongoose/database access                        |
| `<module>.validation.ts` | Zod request schemas                                          |
| `<module>.types.ts`      | Internal types that have an actual consumer                  |
| `models/`                | Exact module-owned schemas from the Database Design document |

Call another module's service/public interface when another domain capability is
needed. Never import or manipulate another module's Mongoose model. Wedding-owned
queries require authorized weddingId scoping and same-wedding reference checks.
Authentication and wedding access placeholders fail closed and must be implemented
before protected routers are mounted. Do not create fake controllers or repositories.

The 18 core collection ownership boundaries are:

| Module         | Collections                                                       |
| -------------- | ----------------------------------------------------------------- |
| auth           | users, sessions                                                   |
| weddings       | weddings                                                          |
| memberships    | wedding_memberships, membership_invites                           |
| events         | events                                                            |
| tasks          | tasks                                                             |
| expenses       | expenses, expense_payments                                        |
| guests         | guest_groups                                                      |
| invitations    | event_invitations, guest_access_tokens                            |
| vendors        | vendor_selections                                                 |
| gallery        | albums, media_assets                                              |
| website        | website_settings                                                  |
| email          | email_deliveries                                                  |
| audit          | audit_logs                                                        |
| platform-admin | No additional collection; audited aggregate/public service access |

`models/.gitkeep` files reserve locations without inventing incomplete schemas.
