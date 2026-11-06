# Tasks — Ordered Implementation Backlog

Work top-to-bottom inside each milestone; milestones are ordered by real-school value ([PRD.md](./PRD.md) §3). Each task lists files to touch and its acceptance criteria. Update checkboxes as you ship; keep [Checklist.md](./Checklist.md) in sync.

**Status:** ☐ open · ◐ in progress · ☑ done

---

## M0 — Hygiene & Quick Wins (start here, low risk, unblocks everything)

**T-1 ☐ Remove dead code & unused scaffolding**
- Files: `src/packages/auth/server/create-invite.ts`; unused `getInviteByToken`/`getGuardianInviteByToken` in `src/packages/invite/invite-service.ts`; unused `countPendingInviteRequests` in `src/packages/invite/requests-service.ts`
- Verdict each one first (grep the import graph); delete confirmed-unused, or move to `src/lib/` if genuinely reusable. Also decide the fate of the comment-disabled `<LenisProvider />` (it belongs to DS-4 — don't leave ambiguous state).
- AC: `npx tsc --noEmit` and `npm test` pass; no dangling imports; Checklist updated.

**T-2 ☐ Server tests for academics / transport / admin**
- Files: new `src/packages/academics/server.test.ts`, `src/packages/transport/server.test.ts`, `src/packages/admin/server.test.ts` (mirror the pattern of `src/packages/content/server.test.ts`: stub prisma, permission denials, happy paths, batch caps).
- AC: coverage parity with the content/invite packages; `npm test` green.

**T-3 ☐ CI parity with local verification**
- File: `.github/workflows/ci.yml`
- Add a job with a `postgres` service that runs `db:migrate:deploy` against a fresh DB + `npm run test:integration` (local storage driver) after unit tests; keep e2e out (it needs a separately started app), but continue producing the build.
- AC: green run with migrations applied from scratch in CI.

**T-4 ☐ Env parity & docs truthing**
- Files: `.env.example`, `src/env/server.ts`, `src/env/client.ts`, README env table
- Add `VITE_APP_TITLE` and `S3_REGION` to `.env.example`; crosscheck the README table against the actual validator fields (`STORAGE_LOCAL_DIR`, `CRON_SECRET`, mail, storage block).
- AC: every validated env var is documented; validators still exit-on-invalid.

**T-5 ☐ Decide + implement asset-serve authorization**
- Files: `src/routes/uploads/$.ts`, `prisma/schema.prisma`, storage docs
- Decision options: (a) keep public-by-unguessable-UUID but ensure no listing/crawlable paths; (b) add `visibility: PUBLIC|PRIVATE` on `FileAsset` with session-gated fetch for private attachments.
- AC: the decision is recorded in PRD §5/Architecture §9; if (b), ship migration + 401/403 tests.

**T-6 ☐ Typed error codes**
- Files: `src/lib/error.ts` (extend or add `error-codes.ts`), all server packages that throw codes, client pages that string-match
- Replace convention-based strings (`INVITE_NOT_FOUND`, `REQUEST_ALREADY_PENDING`, `COURSE_CODE_TAKEN`) with a shared constant map; keep transport as plain `Error`. Audit existing client constants used by `activate.$token.tsx` for mismatches against server codes.
- AC: every client branch references a constant; no code pairs that can never match.

**T-7 ☐ Make mail transport configurable**
- File: `src/packages/notifications/mail.ts`
- Replace the hard-coded Gmail SMTP block with env-driven SMTP settings (host/port/secure/user/pass from `serverEnv`), keeping the never-throw fallback and callers' `emailSent` flags intact.
- AC: works with the current Gmail creds via env; still silently no-ops when unconfigured; `.env.example` updated.

---

## M1 — Website Excellence (public site becomes flagship)

**DS-1 ☐ Single token set** *(Design-system.md §2.1)*
- File: `src/styles.css`
- Map the de facto cream/red palette into the shadcn semantic tokens (`--background`, `--primary`, `--accent`, `--sidebar-*`); bind Fraunces (`--font-display`) and apply it on marketing headings; add `--positive`/`--info` for feedback states.
- AC: token definitions drive the visible palette; the unused sea/lagoon token block is deleted.

**DS-2 ☐ Introduce `src/components/ui` primitives**
- Use the ready `components.json` (shadcn new-york) to generate: `button input label textarea select card badge tabs dialog alert-dialog dropdown-menu table skeleton tooltip avatar command pagination sonner progress`.
- AC: primitives exist; the three worst inline-repeat offenders (buttons/inputs/dialogs on `/admin/content`, `/admin/academics`, `/admin/permissions`) are refactored onto them; UI regression tests updated.

**DS-3 ☐ Layout components onto tokens + shared shell**
- Files: `src/templates/modern/{Sidebar,LandingPage,About,Contact}.tsx`, `src/components/auth/AuthShell.tsx`
- Extract a real `Footer` (currently inline in `LandingPage`); keep the Sidebar as the app nav; ensure the landing hero gets the `md:ml-72` treatment or a full-bleed rule the sidebar respects.
- AC: no hardcoded hexes in these components; visual regression pass on landing/about/contact/admin/auth.

**DS-4 ☐ Motion unification**
- Files: `src/routes/__root.tsx`, `src/styles.css`, `LandingPage.tsx`, `LenisProvider.tsx`
- Re-enable Lenis **and remove `html { scroll-behavior: smooth }`** (they conflict), or remove Lenis+GSAP-provider entirely; honor `prefers-reduced-motion` for hero scrub and smooth scroll.
- AC: consistent scroll behavior; reduced-motion respected.

**DS-5 ☐ Data-driven theme/brand config**
- Files: `src/schools/everest/config.json`, `src/templates/modern/*`, docs
- Fill real values (official org name, tagline, phone `980000000` placeholder, email, SEO description; social links; primary color if any). Render config theme values as CSS custom properties injected at SSR so rebrand = config edit.
- AC: changing `config.json` visibly changes branding; no code edits needed for a basic rebrand.

**T-8 ☐ Contact form → persisted inbox**
- Files: schema (`ContactMessage` + migration), new `src/packages/contact/{service,server}.ts`, `src/routes/contact.tsx`, new `/admin/inbox`
- Public form (name, email, phone optional, subject, message; honeypot + minimum fill-time), rate limited, email notify to the school address, admin list + mark handled.
- AC: submissions persist even when mail is unconfigured; admin can view/resolve; validation/flood tests.

**T-9 ☐ SEO metadata + sitemap**
- Files: per-route meta in route files, `schools/*/config.json`, new sitemap route
- Per-page titles/descriptions from config + content (notice/event detail overrides), OG tags, `robots.txt`, sitemap covering static public pages + notices/events/clubs.
- AC: viewable meta on `/`, `/notices/<slug>`; sitemap lists all public URLs.

**T-10 ☐ Marketing page parity**
- Files: new routes (e.g. `/gallery`, admissions/enquiry page), gallery management via existing attachment/upload patterns
- Minimum: gallery page (admin-managed images) and an admissions CTA section pointing at the (T-8) inbox.
- AC: gallery content manageable from `/admin/content`; enrollment CTA reachable from every public page.

**T-11 ☐ Landing hero CTAs + mobile fix**
- Files: `LandingPage.tsx`, `HeroCanvas`/`useCanvasVideo` (`src/hooks`)
- Add CTA overlays (Admissions → contact, Notices, Events) once the hero is safe on mobile; add loading fallback for the 216-frame canvas and consider reduced frame counts for slow networks.
- AC: no sidebar-clipped hero at mobile widths; CTAs navigable; no LCP regression.

---

## M2 — Academic Core (schema first, then screens)

**T-12 ☐ Academic Year / Term model**
- Schema: `AcademicYear` (org, name, start, end, isActive) + `Term` (yearId, name, start, end); migrate + seed one default year/term; don't forcibly back-mutate existing data.
- AC: migration clean; a year/term switcher exists for surfaces added from here on.

**T-13 ☐ Timetable**
- Schema: `TimetableSlot` (courseId, classroomId, staffId, weekday, periodIndex, yearId) with conflict validation (no staff/room double-booking).
- UI: `/admin/timetable` weekly grid with select-based assignment (drag later), conflict warnings; permissions: extend `MANAGE_ACADEMICS` or add `MANAGE_TIMETABLE` to the catalog + migration.
- AC: overlapping staff/room slots are rejected server-side; views for later consumption exist.

**T-14 ☐ Exams, marks & report cards**
- Schema: `Exam` (termId, name, date range), `ExamSchedule` (examId, courseId, date, maxMarks, room), `Mark` (student, schedule/course, score), grade-scale config.
- Admin: exam setup + marks entry per course with diffed batch saves (attendance pattern); student/guardian: marks view + printable report card.
- AC: marks saves idempotent via unique constraint; report card renders across a term; new `MANAGE_EXAMS` permission key wired catalog → UI.

**T-15 ☐ Homework / Assignments**
- Schema: `Assignment` (courseId, title, instructions, dueAt) reusing the FileAsset/Attachment pattern (≤10 docs like clubs).
- Visibility: enrolled students + their guardians; staff create UI; student view appended to `/my-records` (or per-child subpage).
- AC: only enrolled students (and their guardians) see assignments; attachments follow the upload policy.

**T-16 ☐ Fees & finance — Phase 1 (invoices & dues)**
- Schema: `FeeStructure` (termId, grade/section, name, amount, dueDate), `Invoice` (student, term, status DRAFT/UNPAID/PARTIAL/PAID), `Payment` (invoice, amount, method, paidAt, receivedBy staff).
- Admin dues dashboard + record-payment flow; guardian invoices/receipt view (printable). No payment gateway this phase.
- AC: status transitions atomic; strict per-student scoping; new `MANAGE_FEES` permission key wired everywhere.

---

## M3 — Communication & Experience

**T-17 ☐ In-app notification center**
- Schema: `Notification` (userId, type, title, body, readAt, refType/refId).
- Trigger points: invite approved/rejected, notice published to audience, password reset confirmation, T-14 marks published.
- UI: bell in the admin/app shell + `/notifications` with mark-read; unread badge.
- AC: unread count server-resolved; all notifications created in server actions.

**T-18 ☐ Audience enforcement for notices**
- Files: `src/packages/content/*`, dashboard, possible `/notice-feed` route
- Signed-in role-filtered notice feed honoring `Notice.audience` (ALL/STUDENTS/STAFF/GUARDIANS); public site unaffected.
- AC: audience-scoped tests pass for each value.

**T-19 ☐ Dashboard upgrades**
- Files: `src/routes/dashboard.tsx`, `src/packages/admin/server.ts`
- Role cards: STUDENT (attendance %, next exam, dues), GUARDIAN (per-child digest), STAFF (today's classes + pending attendance), ADMIN (pending invites, dues, upcoming events).
- AC: data served via loaders; no admin-only content reaching student guard views.

**T-20 ☐ Staff workspace**
- New route (e.g. `/my-classes`): courses taught, today's attendance to take, my timetable (post T-13).
- AC: staff with no courses get a clean empty state; staff stop seeing the empty `/my-records`.

**T-21 ☐ Mail delivery visibility**
- Files: `mail.ts`, schema `MailLog` (recipient, subject, template, ok, sentAt), optional small admin list
- AC: failures recorded in DB, not silently dropped; template previews checked.

---

## M4 — Extended Domains (one at a time, end-to-end)
Use the domain recipe in Agents.md §6 (migration → service → server fn → route → UI → tests → docs; new permission key when a new admin surface appears).

**T-22 ☐ Library** — Book/Copy + Loan models, issue/return, dues/fines, student history. `MANAGE_LIBRARY`.
**T-23 ☐ Hostel/Boarding** — Hostel/Room/Allocation with capacity checks; guardian visibility.
**T-24 ☐ Discipline & wellbeing** — Incident log (reporter, student, severity, action, guardian-visible flag) + counseling notes.
**T-25 ☐ Health records** — per-student health records, immunization rows; guardian read-only.
**T-26 ☐ Staff HR** — LeaveType/LeaveRequest (apply/approve), staff attendance, payslip records (no payroll engine yet).
**T-27 ☐ Admissions pipeline** — public `AdmissionApplication` form (extending the T-8 inbox pattern — enquiry → stage tracking → convert to Student + invite), document attachments.
**T-28 ☐ Student documents & certificates** — StudentDocument store (FileAsset reuse), printable TC/bonafide templates.

---

## M5 — Multi-School Activation (deliberately last)

**T-29 ☐ Runtime tenant resolution**
- Resolve org from domain/slug; hydrate the (currently unused) zustand `activeSchoolId` store; school config from DB organization settings with JSON fallback; finish the hardcoded-`"everest"` sweep (`__root.tsx`, `src/lib/constants.ts` `PUBLIC_ADDRESS`, `src/store/school-store.ts`).
- Prereq: DS-5 (theme from data) must be done; relies on existing `(organizationId, branchId)` columns everywhere.
- AC: a second seeded org renders its own theme/content with no code change.

**T-30 ☐ Branch-scoped permission enforcement**
- Files: `src/packages/auth/permissions.ts` (`resolvePermissions`), `permissions-service.ts`, `/admin/permissions` UI, schema already carries `scopeKey`/`branchId`.
- AC: effective permissions honor branch context when present; `scopeKey: "global"` remains the fallback; self-lockout guard covers branch overrides.

---

## Suggested Session Sequence (for the next agent)
1. **M0 fully (T-1 → T-7)** — warm-up: tests, CI, env, dead code, authz decisions. Every task leaves the repo greener and unblocks later work.
2. **DS-1 → DS-2 → DS-3 → DS-4 → DS-5** — design-system ground floor before any new public-facing page (prevents restyling twice).
3. **T-8 → T-9 → T-10 → T-11** — website flagship slice (contact inbox + SEO + marketing parity + hero CTAs).
4. **M2 slices in schema order** — T-12 → T-13 → T-14 → T-15 → T-16, running migration + tests immediately per slice.
5. **M3, then M4 domains** one end-to-end at a time. **M5 last** — it's the riskiest and benefits from all prior discipline.
6. After every finished slice: tick checkboxes here, flip Checklist statuses, add discovered debt to PRD §5, and follow the Definition of Done in Agents.md §8.
