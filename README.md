# School Management System (ScMS) v1

ScMS is a all-in-one system to manage the operations, events, notices, users, attendance, transportation, courses, classroom, and clubs.

## Overview

[DEMO](https://user-cdn.hackclub-assets.com/01a0300e-0e6b-74da-93df-cd6c6d7f5275/scms-basic-intro.mp4)

## Pictures

<img width="1896" height="901" alt="image" src="https://github.com/user-attachments/assets/59732499-0290-4e07-b6f6-5f4b6bf0e492" />
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/a1e73a8d-188d-46a8-8b80-55b8bae72bb9" />
<img width="1919" height="840" alt="image" src="https://github.com/user-attachments/assets/aa3a9a28-82c7-406b-bdf4-3b4da281971c" />
<img width="724" height="102" alt="image" src="https://github.com/user-attachments/assets/7f3eaf9f-02d3-4267-b8c2-4572d3938b35" />
<img width="664" height="41" alt="image" src="https://github.com/user-attachments/assets/d18f6e10-18bf-4e46-989d-0bb93488bbdd" />
<img width="670" height="125" alt="image" src="https://github.com/user-attachments/assets/e85418fb-9663-49b3-8057-fb4014f16d7d" />
<img width="1571" height="36" alt="image" src="https://github.com/user-attachments/assets/9140aaa7-efa4-40fa-95af-90df11a1c3d4" />
<img width="353" height="59" alt="image" src="https://github.com/user-attachments/assets/20c2ec5c-2824-47ca-a98b-6ce4ce7fbbab" />


---

### Routes

Public routes:

1. Landing Page (`/`) with Hero, Overview, and Footer sections.
2. About Page (`/about`).
3. Contact Page (`/contact`).
4. Notices (`/notices`, `/notices/:slug`).
5. Events (`/events`, `/events/:slug`).
6. Clubs (`/clubs`).

Authentication and onboarding:

1. Signup (`/signup`) — public invitation request. Requests are queued for an administrator to review; no account or invite is created until it is approved.
2. Activate (`/activate/:token`) — staff/student account activation.
3. Guardian activation (`/activate/guardian/:token`).
4. Login (`/login`).
5. Forgot password (`/forgot-password`) and reset password (`/reset-password`).

Signed-in area:

1. Dashboard (`/dashboard`) with role-aware summaries.
2. Admin overview (`/admin`).
3. Invitations (`/admin/invites`) — staff, student, and guardian invitations, CSV bulk import, and the invitation-request review queue.
4. Directory (`/admin/directory`) — students, staff, and guardians.
5. Content management (`/admin/content`) — create and manage notices, events, and clubs, including cover images and document attachments. Existing club attachments can be added or removed using **Edit attachments**.
6. Academics (`/admin/academics`) — classrooms, courses, teachers, and student enrolments.
7. Attendance (`/admin/attendance`) — open a daily register per course, mark students, and review per-student summaries.
8. Transport (`/admin/transport`) — bus routes, stops, drivers, and student route assignments.
9. Permissions (`/admin/permissions`) — edit role-level defaults and grant or revoke individual permissions.
10. My records (`/my-records`) — students and guardians see their own courses, attendance, and transport; staff see an empty state.

## Introduction & Till What I reached

ScMS started as a highly ambitious project, due to the time constraint, and my academics; needs to seriously compromise on the probable greatness of the project while still making sure the started features were completed without any stone unturned.

## What is Completed?

- Modular Architecture (Data consuming logic, Static and Dynamic Data distinction (Json vs Zustand))
- Schema, seed, Docker config, and versioned Prisma migrations
- User Signup/Activate/Login flow, password reset, and email verification
- Email delivery through Nodemailer with graceful fallback when mail is not configured
- Public invitation requests with an admin approve/reject review queue, including a decision email to the requester
- Admin-driven invitation flow for staff, students, and guardians, including revocation
- CSV imports for staff and students with column mapping, validation, previews, and bulk creation
- Admin dashboard, directory, and content management screens
- Notices, events, and clubs (public pages and admin CRUD)
- Academics: classrooms, courses with teacher/classroom assignment, and student enrolments
- Attendance: daily course registers, per-student marks (present/absent/late/excused), and summaries
- Transport: routes, ordered stops, drivers, and per-student pickup/drop-off assignments
- Editable role-level permission defaults plus per-user overrides, with a dedicated permissions screen
- Cover images and document attachments (PDF, Word, Excel, CSV, text) for notices, events, and clubs, with a pluggable local/S3 storage driver
- Club attachment editing with up to 10 documents per club and public download links on active club cards
- On-demand cleanup of uploads that are no longer referenced by any content
- Self-service records for students and guardians: courses, attendance history, and bus route details
- Landing, About, and Contact pages
- Sidebar (with proper layout and collapsing logic)
- Unit and UI regression tests for CSV imports and document attachments (`npm test`)

## What is Incomplete? (or, What is left?)

- Orphaned uploads are removed only when an administrator runs the cleanup action on the content screen; there is no scheduled/cron job.
- Uploads are capped at 5 MB for images and 10 MB for documents, and the allowed document types are fixed in `src/routes/api/uploads.ts`.
- The permission screen edits role defaults and per-user overrides; there is no per-branch permission scoping yet.
- Migration history includes `init`, role permissions and attachments, and club attachments; every future schema change needs its own migration.

## Tech Stack

- Tanstack start (w/ React compiler, Tailwind css)
- Postgresql (w/ Prisma)
- Gsap
- Better Auth
- Zod
- Lenis
- T3env
- Biome
- Docker
- Papaparse
- Nodemailer
- Zustand with Immer

## Security and dependency migration notes

The dependency security upgrades include TanStack, Better Auth 1.7.15, Prisma 7.10.1, Nodemailer 10.3.1, Zod 4.6.7, and updated Vite/Vitest tooling. On **2026-11-04**, `npm audit` and `npm audit --omit=dev` both reported **zero vulnerabilities**. No forced dependency fixes were used; the dependency override is limited to `@tailwindcss/typography@0.5.20`'s selector parser. Audit results are a point-in-time check, not a security guarantee.

Final verification completed on **2026-11-03–04**:

- **194 unit/UI tests** across 13 files, including 59 S3-driver tests; TypeScript and scoped Biome checks passed.
- **8 local-storage and 8 real MinIO integration tests** passed. The MinIO run used an explicitly configured `eu-west-1` region for the driver and bucket cleanup.
- **5 Chromium tests with local storage and 5 with S3 storage** passed against the rebuilt production Docker image. The S3 browser run used an existing `eu-west-1` bucket with the app's `S3_REGION` unset, exercising region discovery.
- A signed session cookie issued by **Better Auth 1.6.19** remained valid with **1.7.15**, and logout revoked it on both versions. The verification request sent a JSON body (`data: {}`).
- The host production build and a **no-cache production Docker build** passed without build warnings; the Docker image is tagged `scms:security-verification`.
- All three versioned migrations applied successfully from scratch to three disposable PostgreSQL 17 databases.

These checks validate the patch's tested paths, not every production S3 provider or deployment configuration. The temporary verification containers, dedicated PostgreSQL volume/network, env file, and legacy-auth scripts were removed after the successful runs; normal development resources were left untouched.

- The S3 driver now uses `@aws-sdk/client-s3` instead of the `minio` JavaScript SDK. This does not change the storage provider: MinIO and compatible S3 services remain supported. Existing bucket/object keys, `/uploads/...` URLs, database asset references, and the storage `put`/`get`/`delete` API are preserved; **no object migration or re-upload is required** when retaining the same storage configuration.
- Deploy the committed `package-lock.json` with `npm ci`, regenerate Prisma, apply versioned migrations, and rebuild/redeploy the app (`npm run build` or rebuild the production Docker image). Do not reuse an old `node_modules` directory or `.output` bundle with the upgraded dependencies. See the database upgrade instructions below.
- Password-reset and email-verification links expire after **20 minutes** (`1,200` seconds, not milliseconds). Reset tokens are single-use; a successful password reset revokes existing sessions, so users must sign in again. Email verification is sent on sign-up and automatically signs in after verification, but verification is not currently required for password login. These Better Auth token lifetimes are separate from invitation/activation expiry.

## Get started with contribution

Step 1: Clone
```bash
git clone https://github.com/BurningFlamesss/scms
```

Step 2: Install deps
```bash
npm ci
```

Step 3: Copy `.env.example` to `.env.local` and configure it. Set every required variable below, using your own deployment values and a strong, unique auth secret. Do not commit secrets. Vite and the database scripts load `.env.local`; the standalone production server needs these variables supplied explicitly at runtime.

Required server variables (`src/env/server.ts`), plus the required public client variable (`src/env/client.ts`):

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms
APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
SUPER_ADMIN_EMAIL=admin@example.test
SUPER_ADMIN_NAME="School Administrator"
ORGANIZATION_NAME="Example School"
ORGANIZATION_SLUG=example-school
DEFAULT_BRANCH_NAME="Main Campus"
DEFAULT_BRANCH_SLUG=main-campus
VITE_APP_URL=http://localhost:3000
```

`SUPER_ADMIN_*`, `ORGANIZATION_*`, and `DEFAULT_BRANCH_*` configure seed data but are also required by server environment validation. `APP_URL` is the app's public origin; **build-time `VITE_APP_URL` must match runtime `APP_URL`**. All `VITE_*` values are public and must not contain secrets.

Optional variables and defaults:

| Variable | Default / behavior |
| --- | --- |
| `VITE_APP_TITLE` | Optional public client title. |
| `MAIL_APP_USER`, `MAIL_APP_PASSWORD` | Optional mail credentials; configure both for email delivery. Leave both unset for isolated browser tests. |
| `STORAGE_DRIVER` | `local`; set to `s3` for MinIO or another compatible S3 service. |
| `STORAGE_LOCAL_DIR` | `.data/uploads`; local storage directory, relative to the app's working directory unless absolute. |
| `S3_ENDPOINT` | `localhost`; hostname only, without scheme or port. |
| `S3_PORT` | `9000`; positive integer. Set the actual service port, e.g. `443` for HTTPS. |
| `S3_USE_SSL` | `false`; use the literal `true` for HTTPS. |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY` | `scms`, `scms-secret`; local Compose defaults only, not production credentials. |
| `S3_BUCKET` | `scms`; use the existing bucket when upgrading. |
| `S3_REGION` | Optional; explicit region is authoritative. See region discovery below. |

For `STORAGE_DRIVER=s3`, configure the endpoint, port, TLS setting, credentials, and bucket for your service rather than relying on development defaults. The driver checks the bucket and creates it if missing; credentials must permit the required bucket check/object operations and, if needed, bucket creation.

**S3 region discovery:** an explicit `S3_REGION` is authoritative and is not overwritten by discovery. If absent, the client initially uses `us-east-1` and discovers an existing bucket's region through `HeadBucket`. A compatible server's `AuthorizationHeaderMalformed` region hint can trigger one additional `HeadBucket` attempt; this fallback is bounded, not an infinite retry loop. A new bucket defaults to `us-east-1` unless a region was explicitly configured. Set `S3_REGION` to the actual region when your provider requires it; it is not a mandatory new variable for existing deployments.

Step 4: Start local PostgreSQL using Docker (optional if you already have a database). The default Compose file starts **only PostgreSQL**, matching the app's default `STORAGE_DRIVER=local`. It does not pull or require MinIO, an AWS account, or any S3 service.
```bash
docker compose --env-file .env.local up -d
```

With local storage, uploads live in `STORAGE_LOCAL_DIR`; persist that directory when running the app in Docker (see the production image instructions below). Keep backups of both uploads and the database.

**Optional self-hosted MinIO:** set `STORAGE_DRIVER=s3`, configure `S3_*`, and explicitly set **`MINIO_IMAGE`** to a vetted, compatible MinIO image pinned to a release or digest. Then include the optional Compose file:

```bash
docker compose --env-file .env.local \
  -f docker-compose.yml -f docker-compose.minio.yml up -d
```

There is deliberately **no default MinIO image**: this opt-in command fails with an actionable message if `MINIO_IMAGE` is missing, rather than pulling the unavailable `minio/minio:latest` image. Supply the variable in the shell environment or `.env.local` (via `--env-file`); Compose does not automatically read `.env.local`. `MINIO_IMAGE` is Compose-only, not an application environment variable. Keep the MinIO command, credentials, ports, and `/data` volume compatible; images with different entrypoints, licensing requirements, or data-directory ownership need an explicit additional Compose override. External S3 providers do not need the optional Compose file.

**Existing MinIO installations:** include both `-f` files for MinIO lifecycle commands. The service/container names and `minio_data` volume key are unchanged, so using the same Compose project preserves the existing volume. Neither this split nor changing `STORAGE_DRIVER` copies, moves, or deletes existing uploads. Back up data and plan a migration before changing providers or pointing an incompatible server at an existing volume; do not use `down -v` unless you intend to delete its volumes.

The upstream [MinIO community repository](https://github.com/minio/minio) is no longer maintained; a different tag or mirror does not fix that support/security issue. The vendor's maintained [AIStor container](https://docs.min.io/aistor/installation/container/install/) requires a license (including for its free tier) and different startup configuration; it is **not** selected automatically or offered here as a drop-in replacement.

For the isolated release tests, the explicitly selected image was `bitnamilegacy/minio:2025.7.23-debian-12-r5` (digest `sha256:6dabb4a2088c9a79908de3bc05f4586c23ad2182c8908e7e3acbf61c1467fb20`), launched with its MinIO binary entrypoint (`/opt/bitnami/minio/bin/minio`) and disposable storage. This unmaintained legacy image is **test-only, not a production recommendation or a drop-in Compose replacement**. No production provider or default image was automatically replaced.

Step 5: Generate the Prisma client, apply the migrations, then seed the superadmin account and starter content
```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

Upgrading an existing installation requires `npm run db:generate` and `npm run db:migrate:deploy` before starting the updated app. The club attachments migration adds a nullable club relation without changing existing notice/event attachments. Deleting a club removes its attachment links, not the uploaded files; the cleanup action removes files only once they have no remaining references and are past the grace period.

For schema changes during development use `npm run db:migrate` to create a new migration. `npm run db:push` still exists for quick throwaway databases, and `npm run db:migrate:status` shows what is applied.

Step 6: Run either the dev server or the production server
```bash
npm run dev
# Or build and run the standalone production server:
npm run build
npx dotenv -e .env.local -- node .output/server/index.mjs
```

Step 7: Run the unit and UI regression suite (no database required)
```bash
npm test
```

### Production Docker image

Start the Compose services and apply migrations as described above before starting the app. The image does not run migrations automatically and does not contain the Prisma CLI.

```bash
docker build --build-arg VITE_APP_URL=http://localhost:3000 -t scms:local .
docker run --rm --name scms-app --network scms_default \
  --env-file .env.local \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/scms \
  -e S3_ENDPOINT=minio \
  -e STORAGE_LOCAL_DIR=/app/.data/uploads \
  -p 127.0.0.1:3000:3000 \
  --mount type=volume,source=scms_uploads,target=/app/.data/uploads \
  scms:local
```

`scms_default` is the default Compose network for this repository; adjust it if using a different Compose project name. The PostgreSQL credentials above are the local Compose defaults, not production credentials. `VITE_APP_URL` is embedded at build time and must match the runtime `APP_URL`. Server secrets are supplied at runtime and excluded from the build context. The server runs as UID 1000; bind-mounted upload directories must be writable by that user. The named volume keeps local uploads across container replacements; S3 uploads instead use the configured bucket.

Behind a reverse proxy, forward the actual client IP using a trusted header and configure Better Auth's IP-header handling to match the deployment. Direct container requests without such a header can log a shared rate-limit-bucket warning. Do not suppress it by blindly trusting client-supplied forwarding headers; restrict direct access to the app when relying on a proxy.

### PostgreSQL and storage integration tests

Use only a **dedicated disposable database**. `tests/integration/club-attachments.test.ts` requires `SCMS_TEST_DATABASE_URL` explicitly, refuses database names not ending in `_test` or `_verification`, and never falls back to the application's `DATABASE_URL`. It deletes **all** attachment, club, notice, event, and file-asset rows in that database, not just fixture-owned rows. Do not share it with a running app or browser tests.

With the default Compose PostgreSQL service running, create and migrate the integration database, then run against local storage (the default). The suite creates and removes its own temporary local upload directory.

```bash
docker compose exec postgres createdb -U postgres scms_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_test npm run db:migrate:deploy
SCMS_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_test SCMS_TEST_STORAGE_DRIVER=local npm run test:integration
```

Run the same suite separately against S3/MinIO:

```bash
SCMS_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_test \
SCMS_TEST_STORAGE_DRIVER=s3 \
SCMS_TEST_S3_ENDPOINT=localhost \
SCMS_TEST_S3_PORT=9000 \
SCMS_TEST_S3_ACCESS_KEY=scms \
SCMS_TEST_S3_SECRET_KEY=scms-secret \
SCMS_TEST_S3_USE_SSL=false \
npm run test:integration
```

For S3 integration tests, **all four** `SCMS_TEST_S3_ENDPOINT`, `SCMS_TEST_S3_PORT`, `SCMS_TEST_S3_ACCESS_KEY`, and `SCMS_TEST_S3_SECRET_KEY` are mandatory; they do not fall back to the app's `S3_*` values. `SCMS_TEST_S3_USE_SSL` is optional and defaults to `false`. Optional `SCMS_TEST_S3_REGION` configures the same region for the driver and bucket cleanup; when omitted, the driver uses discovery and newly created test buckets/cleanup default to `us-east-1`. The suite does not inherit the app's `S3_REGION`. `SCMS_TEST_STORAGE_DRIVER` accepts only `local` or `s3` and defaults to `local`.

Use a dedicated disposable S3 test service/account with permissions to check, create, and delete buckets and read/write/delete objects. The suite chooses a unique `scms-test-<UUID>` bucket, tracks uploaded keys, and attempts object/bucket teardown; it does not use an app bucket or accept a `SCMS_TEST_S3_BUCKET` override. Check for leftovers after failed runs. Configure `SCMS_TEST_S3_REGION` when the test service requires a non-default region; real MinIO tests are not a substitute for validation against your production provider.

These tests exercise binary round-trips, missing-key/idempotent deletion, real attachment foreign keys, atomic replacement rollback, partial updates, club cascades, shared notice/event assets, grace periods, and physical-object cleanup. For the completed release-verification results, see the security notes above.

### Chromium end-to-end tests: local AND S3

Run the browser suite **twice**, against separately started app instances: once with local storage and once with S3 storage. Playwright does **not** start/configure the app. Each app needs all required server/client variables listed above, a **dedicated disposable migrated database**, and isolated storage. Never use a live installation: the administrator cleanup action scans all old, unreferenced uploads, not just this run's fixtures.

Create separate, uncommitted environment files (for example, `.env.e2e.local` and `.env.e2e.s3.local`) with all required variables, plus the settings below. Keep both `MAIL_APP_USER` and `MAIL_APP_PASSWORD` **unset in the app and test runner**; auth-security tests reject configured runner mail credentials, and the separately started app must also avoid sending real email. Check inherited environment variables and any automatically loaded `.env.local` so production mail/database/storage settings cannot leak into the test app.

| Setting | Local run | S3 run |
| --- | --- | --- |
| App `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/scms_browser_local_test` | `postgresql://postgres:postgres@localhost:5432/scms_browser_s3_test` |
| App `STORAGE_DRIVER` | `local` | `s3` |
| App `STORAGE_LOCAL_DIR` | `.data/e2e-local-uploads` (disposable, not normal uploads) | Not used for S3 objects. |
| App `S3_BUCKET` | Not used. | `scms-browser-s3-test`, a dedicated disposable bucket, not an integration or real app bucket. |
| App S3 connection | Not used. | Configure `S3_ENDPOINT`, `S3_PORT`, `S3_USE_SSL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and optional `S3_REGION` for the test service. |
| App `APP_URL` and build-time `VITE_APP_URL` | Both `http://localhost:3000` | Both `http://localhost:3000` (or another matching loopback origin). |

Create the two databases and apply migrations before starting either app (example local Compose credentials only):

```bash
docker compose exec postgres createdb -U postgres scms_browser_local_test
docker compose exec postgres createdb -U postgres scms_browser_s3_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_browser_local_test npm run db:migrate:deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_browser_s3_test npm run db:migrate:deploy
npx playwright install chromium
```

Build and start the local-storage app with its dedicated configuration:

```bash
npx dotenv -e .env.e2e.local -- npm run build
npx dotenv -e .env.e2e.local -- node .output/server/index.mjs
```

In another terminal, point Playwright at **that same app database and origin**:

```bash
SCMS_E2E_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_browser_local_test \
SCMS_E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

Stop the local app before rebuilding/starting the S3 app on the same port. Ensure the dedicated S3 service is available and the app has bucket-check/object-operation permissions (plus bucket creation if the bucket is absent):

```bash
npx dotenv -e .env.e2e.s3.local -- npm run build
npx dotenv -e .env.e2e.s3.local -- node .output/server/index.mjs
```

Then, from another terminal:

```bash
SCMS_E2E_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_browser_s3_test \
SCMS_E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

`SCMS_E2E_DATABASE_URL` is mandatory, must name a database ending in `_test` or `_verification`, and must identify the running app's database. The default `SCMS_E2E_BASE_URL` is `http://localhost:3000`; the auth-security tests require a loopback host (`localhost`, `127.0.0.1`, or `[::1]`). For another origin, set **all three** of `APP_URL`, build-time `VITE_APP_URL`, and `SCMS_E2E_BASE_URL` identically and rebuild. Browser tests use the app's ordinary `STORAGE_DRIVER`/`S3_*` settings, **not** the integration suite's `SCMS_TEST_*` variables; setting runner storage variables alone does not reconfigure the app.

If Chromium is already installed, set `SCMS_CHROMIUM_EXECUTABLE` to its executable path instead of downloading another copy. The suite covers legacy auth credentials, login persistence/logout revocation, invitation activation, 20-minute single-use password resets/session revocation, expired-reset rejection, the permissions screen, club document upload/edit/download, active/inactive visibility, deletion/cleanup, and anonymous/unauthorized upload denial. Failed traces are stored under `.data/playwright-results`. Inspect and remove only the dedicated test databases, local upload directory, and S3 bucket/objects when finished; browser tests do not tear down the S3 bucket. Both storage modes passed in the final release verification. The tracked auth browser test covers legacy password hashes; a separate, successfully completed check verified a session cookie issued by the old server. To repeat that cross-version check, use the same disposable database and auth secret in old/new app instances; the logout request must send JSON (`data: {}` in Playwright) to avoid HTTP 415. After verification, remove only the dedicated security-verification resources—not normal development resources.
