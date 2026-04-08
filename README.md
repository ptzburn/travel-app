# Solid Starter Template

A full-stack web application built with **SolidStart**, **Hono**, and **Better
Auth**, running on **Deno**. Features a complete authentication system, task
management, admin user management, file uploads, and a polished UI with dark
mode support. This simple app serves as a starting point for your own modern
full-stack application.

**Live demo:** [tasks.hokkanen.io](https://tasks.hokkanen.io)

## Tech Stack

### Runtime & Tooling

- **[Deno](https://deno.land/)** — Runtime, formatter, linter, and type checker
- **[Vite 7](https://vite.dev/)** — Build tool with HMR
- **[Lefthook](https://github.com/evilmartians/lefthook)** — Git hooks
(pre-commit: fmt, lint, check)

### Frontend

- **[SolidJS](https://www.solidjs.com/)** +
**[SolidStart](https://start.solidjs.com/)** — Reactive UI framework with SSR
and file-based routing
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first configuration with
`@tailwindcss/vite`
- **[Kobalte](https://kobalte.dev/)** — Accessible headless UI primitives
(shadcn-solid style)
- **[TanStack Solid Form](https://tanstack.com/form)** — Type-safe form
management
- **[solid-sonner](https://github.com/wobsoriano/solid-sonner)** — Toast
notifications
- **[unplugin-icons](https://github.com/unplugin/unplugin-icons)** — On-demand
icon loading (Lucide, Font Awesome)
- **[Corvu](https://corvu.dev/)** — Drawer, OTP field, and calendar components
- **[Ark UI](https://ark-ui.com/)** — Additional headless components
- **[Embla Carousel](https://www.embla-carousel.com/)** — Carousel component

### Backend

- **[Hono](https://hono.dev/)** +
**[@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)**
— Typed REST API with auto-generated OpenAPI spec
- **[Scalar](https://scalar.com/)** — Interactive API documentation at
`/api/docs`
- **[Pino](https://getpino.io/)** — Structured logging with pretty-print in
development
- **[Nitro](https://nitro.build/)** — Server engine (preset: `deno_server`)

### Auth

- **[Better Auth](https://better-auth.com/)** — Full-featured authentication
with:
  - Email/password with email verification
  - OAuth providers (Google, GitHub)
  - Two-factor authentication (TOTP)
  - Passkeys (WebAuthn)
  - Phone number verification (SMS OTP via seven.io)
  - Email OTP
  - Admin roles
  - Cloudflare Turnstile captcha
  - HaveIBeenPwned password checking

### Database

- **[Drizzle ORM](https://orm.drizzle.team/)** +
**[drizzle-zod](https://orm.drizzle.team/docs/zod)** — Type-safe ORM with Zod
schema generation
- **[LibSQL](https://turso.tech/libsql)** / **[Turso](https://turso.tech/)** —
SQLite-compatible database

### Email & SMS

- **[Resend](https://resend.com/)** — Transactional email delivery
- **[seven.io](https://www.seven.io/)** — SMS OTP delivery

### File Storage

- **[AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/)** —
S3-compatible file storage
- **[RustFS](https://github.com/nickelchen/rustfs)** — Local S3-compatible
storage for development (via Docker)

### Validation

- **[Zod v4](https://zod.dev/)** — Runtime schema validation used throughout the
stack

## Features


| Area           | Description                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Auth**       | Email/password, Google & GitHub OAuth, email verification, forgot/reset password, 2FA, passkeys, phone OTP, Turnstile captcha |
| **Tasks**      | Full CRUD task list with completion tracking and progress bar                                                                 |
| **Account**    | Edit name, email, phone; change password; manage 2FA & passkeys; backup codes; active sessions                                |
| **Users**      | Admin-only paginated user directory with search, filters, and per-user role management                                        |
| **Files**      | Avatar upload and removal to S3-compatible storage                                                                            |
| **API Docs**   | Auto-generated OpenAPI spec with Scalar interactive docs at `/api/docs`                                                       |
| **Theme**      | Light/dark/system color mode with persistent preference                                                                       |
| **Responsive** | Sidebar navigation on desktop, drawer-based mobile navigation                                                                 |


## Project Structure

```
src/
├── app.tsx                    # App shell: router, color mode, toaster
├── app.css                    # Tailwind v4 config & design tokens
├── entry-client.tsx           # SolidStart client hydration
├── env.ts                     # Zod-validated environment variables
│
├── api/                       # Hono REST API (mounted at /api)
│   ├── app.ts                 # API router composition
│   ├── db/
│   │   ├── index.ts           # Drizzle client (LibSQL)
│   │   ├── schema/            # Database schemas (auth, tasks)
│   │   ├── relations.ts       # Drizzle relation definitions
│   │   └── migrations/        # SQL migration files
│   ├── emails/
│   │   ├── templates/         # HTML email templates
│   │   ├── render.ts          # Template renderer (placeholder replacement)
│   │   └── generate-types.ts  # Script to generate template type definitions
│   ├── lib/                   # App factory, OpenAPI config, service clients
│   ├── middlewares/            # Auth, logging, error handling
│   ├── routes/                # API route handlers (tasks, files)
│   ├── services/              # Email sending service
│   ├── types/                 # Hono type helpers
│   └── utils/                 # Shared API utilities
│
├── client/                    # SolidStart frontend
│   ├── actions/               # Server actions (tasks, files)
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives (shadcn-solid style)
│   │   └── *.tsx              # Shared widgets (dialogs, form components)
│   ├── contexts/              # Session context provider
│   ├── hooks/                 # Custom hooks (media query, form)
│   ├── lib/                   # Auth client, route middleware, utils
│   ├── queries/               # Data fetching (tasks, auth, users)
│   └── routes/                # File-based routes
│       ├── index.tsx           # Landing page
│       ├── auth/               # Auth pages (sign-in, sign-up, etc.)
│       ├── dashboard/          # Protected dashboard
│       │   ├── index.tsx       # Task management
│       │   ├── account/        # Account settings, security, sessions, data
│       │   └── users/          # Admin user management
│       └── api/[...route].ts   # API proxy to Hono
│
└── shared/                    # Cross-cutting code
    ├── auth.ts                # Better Auth server configuration
    ├── types.ts               # Shared type definitions
    ├── types/auth.ts          # Auth-inferred types
    ├── http-status.ts         # HTTP status code constants
    └── rpc-client.ts          # Typed Hono RPC client
```

## Prerequisites

- **[Deno](https://docs.deno.com/runtime/getting_started/installation/)**
(latest stable)
- **[Docker](https://docs.docker.com/get-started/get-docker/)** (for local S3
storage via RustFS)
- **Node modules:** Run `deno install` to set up `node_modules` (manual mode)

## Environment Variables

Create a `.env` file in the project root. The following variables are required:

```env
# General
NODE_ENV=development
LOG_LEVEL=debug

# Database (LibSQL / Turso)
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=              # Leave empty for local file DB

# Auth (Better Auth)
BETTER_AUTH_SECRET=               # Random secret string
BETTER_AUTH_URL=http://localhost:3020

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Turnstile (Cloudflare)
VITE_TURNSTILE_SITE_KEY=
VITE_TURNSTILE_SECRET_KEY=

# App URL
VITE_HOST_URL=http://localhost:3020

# Email (Resend)
RESEND_API_KEY=
RESEND_EMAIL=noreply@yourdomain.com

# SMS (seven.io)
SEVEN_IO_API_KEY=

# S3-compatible storage (RustFS in dev)
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=
S3_ACCESS_SECRET=
S3_BUCKET=tasks
VITE_S3_PUBLIC_URL=http://localhost:9000/tasks

# Docker / RustFS (only needed in development)
RUSTFS_API_PORT=9000
RUSTFS_CONSOLE_PORT=9001
RUSTFS_ACCESS_KEY=
RUSTFS_SECRET_KEY=
```

## Getting Started

### 1. Install dependencies

```bash
deno install
```

### 2. Start the development environment

This starts both the Vite dev server (port 3020) and the RustFS Docker
container:

```bash
deno task dev
```

Or run them separately:

```bash
# App only
deno task dev:app

# Docker (RustFS) only
docker compose up
```

### 3. Generate and run database migrations

Migrations are not committed to the repository, so you need to generate them
from the schema first:

```bash
deno task db:generate
deno task db:migrate
```

### 4. Open the app

Navigate to [http://localhost:3020](http://localhost:3020). The first user to
sign up is automatically assigned the **admin** role.

## Available Scripts


| Command                          | Description                                          |
| -------------------------------- | ---------------------------------------------------- |
| `deno task dev`                  | Start app + Docker (RustFS) concurrently             |
| `deno task dev:app`              | Start Vite dev server on port 3020                   |
| `deno task build`                | Production build (uses `.env.prod`)                  |
| `deno task start`                | Run production build from `.output/server/index.mjs` |
| `deno task db:generate`          | Generate Drizzle migration files                     |
| `deno task db:migrate`           | Run database migrations                              |
| `deno task db:studio`            | Open Drizzle Studio on port 8000                     |
| `deno task db-prod:migrate`      | Run migrations with `.env.prod`                      |
| `deno task db-prod:studio`       | Open Drizzle Studio with `.env.prod`                 |
| `deno task check`                | Format, lint, and type-check `./src/`                |
| `deno task generate:email-types` | Regenerate TypeScript types from email templates     |


## Database

The project uses **Drizzle ORM** with **LibSQL/Turso**. In development, a local
SQLite file (`local.db`) works out of the box.

### Generating migrations

After modifying schemas in `src/api/db/schema/`:

```bash
deno task db:generate
deno task db:migrate
```

### Inspecting the database

```bash
deno task db:studio
```

Opens Drizzle Studio at [http://localhost:8000](http://localhost:8000).

## API Documentation

The API is built with Hono + Zod OpenAPI and automatically generates an OpenAPI
spec. Interactive documentation is available at:

- **Scalar UI:**
[http://localhost:3020/api/docs](http://localhost:3020/api/docs)
- **Raw spec:** [http://localhost:3020/api/doc](http://localhost:3020/api/doc)

## Production

### Build

```bash
deno task build
```

### Run

```bash
deno task start
```

The production build uses `.env.prod` for environment variables and outputs to
`.output/server/index.mjs`, served via Nitro with the `deno_server` preset.

## Acknowledgements

- **[solid-ui](https://www.solid-ui.com/)** — UI component library. An
unofficial port of shadcn/ui and tremor-raw to Solid, providing the
beautifully designed component primitives used throughout this project.
- **[hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter)** by
CJ — The Hono OpenAPI structure and conventions in this project were inspired
by this starter template for building fully documented type-safe JSON APIs.

