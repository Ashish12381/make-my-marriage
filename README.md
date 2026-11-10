# Make My Marriage

V1 foundation for a collaborative wedding planning application. This repository contains the approved Stitch public homepage, scaffold routes, an Express health endpoint, shared-package configuration, and development tooling. Product features are implemented incrementally from the documents in [`docs/`](docs/).

## Architecture

An npm-workspace monorepo with a modular monolith API:

- `apps/web`: Next.js App Router, React, strict TypeScript, and Tailwind CSS.
- `apps/api`: Express, strict TypeScript, Zod, and MongoDB Atlas through Mongoose.
- `packages/contracts`: framework-independent types and schemas shared by both applications when needed. It contains no database or application-framework code.

Backend modules own their business rules and persistence. Routes handle routing, controllers translate HTTP input/output, services coordinate business rules and authorization, and repositories access the database. Modules call one another through public service interfaces instead of importing another module's Mongoose models.

```text
make-my-marriage/
├── apps/
│   ├── web/
│   │   ├── src/app/              # Marketing, auth, member invitation, wedding routes
│   │   ├── src/components/       # UI and page-area component locations
│   │   ├── src/lib/              # Environment, API client, utilities
│   │   ├── src/styles/           # Shared design tokens
│   │   └── .env.example
│   └── api/
│       ├── src/config/           # Environment and optional database connection
│       ├── src/common/           # Errors, middleware, utilities
│       ├── src/modules/          # Domain modules and model locations
│       ├── src/integrations/     # R2, Resend, Google Places foundations
│       ├── src/jobs/             # Future RSVP reminder location
│       ├── tests/               # Health endpoint test
│       └── .env.example
├── packages/contracts/
├── docs/                        # Existing product and technical documents
├── .github/workflows/ci.yml
├── AGENTS.md
└── package.json
```

`apps/api/src/app.ts` exports the configured Express application. `server.ts` handles local database initialization and listening, keeping HTTP tests and future serverless integration independent of the local listener.

## Prerequisites

- Node.js 24.x.
- npm 10 or newer.
- MongoDB is optional for this scaffold. Configure an appropriate MongoDB Atlas or local URI when implementing or exercising persistence.

## Install and configure

From the repository root:

```sh
npm install
```

Copy the environment templates once, then edit the copies as needed.

PowerShell:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
```

Bash:

```sh
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

The web template sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`. The API template sets port `4000` and `WEB_ORIGIN=http://localhost:3000`; its database and integration values are empty placeholders.

The API can start without `MONGODB_URI`; the health endpoint verifies the HTTP application, not database readiness. Setting a URI enables database connection on local startup. Backend environment parsing uses Zod. Optional provider configuration is checked when its integration is used, so blank provider secrets do not prevent local startup.

Keep credentials in ignored local environment files or deployment environment settings. Never place secrets in `NEXT_PUBLIC_*` variables or source control. The membership email workflow can send through Resend when configured; media uploads and vendor searches remain unimplemented.

R2 and Google Places expose configuration validation only. Resend membership emails use native HTTP with bounded attempts and persisted outcomes; sender-domain verification is still required locally. Provider settings are validated when the integration is used.

## Run locally

```sh
npm run dev
```

This first builds contracts, then runs the web, API, and contracts compiler watchers concurrently. Use `npm run dev:web` or `npm run dev:api` to build contracts and start one application.

| Application | Local URL                             |
| ----------- | ------------------------------------- |
| Web         | <http://localhost:3000>               |
| API         | <http://localhost:4000>               |
| Health      | <http://localhost:4000/api/v1/health> |

The API implements health, authentication/session routes, wedding onboarding and membership/invitation workflows. The public homepage uses the approved Stitch design with responsive navigation and clearly labeled illustrative previews. Signup redirects to login with a success notice; ordinary login returns home. Invitation-specific login/signup safely returns to the invite for explicit acceptance. Open My Weddings to create/select a wedding, edit its details, or open Family & Team. Full planning dashboard aggregates remain deferred.

The browser API client includes credentials for HTTP-only session cookies. It has no JWT handling and does not store authentication tokens in browser storage. Session authentication validates hashed tokens, expiry, revocation, and active account status. Wedding and membership services enforce real authorization; the old fail-closed wedding-access middleware remains unused.

## Commands

Run these from the repository root:

| Command                | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run dev`          | Build contracts, then watch contracts and run web/API development servers |
| `npm run dev:web`      | Build contracts and run the web application                               |
| `npm run dev:api`      | Build contracts and run the local API                                     |
| `npm run build`        | Build contracts before the API and web applications                       |
| `npm run lint`         | Run ESLint across application and shared code                             |
| `npm run typecheck`    | Check strict TypeScript types across workspaces                           |
| `npm run test`         | Run API and frontend regression suites; Atlas tests are opt-in            |
| `npm run format`       | Apply Prettier formatting                                                 |
| `npm run format:check` | Check formatting without changing files                                   |

CI uses Node.js 24, installs dependencies with `npm ci`, and runs formatting checks, lint, type checking, tests, and builds on pushes and pull requests.

## Development boundaries

Read [`AGENTS.md`](AGENTS.md) before changing domain behavior. Approved source documents are [`PRD.md`](docs/PRD.md), [`SYSTEM_Design.md`](docs/SYSTEM_Design.md), [`DATABASE_Design.md`](docs/DATABASE_Design.md), and [`API_Design.md`](docs/API_Design.md).

Wedding is the tenant boundary. Future persistence must enforce `weddingId` and same-wedding references. The V1 uses revocable opaque sessions, family-level guest groups, event-specific family RSVP, integer paise for money, and R2 for compressed images and thumbnails. Shared contracts must stay independent of Mongoose, Express, and Next.js.

Users, sessions, weddings, wedding memberships/invites, email deliveries, unpublished website settings, and audit records have concrete schemas. Wedding onboarding and Family & Team implement scoped reads, transactional creation, secure invitations/acceptance, Admin-only role/permission changes, and concurrent last-Admin protection. Password recovery, events/tasks, guest RSVP, media, published websites, reminders and platform administration remain pending. See [`docs/WEDDING_ONBOARDING.md`](docs/WEDDING_ONBOARDING.md) and [`docs/FAMILY_TEAM.md`](docs/FAMILY_TEAM.md) for scope and verification. Resend membership email sending is implemented; the authorized real test was rejected because the configured sender domain is not verified.

## Vercel demo

Use [planyourwedding.online](https://planyourwedding.online/) for browser QA. The API trusts this web origin. The web configuration permanently redirects `make-my-marriage-nine-rho.vercel.app` to the custom domain, preserving paths and query parameters. After deploying a change to the web project, verify that an old alias login link reaches the same path on the custom domain.

1. Push the deployment changes to the branch you want to demo. Import the same repository into two Vercel projects. Set the Production Branch to that branch for both projects. The current application branch is `dev`.
2. Set the API project to **Express** with root directory `apps/api`. Set the web project to **Next.js** with root directory `apps/web`. Use Node.js 24 for both and enable **Include source files outside of the Root Directory in the Build Step** so both can build the shared contracts. Keep automatic install and output directory settings. Override the Build Command in both projects with `npm --prefix ../.. run build:contracts && npm run build`.
3. Prepare a separate Atlas demo database and a database user scoped to it. In Atlas, allow connections from the API deployment's outbound network. Set the API project's Production environment variables below. Use the stable web project domain for `WEB_ORIGIN`.
4. Deploy the API and check `/api/v1/health` and `/api/v1/auth/csrf` on its stable project domain. Health checks the HTTP process. The CSRF endpoint also checks that auth and Atlas are configured.
5. Set the web project's Production environment variables below and deploy the web project. Use stable project domains rather than deployment-specific URLs. The web rewrite keeps browser auth and cookies on the web hostname. The API's stable domain must be reachable by that rewrite.
6. In a private browser window, open the web project domain and check signup, login, the navbar identity, page refresh, My Weddings, wedding creation, Family & Team, and logout. Check the URL in another signed-out window before sharing it.

| Project | Variable                              | Demo value                                                              |
| ------- | ------------------------------------- | ----------------------------------------------------------------------- |
| API     | `WEB_ORIGIN`                          | `https://planyourwedding.online`                                        |
| API     | `MONGODB_URI`                         | Atlas connection string pointing to the demo database                   |
| API     | `AUTH_SECRET`                         | Fresh random secret of at least 32 characters                           |
| API     | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional for delivery. Use a verified sender for invitations to friends |
| Web     | `API_UPSTREAM_ORIGIN`                 | Stable API origin, such as `https://make-my-marriage-api.vercel.app`    |
| Web     | `NEXT_PUBLIC_API_BASE_URL`            | `https://planyourwedding.online/api/v1`                                 |

Set secrets in the API project settings. To generate a secret locally, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Redeploy the affected project after changing its environment variables.

## Authentication development

See [`docs/AUTH_SETUP.md`](docs/AUTH_SETUP.md) for Atlas configuration, session/CSRF behavior, live test instructions, and current boundaries. `MONGODB_URI` and a random `AUTH_SECRET` of at least 32 characters belong in ignored `apps/api/.env`. Auth routes return a safe 503 if configuration is absent; the health endpoint remains available.
