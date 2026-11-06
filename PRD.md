# PRD — ScMS: School Management Platform & Official School Website

> Single source of truth for **what we are building, why, and in what order**.
> Status ledger lives in [Checklist.md](./Checklist.md). Execution order lives in [Tasks.md](./Tasks.md).
> Last audited against code: **2026-11-06**.

## 1. Product Vision

ScMS serves **two products from one codebase**:

1. **The school's official public website** — a genuinely excellent, fast, content-first site (hero, about, contact, notices, events, clubs) that a real school would proudly run. First impression product.
2. **The school's operations system** — identity, admissions/invitations, academics, attendance, transport, communications, and (future) finance/exams/library — with role-aware experiences for Admins, Staff, Students, Guardians.

**North star:** a school that has *never used school software* can adopt ScMS end-to-end in one afternoon: seed the superadmin → invite staff → publish a notice → take attendance → assign bus routes. And a parent landing on the public site can find who/where/what the school is within 5 seconds.

**Users/roles:** `SUPERADMIN`, `ADMIN`, `STAFF`, `STUDENT`, `GUARDIAN` (RBAC with 8 permission keys, editable role defaults + per-user overrides, branch-scoping designed but not yet enforced).

## 2. Current State (v1 — Shipped)

Verified implemented in code (details in [Checklist.md](./Checklist.md)):

- **Identity & access**: Better Auth (email/password, 20-min single-use password reset with session revocation), invitation-based provisioning for staff/students/guardians with 7-day tokens, public "request an invitation" queue with advisory-lock dedupe and admin approve/reject (+ decision emails), CSV bulk import for students/staff (500-row batch, per-row errors).
- **RBAC**: 5 roles × 8 permission keys (`MANAGE_DASHBOARD|INVITES|DIRECTORY|CONTENT|ACADEMICS|ATTENDANCE|TRANSPORT|PERMISSIONS), role defaults editable in DB, per-user allow/deny overrides, self-lockout guard, SUPERADMIN always all-permissions.
- **Academics**: branches, classrooms, courses (teacher + room, unique code), enrolments (batch ≤500).
- **Attendance**: dated sessions per unique (course, date), per-student marks (PRESENT/ABSENT/LATE/EXCUSED + note), diffed saves, SQL-side per-student summaries.
- **Transport**: routes with ordered stops (lat/lng, pickup/dropoff times), drivers/vehicles, per-direction student assignments.
- **Content**: notices (audience + publish window), events (datetime + location), clubs (active flag) — slugs, cover images, document attachments (≤10/club), public detail pages.
- **Storage**: pluggable local/S3(MinIO) drivers, `/uploads/$` serving, upload policy (5 MB images / 10 MB docs), orphan cleanup (manual + CRON_SECRET-protected endpoint).
- **Self-service**: `/dashboard` (role-aware) and `/my-records` (courses, attendance %, bus route).
- **Public website**: landing (canvas-video hero + GSAP scroll), about, contact (`mailto:`/`tel:` only), notices/events/clubs pages.
- **Ops**: Docker (3-stage, non-root), compose (Postgres + optional MinIO), 4 versioned migrations, idempotent seed, CI (lint/tsc/unit/build) — ~120 unit tests, 8 integration, 5 e2epaywright.

## 3. Gaps & Ambitions (v2 Roadmap)

Ordered by **real-school value**. Each phase has its own Tasks.md milestone.

### P1 — Website Excellence (make the public site a flagship)
The codebase is already "an admin tool with a website bolted on". Invert it:
- Unified design system (today two unused token sets + hardcoded cream/red/yellow; [Design-system.md](./Design-system.md)).
- Contact form → persisted `ContactMessage` + admin inbox + email notify.
- Hero CTAs, shared `Footer`/`Navbar` components, gallery/faculty/admissions pages, SEO & OG metadata per page, real school config content (today: placeholder phone `980000000`, org name `"everest"`).
- Smooth scrolling (Lenis is *installed but commented out*), motion polish consistent everywhere.

### P2 — Academic Core (the must-haves every school demands)
- **Academic calendar**: `AcademicYear` / `Term` models; everything temporal anchors to them (today grades/sections are free strings, courses have no term).
- **Timetable**: weekly `TimetableSlot` grid (course ↔ classroom ↔ staff ↔ weekday/period).
- **Exams & marks**: exam schedules, per-student marks, report cards (PDF), grade scales.
- **Homework/assignments** with due dates and (later) submission visibility for students/guardians.
- **Fees & finance**: fee structures per grade/term, invoices, payments, receipts, dues dashboard (no money field exists anywhere today).

### P3 — Communication & Experience
- In-app notification center (mail is fire-and-forget today; no `Notification` table).
- Audience enforcement: `Notice.audience` exists but signed-in users get no role-filtered notice feed.
- Richer `/dashboard`, student/guardian portal pages (timetable, homework, dues, fee receipts).
- Staff experience: staff records page (currently staff see an empty `/my-records`).

### P4 — Extended Domains (differentiators)
Admissions pipeline (applications/enquiry forms), library (catalog/loans/fines), hostel/boarding, discipline & health records, staff HR (leave, payslips), surveys/PTA feedback, certificates & student documents.

## 4. Non-Goals (for now)
- Multi-tenant SaaS across schools **at runtime** (schema + `src/schools/*` scaffolding exists; the app is single-school until P5 — see Tech Debts).
- Payments gateway integration (P2 covers invoices/dues; gateway is a later spike).
- Mobile native apps (responsive web only).
- OAuth/SSO login via Better Auth plugins (email/password only today).

## 5. Technical Debts (fold into roadmap work)
| Debt | Where | Levelling task |
| --- | --- | --- |
| Two conflicting design-token sets, none used by components | `src/styles.css` | DS-1 (Tasks) |
| `components.json` ready but `src/components/ui/` absent (hand-rolled everything) | `src/components` | DS-2 |
| LenisProvider commented out in `__root.tsx`; `html{scroll-behavior:smooth}` fights Lenis | `src/routes/__root.tsx` | P1 |
| Hardcoded tenant slug `"everest"`; `school-store.ts` (zustand) has no consumers | `__root.tsx`, `src/store` | P1 / P5 |
| `Notice.audience` not honored on any feed | content package | P3 |
| Branch-scoped permission columns exist, never read/enforced | permissions packages | P3/P4 |
| Dead code: legacy `createInvite`, duplicate `getInviteByToken`/`getGuardianInviteByToken`, unused `countPendingInviteRequests` | invite packages | T-1 |
| `/uploads/$` serves any FileAsset without authz (UUID-unguessable, but unscoped) | `src/routes/uploads/$.ts` | P3 (decision) |
| Gmail SMTP hard-coded in mail.ts | `src/packages/notifications/mail.ts` | P3 (configurable transport) |
| No tests for academics/transport/admin server actions | `src/packages/**` | T-2 |
| CI runs no DB-backed tests; `.env.example` missing `VITE_APP_TITLE`/`S3_REGION` | CI, env | T-3/T-4 |

## 6. Success Criteria (per release)
1. `npx tsc --noEmit`, `npx biome check src`, `npm test` all green; schema change ships with a versioned migration + updated seed.
2. New admin surfaces are permission-gated server-side (not just UI-hidden), follow the `getXFn` / `*Action` + `{ success, error }` envelope conventions ([Architecture.md](./Architecture.md) §Conventions).
3. Every new student/guardian-visible surface also works for anonymous visitors without leaking records.
4. The public site pages remain LCP-friendly: no blocking client data fetch on public routes.
