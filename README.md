# Carte

A full-stack travel companion web app built with **SolidStart**, **Hono**, and
**Better Auth**, running on **Deno**. Pin your favorite places on an interactive
map, log visits with photos and notes, and build a personal travel journal — all
from a single dashboard.

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
  icon loading (Lucide, Tabler, Simple Icons, etc.)
- **[Corvu](https://corvu.dev/)** — Drawer, OTP field, and calendar components
- **[Ark UI](https://ark-ui.com/)** — Additional headless components
- **[Embla Carousel](https://www.embla-carousel.com/)** — Image carousel for
  photo journals
- **[MapLibre GL](https://maplibre.org/)** +
  **[solid-maplibre](https://github.com/GIShub4/solid-maplibre)** — Interactive
  vector maps with custom markers
- **[cmdk-solid](https://github.com/create-signal/cmdk-solid)** — Command menu
  for location search

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
  - Email/password with email OTP verification
  - OAuth providers (Google, GitHub) with account linking
  - Two-factor authentication (TOTP + backup codes)
  - Passkeys (WebAuthn)
  - Phone number verification (SMS OTP via seven.io)
  - Admin roles (first registered user becomes admin)
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

### Internationalization

- **[Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)**
  — Compiled i18n with type-safe message functions
- Supported locales: **English**, **Finnish**, **Swedish**, **Russian**

### Validation

- **[Zod v4](https://zod.dev/)** — Runtime schema validation used throughout the
  stack

## Features

| Area              | Description                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Map**           | Interactive MapLibre map with custom markers, hover highlights, click-to-detail, and light/dark map styles                          |
| **Locations**     | Pin places on the map with name, description, and coordinates; unique slugs per user                                                |
| **Visit Logs**    | Log each visit with date range, notes, coordinates, and photos — building a timeline of memories per location                       |
| **Photo Journals**| Upload and manage photos attached to visit logs, stored in S3-compatible storage                                                    |
| **Search**        | Location search powered by Nominatim geocoding with server-side caching                                                             |
| **Auth**          | Email/password, Google & GitHub OAuth, email OTP verification, forgot/reset password, 2FA (TOTP), passkeys, phone OTP, Turnstile    |
| **Account**       | Edit name, email (with OTP confirmation), phone; change password; manage 2FA & passkeys; backup codes; view/revoke active sessions  |
| **Users**         | Admin-only paginated user directory with search, filters, and per-user role management                                              |
| **Avatars**       | Upload and remove profile avatars to S3-compatible storage                                                                          |
| **i18n**          | Localized landing page and UI with language switcher (EN, FI, SV, RU)                                                              |
| **API Docs**      | Auto-generated OpenAPI spec with Scalar interactive docs at `/api/docs`                                                             |
| **Theme**         | Light/dark/system color mode with persistent preference                                                                             |
| **Responsive**    | Sidebar navigation on desktop, drawer-based mobile navigation with bottom sheet map                                                 |

## Project Structure

```
src/
├── app.tsx                    # App shell: router, color mode, toaster
├── app.css                    # Tailwind v4 config & design tokens
├── entry-client.tsx           # SolidStart client hydration
├── entry-server.tsx           # SSR entry: Paraglide middleware, locale-aware HTML
├── env.ts                     # Zod-validated environment variables
│
├── api/                       # Hono REST API (mounted at /api)
│   ├── app.ts                 # API router composition
│   ├── db/
│   │   ├── index.ts           # Drizzle client (LibSQL)
│   │   ├── schema/            # Database schemas (auth, locations, logs, images)
│   │   ├── relations.ts       # Drizzle relation definitions
│   │   └── migrations/        # SQL migration files
│   ├── emails/
│   │   ├── templates/         # HTML email templates
│   │   ├── render.ts          # Template renderer (placeholder replacement)
│   │   └── generate-types.ts  # Script to generate template type definitions
│   ├── lib/                   # App factory, OpenAPI config, service clients
│   ├── middlewares/            # Auth, logging, error handling
│   ├── routes/                # API route handlers (locations, search, files)
│   ├── services/              # Email & SMS sending services
│   ├── types/                 # Hono type helpers
│   └── utils/                 # Shared API utilities
│
├── client/                    # SolidStart frontend
│   ├── actions/               # Server actions (locations, files)
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives (shadcn-solid style)
│   │   └── *.tsx              # Shared widgets (dialogs, form fields, map, search)
│   ├── contexts/              # Session context provider
│   ├── hooks/                 # Custom hooks (media query, form)
│   ├── lib/                   # Auth client, route middleware, utils
│   ├── queries/               # Data fetching (locations, auth, users)
│   ├── stores/                # Reactive stores (map state, location filters)
│   └── routes/                # File-based routes
│       ├── index.tsx           # Landing page
│       ├── auth/               # Auth pages (sign-in, sign-up, forgot password, etc.)
│       ├── dashboard/          # Protected dashboard
│       │   ├── index.tsx       # Location list with map
│       │   ├── locations/      # Location & visit log CRUD
│       │   ├── account/        # Account settings, security, sessions, data
│       │   └── users/          # Admin user management
│       └── api/[...route].ts   # API proxy to Hono
│
├── paraglide/                 # Generated i18n runtime & message functions
│
└── shared/                    # Cross-cutting code
    ├── auth.ts                # Better Auth server configuration
    ├── types.ts               # Shared type definitions
    ├── schemas/               # Shared Zod schemas
    ├── http-status.ts         # HTTP status code constants
    └── rpc-client.ts          # Typed Hono RPC client

messages/                      # i18n source files (en, fi, sv, ru)
project.inlang/                # inlang/Paraglide project config
```

## Prerequisites

- **[Deno](https://docs.deno.com/runtime/getting_started/installation/)**
  (latest stable)
- **[Docker](https://docs.docker.com/get-started/get-docker/)** (for local S3
  storage via RustFS)
- **Node modules:** Run `deno install` to set up `node_modules` (manual mode)

## Environment Variables

Create a `.env` file in the project root. See
[`.env.example`](.env.example) for all available variables.

```env
# General
NODE_ENV=development
LOG_LEVEL=debug

# Database (LibSQL / Turso)
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=              # Leave empty for local file DB

# Auth (Better Auth)
BETTER_AUTH_SECRET=               # Random secret string
BETTER_AUTH_URL=http://localhost:3040

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
VITE_HOST_URL=http://localhost:3040

# Contact (required — used for Nominatim geocoding User-Agent)
CONTACT_EMAIL=

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
S3_BUCKET=carte
VITE_S3_PUBLIC_URL=http://localhost:9000/carte

# Docker / RustFS (only needed in development)
RUSTFS_API_PORT=9000
RUSTFS_CONSOLE_PORT=9001
RUSTFS_ACCESS_KEY=
RUSTFS_SECRET_KEY=
```

All environment variables are validated at startup with Zod via `src/env.ts`. The
server will exit immediately with a clear error if any required variable is
missing.

## Getting Started

### 1. Install dependencies

```bash
deno install
```

### 2. Start the development environment

This starts both the Vite dev server (port 3040) and the RustFS Docker
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

Migrations are not committed to the repository, so generate them from the schema
first:

```bash
deno task db:generate
deno task db:migrate
```

### 4. Compile i18n messages

```bash
deno task localize
```

### 5. Open the app

Navigate to [http://localhost:3040](http://localhost:3040). The first user to
sign up is automatically assigned the **admin** role.

## Available Scripts

| Command                          | Description                                          |
| -------------------------------- | ---------------------------------------------------- |
| `deno task dev`                  | Start app + Docker (RustFS) concurrently             |
| `deno task dev:app`              | Start Vite dev server on port 3040                   |
| `deno task build`                | Production build (uses `.env.prod`)                  |
| `deno task start`                | Run production build from `.output/server/index.mjs` |
| `deno task db:generate`          | Generate Drizzle migration files                     |
| `deno task db:migrate`           | Run database migrations                              |
| `deno task db:studio`            | Open Drizzle Studio on port 8000                     |
| `deno task db-prod:migrate`      | Run migrations with `.env.prod`                      |
| `deno task db-prod:studio`       | Open Drizzle Studio with `.env.prod`                 |
| `deno task check`                | Format, lint, and type-check `./src/`                |
| `deno task localize`             | Compile Paraglide i18n messages to `src/paraglide/`  |
| `deno task generate:email-types` | Regenerate TypeScript types from email templates     |

## Database

The project uses **Drizzle ORM** with **LibSQL/Turso**. In development, a local
SQLite file (`local.db`) works out of the box.

### Schema

| Table                | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `users`              | User accounts with role, phone, 2FA, ban status          |
| `sessions`           | Active sessions with expiry                              |
| `accounts`           | OAuth provider links                                     |
| `verifications`      | Email/phone verification tokens                          |
| `two_factors`        | TOTP secrets and backup codes                            |
| `passkeys`           | WebAuthn credentials                                     |
| `locations`          | User-pinned places with name, slug, description, coords  |
| `location_logs`      | Visit entries per location with dates, notes, coords     |
| `location_log_images`| Photos attached to visit logs, stored as S3 keys         |

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

## API

The API is built with Hono + Zod OpenAPI and serves at `/api`. Interactive
documentation is available at:

- **Scalar UI:**
  [http://localhost:3040/api/docs](http://localhost:3040/api/docs)
- **Raw OpenAPI spec:**
  [http://localhost:3040/api/doc](http://localhost:3040/api/doc)

### Endpoints

| Method | Path                                | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| GET    | `/api/locations`                    | List user's locations           |
| POST   | `/api/locations`                    | Create a location               |
| GET    | `/api/locations/{slug}`             | Get location with visit logs    |
| PUT    | `/api/locations/{slug}`             | Update a location               |
| DELETE | `/api/locations/{slug}`             | Delete a location               |
| POST   | `/api/locations/{slug}/add`         | Add a visit log                 |
| GET    | `/api/locations/{slug}/{id}`        | Get visit log with images       |
| PUT    | `/api/locations/{slug}/{id}`        | Update a visit log              |
| DELETE | `/api/locations/{slug}/{id}`        | Delete a visit log              |
| GET    | `/api/search`                       | Geocode search (Nominatim)      |
| POST   | `/api/avatars`                      | Upload user avatar              |
| DELETE | `/api/avatars`                      | Remove user avatar              |
| POST   | `/api/images/{slug}/{id}`           | Upload image to visit log       |
| DELETE | `/api/images/{slug}/{id}/{imageId}` | Remove image from visit log     |
| *      | `/api/auth/**`                      | Better Auth routes (OAuth, etc.)|

## Email Templates

Transactional emails are sent via Resend using HTML templates in
`src/api/emails/templates/`:

| Template                | Sent when                                |
| ----------------------- | ---------------------------------------- |
| `verify-email.html`     | Email OTP verification on sign-up        |
| `sign-up-attempt.html`  | Sign-up attempted with existing email    |
| `reset-password.html`   | Password reset requested                 |
| `delete-account.html`   | Account deletion confirmation            |
| `email-change.html`     | Email address change confirmation        |

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

- **[solid-ui](https://www.solid-ui.com/)** — An unofficial port of shadcn/ui to
  Solid, providing the beautifully designed component primitives used throughout
  this project.
- **[hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter)** by
  CJ — The Hono OpenAPI structure and conventions in this project were inspired
  by this starter template for building fully documented type-safe JSON APIs.
