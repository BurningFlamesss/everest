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
5. Content management (`/admin/content`) — create and edit notices, events, and clubs, including cover images and document attachments. Existing club attachments can also be managed on their own with **Edit attachments**.
6. Website page editors (`/admin/courses`, `/admin/about`) — a skeleton of the public page; double-click a block (header, level rail, most-chosen programme, overview/subjects/fees/pathways tabs, routine, chapters) to edit exactly that block. The courses editor also pins one programme per level as the featured card, and about chapters open in their own dialog.
7. Academics (`/admin/academics`) — classrooms, courses, teachers, and student enrolments, with editing for courses and classrooms.
8. Attendance (`/admin/attendance`) — open a daily register per course, mark students, and review per-student summaries.
9. Transport (`/admin/transport`) — bus routes, stops, drivers, and student route assignments, with editing for routes and stops (including stop order).
10. Permissions (`/admin/permissions`) — edit role-level defaults and grant or revoke individual permissions; returning a role permission to its built-in default removes the stored override.
11. My records (`/my-records`) — students and guardians see their own courses, attendance, and transport; staff see an empty state.

Operations:

1. Scheduled maintenance (`/api/cron/cleanup`) — token-protected orphan-upload cleanup for an external scheduler; disabled unless `CRON_SECRET` is set.

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
- Notices, events, and clubs (public pages and admin create/edit/delete)
- Academics: classrooms, courses with teacher/classroom assignment, and student enrolments, including course and classroom editing
- Attendance: daily course registers, per-student marks (present/absent/late/excused), and per-course summaries with attendance rates
- Transport: routes, ordered stops, drivers, and per-student pickup/drop-off assignments, including route and stop editing
- Editable role-level permission defaults plus per-user overrides, with a dedicated permissions screen that clears redundant overrides when a role returns to its built-in default
- Cover images and document attachments (PDF, Word, Excel, CSV, text) for notices, events, and clubs, with a pluggable local/S3 storage driver
- Club attachment editing with up to 10 documents per club and public download links on active club cards
- On-demand cleanup of uploads that are no longer referenced by any content
- Self-service records for students and guardians: courses, attendance history, and bus route details
- Landing, About, and Contact pages
- Sidebar (with proper layout and collapsing logic)
- Scalable admin lists: the directory is paginated and loads one tab per request, and student pickers search on the server instead of downloading the whole student body
- SQL-side attendance summaries, diffed attendance saves, and set-based enrolment writes
- Token-protected `/api/cron/cleanup` endpoint for scheduled orphan-upload removal
- A single upload policy module shared by the upload API and the admin upload fields
- Page-skeleton editors for the public courses and about pages, with per-block double-click editing and one pinned “most-chosen” programme per level
- A database-independent public sidebar: the DB-backed and bundled navigation share one definition, and the content column no longer reserves a sidebar offset when the sidebar is absent

## What is Incomplete? (or, What is left?)

- Scheduled cleanup still needs an external scheduler (cron, systemd timer, platform cron job) to call `/api/cron/cleanup`; the app deliberately runs no in-process timers so it stays safe with multiple instances. Without `CRON_SECRET` the endpoint is disabled and cleanup stays manual.
- Upload limits (5 MB for images, 10 MB for documents) and allowed types live in `src/packages/storage/policy.ts`; changing the policy means editing that module, not setting environment variables.
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

- TypeScript and scoped Biome checks passed.
- The application and storage configuration used for the checks was rebuilt and exercised manually.
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
| `MAIL_APP_USER`, `MAIL_APP_PASSWORD` | Optional mail credentials; configure both for email delivery. Leave both unset to disable sending. |
| `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_SECURE` | SMTP transport; defaults `smtp.gmail.com`, `587`, `false`. Point these at any provider (SES/Mailgun/Postmark/school mail server). |
| `MAIL_FROM` | Optional From header; falls back to `MAIL_APP_USER`. |
| `STORAGE_DRIVER` | `local`; set to `s3` for MinIO or another compatible S3 service. |
| `STORAGE_LOCAL_DIR` | `.data/uploads`; local storage directory, relative to the app's working directory unless absolute. |
| `S3_ENDPOINT` | `localhost`; hostname only, without scheme or port. |
| `S3_PORT` | `9000`; positive integer. Set the actual service port, e.g. `443` for HTTPS. |
| `S3_USE_SSL` | `false`; use the literal `true` for HTTPS. |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY` | `scms`, `scms-secret`; local Compose defaults only, not production credentials. |
| `S3_BUCKET` | `scms`; use the existing bucket when upgrading. |
| `S3_REGION` | Optional; explicit region is authoritative. See region discovery below. |
| `CRON_SECRET` | Optional; at least 16 characters. Enables `GET`/`POST /api/cron/cleanup` when set. Leave unset to disable the endpoint. |
| `FACEBOOK_PAGE_TOKEN`, `FACEBOOK_PAGE_ID` | Optional; together they enable the real Facebook page feed on the landing page and `/posts`. The token is a Page Access Token from an admin of the school's Facebook page; the ID is the page's numeric ID. Leave unset to show the honest empty state instead of posts. |
| `FACEBOOK_GRAPH_VERSION` | Optional; Graph API version, defaults to `v23.0`. |
| `FACEBOOK_RSS_URL` | Optional; RSS bridge feed (rss.app, RSSHub, self-hosted) used when the Graph token is unset or fails. `VITE_FACEBOOK_RSS_URL` is accepted as a legacy alias. |

For `STORAGE_DRIVER=s3`, configure the endpoint, port, TLS setting, credentials, and bucket for your service rather than relying on development defaults. The driver checks the bucket and creates it if missing; credentials must permit the required bucket check/object operations and, if needed, bucket creation.

**S3 region discovery:** an explicit `S3_REGION` is authoritative and is not overwritten by discovery. If absent, the client initially uses `us-east-1` and discovers an existing bucket's region through `HeadBucket`. A compatible server's `AuthorizationHeaderMalformed` region hint can trigger one additional `HeadBucket` attempt; this fallback is bounded, not an infinite retry loop. A new bucket defaults to `us-east-1` unless a region was explicitly configured. Set `S3_REGION` to the actual region when your provider requires it; it is not a mandatory new variable for existing deployments.

Step 4: Start PostgreSQL and MinIO using Docker (optional if you already have a database and object store). The Compose file starts **both services**, so a self-hosted S3-compatible setup needs no second compose file:

```bash
docker compose --env-file .env.local up -d
```

The app still defaults to `STORAGE_DRIVER=local`; set `STORAGE_DRIVER=s3` to keep uploads in MinIO. The default `S3_*` values already match the Compose service (`S3_ENDPOINT=localhost`, `S3_PORT=9000`, `S3_ACCESS_KEY=scms`, `S3_SECRET_KEY=scms-secret`, `S3_BUCKET=scms`). When the app itself runs inside the Compose network, set `S3_ENDPOINT=minio` instead of `localhost`.

The Compose default is the legacy Bitnami build (`bitnamilegacy/minio:2025.7.23-debian-12-r5`) because the upstream `minio/minio` images are no longer anonymously pullable. It is a self-hosted convenience, not a maintained release: for production, point `MINIO_IMAGE` at a vetted image in your own registry, remove or adapt `MINIO_ENTRYPOINT` to that image's binary, and keep the `minio-init` bucket step. `MINIO_CONSOLE_PORT` changes the console port (default `9001`). None of these Compose-only variables are read by the application. The console is at `http://localhost:9001` using the configured access key and secret.

A one-shot `minio-init` container waits for MinIO's healthcheck and creates `S3_BUCKET` with `mc mb --ignore-existing`, so the bucket exists before the first upload. The storage driver also creates it if missing. Credentials must permit bucket checks, object operations and, when the bucket is absent, bucket creation. **Use real production credentials**; the Compose values are local defaults. The MinIO container runs as root so it can write the root-owned `minio_data` volume. With local storage, uploads live in `STORAGE_LOCAL_DIR`, so persist that directory when running the app in Docker (see the production image instructions below). Back up the `postgres_data` and `minio_data` volumes. External S3 providers can skip MinIO entirely and set `S3_*` to their own endpoint.

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

### Scheduled upload cleanup

An administrator can remove unreferenced uploads from the content screen, but a production deployment should also run the cleanup unattended. Set `CRON_SECRET` and let any scheduler call the endpoint:

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://school.example.edu/api/cron/cleanup
```

`GET` is accepted as well (`?token=…` works for schedulers that cannot set headers; the header is preferred). The endpoint is safe to call from several app instances: each run takes at most five batches of 200 assets, only removes files older than the 24-hour grace period, and leaves rows behind when storage deletion fails so a later run can retry. It returns JSON with `deleted`, `failed`, `candidates`, `batches`, and `durationMs`; it answers `503` when `CRON_SECRET` is unset and `401` for a wrong token. A 15-minute schedule is plenty for a school-sized content library.

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
