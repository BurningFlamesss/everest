# Merge Plan: ScMS → Everest

## Executive Summary

This plan propagates all new changes from the ScMS branch (43 models, 6 migrations, 15 commits since fork) into the Everest repo (29 models, 9 migrations, 55 commits after fork). The merge base is `423462c` (Revise README with demo link and image updates, 2026-08-24).

**Approach: structural union, not overwrite.** Everest's richer UI is preserved; ScMS's backend/domain models are grafted as additive extensions. The two repos represent *disjoint domains* (CMS/website vs school operations) that only collide on shared *type names* that mean different things. Every collision is resolved per-file with explicit evidence.

---

## 1. Schema Merge

### 1.1 Add ScMS-only models and enums (purely additive — 22 new items)

From the field-level delta report, ScMS has 22 models/enums that have NO Everest counterpart. These are all pure additions:

- `AcademicYear`, `Assignment`, `Attachment`, `AttendanceSession`, `AttendanceStatus`
- `Classroom`, `Club`, `ContactMessage`, `ContactMessageStatus`, `Course`, `Enrollment`, `EnrollmentStatus`
- `Event`, `Exam`, `ExamSchedule`, `FeeStructure`, `FileAsset`, `GalleryImage`
- `InviteRequest`, `InviteRequestStatus`, `MailLog`, `Mark`, `NoticeAudience`, `Notification`
- `Payment`, `PermissionKey`, `RolePermission`, `Term`, `TimetableSlot`
- `TransportAssignment`, `TransportDirection`, `TransportRoute`, `TransportStop`

**Action:** Add every one of these to `prisma/schema.prisma` via `prisma generate`. No existing Everest tables are affected.

### 1.2 Field-level deltas on shared models (6 models need explicit resolution)

These 6 models exist in both repos with different fields. All other shared models are IDENTICAL.

| Model | Everest-only fields | ScMS-only fields | Redefined fields (both present, different) |
|---|---|---|---|
| **AttendanceRecord** | `class, classId, date, markedAt, markedBy, personType, staff, staffId, state` | `session, sessionId, status, updatedAt` | `student, studentId` (2 fields) |
| **Branch** | `applications, classes` | `classrooms, courses, rolePermissions, transportRoutes, userPermissions` | none |
| **GuardianInvite** | `guardianEmail` | `isPrimary, relation, user, userId` | none |
| **Invoice** | `amountPaid, invoiceNo, issuedDate, items` | `feeStructure, feeStructureId, payments, termId` | `dueDate, student, studentId, term` (4 fields) |
| **InvoiceStatus** | `OVERDUE, VOID` | `DRAFT` | none |
| **Notice** | `bullets, dateAd, dateBs, issuedBy, order, pinned, ref, table` | `authorId, branchId, coverImage, expiresAt, isPublished, organizationId, publishedAt, slug` | `attachments, audience, body, category, summary` (5 fields) |

**Resolution policy (UNION + RENAME hybrid):**

**(a) AttendanceRecord → RENAME**
- Everest's `AttendanceRecord` backs the *CMS attendance* mock table. ScMS's `AttendanceRecord` (with `sessionId`, `status`) backs real Prisma attendance.
- **Verdict:** Keep Everest's `AttendanceRecord` as the CMS attendance table; add ScMS's `AttendanceSession` + ScMS's `AttendanceRecord` fields as *optional* on the merged table OR introduce a new `SessionAttendanceRecord` for ScMS's session-level attendance, leaving Everest's CMS table untouched.
- **Reconciliation:** In the merged schema, `AttendanceRecord` keeps Everest's 9 fields + `sessionId` and `status` (from ScMS) as `@@optional` columns. Everest admin pages that read `classId`, `date`, `personType, state` continue to work. ScMS attendance fns can read/write the new columns.

**(b) Invoice + InvoiceStatus → UNION + RENAME**
- Everest invoices: `studentId`, `student`, `term`, `amount`, `amountPaid`, `items`, `status` (OVERDUE/VOID).
- ScMS invoices: `studentId`, `student`, `termId`, `feeStructureId`, `feeStructure`, `amount`, `status` (DRAFT/UNPAID), `dueDate`, `payments`.
- **Verdict:** Adopt ScMS's structure as the canonical merged Invoice, with Overdue/Voided as status values inherited from Everest. Rename Everest's `InvoiceStatus` → keep `DRAFT | UNPAID | OVERDUE | VOID` as a unified enum.
- **Reconciliation:** Merged `InvoiceStatus = DRAFT | UNPAID | OVERDUE | VOID`. Merged `Invoice` adds `termId`, `feeStructureId`, `dueDate`, `payments` (all nullable). Keep Everest's `amountPaid` and `invoiceNo` as columns. Rename all importers of Everest's `InvoiceStatus` to use the unified enum.

**(c) Notice → UNION (ScMS fields grafted onto Everest Notice)**
- Everest `Notice`: `ref, title, category, dateAd, dateBs, audience, issuedBy, summary, body, bullets, table, attachments, pinned, order`.
- ScMS `Notice`: `title, slug, summary, body, category, coverImage, attachments, audience NoticeAudience, isPublished, publishedAt, expiresAt, organizationId, branchId, authorId`.
- **Verdict:** Union — keep Everest's `Notice` as canonical; add ScMS fields `slug`, `isPublished`, `publishedAt`, `coverImage`, `organizationId`, `branchId`, `authorId` as `@@optional`. Rename Everest's `ref` → keep it; add ScMS's `slug` as unique. Keep `bullets`, `table` as optional.
- **Reconciliation:** Merged `Notice` = Everest base + {`slug` @unique, `isPublished`, `publishedAt`, `coverImage`, `organizationId`, `branchId`, `authorId`}. `ref` stays. `audience` stays as String (Everest) ∪ `NoticeAudience` enum (ScMS). All existing CMS pages continue to work; ScMS admin can publish/expire/notices by branch/org.

**(d) GalleryImage/FileAsset → KEEP Album as canonical; GalleryImage is ScMS-only**
- Everest `Album`: `event, year, category, date, photos Json, order`. Used as the gallery/photo container in the public CMS.
- ScMS `GalleryImage`: `title, caption, imageUrl, sortOrder, isPublished`. Used in the admin gallery.
- **Verdict:** KEEP Everest's `Album` as the canonical gallery container; ScMS's `GalleryImage` is a *new* table that coexists. Do NOT replace Album with GalleryImage. The public gallery page renders from `Album`; the admin gallery can render from `GalleryImage` additionally.
- **Reconciliation:** Both tables exist. Admin gallery page reads from `GalleryImage`; public gallery reads from `Album`. No migration needed to drop either.

**(e) Student → UNION**
- Everest `Student`: `address, attendance, bloodGroup, city, class, classId, dateOfBirth, gender, guardianEmail, guardianName, guardianPhone, guardianRelation, houseName, nationality, phone`.
- ScMS `Student`: `attendanceRecords, enrollments, marks, transportAssignments`.
- **Verdict:** UNION — keep Everest's `Student` as canonical; add ScMS's `attendanceRecords`, `enrollments`, `marks`, `transportAssignments` as `@@relation` arrays (nullable). Everest's `classId` stays; ScMS's `branchId`/`organizationId` additions are nullable.
- **Reconciliation:** Merged `Student` = Everest base + `{attendanceRecords, enrollments, marks, transportAssignments}` (all `@@optional`). Existing student pages continue to read Everest fields; new ScMS admin features read the added fields.

### 1.3 Enums: unified status values

| Everest InvoiceStatus | ScMS InvoiceStatus | Unified |
|---|---|---|
| OVERDUE, VOID | DRAFT, UNPAID | DRAFT | UNPAID | OVERDUE | VOID |

**Action:** Single enum `InvoiceStatus = DRAFT | UNPAID | OVERDUE | VOID`.

| Everest AttendanceState | ScMS AttendanceStatus | Unified |
|---|---|---|
| PRESENT, ABSENT, LATE, EXCUSED | PRESENT, ABSENT, LATE, EXCUSED | IDENTICAL — keep as `AttendanceStatus` |

| Everest Notice audience concept | ScMS `NoticeAudience` | UNION |
|---|---|---|
| String `audience` field | Enum `NoticeAudience = ALL | CLASS | GRADE | ...` | Add the enum as `@@native("NotificationAudience")` on merged `Notice.audience`, keeping the String field for backward compat.

---

## 2. Migration Sequencing

Both histories are independent (no overlapping migration names: Everest uses `2026...` numbered, ScMS uses `20261102000000_*` dated). **No collision.**

### 2.1 Recommended: archive + single fresh migration

1. **Archive both histories:**
   - `prisma/migrations-archive/everest/` → 9 migrations (889 SQL lines)
   - `prisma/migrations-archive/scms/` → 6 migrations
   - Record the archive in `CHANGELOG.md`.

2. **Write one consolidated migration** starting from the fork point that applies ALL new columns/tables from ScMS (22 new models, all field deltas) plus any Everest-specific additions. Run `prisma migrate make consolidated` then `prisma migrate resolve --rolled-back` as needed.

3. **Run `prisma generate`** to update `src/generated/prisma`.

**Alternative (interleaved):** Possible but risky — the two histories touch different tables but share `Branch`, `Guardian`, `User`, `Role`, `Session` models. The interleaved approach would require careful `@@index`/@@unique conflict resolution. **Prefer the archive+single-migration approach.**

### 2.2 Generated prisma status

- Everest: `src/generated/prisma/` is **COMMITTED** in git (37 files). Must be regenerated after merge.
- ScMS: `src/generated/prisma/` is also committed. After merge, delete both and run `prisma generate` once.

---

## 3. Permission-System Unification

### 3.1 Everest's 35 dotted permission keys

*(Read from `src/lib/permissions.ts` — omitted here for brevity but systematically mapped to ScMS's MANAGE_* keys.)*

### 3.2 ScMS's 12 `PermissionKey` enum values

```
MANAGE_DASHBOARD, MANAGE_INVITES, MANAGE_DIRECTORY, MANAGE_CONTENT,
MANAGE_ACADEMICS, MANAGE_ATTENDANCE, MANAGE_TRANSPORT, MANAGE_PERMISSIONS,
MANAGE_INBOX, MANAGE_TIMETABLE, MANAGE_EXAMS, MANAGE_FEES
```

### 3.3 Proposed mapping (dotted → MANAGE_*)

Every Everest dotted key maps to a ScMS `MANAGE_*` key where a functional equivalent exists. Keys with NO ScMS equivalent are flagged.

| Everest Dotted Key | MANAGE_* Equivalent | Status |
|---|---|---|
| `dashboard.view` | `MANAGE_DASHBOARD` | ✅ mapped |
| `attendance.view` | `MANAGE_ATTENDANCE` | ✅ mapped |
| `gallery.view` | *no direct equivalent* | ⚠️ flagged — `MANAGE_CONTENT` may cover it |
| `notices.view` | `MANAGE_CONTENT` | ✅ mapped |
| `events.view` | `MANAGE_CONTENT` | ✅ mapped |
| `clubs.view` | `MANAGE_CONTENT` | ✅ mapped |
| `facilities.view` | `MANAGE_CONTENT` | ✅ mapped |
| `timetable.view` | `MANAGE_TIMETABLE` | ✅ mapped |
| `exams.view` | `MANAGE_EXAMS` | ✅ mapped |
| `fees.view` | `MANAGE_FEES` | ✅ mapped |
| `transport.view` | `MANAGE_TRANSPORT` | ✅ mapped |
| `inbox.view` | `MANAGE_INBOX` | ✅ mapped |
| `overview.view` | *no direct equivalent* | ⚠️ flagged — maps to dashboard |
| `settings.view` | `MANAGE_PERMISSIONS` (partial) | ⚠️ flagged |
| ... (35 total, ~27 map cleanly, ~8 need "no equivalent" flag) |

### 3.4 Role definition differences

- **Everest:** Roles are implicit via dotted keys checked in `AuthProvider.can()` and nav-config.
- **ScMS:** Explicit `RolePermission` junction table linking `Role` ↔ `PermissionKey` ↔ `scopeKey`.

**Resolution:** After merge, Everest's role-checking logic is replaced by the `UserPermission`/`RolePermission` pattern from ScMS. The 35 dotted keys become derived: each is checked against `context.viewer.permissions` (the ScMS-shaped viewer). A bridge utility converts dotted-key checks to `permissions.includes("MANAGE_X")` calls, or better: the admin routes adopt ScMS's `context.viewer.permissions` guard (see §4).

### 3.5 `context.viewer` shape

**ScMS produces:** `getViewerFn()` returns `{ viewer: { permissions: PermissionKey[]; isManagement: (key: PermissionKey) => boolean; unreadNotifications: number } }` (from `src/packages/auth/server/get-viewer.fn.ts`).

**Everest currently produces:** `getSessionFn` → session from better-auth; no `viewer.permissions` or `isManagement` guard.

**Resolution for merged admin routes (§4):** Adopt ScMS's `getViewerFn` pattern. The merged `admin.tsx` beforeLoad uses `getViewerFn()` and guards with `!viewer.isManagement("MANAGE_ATTENDANCE")`. Everest's existing admin routes (6-line wrappers) are rewritten to use this guard.

### 3.6 `scms_demo_session` removal

Three references exist:
1. `src/providers/AuthProvider.tsx:37` — `document.cookie = "scms_demo_session=; path=/; max-age=0;";`
2. `src/lib/auth.ts:38` — `cookieHeader.match(/scms_demo_session=([^;]+)/);`
3. `src/packages/auth/middleware/auth.middleware.ts:20` — same regex fallback.

**Action:**
- Remove the cookie-read fallback from `auth.middleware.ts` (lines 18-37). The middleware now only calls `auth.api.getSession({ headers })`.
- In `AuthProvider.tsx`, remove the `document.cookie` line (or leave it as dead code — it will never execute since the middleware no longer reads it).
- In `lib/auth.ts`, remove the `scms_demo_session` regex match (or mark as unused).
- **Impact:** `/login` redirect target must resolve without the cookie fallback. Everest's login redirects to `/admin/overview` for admin, `/user` otherwise. Verify these paths exist post-merge.

---

## 4. Admin-Page Replacement Plan

### 4.1 Route inventory: Everest vs ScMS

| Route | Everest shape | ScMS shape |
|---|---|---|
| `/admin` | `AdminShell` wrapper, `beforeLoad` only checks `session` | Full page with `MANAGE_DASHBOARD` guard |
| `/admin/attendance` | 6-line `createFileRoute` → `AttendancePage` (mock-backed) | Full 100+ line page with `beforeLoad: MANAGE_ATTENDANCE` guard + real server fns |
| `/admin/classes` | 6-line wrapper → `ClassesPage` | No direct counterpart (academics-only) |
| `/admin/courses` | 6-line wrapper → `CoursesPage` | Full page with `MANAGE_COURSES` (via MANAGE_ACADEMICS) |
| `/admin/events` | 6-line wrapper → `EventsPage` | Full page with `MANAGE_EVENTS` guard |
| `/admin/notices` | 6-line wrapper → `NoticesPage` | Full page with `MANAGE_CONTENT` guard + notices server fn |
| `/admin/gallery` | 6-line wrapper → `GalleryPage` | Full page with `MANAGE_GALLERY` guard + gallery server fns |
| `/admin/transportation` | 6-line wrapper → `TransportationPage` | Full page with `MANAGE_TRANSPORT` guard |
| `/admin/payments` | 6-line wrapper → `PaymentsPage` | Full page with `MANAGE_FEES` guard |
| `/admin/staff` | 6-line wrapper → `StaffPage` | Full page with `MANAGE_STAFF` (via MANAGE_ACADEMICS) |
| `/admin/students` | 6-line wrapper → `StudentsPage` | Full page with `MANAGE_STUDENTS` |
| `/admin/users` | 6-line wrapper → `UsersPage` | No direct counterpart |
| `/admin/overview` | 6-line wrapper → `OverviewPage` | No direct counterpart |
| `/admin/facilities` | 6-line wrapper → `FacilitiesPage` | No direct counterpart |
| `/admin/results` | 6-line wrapper → `ResultsPage` | No direct counterpart |
| `/admin/scholarships` | 6-line wrapper → `ScholarshipsPage` | No direct counterpart |
| `/admin/settings` | 6-line wrapper → `SettingsPage` | No direct counterpart |
| `/admin/admissions` | 6-line wrapper → `AdmissionsPage` | No direct counterpart |

### 4.2 Domain-by-domain verdicts

For each domain present in **both** repos:

| Domain | Everest backend (mock/DB) | ScMS backend (server fn + Prisma) | Verdict |
|---|---|---|---|
| **attendance** | `src/lib/db.ts` mock collection + `src/mock/seed.ts` | `src/packages/attendance/server.ts` + Prisma `AttendanceSession` + `AttendanceRecord` | **REPLACE** — ScMS full page wins. Replace Everest's 6-line wrapper with ScMS page body, restyled into Everest's `AdminShell`. Keep `context.viewer.permissions` guard. |
| **classes** | Mock + seed | No ScMS counterpart (academics course sections exist) | **KEEP EVEREST** — but add ScMS-like features (timetable slots, classroom assignments) as optional extensions. |
| **courses** | Mock + seed | `src/packages/academics/courses/server.ts` + Prisma `Course` | **REPLACE** — ScMS full page with `MANAGE_ACADEMICS` guard replaces Everest wrapper. |
| **gallery** | `Album` table in Prisma + mock UI | `GalleryImage` table + `FileAsset` + upload fns | **KEEP ALBUM** (Everest canonical); add ScMS `GalleryImage` as coexisting table. Admin gallery reads from `GalleryImage`; public gallery reads from `Album`. |
| **notices** | `Notice` table + `src/mock/seed.ts` | `Notice` table + `src/packages/content/server.ts` + `isPublished, publishedAt` | **UNION** — merged `Notice` with ScMS `isPublished/publishedAt` added. Everest notices page restyled to show publish button. |
| **events** | `CalendarEvent` table + mock UI | `Event` table + `startsAt, endsAt, isPublished, publishedAt` | **UNION** — merged `CalendarEvent`/`Event` with ScMS fields. Admin events page shows publish scheduling. |
| **staff** | Mock + seed | `Staff` table + `src/packages/people/server.ts` + `courses, marksEntered, paymentsReceived, timetableSlots` | **REPLACE** — ScMS full admin page + `MANAGE_ACADEMICS` guard. |
| **students** | Mock + seed | `Student` + `attendanceRecords, enrollments, marks, transportAssignments` | **UNION** — merged `Student` (§1.3e). Admin page replaces Everest wrapper. |
| **transportation** | Mock + seed (bus routes, drivers) | `TransportRoute, TransportStop, TransportAssignment` + `MANAGE_TRANSPORT` | **REPLACE** — ScMS full page replaces Everest wrapper. |
| **payments** | Mock + seed (invoices) | `Invoice, Payment` + `feeStructure, termId, dueDate, payments` | **UNION + RENAME** (Invoice/InvoiceStatus §1.2b). Admin page replaces Everest wrapper with ScMS structure. |
| **users** | Mock + seed (auth users) | `User` + `permissions, guardianInvites, reviewedInviteRequests` | **REPLACE** — ScMS admin page for user management. |

### 4.3 ScMS-only admin pages (no Everest counterpart)

These pages exist in ScMS but Everest has no counterpart. After merge, they become new admin features. Each needs:
- The `MANAGE_*` permission added to the merged nav-config
- A route registered under `/admin/` (or a new section)
- Server fns that may need to be ported from ScMS `src/packages/*/server.ts`

| Page | Permissions needed | Server fns |
|---|---|---|
| `academics/` | `MANAGE_ACADEMICS` | academics/{calendar,exams,homework,timetable}-server.ts |
| `calendar` | `MANAGE_TIMETABLE` | timetable-server.ts |
| `content` | `MANAGE_CONTENT` | content/server.ts |
| `directory` | `MANAGE_DIRECTORY` | people/directory-service.ts |
| `exams` | `MANAGE_EXAMS` | exams-server.ts |
| `fees` | `MANAGE_FEES` | fees-server.ts |
| `homework` | `MANAGE_CONTENT` | homework-server.ts |
| `inbox` | `MANAGE_INBOX` | notifications/mail-server.ts |
| `invites` | `MANAGE_INVITES` | invite/server/{activate-invite, get-invite}.ts |
| `mail` | `MANAGE_CONTENT` | notifications/mail-server.ts |
| `permissions` | `MANAGE_PERMISSIONS` | auth/permissions-server.ts |
| `timetable` | `MANAGE_TIMETABLE` | timetable-server.ts |
| `transport` | `MANAGE_TRANSPORT` | transport/server.ts |

### 4.4 Everest-only admin pages (no ScMS counterpart)

These pages currently work off Everest's mock layer. After the mock layer is retired (see §5), they will need new backends — **or** they keep working if the mock layer is preserved.

| Page | Current backend | Post-merge status |
|---|---|---|
| `activity` | `src/lib/db.ts` mock | **Keep mock** or port to new DB-backed fn |
| `admissions` | `src/lib/db.ts` mock | **Keep mock** (admissions inquiries) |
| `facilities` | `src/lib/db.ts` mock | **Keep mock** + add `Facility` from ScMS |
| `faculty` | `src/lib/db.ts` mock | **Keep mock** (faculty directory) |
| `overview` | `src/lib/db.ts` mock + hardcoded | **Keep as static/dashboard** |
| `resources` | `src/lib/db.ts` mock | **Keep mock** |
| `results` | `src/lib/db.ts` mock | **Keep mock** or integrate with `Grade`/`Report` from ScMS |
| `scholarships` | `src/lib/db.ts` mock | **Keep mock** or integrate with `Scholarship` from ScMS |
| `settings` | `src/lib/db.ts` mock | **Keep mock** or merge with ScMS org config |
| `website` | hardcoded + `WebsitePage` table | **Keep as CMS-driven** via `WebsitePage` |

### 4.5 Shared UI components to port

ScMS admin pages import these UI components that may not exist in Everest:

| Component | ScMS location | Everest equivalent | Action |
|---|---|---|---|
| `ImportWizard` | `components/imports/ImportWizard.tsx` | *none* | Port to Everest `components/ui/import-wizard` or adapt Everest's csv importer pattern. |
| `StudentSearchInput` | `components/people/StudentSearchInput.tsx` | *none* | Port; Everest has no student search in admin. |
| `ImageUploadField` | `components/content/ImageUploadField.tsx` | `components/ui` has file inputs | Adapt Everest's file upload pattern. |
| `AttachmentUploadField` | `components/content/AttachmentUploadField.tsx` | *none* | Port. |
| `ui/field.tsx` | `scms/components/ui/field.tsx` | Everest `components/ui` has full shadcn set | Replace imports; Everest's `field.tsx` wins. |

All 16 ScMS-only admin-page UI components can be ported without collision since only 30 of 79 `#/` paths collide (the other 49 are ScMS-only).

---

## 5. Mock Layer Retirement

Everest's entire backend is currently a localStorage mock (`src/lib/db.ts` 144 lines, `src/mock/seed.ts` 1519 lines, `src/services/*.ts` 6133 lines). ScMS has real Prisma-backed server functions.

### 5.1 Retirement strategy

**Phase 1 (merge):** Keep Everest's mock layer entirely intact. All existing Everest admin pages continue to work off `src/lib/db.ts`.

**Phase 2 (post-merge, next sprint):** Gradually replace mock-backed pages with ScMS's real server fns:
- Start with the replaced domains (§4.2: attendance, courses, staff, transportation, payments).
- For each replaced page, delete the `src/services/*` import and import the real ScMS server fn (adapted path: `#/packages/academics/courses/server` etc.).
- Run `prisma generate` after each batch.
- After all replaced pages are migrated, delete `src/mock/seed.ts` and `src/lib/db.ts`.

**Phase 2 fallback:** If the user prefers to keep the mock layer indefinitely, that is a valid configuration choice. The merge plan only *requires* retirement if new ScMS-backed features are added that the mock cannot satisfy.

### 5.2 Pages that WOULD lose backend if mock retired

If the mock layer IS retired (not optional), these Everest admin pages would have NO backend:

- `activity` — no ScMS counterpart; would need a new DB model.
- `admissions` — no ScMS counterpart; would need new `AdmissionApplication` model.
- `facilities` — could use ScMS `Facility` model + fields.
- `faculty` — could use ScMS `Staff` model (but different shape).
- `overview` — hardcoded; would need new DB queries.
- `resources` — no ScMS counterpart.
- `results` — could integrate with `Grade`/`Report` concepts.
- `scholarships` — could integrate with ScMS `Scholarship` model.
- `settings` — could merge with ScMS org config.

**Recommendation:** Preserve the mock layer as a "compat shim" for these pages. The merge does NOT require retiring it.

---

## 6. Route & File Relocation

### 6.1 Public pages: Everest wins URL collisions

| ScMS path | Everest path | Verdict |
|---|---|---|
| `scms/src/routes/index.tsx` | `everest/src/routes/_public/index.tsx` | **Everest wins** — CMS-prop-wired; ScMS index.tsx dropped. |
| `scms/src/routes/about.tsx` | `everest/src/routes/_public/about.tsx` | **Everest wins**. |
| `scms/src/routes/contact.tsx` | `everest/src/routes/_public/contact.tsx` | **Everest wins**. |
| `scms/src/routes/gallery.tsx` | `everest/src/routes/_public/gallery.tsx` | **Everest wins** — Album table is canonical. |
| `scms/src/routes/_onboard/login.tsx` | `everest/src/routes/login.tsx` | **Everest wins** — real better-auth flow. |
| `scms/src/routes/_onboard/signup.tsx` | `everest/src/routes/_onboard/signup.tsx` | **PORT** — move signup form into _onboard, strip AuthShell, render via PageShell. |
| `scms/src/routes/_onboard/forgot-password.tsx` | `everest/src/routes/_onboard/forgot-password.tsx` | **PORT** — same pattern. |
| `scms/src/routes/_onboard/reset-password.tsx` | `everest/src/routes/_onboard/reset-password.tsx` | **PORT** — same pattern. |
| `scms/src/routes/index.tsx` (root) | **Delete** — never referenced by routeTree. | **DELETE**. |
| `scms/src/routes/-admin.tsx` (dead) | **Delete** — never referenced. | **DELETE**. |

### 6.2 Admin routes: ScMS pages replace Everest wrappers

For every domain in both repos, the Everest 6-line wrapper is replaced by the ScMS full page, restyled into Everest's `AdminShell`:

```
Everest:  createFileRoute("/admin/attendance")({ component: AttendancePage })
→
ScMS:     createFileRoute("/admin/attendance")({ 
  component: AdminAttendance, 
  beforeLoad: ({context}) => { if (!context.viewer.permissions.includes("MANAGE_ATTENDANCE")) throw redirect({to:"/user"}); }
})
```

The ScMS page component is moved to `src/routes/admin/attendance.tsx` (overwriting the Everest wrapper) and its `beforeLoad` guard uses `context.viewer.permissions` (the unified shape from §3.5).

### 6.3 New public pages from ScMS

Add these under `src/routes/_public/` (Everest's public layout), using Everest's `getSchoolContentServer` loader:

- `/_public/admissions.tsx` — thin wrapper using `getSchoolContent` with `identifier: "everest"` + admissions data from merged `Notice`/`ContentBlock`.
- `/_public/clubs.tsx` — clubs listing from `Event` + `Club` tables.
- `/_public/events.index.tsx` — list of published `Event` entries.
- `/_public/events.$slug.tsx` — single event page.
- `/_public/notices.$slug.tsx` — single notice page (using merged `Notice` with `slug`).
- `/_public/calendar.index.tsx` — calendar events from `CalendarEvent`.
- `/_public/calendar.$slug.tsx` — single calendar event.

These keep Everest's `_public.tsx` layout (AuthProvider + Sidebar + PageShell) and CMS wiring.

### 6.4 Dead file deletion

- `src/routes/-admin.tsx` — never referenced by `routeTree.gen.ts`. Delete after merge.
- `scms/src/routes/index.tsx` — dead ScMS root. Delete.
- Any orphaned `scms/` imports that no longer resolve.

---

## 7. Config.json Identity Question (explicit product decision)

Two different schools are described:

| | Everest | ScMS |
|---|---|---|
| **Name** | Everest English Boarding Secondary School | Everest English Boarding Higher Secondary School |
| **Location** | Pokhara, Nepal | Butwal, Rupandehi, Nepal |
| **Phone** | +977 61 521884 | +977 71 540 000 |
| **Email** | office@everestpokhara.edu.np | everestbutwal@gmail.com |
| **Theme** | `#d32f2f` (red) | `#ef4444` (red accent), `#facc15` (accent), `#f6f1e8` (bg), `#f87171` (sidebar) |
| **Short name** | (none) | `Everest` |
| **Tagline** | (none) | `Established in purpose. Contemporary in outlook.` |
| **Address** | (none) | Butwal, Rupandehi, Nepal |
| **Hours** | (none) | Sun–Thu 9:00–16:00 / Fri 9:00–13:00 / Sat Closed |
| **Map image** | (none) | `/map.png` |
| **Socials** | (none) | Facebook + Instagram |
| **SEO ogImage** | `/schools/everest/logo.png` | `/schools/everest/logo.png` |

### 7.1 Recommended resolution

**Keep Everest's identity as the canonical base**, and **union ScMS's structural keys as optional fields**.

**Action:** Edit `/home/flame/Desktop/everest/src/schools/everest/config.json` to add these optional fields:

```json
{
  "shortName": "Everest",
  "tagline": "Established in purpose. Contemporary in outlook.",
  "address": "Butwal, Rupandehi, Nepal",
  "theme": {
    "primary": "#ef4444",
    "accent": "#facc15",
    "background": "#f6f1e8",
    "sidebar": "#f87171"
  },
  "contact": {
    "phone": "+977 71 540 000",
    "email": "everestbutwal@gmail.com",
    "hours": ["Sun–Thu 9:00–16:00", "Fri 9:00–13:00", "Sat Closed"]
  },
  "mapImage": "/map.png",
  "socials": ["facebook", "instagram"],
  "seo": {
    "ogImage": "/schools/everest/logo.png"
  }
}
```

Everest's existing values (Pokhara phone, red theme `#d32f2f`, office@ email) stay as-is. The ScMS keys are added as optional — if the user later wants to switch the school identity to Butwal, they can flip the base values; if they want to keep Pokhara, the ScMS fields are there but dormant.

---

## 8. Package.json & Vite/Nitro Config Union

### 8.1 Dependency union

| Package | Everest | ScMS | Recommendation |
|---|---|---|---|
| `@tanstack/*` | latest | latest | Keep everest "latest" (both on same pins). |
| `prisma` | `^7.10.0` | `^7.10.1` | Prefer ScMS pin `7.10.1`. |
| `better-auth` | `^1.6.13` | `1.7.15` | Union: keep Everest `^1.6.13` as dev dep; add ScMS `1.7.15` as prod (ScMS actually uses v1.7 features). |
| `zod` | `^4.4.3` | `4.6.7` | Prefer ScMS `4.6.7` ( stricter). |
| `vite` | `^8.0.0` | `8.1.6` | Keep Everest `^8.0.0`; ScMS `8.1.6` is compatible. |
| `@tailwindcss/typography` | `0.5.16` | `0.5.20` | **CRITICAL:** Everest has `overrides` block → `postcss-selector-parser 6.1.5`. Keep Everest's override; ScMS typography can stay as-is since it's only used in ScMS pages being ported. |
| `@aws-sdk/client-s3` | not present | `3.1161.0` | Add to Everest if S3 storage needed; otherwise optional. |
| `nodemailer` | `^9.0.3` | `10.3.1` | Union: keep Everest `^9.0.3`; add ScMS `10.3.1` as optional. |
| `react-start` | `1.168.60` | `1.168.60` | Identical. |
| `router-plugin` | `1.168.42` | `1.168.42` | Identical. |
| `router-cli` | `1.167.40` | `1.167.40` | Identical. |
| `playwright` | not in scripts | `^1.64.1` | Add if e2e tests needed. |

**Script union:** Keep Everest's dev/generate-routes/build/preview/test scripts. Add ScMS's scripts: `test:integration`, `test:e2e`, `db:migrate:deploy`, `db:migrate:status`. Do NOT overwrite Everest's post-cta-init script.

### 8.2 Vite config union

- **Everest:** `nitro({preset:'vercel'})`, `ssr.external: [/^@sentry\//]`
- **ScMS:** `nitro({rolloutConfig:{external:[/^@sentry\//]]})`

**Union:** Keep Everest's `nitro({preset:'vercel'})` (verified working). Add ScMS's nitro `external` array as an additional external array (or merge if both have sentry). The `ssr.external` stays Everest.

**Biome merge:** Everest's `biome.json` has includes config; ScMS has its own. Merge by adding ScMS's include paths into Everest's config.

### 8.3 tsconfig path aliases

- Everest: `#/*`, `#lib/*`, `#content/*`, `#types/*`, `#templates/*`, `@/*`
- ScMS: `#/*`, `@/*`

**Action:** Everest's aliases are a superset. ScMS's `@/*` alias needs to be added if any ScMS import using `@/` is ported into Everest. Verify: the 30 collision paths already exist in Everest, and ScMS's `@/` imports that don't collide (the 49 clean ones) would need `@/` added to tsconfig if ported. **Recommendation:** Add `@/*` to Everest's tsconfig as an optional alias — it's a no-op if never used, and enables porting ScMS-only paths later without a tsconfig change.

---

## 9. Sitemap & Robots Update

After `tsr generate`, update:

- `scms/src/routes/sitemap[.]xml.ts`: update `staticPaths` to `[ "/", "/about", "/contact", "/notices", "/events", "/clubs", "/gallery", "/admissions" ]` (Everest's real public URLs).
- `scms/src/routes/robots[.]txt.ts`: same paths + `/signup`, `/forgot-password`, `/reset-password` (now that those are ported to _onboard).
- Everest's own sitemap/robots (if any) unchanged — Everest already uses its own URLs.

---

## 10. Summary Checklist (what to execute)

### Phase 1 — Schema (do first, before any file moves)

- [ ] Run `/tmp/schema-delta.py` output to add 22 ScMS-only models/enums to merged `prisma/schema.prisma`.
- [ ] Resolve 6 field-delta models per the UNION/RENAME policy (AttendanceRecord → add sessionId/status columns; Invoice → unified status + new columns; Notice → add slug/isPublished/publishedAt/coverImage/organizationId/branchId/authorId; GalleryImage coexists with Album; Student → add attendanceRecords/enrollments/marks/transportAssignments; InvoiceStatus → unified DRAFT|UNPAID|OVERDUE|VOID).
- [ ] Run `prisma generate` to regenerate `src/generated/prisma`.
- [ ] Archive old migrations: `prisma/migrations-archive/everest/` and `prisma/migrations-archive/scms/`.
- [ ] Write one consolidated migration from the fork point.

### Phase 2 — Auth & permissions

- [ ] Remove `scms_demo_session` fallback from `src/packages/auth/middleware/auth.middleware.ts` (lines 18-37).
- [ ] Remove `scms_demo_session` reference from `src/providers/AuthProvider.tsx` line 37.
- [ ] Remove `scms_demo_session` regex from `src/lib/auth.ts` line 38 (or mark unused).
- [ ] Update `src/routes/admin.tsx` beforeLoad to use `getViewerFn()` + `viewer.isManagement()` guard (ScMS pattern).
- [ ] Map Everest's 35 dotted keys to `MANAGE_*` — add bridge utilities if needed.
- [ ] Verify Everest login redirect targets (/admin/overview / /user) work without the demo cookie fallback.

### Phase 3 — Admin routes & pages

- [ ] For each domain in both repos (attendance, courses, gallery, notices, events, staff, students, transportation, payments):
  - Replace Everest's 6-line wrapper with ScMS full page, restyled into AdminShell.
  - Keep `context.viewer.permissions` guard.
  - Adapt permission keys for the merged tree (dotted → MANAGE_* mapping).
- [ ] Add new public pages under `src/routes/_public/` (admissions, clubs, events.index, events.$slug, notices.$slug, calendar.index, calendar.$slug).
- [ ] Port ScMS admin UI components: ImportWizard, StudentSearchInput, ImageUploadField, AttachmentUploadField.
- [ ] Delete `src/routes/-admin.tsx` (dead).
- [ ] Delete `scms/src/routes/index.tsx` and `scms/src/routes/-admin.tsx` (if not already handled).

### Phase 4 — Config & infra

- [ ] Edit `src/schools/everest/config.json` — add ScMS optional fields (shortName, tagline, address, theme tokens, contact details, socials, seo.ogImage).
- [ ] Merge package.json: keep Everest deps/scripts, add ScMS backend/test deps.
- [ ] Merge vite.config.ts: Everest nitro preset + merge nitro externals.
- [ ] Merge biome.json: add ScMS includes into Everest config.
- [ ] Add `@/*` to tsconfig paths if not present (optional, enables ScMS `@/` imports).
- [ ] Update sitemap and robots after `tsr generate`.

### Phase 5 — Verification

- [ ] `npm run generate-routes` (tsr generate) — verify no errors.
- [ ] `npx tsc --noEmit` — compare tsc error count against the ~399-error baseline (exclude 415 noise errors from root tsconfig picking up scms/). Must not INCREASE.
- [ ] `npx biome check --write` — verify biome passes.
- [ ] `npm run build` — verify Vite build succeeds.
- [ ] `npm test` — verify Vitest passes (ScMS Vitest config may need merging).
- [ ] Run the app: `npm run dev` — verify public pages load, admin routes render (with proper permission gating), auth flows work without `scms_demo_session`.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Public page breakage** from routeTree regen | Medium | High (user-facing) | Always regenerate via `tsr generate`, never hand-merge `routeTree.gen.ts`. Keep Everest's `_public.tsx` layout intact. |
| **Admin page permission gaps** after vocab unification | Medium | Medium | Test every admin route with each `MANAGE_*` permission; verify redirect targets (/user vs /dashboard). |
| **Invoice/Notice data loss** during UNION | Medium | High | Run seeded migration on a copy of the DB first; verify existing records are readable after column additions. |
| **GalleryImage vs Album conflict** | Low | Medium | Explicit decision: keep Album canonical, add GalleryImage as coexisting table. Update admin gallery page to read from `GalleryImage`; public gallery reads from `Album`. |
| **Mock layer retirement timing** | Low | Medium | Keep mock layer as compat shim; phase out in a separate sprint if needed. |
| **Config.json identity collision** (Pokhara vs Butwal) | Medium | Medium (product, not technical) | Explicit user decision: keep Everest base + optional ScMS fields. Do NOT overwrite Everest values. |
| **Package.json dep conflicts** (overrides block) | Low | Medium | Keep Everest's `overrides` block for `@tailwindcss/typography`; do not remove it. |
| **Sentry external conflict** | Low | Low | Both have `/^@sentry\//`; merge by concatenating arrays. |

---

## 12. Final verification script (run last)

```bash
cd /home/flame/Desktop/everest

# 1. Schema + generate
npx prisma generate

# 2. Route generation
npm run generate-routes   # or: npx @tanstack/router-cli generate

# 3. Type check against baseline
npx tsc --noEmit 2>&1 | grep -v 'scms/' | wc -l   # should be ~399 or fewer (not more than pre-merge baseline)

# 4. Lint + format
npx biome check --write
npx vite build

# 5. Smoke test
npm run dev   # verify app opens; test public pages; login; try admin routes (should redirect if not authorized)
```