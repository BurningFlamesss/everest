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
- Container, real-storage, browser, and legacy-session upgrade verification remain pending; see the dependency migration notes below.

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

The dependency security upgrades include TanStack, Better Auth 1.7.15, Prisma 7.10.1, Nodemailer 10.3.1, Zod 4.6.7, and updated Vite/Vitest tooling. On **2026-11-03**, `npm audit` and `npm audit --omit=dev` both reported **zero vulnerabilities**, and the unit/UI suite, TypeScript, scoped Biome checks, and host production build passed. No forced dependency fixes were used; the dependency override is limited to `@tailwindcss/typography@0.5.20`'s selector parser. Audit results are a point-in-time check, not a security guarantee.

**Release verification is not complete:** the Docker production build, fresh migrations, real local/S3 integration runs, browser runs against the rebuilt app with both storage drivers, and the legacy-session-cookie upgrade check still need to be rerun. In the current verification environment Docker socket access is denied and no disposable test database URLs are configured for the suites. Integration/browser safety guards stop before accessing a database. Previous handoff results do not substitute for these final checks.

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

Step 4: Setup local database and object storage using docker (OPTIONAL, if you are using another PostgreSQL or S3 provider). Compose starts PostgreSQL plus a MinIO service used when `STORAGE_DRIVER=s3`.
```bash
docker compose --env-file .env.local up -d
```

Compose defaults to `minio/minio:latest`. If that image is unavailable, explicitly set **`MINIO_IMAGE`** to a trusted, compatible MinIO image with a chosen tag or digest, then repeat the command. Supply it in the shell environment or `.env.local` (via `--env-file`); Compose does not automatically read `.env.local`. This is an opt-in image override, not an automatic fallback or permission to silently switch storage providers. Keep the existing MinIO command, credentials, ports, and `/data` volume compatible, and verify the chosen image before use. `MINIO_IMAGE` is Compose-only, not an application environment variable.

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

These tests exercise binary round-trips, missing-key/idempotent deletion, real attachment foreign keys, atomic replacement rollback, partial updates, club cascades, shared notice/event assets, grace periods, and physical-object cleanup. These are run instructions, not a claim that final integration runs have passed.

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

If Chromium is already installed, set `SCMS_CHROMIUM_EXECUTABLE` to its executable path instead of downloading another copy. The suite covers legacy auth credentials, login persistence/logout revocation, invitation activation, 20-minute single-use password resets/session revocation, expired-reset rejection, the permissions screen, club document upload/edit/download, active/inactive visibility, deletion/cleanup, and anonymous/unauthorized upload denial. Failed traces are stored under `.data/playwright-results`. Inspect and remove only the dedicated test databases, local upload directory, and S3 bucket/objects when finished; browser tests do not tear down the S3 bucket. Both final browser runs remain pending. The tracked auth browser test covers legacy password hashes, not a session cookie issued by the old server. The separate legacy-cookie upgrade check requires the same disposable database and auth secret in old/new app instances; its logout request must send JSON (`data: {}` in Playwright) to avoid HTTP 415. The temporary handoff script's logout request has been corrected. Its rerun failed with Prisma `P1001` because the verification database at `127.0.0.1:35057` is unreachable; the old/new app ports are also unavailable. Keep the temporary script/env file until this check can complete, then remove only the security-verification containers, network, env file, and script—not normal development resources.
