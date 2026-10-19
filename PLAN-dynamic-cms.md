# Fully Dynamic Website CMS — Implementation Plan

**Goal:** Every public page's content is admin-editable. Page copy edits happen in the existing fixed-section CMS; dynamic collections get dedicated admin CRUD; admins can append free-form blocks. Real DB (Prisma/Postgres) is the single source of truth; `src/content/*` becomes seed + fallback only. **Designs are preserved — no restyling.**

**Guiding principle (user-selected):** "Editable real design" — keep each page's exact current design & interactions; convert copy/images/links/lists into CMS-editable fields; entity collections (notices, faculty, gallery…) are DB-driven with their own admin CRUD.

---

## Architecture (already present — we generalize, not reinvent)

- `WebsitePage(key)` + `ContentBlock(type, fields JSON)` — page chrome + section copy.
- Fixed-section editor: `pageSectionTypes()` + `SECTION_DEFAULTS`/`sectionDefaults()` + `BLOCK_FIELDS` + `SectionEditor` + `CmsSectionBox` + live iframe `?cms=1` preview. **Proven on /faculty.**
- Entity collections: Prisma models + `getXServer()` reads (content.ts) + `save/delete` mutations (mutations.ts) + public hook with static fallback. **Proven on faculty/notices/scholarships.**
- Root loader (`__root.tsx`) preloads content with 4s timeout + static fallback.

---

## Work Streams (each independently verifiable)

### WS0 — Fix the data backbone (highest leverage; unlocks everything)
1. **Root loader coverage** (`src/routes/__root.tsx`): fetch **all published pages** via existing `getAllPublishedPagesServer()` and key them into `content[key]`, so `useWebsitePageContent(key)` works for every page — not just faculty/login. Add the missing entity reads (`getAlbumsServer`, `getFacilitiesServer`, `getResourcesServer`, `getBoardResultsServer`, `getProgramsServer`, `getBusRoutesServer`, `getCalendarEventsServer`) into the same `Promise.allSettled` fan-out (each already returns `[]`/null-safe), keyed into `content`.
   - *Note:* per-route preview loaders (`?cms=1`) still override for WYSIWYG; published reads flow through root. This matches the existing faculty pattern.
2. **Entity hooks** (`src/packages/school/hook.tsx`): add `useAlbums()`, `useFacilities()`, `useResources()`, `useBoardResults()`, `usePrograms()`, `useBusRoutes()`, `useCalendarEvents()` mirroring `useNotices()` (read `content[key]`, null when absent → static fallback).
3. **Resolve dual Prisma clients**: make `src/lib/prisma.ts` the single client (re-export from `src/packages/db/index.ts` or vice-versa). Pick one; delete the other's instantiation.

### WS1 — Schema & types
4. **`BlockType` additions** (Prisma enum + `src/types/index.ts` union + `BLOCK_FIELDS` + `SECTION_DEFAULTS` + `BLOCK_LIBRARY_DEFAULTS`): add the page-copy section types needed to make hardcoded copy editable:
   - `landing_hero` (scroll-text-1/2/3 headline+body), `landing_facts` (institution fact list), `discover_cards` (list of card{eyebrow,title,body,href}), `chapters` (about page list), `department_list` (contact).
   - Reuse existing `hero/headline/intro/stats/cta/featured_*/gallery_grid/contact_details/office_hours/map` where they fit.
5. **`WebsitePageKey`**: add `course_finder` (and reconcile TS union vs Prisma enum — TS omits `posts`/`other`; align both, keep `posts`).
6. **Migration** for the enum additions (Prisma migrate). No shape changes otherwise (fields stay JSON).

### WS2 — Extend the SectionEditor (generic field kinds)
7. `SectionEditor.tsx` currently renders only text/textarea/image/number/date. Add renderers for **`list`** (repeatable item editor from `itemFields`), **`tags`** (string array), **`richtext`** (TipTap — deps already present). This makes chapters/pillars/voices/FAQs editable. (`BlockInspector` already has some of this — port, don't duplicate.)

### WS3 — Page copy → CMS (per public page, preserving design)
For each page: add fixed sections, wrap regions in `CmsSectionBox`, seed defaults from current hardcoded/static copy, render merged `sectionDefaults ∪ savedFields`. Root-loader fix (WS0) makes published content flow; per-page `?cms=1` preview already exists.
8. **Landing `/`**: wrap GSAP scroll-text-1/2/3 (landing_hero), fact list (landing_facts), discover cards (discover_cards). Keep `<LandingPage/>` design; pass CMS fields in as props with the hardcoded strings as defaults. Appended free-form blocks render *below* the native design via `PublicBlocks`.
9. **About `/about`**: convert inline `chapters[]` → `chapters` list section (name/category/description/image/stats/inCharge/since/block/studentsLove/gallery). Seed from the inline array.
10. **Contact `/contact`**: wire existing `contact_details`/`office_hours`/`map` sections + `social_links`; source phones/hours/map/departments from CMS (fallback `#/lib/site`). Add `CmsSectionBox` overlays (currently none).
11. **Calendar `/calendar`**: `headline` section already present; switch body from static `calendarEvents` to `useCalendarEvents()` (see WS4). Keep BS display.
12. **Chrome (all pages)**: NoticeTicker + Footer + Sidebar currently read static. Point them at root-loader `content` (notices) and school config. (Sidebar nav tree stays code-defined; only labels/branding editable via site settings.)

### WS4 — Collections → Prisma + dedicated admin CRUD (close split-brain)
Reconcile each collection so **admin writes → Prisma → public reads**. Table per collection: public read fn, admin page, mutation fns, permission, gaps.

| Collection | Public read | Admin page | Mutations | Permission | Action needed |
|---|---|---|---|---|---|
| FacultyMember | getFacultyMembersServer | faculty/FacultyAdminPage ✓Prisma | save/delete ✓ | staff.manage | OK — verify only |
| Scholarship | getScholarshipsServer | scholarships/ScholarshipsAdminPage ✓ | save/delete ✓ | admissions.manage | OK — verify |
| Album | getAlbumsServer | gallery/* (via services→server) | create/update/delete (no auth/zod) | website.manage | add guard+zod |
| Facility | getFacilitiesServer | **none** | save/delete (no auth/zod) | website.manage | **build admin page** + guard+zod |
| Resource | getResourcesServer | resources/ResourcesPage ✓ | save/delete ✓ | website.manage | OK — verify |
| BoardResult | getBoardResultsServer | results/ResultsPage ✓ | save/delete (no auth/zod) | — | add guard+zod |
| BusRoute | getBusRoutesServer | transportation/TransportationPage ✓ | save/delete (no auth/zod) | — | add guard+zod |
| Program | getProgramsServer | courses/CoursesPage ✗(**mock**) | create/update/delete (no auth/zod) | website.manage | **repoint admin to Prisma** + guard+zod |
| CalendarEvent | getCalendarEventsServer (**unused**) | events/* ✗(**mock**) | save/delete (events.manage, zod=base only) | events.manage | **wire public page + repoint admin to Prisma** + extend zod |
| Notice | getNoticesServer | notices/* ✗(**mock**) | save/delete ✓zod | notices.manage | **repoint admin to Prisma** |

13. Repoint **notices**, **courses/programs**, **events** admin UIs from `@/services/*` (mock) to the Prisma server fns in `mutations.ts` (+ raw list getters in content/server/*).
14. **Build Facilities admin CRUD page** (list + create/edit dialog) following the Resources admin pattern; register route + nav.
15. Add `requirePermission` + zod validators to the unguarded mutations (album, facility, boardResult, busRoute, program).

### WS5 — Hardening
16. Server-side authorization on `/api/website/**` (currently any authenticated user can mutate; `actor` forgeable). Enforce `website.manage` via `getSessionMiddleware`/`requirePermission`; derive actor server-side from session.
17. Make `updateBlockFields`/`toggleBlockVisibility`/`move`/`reorder`/`add`/`duplicate`/`delete` set `hasUnpublishedChanges` (consistency with `saveSectionFields`).
18. Surface `seoTitle/seoDescription/seoKeywords` in public route `head()`.

### WS6 — Seed from static content (one-time, idempotent)
19. A Prisma seed (extend `db:seed`) that upserts: all `WebsitePage` rows with `SECTION_DEFAULTS`-derived blocks, and all entity collections from `src/content/*` + `src/lib/{faculty,notices,scholarships,programs,facilities}` + `calendar.ts`. Run once; thereafter DB is source of truth and static modules remain as build-time fallback only. Calendar: store BS display strings, map to AD `startDate` via existing `bsToAd`.

---

## Explicit non-goals (won't do without confirmation)
- No true draft/published **content versioning/snapshotting** (publish stays a status flag; noted as a known limitation).
- No **media upload pipeline** — image fields remain URL/path strings via existing `ImageUploader`.
- No free-form **page builder** that replaces page designs — appended blocks only.
- `crestParts` SVG animation vectors & campus-plan SVG `path` data stay code-owned (not admin-edited).

## Verification
- `npx tsc --noEmit` + `npm run build` clean.
- Each public page renders identically pre/post with no DB edits (defaults path).
- Editing a section in admin → publish → visible on public page (and in `?cms=1` preview).
- Each collection CRUD round-trips admin→DB→public.
