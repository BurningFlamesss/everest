# Design System — ScMS

Status: **inconsistent by drift** — the app looks coherent (cream/red-accent "modern" theme) but there is **no enforced system**. This doc defines the target and the migration plan. See [Tasks.md](./Tasks.md) DS-1…DS-4.

## 1. Current State Audit

### 1.1 What exists
- `src/styles.css` (Tailwind v4, no JS config): one global stylesheet.
- Two **parallel token sets**, neither in real use:
  1. **"Sea/lagoon" editorial palette** (`--sea-ink`, `--lagoon`, `--palm`, `--sand`, `--foam`, `--surface`, `--kicker`, `--hero-a/b`, `--bg-base`, `--header-bg`, `--chip-*`) + `.dark` override — defined, **referenced by zero components**.
  2. **Standard shadcn oklch family** (`--background/--foreground/--primary/--secondary/…/--chart-1..5/--radius/--sidebar-*`) wired via `@theme inline` into Tailwind colors — also **unconsumed** by UI code (which uses ad-hoc Tailwind + arbitrary hexes).
- Fonts: Google **Fraunces** (display serif) + **Manrope** (body). Fraunces is imported but **never applied** (no `--font-display` mapping); Manrope is bound to `--font-sans`.
- `components.json` (shadcn `new-york`, zinc, lucide) is configured and the `cn()` helper exists in `src/lib/utils.ts` — but `src/components/ui/` **does not exist**; all controls are hand-rolled JSX (Class Variance Authority installed, unused).
- Motion: GSAP + ScrollTrigger on `LandingPage` (canvas frame scrub + clip-path reveal); **Lenis smooth scroll installed but disabled** (`<LenisProvider />` commented out in `__root.tsx`; `html { scroll-behavior: smooth }` which fights Lenis), red scrollbar.

### 1.2 What the app actually looks like (de facto system)
- Background: `bg-[#f6f1e8]` cream; cards: white/`gray-*` borders; primary accents: `red-500/600` buttons/links, `yellow-400` highlights; role styling is repeated inline per component (sidebar bg-red-400/yellow-400, auth shell, admin cards…).
- Dark mode: tokens defined (`.dark` overrides) but **the app never toggles `.dark` — effectively light-only**.
- Charts: `--chart-1..5` defined, unused.
- Icons: `lucide-react` ad hoc.

### 1.3 Consequences (why this is debt, not taste)
Two rebrand paths mean neither works: editing the sea tokens changes nothing visible; changing hexes requires touching every page. Placeholder theme data (`schools/everest/config.json`: `primary: "#ff0000"`, name `"everest"`, phone `980000000`) means the "brand" is not real content either.

## 2. Target System (definition)

### 2.1 Foundations — one token set, real usage
Keep the shadcn semantic token contract (Battle-tested + Tailwind-binding already done) and **map the current cream/red de facto palette into it**:
- Role → token mapping: cream bg → `--background`; red buttons → `--primary`; yellow highlight → `--accent`; sidebar tint family → `--sidebar-*`; success/info → new `--positive`, `--info`.
- Delete the unreferenced sea/lagoon token block after migration, or relocate to the templates theme layer only.
- Typography scale: `--font-display: Fraunces` (actually apply to headings/kickers on marketing pages), `--font-sans: Manrope`; define `text-display/title/body/caption` utility presets.
- Radius/spacing/borders unify on `--radius` (0.625 rem) + named size scale; define elevation (border + subtle shadow) presets instead of per-page borders.
- Dark mode: ship the `.dark` class wiring (already tokenized) but explicitly mark it out-of-scope for v2 unless requested — do not let it silently break.

### 2.2 Component library — `src/components/ui`
Generate (shadcn CLI, `components.json` is ready) and **refactor pages onto** the primitives below; hand-rolled replacements exist inside each page today (pattern: eager inline `Input`, buttons, dialogs):
`button, input, label, textarea, select, checkbox, radio-group, switch, badge, card, separator, tabs, dialog, alert-dialog, dropdown-menu, table, toast/sonner, skeleton, tooltip, avatar, sheet, command (search pickers), pagination, popover, progress, empty-state (custom), stat-card (custom)`.
Rules: pages must stop styling raw `<button>`/`<input>` inline; variants (size/primary/destructive/ghost) live in the primitive; `cn()` everywhere.

### 2.3 Layout system
- Shared `MarketingShell` (Navbar + Footer + Sidebar hooks?) — today the sidebar overlaps the full-bleed hero and the footer is inline in `LandingPage`.
- Shared `AppShell` (admin) already half-exists via `admin.tsx` layout + `Sidebar.tsx`; formalize: `Sidebar`, `TopBar` (user menu + sign out), page-header component with title/actions breadcrumbs.
- Grid rules for marketing sections (max-w container, 2-col facts, hero breakpoints).

### 2.4 Motion
- Decide on Lenis: re-enable provider (restore in `__root.tsx`) **and remove `scroll-behavior: smooth`** from CSS, or remove lenis+gsap-as-provider; GSAP remains for the landing hero capture and scroll-reveals. Respect `prefers-reduced-motion` (currently ignored).

### 2.5 Content/model
- School identity (colors, name, contact, hours, social, map, SEO copy) should come from the school config JSON / future DB org settings — not hardcoded hexes (Task DS-4); `config.theme.primary` etc. becomes CSS custom props at SSR time (`<html style="--primary: ...">` pattern) so the template stays data-driven.

## 3. Component Quality Bar (for all new UI)
1. Every interactive control is a `ui/*` primitive; one-off styling goes in variants, not page markup.
2. Marketing pages: Fraunces headings + Manrope body, defined spacing scale, visible focus rings.
3. Forms: label + input + hint + error pattern with inline Zod messages; consistent destructive vs success feedback (existing `FormError`/`FormSuccess` components).
4. Lists: table for admin, cards for marketing; `<Skeleton>` while loading, explicit empty states.
5. A11y: semantic headings per section, labels on all fields, `aria-live` for async feedback, keyboard-reachable tabs/dialogs, reduced-motion media query for GSAP/Lenis.
6. Responsive: mobile-first; admin pages usable at 360 px width; hero must not be clipped behind sidebar.

## 4. Migration Plan → see tasks DS-1…DS-4 in Tasks.md
1. Map palette → semantic tokens; set site-wide defaults; delete unused token sets. No visual rewrite yet — just stop the drift.
2. Introduce `ui` primitives without rewriting pages (replace the biggest repeated offenders first: buttons/inputs/dialogs in admin pages).
3. Update `Sidebar`, `AuthShell`, dashboard/admin cards to tokens; verify against both tenants of tests (UI regression files exist for content/attachments/clubs).
4. Ship `MarketingShell` + Footer + hero CTA/safe area; wire Fraunces; re-enable (or drop) Lenis.
5. Template-theming: feed school config into custom properties, document in `schools/*/config.json` schema docs.
