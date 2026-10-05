# Make My Marriage

V1 foundation for a collaborative wedding planning application. This repository currently contains a project scaffold: working web routes, an Express health endpoint, shared-package configuration, and development tooling. Product features and the approved page designs will be implemented incrementally from the documents in [`docs/`](docs/).

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

- Node.js >=20.19.0 <21.
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

Keep credentials in ignored local environment files or deployment environment settings. Never place secrets in `NEXT_PUBLIC_*` variables or source control. The scaffold does not send email, upload media, or perform vendor searches.

R2, Resend, and Google Places currently expose configuration validation only. Provider SDK dependencies and network operations are deferred until their actual feature implementation; Google Places will use native HTTP/fetch unless an SDK becomes necessary.

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

Only the health endpoint implements API behavior in this phase. Business routes and authentication remain placeholders. Web pages contain minimal route placeholders; approved landing, authentication, and dashboard designs are deferred.

The browser API client includes credentials for future HTTP-only session cookies. It has no JWT handling and does not store authentication tokens in browser storage. Authentication and wedding-access middleware are unmounted placeholders that fail closed if invoked; they do not provide working authorization yet.

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
| `npm run test`         | Run the API test foundation                                               |
| `npm run format`       | Apply Prettier formatting                                                 |
| `npm run format:check` | Check formatting without changing files                                   |

CI uses Node.js 20.19.6, installs dependencies with `npm ci`, and runs formatting checks, lint, type checking, tests, and builds on pushes and pull requests.

## Development boundaries

Read [`AGENTS.md`](AGENTS.md) before changing domain behavior. Approved source documents are [`PRD.md`](docs/PRD.md), [`SYSTEM_Design.md`](docs/SYSTEM_Design.md), [`DATABASE_Design.md`](docs/DATABASE_Design.md), and [`API_Design.md`](docs/API_Design.md).

Wedding is the tenant boundary. Future persistence must enforce `weddingId` and same-wedding references. The V1 uses revocable opaque sessions, family-level guest groups, event-specific family RSVP, integer paise for money, and R2 for compressed images and thumbnails. Shared contracts must stay independent of Mongoose, Express, and Next.js.

Authentication, concrete MongoDB schemas, CRUD, RSVP, provider integrations, media flows, wedding websites, reminders, and platform administration are deliberately deferred. Model locations and integration foundations do not imply these features work. Do not add fake product logic to fill placeholders.

`apps/web` and `apps/api` are intended to become separate Vercel projects. Deployment configuration and Vercel Cron setup are deferred; this phase does not deploy either application or connect real services.
