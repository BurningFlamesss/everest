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
5. Content management (`/admin/content`) — create and manage notices, events, and clubs, including cover-image uploads.
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
- Cover images and document attachments (PDF, Word, Excel, CSV, text) for notices and events, with a pluggable local/S3 storage driver
- On-demand cleanup of uploads that are no longer referenced by any content
- Self-service records for students and guardians: courses, attendance history, and bus route details
- Landing, About, and Contact pages
- Sidebar (with proper layout and collapsing logic)
- Unit tests for the CSV import pipeline (`npm test`)

## What is Incomplete? (or, What is left?)

- Orphaned uploads are removed only when an administrator runs the cleanup action on the content screen; there is no scheduled/cron job.
- Notices and events accept document attachments, but clubs still support a cover image only.
- Uploads are capped at 5 MB for images and 10 MB for documents, and the allowed document types are fixed in `src/routes/api/uploads.ts`.
- The permission screen edits role defaults and per-user overrides; there is no per-branch permission scoping yet.
- Migration history now has two migrations (`init`, then role permissions and attachments); every future schema change needs its own migration.

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

For schema changes during development use `npm run db:migrate` to create a new migration. `npm run db:push` still exists for quick throwaway databases, and `npm run db:migrate:status` shows what is applied.

Step 6: Run either the dev server or the production server
```bash
npm run dev
npm run build
```

Step 7: Run the test suite
```bash
npm test
```
