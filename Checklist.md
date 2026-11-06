# Checklist

> **Status update (2026-11-07):** M2 academic core is shipped — academic years/terms, timetable with server-side teacher/room clash rejection, exams with idempotent marks and published-result notifications, homework with attachments and enrolment-scoped visibility, and phase-1 fees (structures → invoices → payments with atomic status). M3 is shipped apart from password-reset notifications: in-app notification center with bell/badge and invite/notice/exam triggers, role-aware dashboard cards, `/my-classes` staff workspace, and a `MailLog` + `/admin/mail` view. Marketing parity added `/gallery`, `/admissions`, and a gallery manager. Branch-scoped permission resolution now honours `scopeKey` with global fallback. Still open: extended domains (library, hostel, discipline, health, HR, admissions pipeline, student documents) and runtime tenant resolution (T-29), plus DS-2's admin-screen migration. — Feature Audit (what is done / partial / missing)

Legend: ✅ implemented · 🟡 partially implemented (follow-up needed) · ❌ not started.
Sources: full codebase audit 2026-11-06. Cross-refs: [PRD.md](./PRD.md), [Tasks.md](./Tasks.md).

## 1. Identity & Access
- ✅ Email/password auth via Better Auth 1.7.15 + Prisma adapter + TanStack cookies
- ✅ Login / logout / session persistence; logout revokes sessions server-side
- ✅ Forgot/reset password: 20-min single-use tokens, sessions revoked on reset, expired-token rejection
- ✅ Verify-email hook (sends on signup, auto sign-in after verify) — 🟡 verification **not required** to log in (`requireEmailVerification: false`; invited users pre-set `emailVerified: true`)
- ✅ Staff/student invite + `/activate/$token` flow (7-day TTL, single-use, revokes prior open invites)
- ✅ Guardian invite + `/activate/guardian/$token` (linked student shown)
- ✅ Public `/signup` → `InviteRequest` queue (advisory-lock dedupe, `REQUEST_ALREADY_PENDING`)
- ✅ Admin approve/reject queue with atomic claim + rollback and decision email w/ reviewer note
- ✅ CSV bulk import for students & staff (≤500 rows, column mapping, validation preview, per-row errors) via `ImportWizard`
- ❌ OAuth/SSO providers
- ❌ Data-edit flows for own profile (no "change email/name password" page; only reset flow)

## 2. Permissions (RBAC)
- ✅ 5 roles × 8 permission keys; role defaults (SUPERADMIN all, ADMIN all-but-permissions, STAFF dashboard+attendance)
- ✅ Editable role defaults stored in `RolePermission`, per-user `UserPermission` allow/deny overrides
- ✅ `/admin/permissions` screen: paged user search, role/user reset, redundant-override cleanup, self-lockout guard
- 🟡 Branch scoping: `scopeKey`/`branchId` columns exist (migration `20261105000000`) but resolution always reads globally and UI never sets branch — designed, not wired
- 🟡 SUPERADMIN role lock is enforced in code (always all permissions) but the UI affordance is limited
- ❌ Per-branch permission admin UI

## 3. People & Directory
- ✅ Students/Staff/Guardians profiles with status enums; guardian↔student links (relation, isPrimary)
- ✅ `/admin/directory` paginated, debounced server search, one tab loaded per request
- ✅ Server-side student search picker (`searchStudentsFn`, ≤100) used by invites/academics/transport
- ❌ Edit person profile fields after creation (invite captures name/email only; no admin "edit student fields" screen)
- ❌ Transfer/promote/drop workflows (`StudentStatus` enum exists but no lifecycle screens)
- ❌ Student documents / certificates attached to people (attachments today are content-only)

## 4. Academics
- ✅ Branches + classrooms (building/floor/capacity, unique per branch), CRUD + edit
- ✅ Courses: unique code, grade/section strings, teacher & classroom assignment, CRUD + edit
- ✅ Enrolments: batch enrol (≤500) via search picker, remove, status column (`EnrollmentStatus` unused in UI beyond ACTIVE)
- ❌ Academic year / term models (time is unanchored; everything is "current")
- ❌ Grade levels & sections as first-class entities (currently free strings on Student/Course)
- ❌ Subjects, syllabus, lesson planning
- ❌ Timetable (course schedule is a free-text string field)

## 5. Attendance
- ✅ Dated sessions per course, unique (course,date); mark PRESENT/ABSENT/LATE/EXCUSED + note
- ✅ Diffed saves, per-student summaries computed in SQL with rates
- 🟡 Attendance attaches `takenById` (Staff) — but no staff-facing "my classes" workflow surface (staff only via generic admin screens per permissions)
- ❌ Student self-view uses `/my-records` ✅ (implemented) — guardian multi-child view ✅ -> considered done
- ❌ Term-wise attendance exports/reports

## 6. Transport
- ✅ Routes (driver/phone/vehicle/capacity) + ordered stops (times, lat/lng), CRUD + edit incl. stop order
- ✅ Assignments per direction (PICKUP/DROPOFF/BOTH) with active window fields
- ❌ Capacity enforcement / seat counting / alerts
- ❌ Parent stop-change requests

## 7. Content & Public Website
- ✅ Notices (slug, category, audience field, publish window, cover, body, attachments) public list+detail
- ✅ Events (datetime range, location, cover, attachments) public list+detail
- ✅ Clubs (meeting schedule, isActive, ≤10 attachments w/ Edit-attachments) public cards
- ✅ Admin `/admin/content`: create/edit/delete all three, publish/unpublish, orphan cleanup UI
- ✅ Storage: local + S3 drivers, policy (5 MB image/10 MB doc), `/api/uploads` gated by `MANAGE_CONTENT`, rollback on DB failure
- ✅ `/uploads/$` file serving w/ immutable cache — decision recorded (Tasks T-5): public-by-unguessable-UUID, safe-key validation, no listing, `nosniff` + sandbox CSP, attachment disposition for non-previewable types. Sensitive documents must not be attached to public content until per-asset authz exists.
- ✅ Orphan cleanup: admin manual + `/api/cron/cleanup` (token-protected, batched, 24 h grace) — 🟡 external scheduler must call it; disabled without `CRON_SECRET`
- ✅ Landing page: bespoke GSAP/canvas-video hero with admissions/notices/events CTAs, mobile-safe overlay (`md:pl-80`), poster + progress fallback and a halved mobile frame budget; reduced-motion skips the scrub
- ✅ About page (real content)
- ✅ Contact page: info/hours/map from `schools/everest/config.json` plus a persisted enquiry form (name, email, phone, subject, message; honeypot, minimum fill time, per-email + per-IP hourly flood limits) and `/admin/inbox` to read/resolve messages with email notification
- ✅ Shared `Footer` (`src/components/layout/Footer.tsx`) driven by school config, used on landing/about/contact; sidebar remains the app nav
- ❌ Faculty/staff page, gallery, admissions/enquiry page, alumni, results/achievements
- ✅ SEO: root + per-page title/description/OG metadata from config and content, `/sitemap.xml` (static + notices/events/clubs) and `/robots.txt`
- ❌ Newsletter/analytics integration

## 8. Dashboards & Self-service
- 🟡 `/dashboard`: role greeting + shortcuts + stats links — thin; no actionable widgets
- ✅ `/admin` overview: live counts (students, staff, guardians, pending invites, drafts, upcoming events, clubs)
- ✅ `/my-records`: per-student courses, attendance totals+%, last-10, bus route; guardian multi-child
- 🟡 Staff view of `/my-records` is an explicit empty state
- 🟡 Admin contact inbox (`/admin/inbox`) persists and resolves public enquiries; there is still no per-user notification center (`Notification` model)
- ✅ Signed-in dashboard shows a notice feed scoped by `Notice.audience` (management roles see everything; tests cover each audience value)

## 9. Platform & Ops
- ✅ TanStack Start (SSR) + React 19 + React Compiler + Tailwind v4; `#/*` alias
- ✅ Zod validation on every server function (`.validator`); env validated via t3-env (exit-on-invalid)
- ✅ Prisma 7 + pg adapter; 4 versioned migrations; idempotent seed (org, branch, superadmin, activation link, starter content); `db:migrate:status` tooling
- ✅ Docker 3-stage non-root image; compose (postgres17) + optional MinIO overlay (requires pinned `MINIO_IMAGE`)
- ✅ CI: `verify` (npm ci → prisma generate → tsc → biome → unit tests → build) plus an `integration` job with a Postgres 17 service that applies migrations from scratch, seeds and runs `npm run test:integration` against local storage
- ✅ Tests: 220 unit/UI (17 files) including academics/transport/admin server actions, contact persistence/flood limits and notice audience scoping; 8 integration (club-attachments, local+S3); 5 Playwright e2e — e2e remains out of CI (needs a separately started app)
- 🟡 Email: configurable SMTP host/port/secure/from with env defaults preserving Gmail, graceful not-configured fallback, 7 email types — still no `MailLog` delivery table
- 🟡 Live state: zustand `school-store` has zero consumers; TanStack Query wired for SSR but **zero** `useQuery` call sites (all data via loaders + manual action calls)
- ✅ Design system: one semantic token set mapped to the cream/red palette, Fraunces bound to marketing headings, `--positive`/`--info`, config-driven CSS variables at SSR; `src/components/ui` primitives started (DS-2 still partial)

## 10. Roadmap Domains (all ❌ — no models exist)
Fees & finance · Exams/marks/report cards · Timetable · Homework/assignments · Academic year/terms · Library · Hostel · Discipline/wellbeing · Health records · Admissions pipeline · Staff HR (leave/payroll) · Certificates/student documents · Surveys/PTA · August-first: contact-form persistence
