# Working on this repo

Read `DESIGN.md` and `SPEC.md` first. This file is the short version of the rules
that are easy to break by accident.

## Non-negotiables

- **Static output.** No runtime server, no database, no form SaaS, no second CMS,
  no CSS framework, no UI kit, no Tailwind, no font CDN, no animation library.
- **Content is JSON in `content/`.** A content edit is a commit; a build consumes
  it. There is no sync, seed or pull step. Never add one.
- **Views and components never read files.** Only `src/data/load.ts` touches the
  on-disk shape; everything downstream consumes the typed models in
  `src/data/types.ts`.
- **`localePath()` is the only way to build an internal link.** Never write `/kn`
  by hand. Nav lives locale-free in `src/lib/nav.ts`.
- **Every route exists twice.** Add a page to `src/pages/` and mirror it in
  `src/pages/kn/`; both import the same view from `src/views/`.
- **`bun run check` must report 0 errors, 0 warnings, 0 hints.** `bun run build`
  must pass. `bun run verify` must be all green before you claim anything works.

## Adding a page

1. Write `src/views/MyView.astro` taking `lang: Locale`.
2. Add `src/pages/my-page.astro` and `src/pages/kn/my-page.astro`, each ~6 lines:
   import `BaseLayout` and the view, pass `lang` and `path`.
3. Add the route to `NAV` (or `SECONDARY_NAV`) in `src/lib/nav.ts` **with a UI
   key that exists in both dictionaries**.
4. Add the key to both `en` and `kn` in `src/i18n/ui.ts`.
5. Run `bun run check`, `bun run build`, `bun run verify`.

## Adding a content collection

1. Add the type to `src/data/types.ts`.
2. Add a mapping module in `src/data/` using the helpers in `load.ts`
   (`str`, `text`, `media`, `mediaList`, `num`, `isoDate`) — never a raw
   `JSON.parse` in a view.
3. Seed `content/<collection>/*.json`, filename = slug.
4. Declare it in `public/admin/config.yml` with a label and a hint per field.
5. Include it in `recentActivity()` only if it belongs in the home feed.

## Gotchas this repo has already been bitten by

- **Dates**: do not use `Intl.DateTimeFormat` for the month. Kannada month names
  are missing from some ICU builds and it silently renders "22, 2024". Use
  `formatDate()`.
- **`[hidden]` must win**: `global.css` sets `[hidden] { display: none !important }`.
  The filter depends on it. Never add a `display` rule that overrides it.
- **Islands**: after a dependency change, if an island stops responding, restart
  the dev server and clear `node_modules/.vite` before debugging the component.
- **Kannada fallback**: an English-only record is fine. `lx()` falls back and
  `isFallback()` drives the visible note. Do not machine-translate long-form prose
  and ship it as final.
- **The 404 page returns a real page** in `dist/404.html`; the verify server maps
  it explicitly.
- **`getStaticPaths` is hoisted** out of the component. Import any constant it
  uses from a module; do not reference frontmatter variables.
- **Never fabricate** an event, project, amount, name or photograph. The archive
  is the point of this site. If a collection is empty, render the empty state.

## Scripts

- `bun run images` — regenerates `public/images/*.webp` from `originals/`. Never
  delete or overwrite `originals/`.
- `bun run logo` — regenerates the transparent logo mark, favicons and the social
  card from `originals/assets/logo.webp`.
- `bun run verify` — the browser gate. Run it before saying a change works.

## Commits

Small and working. `bun run check`, `bun run build` and `bun run verify` green at
each one.
