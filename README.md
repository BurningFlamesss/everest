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

1. Signup (`/signup`) — public invite request kept for backward compatibility.
2. Activate (`/activate/:token`) — staff/student account activation.
3. Guardian activation (`/activate/guardian/:token`).
4. Login (`/login`).
5. Forgot password (`/forgot-password`) and reset password (`/reset-password`).

Signed-in area:

1. Dashboard (`/dashboard`) with role-aware summaries.
2. Admin overview (`/admin`).
3. Invitations (`/admin/invites`) — staff, student, and guardian invitations, plus CSV bulk import.
4. Directory (`/admin/directory`) — students, staff, and guardians.
5. Content management (`/admin/content`) — create and manage notices, events, and clubs.

## Introduction & Till What I reached

ScMS started as a highly ambitious project, due to the time constraint, and my academics; needs to seriously compromise on the probable greatness of the project while still making sure the started features were completed without any stone unturned. 

## What is Completed?

- Modular Architecture (Data consuming logic, Static and Dynamic Data distinction (Json vs Zustand))
- Schema, Seed, and Docker Config
- User Signup/Activate/Login flow, password reset, and email verification
- Email delivery through Nodemailer with graceful fallback when mail is not configured
- Admin-driven invitation flow for staff, students, and guardians, including revocation
- CSV imports for staff and students with column mapping, validation, previews, and bulk creation
- Admin dashboard, directory, and content management screens
- Notices, events, and clubs (public pages and admin CRUD)
- Landing, About, and Contact pages
- Sidebar (with proper layout and collapsing logic)
- Unit tests for the CSV import pipeline (`npm test`)

## What is Incomplete? (or, What is left?)

- Attendance, transportation, courses, and classroom modules (not yet started; there are no schema models or routes for them)
- Fine-grained per-role permissions beyond the current admin guards
- File uploads (images/attachments) for notices, events, and clubs
- A public invitation-request workflow (the legacy `/signup` route still creates invites directly; admins can use `/admin/invites` instead)
- Automated database migrations (the project currently uses `npm run db:push`)

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

Step 3: Rename `.env.example` to `.env.local` and change the variables

Step 4: Setup local database provider using docker  (OPTIONAL, If you are using some other postgresql provider)
```bash
docker compose up -d
```

Step 5: Generate and push the Prisma schema, then seed the superadmin account and starter content
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Step 6: Run either the dev server or the production server
```bash
npm run dev
npm run build
```

Step 7: Run the test suite
```bash
npm test
```
