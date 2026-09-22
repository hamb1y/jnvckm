# Design

Three decisions were made before any markup was written. They come from the
association's own material, not from a default look.

## 1. Palette — the association's own printed record

Derived from the JNVCkm Alumni logotype (burnt orange laurel, charcoal slab-serif
wordmark, small green dot) and the association's printed financial-report covers
(olive green with gold serif caps). Not a general-purpose palette.

Roles, not hues. Defined in `src/styles/tokens.css`.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f7f3e8` | warm unbleached report paper; the ground |
| `--surface` | `#fffdf7` | raised card |
| `--surface-sunk` | `#eee8d8` | sunken / archival surface |
| `--ink` | `#241f17` | body text, from the wordmark |
| `--text-2` | `#57503f` | secondary prose |
| `--text-3` | `#6e6553` | meta text; lowest step that stays above 4.5:1 on paper |
| `--rule` | `#ddd4bf` | hairlines |
| `--brand` | `#3d4a21` | structure: header rule, footer, dark bands |
| `--accent-program` | `#7e5a0a` | programs (IGNITE, NCL); text-safe gold |
| `--accent-give` | `#a8410f` | giving (contributions, the action button) |

Tints are derived with `color-mix()`; no pastel is hand-picked. Gold and orange
have a second "mark" value (`--accent-program-mark`, `--accent-give-mark`) for
fills and rules only, never small text.

Colour means something: olive is the institution, gold is a programme, orange is
giving. Nothing is coloured for decoration.

## 2. Type — the wordmark's own family

- **Display: Arvo** — a slab serif, and the same letterform family as the
  association's logotype. This is continuity, not a default.
- **Body: Mukta** — a warm humanist sans from Ek Type, Mumbai. Kannada falls
  back to Noto Sans Kannada.
- **Mono: Spline Sans Mono** — dates, ₹ amounts and batch codes. This archive is
  full of figures and they should read as record, not prose.

Kannada headings fall back to Noto Serif Kannada, paired with Arvo. No Latin-only
flourishes (drop caps, small caps) are applied to Kannada.

## 3. One repeated structure — the rail, and the ledger inside it

Two moves, applied everywhere.

**The rail.** Every block of the page is a two-column grid: a narrow left rail
(`--rail`, 13rem) carrying the block's heading, a one-line lede and a "view all"
link, and a wide right body carrying the content (`Section.astro`, styled by
`.section-block` in `global.css`). On wide screens this gives every page the same
editorial rhythm and a stable place for the eye; below 900px it collapses to one
column. The rail label *is* the section heading, so nothing is labelled twice.

**The ledger.** The content is a record of dated things, so the records are a
ruled list (`EntryRow.astro`): date in mono on the left, the record in the
middle, the figure set large on the right in burnt orange, and a small plate
when a photograph exists. The home page opens with the ledger of giving, because
real amounts are the most convincing thing the site has.

The home page also carries a **masthead** (`.masthead`): the association's name
in Arvo at `--step-4`, a 2px olive rule under it, and one real photograph. It is
a printed-report cover, not a hero banner.

Two supporting components, because the archive contains two kinds of image:

- **`Figure.astro`** — documentary photographs. Cropped to a ratio, with
  `object-position` from a position select. Renders nothing when there is no
  image; it never renders a broken frame.
- **`Document.astro`** — posters, press clippings, report covers, screenshots.
  Shown uncropped, in a frame, linked to the full-size file. Cropping a Prajavani
  clipping or a Zoom screenshot into a 3:2 photo card would destroy it.

## What this design deliberately avoids

- No gradient, no glassmorphism, no coloured box-shadow, no decorative grid
  background, no glowing border.
- No thick coloured stripe on a card edge; no coloured border on a rounded
  element. Surfaces get a hairline border **or** a shadow, never both.
- No centred stack of identical full-width bands. The rail gives every block a
  different proportion, and the page has one dominant element rather than six
  equal ones.
- No timid type scale: the masthead is `--step-4`, section headings `--step-2`,
  ledger figures `--step-1`. Nothing hovers in a single narrow band.
- Colour is placed, not sprinkled: olive for structure, gold for program
  identity, orange only on figures and the primary action.
- Radii are 2–8px, drawn from the token scale.
- No all-caps headings or labels; no wide letter-spacing; body text is 16px+ at
  a 1.62 line-height and a measure of 66ch.
- No pill or badge above the h1, no icon in a rounded tile, no icon cards in a
  row. Icons appear inline beside text, or not at all.
- No stock imagery, no illustrations standing in for documentary evidence. Where
  a record has no photograph it simply has none.
- No invented metrics, testimonials, staff or events. Empty collections render an
  intentional empty state.

## Missing states

- **Contributions filter** — chips filter the server-rendered rows by toggling
  `hidden`, so content stays crawlable and works without JavaScript.
- **Empty collections** — events (no upcoming), stories, and any filtered
  category render an explicit message, never blank space.
- **Unverified contact** — `contact.emailVerified` / `phoneVerified` are false,
  so the footer and Connect page render "To be confirmed" instead of a
  placeholder address.
- **Archived records shown in English on a Kannada page** — a visible note
  explains why, rather than silently mixing languages.

## The three questions

1. Does it feel like it came from somewhere? Yes: the palette and type come from
   the association's own logotype and printed reports, and every photograph in
   the build is a real one from the archive.
2. Does it have a voice? It reads as a plain record of what batches did, with
   real amounts and real dates, rather than as a template.
3. Could another organisation swap in their logo? Not without changing the
   colours, the slab-serif display face, the batch vocabulary and the ledger.
