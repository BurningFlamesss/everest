# Architecture — ScMS

How the system fits together today, the conventions that keep it coherent, and the architectural direction for what's coming. Companion docs: [PRD.md](./PRD.md) · [Checklist.md](./Checklist.md) · [Design-system.md](./Design-system.md) · [Tasks.md](./Tasks.md).

## 1. Stack
| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (Nitro SSR) + TanStack Router (file-based, `tsr generate`) + React 19 w/ React Compiler |
| Styling | Tailwind CSS v4 (`src/styles.css`, `@theme inline`), `tw-animate-css`, `@tailwindcss/typography` |
| DB | PostgreSQL 17 + Prisma 7 (`@prisma/adapter-pg`; output `src/generated/prisma`) |
| Auth | Better Auth 1.7.15 (`tanstackStartCookies` plugin only; custom RBAC on top) |
| Validation | Zod 4 via `.validator()` on every server fn; env via `@t3-oss/env-core` (`src/env/{server,client}.ts`, exit-on-invalid) |
| Mail | Nodemailer (Gmail SMTP hardcode, graceful fallback) |
| Storage | Pluggable drivers: `LocalStorageDriver` (`.data/uploads`) / `S3StorageDriver` (`@aws-sdk/client-s3`, MinIO-compatible, region discovery) |
| Client state | Zustand + immer (`src/store/school-store.ts`, currently unused); TanStack Query provider wired but unused |
| Motion | GSAP (+ScrollTrigger) on the landing hero; Lenis provider **built but disabled** |
| Tooling | Biome (format+lint, tabs/double-quotes), Vitest (unit + integration), Playwright (Chromium), Docker (node:22-bookworm-slim, non-root) |

Path alias: `#/*` → `./src/*` (also `@/*` via tsconfig/vite).

## 2. Request flow
```
Route file (src/routes/**)
  ├─ beforeLoad → getSessionFn / getViewerFn   (auth gate, router-context: session, viewer{role, permissions, isManagement})
  ├─ loader: getXFn(...)                        (SSR data read; public data loaders must not require session)
  └─ component: handlers call *Action(...)      (mutations via createServerFn, then re-call loaders / local setCull)
        ↓
        zigzag boundary — server-only modules under src/packages/** (prisma, auth secrets never shipped to client)
```
HTTP routes are reserved for things that can't be typed server functions: `api/auth/$` (Better Auth catch-all), `api/uploads` (FormData POST), `api/cron/cleanup`, `uploads/$` (file serving).

## 3. Domain packages (`src/packages/`)
| Package | Contents |
| --- | --- |
| `auth` | `auth.ts` (Better Auth config + hooks), `auth-client.ts`, `permissions.ts` (catalog + pure `resolvePermissions`), `permissions-service.ts` (paged admin queries), `permissions-server.ts`, `middleware/auth.middleware.ts`, `server/{viewer,get-invite,activate-invite,get-guardian-invite,activate-guardian-invite,create-invite(legacy)}.ts` |
| `invite` | `server.ts` (staff/student/guardian invites, CSV import, directory list, revoke), `requests-server.ts` + `requests-service.ts` (public request queue w/ advisory locks, approve/reject), `invite-service.ts` |
| `content` | `content-service.ts` (slugify + persistence), `server.ts` (public `getNoticesFn/…` + admin `*Action` CRUD, orphan assets action) |
| `academics`, `attendance`, `transport` | `service.ts` + `server.ts` per domain (enrolment batch writes, diffed attendance saves with SQL-side summaries, transport CRUD) |
| `people` | `server.ts` (shared student search), `directory-service.ts` (paginated directory) |
| `records` | `service.ts` + `server.ts` → `getMyRecordsFn` (server-resolves own student/guardian children; accepts no client-supplied ids) |
| `admin` | `server.ts` → `getAdminStatsFn` |
| `notifications` | `mail.ts` (never throws; template `renderMailTemplate`) |
| `storage` | `index.ts` (driver singleton), `local.ts`, `s3.ts`, `policy.ts`, `cleanup.ts` (orphan sweep) |
| `csv` | papaparse pipeline (parse → normalize → preview) powering ImportWizard |
| `school` | `loader/hook` — `import.meta.glob` over `src/schools/*/config.json|content.json`; **hardcoded to `"everest"`** in `__root.tsx` |

## 4. Data model (26 models / `prisma/schema.prisma`)
- **Auth**: `User`, `Session`, `Account` (credential password hash), `Verification`
- **Tenancy**: `Organization` → `Branch` (single tenant in practice)
- **People**: `Student` (1:1 user; admissionNo/rollNo/grade/section/status), `Staff` (designation required; teaches courses, takes attendance), `Guardian`, `GuardianStudent` (relation, isPrimary)
- **Access**: `UserRole` (unique per user+org+role), `Invite` / `GuardianInvite` (7-day tokens), `InviteRequest` (PENDING→APPROVED/REJECTED w/ reviewNote), `UserPermission` / `RolePermission` (granted flag; `scopeKey`+`branchId` columns present, unused in logic)
- **Content**: `Notice` (audience + publish window), `Event`, `Club`, `FileAsset` (unique key), `Attachment` (join to notice/event/club)
- **Academics**: `Classroom`, `Course` (code unique, teacher/room SetNull), `Enrollment` (unique course+student)
- **Attendance**: `AttendanceSession` (unique course+date, takenBy staff), `AttendanceRecord` (unique session+student)
- **Transport**: `TransportRoute`, `TransportStop` (ordered, times, latlng), `TransportAssignment` (unique student+route+direction, active window)

Conventions: composite `@@unique` for idempotency & upsert safety; FKs cascade on tenant/people deletes, `SetNull` where teachers/files/accounts may vanish; indexes for the (org, branch) + publish-window queries.

## 5. Key flows
**Invitement:** admin/CSV/create action → pre-provisioned inactive `User` (+profile row+`UserRole`) + open invite token (7 days) → email link → `/activate/$token` sets credential password + `activatedAt`, marks used, client then `signIn.email`. Public `/signup` only enqueues `InviteRequest`.

**Permission resolution:** `getViewerFn` one query joins user roles + `UserPermission` rows; merges hard-coded defaults with `RolePermission` DB overrides via pure `resolvePermissions`; priority SUPERADMIN→ADMIN→STAFF→STUDENT→GUARDIAN; `isManagement` = any permission granted. Guard helpers: `requirePermission`, `hasAnyRole`, self-lockout guard on `MANAGE_PERMISSIONS`.

**Uploads:** client widget → `POST /api/uploads` (session + `MANAGE_CONTENT`, policy by MIME/size) → driver.put → `FileAsset` row (**rollback object on DB failure**) → referenced via `Attachment` FKs or coverImage URLs. Cleanup sweep (admin action or cron) deletes assets unreferenced for >24 h, storage-first, retry-safe.

**Email matrix:** verify / forgot-reset / duplicate-signup notice / invite / request→admin / request-approved / request-rejected. All skip silently when `MAIL_APP_USER/PASSWORD` unset.

## 6. Multi-school scaffolding (future)
`src/schools/<slug>/{config,content}.json` + `src/templates/modern/*` + zustand `activeSchoolId` were built for multi-tenant theming; the running app pins `"everest"`. Any multi-tenant work should convert JSON configs into DB-backed `Organization` settings, keep `src/templates/*` as the theme layer, and drive `useSchoolConfig()` from a server loader with org scope (see Tasks M5).

## 7. Testing strategy
- **Unit** (`npm test`): pure logic and server actions with stubbed prisma — storage drivers, csv, mail, permissions, content services, request queue, upload/cleanup.
- **Integration** (`npm run test:integration`): real Postgres + real storage; requires `SCMS_TEST_DATABASE_URL` ending `_test`/`_verification`; never falls back to app `DATABASE_URL`.
- **E2E** (`npm run test:e2e`): Playwright against a separately built app instance (`SCMS_E2E_DATABASE_URL`, `SCMS_E2E_BASE_URL`); run twice for local and S3 storage.
- CI runs `tsc` `biome lint` unit `build` only (no DB in CI).

## 8. Architectural Record (do not regress these)
1. **No in-process timers** — cleanup and scheduled work is external-scheduler driven (`/api/cron/cleanup`) to stay multi-instance safe.
2. **Server-only prisma access** — never import prisma into code bundled for the client (server functions / api routes only).
3. **Deduplicated writes** — batch/import writes cap at 500 rows, use per-row error collection, diffed attendance saves, set-based enrolment writes, `pg_advisory_xact_lock` for request dedupe.
4. **Storage rollback symmetry** — object/DB failures delete the already-stored half; cleanup only touches rows older than the grace period.
5. **SUPERADMIN cannot be locked out** — force-reset to all permissions in resolution code (added defensively twice).
6. **Public reads stay server-rendered** via loaders, avoiding client-waterfall fetches on marketing pages.
7. **Versioned migrations only** for schema change (no `db:push` on shared DBs); the seed must stay idempotent & env-driven.

## 9. Architectural TODOs for the next agent
- Introduce TanStack Query concretely (mutation caching / invalidations) **or** remove the unused provider — do not keep both half-wired.
- Resolve the dual state cache pattern: page-local `useState` `list` culling after actions vs a central store.
- Decide and implement authz on `/uploads/$` (signed asset links or admin-only flag on FileAsset) — see Tasks T-5.
- Branch-scoped permissions: enforcement first in `resolvePermissions`/guards, then admin UI.
- Move standard error codes (e.g. `INVITE_NOT_FOUND`, `COURSE_CODE_TAKEN`) to a typed constants module shared by client & server (today plain `Error` messages).
- Replace hardcoded Gmail transport with configurable SMTP/HTTP transport + a `MailLog` table for delivery visibility.
