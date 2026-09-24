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

## 3. How pages are composed

**Photographs lead, at size.** The archive's real photographs are the site's
strongest asset, so they are given real width — half a row, a full-bleed band,
a 4:3 card — and the text supports them. No postage-stamp thumbnails, no stock
imagery, no illustration standing in for evidence.

**Every section has its own shape.** A page is not one primitive repeated. The
home page runs: a hero split (copy left, photograph right), a photograph plus a
ledger of figures, a full-bleed band, alternating image/text program rows, a
three-up card row, a two-column "where it began", then a closing band. The
shapes vary because the content does; a uniform grid is what made the first
attempt monotonous.

**Sections are separated by space, not by rules.** `section` carries
`padding-block: clamp(3rem, 7vw, 6rem)` and nothing else. There is no hairline
above every block.

**The ledger is for figures, not for page structure.** `.ledger` renders
label/value rows and is used where the content really is an account — the
summary of what alumni funded, on the home page, where every contribution gets a
row and records with no recorded figure keep an empty figure column. Complete
dated indexes (all events, all contributions) use `.records`, which is
`EntryRow.astro`: date in mono, the record, a place or a figure, and a small
plate when a photograph exists. Curated selections use `EntryCard.astro`, and a
record with no photograph renders as a bordered text card rather than an empty
frame.

**No photograph is never faked.** A program with no image gets a composed
typographic panel (see NCL on the home and programs pages), not a placeholder
frame and not a generated image.

**One archive feature, not a climax.** The full-bleed `Band.astro` is capped in
height so a single historical photograph cannot outweigh the association's
current work.

**A section can carry an accent.** `.accent-program` (gold), `.accent-give`
(burnt orange) and `.accent-brand` (olive) set `--accent`, which `.eyebrow`,
dots and hover states consume. One accent per section, applied by a wrapper.

> **Removed by design — do not reintroduce:** the first rebuild gave every block
> a left rail (a label column) and a hairline rule above it. With the same shape
> on every section it read as a stack of identical bands, and the rules competed
> with the photographs. Labels are now sentence-case eyebrows inside the flow,
> and sections are separated by space. Do not bring back the rail, and do not
> put a rule above every block.

Two supporting components:

- **`Figure.astro`** — the one frame that owns image rendering: ratio, crop
  position, caption, and an explicit dashed empty state. A record with no
  photograph renders nothing (or, where a frame is expected, the empty state)
  rather than a broken `<img>`.
- **`Band.astro`** — a full-bleed photograph with its caption in a solid brand
  bar *beneath* the image, never as a scrim over it, so the photograph is never
  partly hidden.

## What this design deliberately avoids

- No gradient, no glassmorphism, no coloured box-shadow, no decorative grid
  background, no glowing border. (The one functional exception is the subtle
  paper grain on the body ground.)
- No thick coloured stripe on a card edge; no coloured border on a rounded
  element. Surfaces get a hairline border **or** a shadow, never both.
- No rule above every block, and no label rail beside every block. Sections are
  separated by space; one shape for every section is what makes a page monotone.
- No postage-stamp photographs. If a record has a real photograph, give it size;
  if it does not, do not invent one.
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
