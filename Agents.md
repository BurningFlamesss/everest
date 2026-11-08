# Agents.md — Working Guide for AI/Next Contributors

Everything you need to move fast without breaking ScMS. Companion docs: [PRD.md](./PRD.md) (what/why) · [Checklist.md](./Checklist.md) (status per feature) · [Architecture.md](./Architecture.md) (how it fits) · [Design-system.md](./Design-system.md) (UI quality bar) · [Tasks.md](./Tasks.md) (ordered work).

## 1. Project Identity
ScMS = school management platform **and** the school's public website. Single Next.js-like full-stack app (no backend repo): TanStack Start + React 19 + Prisma/Postgres + Better Auth. Alias `#/*` → `./src/*` (never relative-import across packages; use `#packages/...`, `#components/...`, `#lib/...`).

## 2. Repo Map (memorize this)
```
src/
  routes/            file-based routes (public, _onboard/*, admin/*, api/*, uploads)
  packages/          domain logic, server-only (auth, invite, request queue, content,
                     academics, attendance, transport, people, records, admin,
                     notifications/mail, storage, csv, school)
  components/        auth shell, content upload fields, imports (ImportWizard),
                     people search, templates-modern layouts (Sidebar, Landing/About/Contact)
  lib/               utils (cn), error constants, constants
  env/               t3-env serverEnv/clientEnv (exit-on-invalid)
  styles.css         ALL styling (Tailwind v4 @theme)
  schools/everest/   config.json + content.json (theme/nav/contact data)
  store/             zustand+immer (currently unused)
prisma/              schema.prisma (26 models), seed.ts (idempotent), migrations/ (versioned)
tests/               integration + e2e (unit tests live next to sources as *.test.ts)
.products            none — docs live as Agents/PRD/Checklist/Design-system/Architecture/Tasks .md
```

## 3. Ground Rules (non-negotiable)
1. **Server-only Prisma**: import prisma only inside `src/packages/**` server functions (`createServerFn`) or route files under `src/routes/api/**`. Never in client components.
2. **Every server function validates its input** with a Zod schema via `.validator(...)`; return envelope `{ success, error?, ...payload }`. Errors are plain `Error` messages matching uppercase codes the client string-matches — keep that convention unless you're doing Task T-6 (typed error codes).
3. **Permission gates belong server-side.** Any new admin surface: check the action/`getViewerFn` `requirePermission(...)` (or accept the public-token gate pattern used by invite activation). UI hiding is a convenience, never the gate.
4. **Schema changes ship as versioned migrations** (`npm run db:migrate`), keep `@@unique` + index discipline per [Architecture.md](./Architecture.md) §4, and keep `prisma/seed.ts` idempotent (upserts keyed on env-provided slugs).
5. **No in-process scheduled timers.** Anything periodic goes through `/api/cron/cleanup`-style token-protected endpoints.
6. Never commit secrets; required env goes in `.env.example` + `src/env/server.ts|client.ts` validators, keep them in sync (today they're missing `VITE_APP_TITLE`, `S3_REGION`).
7. Don't run `db:push` against anything but throwaway DBs; integration/e2e tests require `_test`/`_verification` database names.
8. Biome style: tabs, double quotes, `npm run check` before pushing.

## 4. Conventions (follow existing files)
- Reads: `getXFn` via `createServerFn({ method: "GET" }).validator(...).handler(...)` and call from route `loader`s (SSR, cache-friendly, no waterfall).
- Writes: `createXAction` / `saveXAction` / `deleteXAction`, invoked from event handlers; after mutation, either re-run the loader via `router.invalidate()` or update local list state the way the page already does.
- Response envelope: `{ success: boolean, error?: string, ...data }`.
- Shared people pickers: use `#/components/people/StudentSearchInput` + `useStudentSearch` (server-searched, ≤100 hits) — never load the whole student table on the client.
- Uploads: `<ImageUploadField>` / `<AttachmentUploadField>` hit `POST /api/uploads` with the policy (`#/packages/storage/policy.ts`; images ≤5 MB, docs ≤10 MB). Extend `policy.ts`, not the route.
- Slugs: content slugs are generated server-side (`content-service.ts` unique suffix loop); use same strategy for new content models.
- Email: always `sendMail` from `#/packages/notifications/mail.ts` — it never throws; handle failures as data (`emailSent`/`decisionEmailSent` flags), never crash the action.
- Record storage of `takenById`-style "who did it" as nullable FK to `Staff`/`User` with `SetNull`, per existing schema.

## 5. Commands
```bash
npm run dev                     # vite dev on :3000
npm run build                   # production build (also checks react-compiler compile)
npm run generate-routes         # after adding/removing route files (tsr generate)
npm run check                   # biome format+lint over src
npx tsc --noEmit                # types (also in CI)
npm test                        # unit/UI regression (no DB required)
npm run db:generate && npm run db:migrate:deploy && npm run db:seed   # bootstrapping
npm run db:migrate              # create a named versioned migration for schema edits
npm run test:integration        # needs SCMS_TEST_DATABASE_URL (…_test), and Start Postgres via docker compose
npm run test:e2e                # needs an app already running w/ SCMS_E2E_DATABASE_URL / _BASE_URL (setup per README E2E section)
```
CI parity: `npm ci → prisma generate → tsc --noEmit → biome lint src → npm test → build`. Fast CI: build only tests what compile+unit-catches; add heavier checks locally before releasing.

## 6. Build-new-feature checklist
1. Confirm PRD/Checklist/Tasks references for the slice and pick the unchecked item.
2. Schema (if needed): add model/enums with `@@unique`s + indexes → `npm run db:migrate -- --name <slug>` → update seed if a starter row makes sense.
3. Permissions: extend `PERMISSION_DEFINITIONS` (and Prisma `PermissionKey` enum in the same migration) only if a new admin domain appears; wire new routes' actions to `requirePermission`.
4. Domain package: `src/packages/<domain>/{service.ts,server.ts}`; service holds prisma logic (pure-ish), server.ts is theZod’d `createServerFn` surface.
5. Route(s): add files under `src/routes`, run `npm run generate-routes`; add `beforeLoad` viewer gating for the admin console nav; public pages stay session-less.
6. UI: use/extend `src/components/ui` primitives only (Design-system.md §3 quality bar); do not hand-roll new button/input/dialog styles.
7. Tests: mirror the pattern of `src/packages/*/server.test.ts` (unit), `tests/integration` (schema/storage-flavored), `tests/e2e` (auth-critical flows).
8. Update Checklist.md ✅/🟡/❌ + Tasks.md checkboxes for what you did; add new discovered debt to PRD §5.

## 7. Updated-Codebase Cautions (from audit)
- Multi-school scaffolding (`src/schools/*`, `templates/modern`, zustand store) is a deliberate seam — extend it, don't rip it, unless removing with Task DS-4's template-theming replacement.
- `Notice.audience` is **not enforced** on any feed — if you make a signed-in feed, honor it (PRD P3).
- Branch scoping of permissions (`scopeKey`, `branchId`) exists in DB, **not enforced** in resolution; don't build UI on top until resolvePermissions honors it.
- The `/uploads/$` route serves any `FileAsset`; if you surface sensitive documents, implement the asset-authz decision (Tasks T-5) before linking those documents.
- `react-query` provider is plumbed for SSR but unused; if you introduce hooks, either convert a whole domain to it or don't — don't mix patterns within a page.
- Lenis + `scroll-behavior: smooth` conflict is latent breakage; resolve before touching smooth-scroll UX (Design-system.md §2.4).
- Playwright e2e requires a *separately started app instance* per README; don't try to have tests spawn the server.

## 8. Definition of Done (for any task)
`npx tsc --noEmit` clean · `npm run check` clean · `npm test` passes · relevant integration/e2e pass if touched · migration+seed updated · docs (Checklist/Tasks/README relevant section) updated · no new env var without `.env.example` + validator entries.
