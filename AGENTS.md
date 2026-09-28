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
- **The site is English only.** Build internal links with `localePath()`. The
  pages nav can link to live in `PAGES` in `src/lib/nav.ts`; which appear, and
  in what order, is set in the CMS.
- **`bun run check` must report 0 errors, 0 warnings, 0 hints.** `bun run build`
  must pass. `bun run verify` must be all green before you claim anything works.

## Adding a page

1. Write `src/views/MyView.astro` taking `lang: Locale`.
2. Add `src/pages/my-page.astro`, ~6 lines: import `BaseLayout` and the view,
   pass `lang` and `path`.
3. Add the route to `PAGES` in `src/lib/nav.ts` **with a UI key that exists in
   `content/copy.json`**, add it to the page options of both Navigation lists in
   `public/admin/config.yml`, and to `nav.header` or `nav.footer` in
   `content/site.json` if it should be linked.
4. Add the key to `content/copy.json`, and its field to the "Interface text"
   file in `public/admin/config.yml`.
5. Run `bun run check`, `bun run build`, `bun run verify`.

## Nothing visible is hardcoded

Text, photos, links, years, counts and lists come from `content/` and have a
CMS field. Programs and contribution categories are content too: a new one needs
no code. Interface text can use `{formed}` and `{founded}` for the years set in
settings.

## Adding a content collection

1. Add the type to `src/data/types.ts`.
2. Add a mapping module in `src/data/` using the helpers in `load.ts`
   (`str`, `text`, `media`, `mediaList`, `num`, `isoDate`) — never a raw
   `JSON.parse` in a view.
3. Seed `content/<collection>/*.json`, filename = slug.
4. Declare it in `public/admin/config.yml` with a label and a hint per field.
5. Include it in `recentActivity()` only if it belongs in the home feed.

## Gotchas this repo has already been bitten by

- **Don't put a rule or a label rail above every section.** The first rebuild did
  and it read as a stack of identical bands. Sections are separated by space;
  every section gets its own shape, and photographs are given size. See
  `DESIGN.md` §3.
- **The mobile menu is an absolutely positioned `<details>` panel.** It needs
  `position: relative` on `.site-header` **and** `inset-block-start: 100%` on the
  open panel. Without the block inset it takes a static position that put the
  list above the viewport, off-screen. `bun run verify` now opens the menu and
  asserts the list starts below its toggle, inside the viewport, and clear of the
  logo.
- **Dates**: format them with `formatDate()`, not `Intl.DateTimeFormat`.
- **`[hidden]` must win**: `global.css` sets `[hidden] { display: none !important }`.
  The filter depends on it. Never add a `display` rule that overrides it.
- **Islands**: after a dependency change, if an island stops responding, restart
  the dev server and clear `node_modules/.vite` before debugging the component.
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
- `bun run build` — runs `scripts/build-og.mjs` first (JPEG social-card twins in
  the gitignored `public/og/`), then `astro build`.
- `bun run verify` — the browser gate. Run it before saying a change works.

## Commits

Small and working. `bun run check`, `bun run build` and `bun run verify` green at
each one.
