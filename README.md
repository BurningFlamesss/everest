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
- The dependency audit currently reports unresolved high/critical advisories. Review `npm audit --omit=dev` and validate targeted updates before public deployment; a successful build is not a security clearance.

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

## Get started with contribution

Step 1: Clone
```bash
git clone https://github.com/BurningFlamesss/scms
```

Step 2: Install deps
```bash
npm i
```

Step 3: Rename `.env.example` to `.env.local` and change the variables. For uploads, keep `STORAGE_DRIVER=local` to write into `STORAGE_LOCAL_DIR`, or set `STORAGE_DRIVER=s3` to use MinIO/any S3-compatible service (`S3_*` variables).

Step 4: Setup local database and object storage using docker (OPTIONAL, if you are using another PostgreSQL or S3 provider). Compose starts PostgreSQL plus a MinIO service used when `STORAGE_DRIVER=s3`.
```bash
docker compose up -d
```

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

### PostgreSQL integration tests

Use only a **disposable** database. The suite requires `SCMS_TEST_DATABASE_URL` explicitly, refuses database names not ending in `_test` or `_verification`, and never falls back to the application's `DATABASE_URL`. It deletes content and file-asset rows in that database and uses a temporary local upload directory.

With the default Compose PostgreSQL service running:

```bash
docker compose exec postgres createdb -U postgres scms_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_test npm run db:migrate:deploy
SCMS_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_test npm run test:integration
```

These tests exercise real attachment foreign keys, atomic replacement rollback, partial updates, club cascades, shared notice/event assets, grace periods, and physical-file cleanup.

### Chromium end-to-end tests

Run an app instance against a **separate disposable database**, such as `scms_browser_test`, with migrations applied. Do not use a live installation: the test exercises the administrator cleanup action, which scans all old, unreferenced uploads. Set the app's `APP_URL` and build-time `VITE_APP_URL` to the tested origin.

```bash
npx playwright install chromium
SCMS_E2E_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scms_browser_test npm run test:e2e
```

The default origin is `http://localhost:3000`; override it with `SCMS_E2E_BASE_URL`. If Chromium is already installed, set `SCMS_CHROMIUM_EXECUTABLE` to its executable path instead of downloading another copy. Tests create their own manager/viewer accounts and cover invitation activation, the permissions screen, club document upload/edit/download, active/inactive visibility, deletion and cleanup, and anonymous/unauthorized upload denial. Failed traces are stored under `.data/playwright-results`.
