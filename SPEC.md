# Spec

## Locales

`en` (default, unprefixed) and `kn` (prefix `/kn`). Configured in
`astro.config.mjs` with `prefixDefaultLocale: false`.

Every route exists in both locales. `src/pages/` holds the English routes;
`src/pages/kn/` mirrors them. Route files are thin: they import a view from
`src/views/` and pass `lang`, plus `title`/`description`/`image` for detail
routes so SEO metadata does not depend on the view.

`localePath(path, locale)` in `src/lib/paths.ts` is the only way internal links
are built. Never hand-write a `/kn` prefix.

## Routes

| Path | View | Notes |
| --- | --- | --- |
| `/` | `HomeView` | Masthead, the ledger of giving, latest news and events, programs, "where it began", connect |
| `/about` | `AboutView` | Who the association is, what it does, formed 1993 |
| `/programs` | `ProgramsView` | IGNITE and NCL |
| `/programs/[id]` | `ProgramDetailView` | `ignite` \| `ncl`, plus that program's editions/seasons |
| `/contributions` | `ContributionsView` | Ledger + category filter (the only island) |
| `/contributions/[slug]` | `ContributionDetailView` | |
| `/events` | `EventsView` | Upcoming (with empty state) and past |
| `/events/[slug]` | `EventDetailView` | |
| `/stories` | `StoriesView` | Stories, news, reports |
| `/stories/[slug]` | `StoryDetailView` | |
| `/connect` | `ConnectView` | Volunteer, mentoring, contributing, batch reps, contact |
| `/vidyalaya` | `VidyalayaView` | School context; explicitly independent of the association |
| `/404` | `NotFoundView` | |
| `/admin/` | — | Sveltia CMS (static app, `noindex`) |

## Content model

`src/data/types.ts` holds the model. `src/data/load.ts` is the only module that
knows the on-disk shape; every other module and all views consume typed models.

```
content/
  site.json                 SiteSettings  (singleton)
  programs/{ignite,ncl}.json Program
  posts/*.json              PostEntry     kind: news | report | story
  events/*.json             EventEntry    program: ignite | ncl | meet | workshop
  contributions/*.json      ContributionEntry  category: infrastructure | technology |
                                                 student-support | sports | culture |
                                                 staff-community
```

Shared fields: `slug`, `title`, `date` (ISO `YYYY-MM-DD`), `summary`, `body`
(markdown, may be empty for a redacted record), `image`, `documents`, `source`.
`Localized = string | { en, kn }`.

Guards that exist on purpose:

- `media()` returns `null` unless a real `src` is present, so a half-filled CMS
  object can never render a broken `<img>`.
- `text()` collapses `{}` and whitespace-only values to `""`.
- Sort order puts undated records last, not first.
- `archiveNote` renders the redaction note on migrated historical records.

## i18n behaviour

- `t(locale, key)` — UI strings, complete in both locales. Falls back to the
  default locale, then the key itself, so a gap is visible in review.
- `tDynamic(locale, key)` — for keys built at runtime (`categories.*`).
- `lx(value, locale)` — content fields, falling back to English.
- `isFallback(value, locale)` — true when a field had to fall back, which is how
  a Kannada page knows to show "this archived record is kept in its original
  language".

Dates are formatted from a table in `src/utils/format.ts`, not `Intl`: Kannada
month names are missing from some ICU builds and `Intl` silently produced
"22, 2024". Amounts use `Intl` with Indian digit grouping.

## Layout

Sections are separated by space (`section { padding-block: … }`), not by a rule
above every block. `Figure.astro` owns all image rendering (ratio, crop, caption,
empty state). `EntryRow.astro` renders one dated record in a `.records` list;
`EntryCard.astro` renders a curated record with a photograph; `Band.astro` is a
full-bleed photograph with its caption in a solid bar beneath. `.ledger` is only
for label/value figures. Global rhythm, accents and utilities live in
`global.css`.

## Islands

One: `ContributionFilter.svelte` (`client:idle`). It toggles `hidden` on
server-rendered rows and updates an `aria-live` count. With JavaScript disabled
every record is simply visible. The mobile nav is a `<details>` element, not an
island, so there is nothing to hydrate and nothing to break.

## Verification

`scripts/verify-site.mjs`. Discovers every route from `dist/`, serves it over a
local static server, and audits each at 1440px plus layout-only re-measures at
320 and 390. Asserted:

- every `astro-island` hydrated (`ssr` attribute gone), after waiting for
  hydration
- no console errors, page errors, failed requests, or image responses ≥400
- no broken images (`naturalWidth > 0`)
- no horizontal overflow at any of the three widths
- exactly one `h1`, no skipped heading levels
- text contrast ≥ 4.5:1 (≥ 3:1 for large text), measured against the nearest
  opaque background
- paragraph measure ≤ 78ch, measured with a real `ch` probe
- no gradients, `background-clip: text`, thick coloured edges, border+shadow
  pairs, uppercase multi-word copy, image hover transforms, or stray animations
- ≤ 4 distinct border radii
- every nav entry renders as a link on every page, in the right locale
- no internal link 404s
- the contributions filter actually changes the visible count
- the mobile nav reveals its links; the language switch points at the mirrored
  route
- `/admin/` mounts with zero console errors and no config-error banner

Exits non-zero on any failure. `--shots` writes full-page screenshots to
`screenshots/`.
