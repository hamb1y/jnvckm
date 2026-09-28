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
| `--gold` | `#dcbd73` | the report covers' gold caps — type and rules **on the olive only** |
| `--brand-2` | `#4a5a2a` | a raised panel or quiet mark on the olive |
| `--brand-muted` | olive-mixed paper | secondary text on the olive (clears 4.5:1) |

Tints are derived with `color-mix()`; no pastel is hand-picked. Gold and orange
have a second "mark" value (`--accent-program-mark`, `--accent-give-mark`) for
fills and rules only, never small text.

Colour means something: olive is the institution, gold is a programme, orange is
giving. Nothing is coloured for decoration.

## 2. Type — the wordmark's own family

- **Display: Arvo** — a slab serif, and the same letterform family as the
  association's logotype. This is continuity, not a default.
- **Body: Mukta** — a warm humanist sans from Ek Type, Mumbai.
- **No mono face.** Dates, ₹ amounts and batch codes are set in Mukta with
  tabular numerals (`font-variant-numeric: tabular-nums`), so figures line up as
  a record without a typewriter look. `--font-mono` stays in `tokens.css`; nothing uses it.

## 3. How pages are composed

### The annual report (the 2026 rework)

The site now reads as the association's printed report, cover to back page:

- **The home page is the cover.** Olive ground; `1993` set at poster size (`--step-6`) in the gold; the name, tagline and actions; the campus photograph mounted with a gold keyline offset behind it; and a **figures strip** of three real counts read from the records (documented contributions with their year range, events on record, programs).
- **Every index page opens on a section divider** (`PageCover.astro`): the olive, the title in paper, the lede, and — where the page has one — a real figure in gold beside it (recorded giving on Contributions, events on record on Events, `1986` on the Vidyalaya, the NCL mark on its program page). The figure never repeats the page title as its label: Events shows `18` and its year range, not "Events 18".
- **Detail pages open on the olive too**, with the date in gold; the photograph is mounted so it overlaps the cover's lower edge, like a plate, and the who/what/where sits beneath it in a ruled **record strip**.
- **The giving statement.** On the home page the total is set at display size in a sticky column beside the ledger it adds up; each ledger bar is drawn on a faint full-width track so its length reads as a share.
- **Events are a timeline**: each year in large gold-brown Arvo, pinned beside its records while you scroll. The records run as one continuous list — a year break is a 2px ink rule, not a gap — and each row shows only day and month, since the year is already beside it.
- **The Vidyalaya is a fact sheet**: a `<dl>` of labelled facts, each leading with its figure or name in Arvo (1986, Seegodu, 6 to 12, 840012) and the detail beneath.
- **About ends on the association's line**, set large, then three onward tiles that each carry a real line from the records (IGNITE · NCL; 12 contributions, 2015–2024; the school's name).
- **NCL's poster.** With no photograph, NCL gets a gold panel with its short name at poster scale — composed, never a placeholder.

**Photographs lead, at size.** The archive's real photographs are the site's
strongest asset, so they are given real width — half a row, a full-bleed band,
a 4:3 card — and the text supports them. No postage-stamp thumbnails, no stock
imagery, no illustration standing in for evidence.

**The home page opens on the association's own olive.** The hero is a full-width
`--brand` ground with the founding year set as the largest mark on the page, in
the report covers' gold, and the association's name beneath it. The cream pages
that follow then read as the inside of the report. The hero photograph stays a
framed figure beside the copy.

**Every section has its own shape.** A page is not one primitive repeated. The
home page runs: an olive hero (year, name, copy left, photograph right), a
photograph plus a ledger of figures, a full-bleed band, alternating image/text
program rows, a three-up card row, a two-column "where it began", then a closing
band. The shapes vary because the content does; a uniform grid is what made the
first attempt monotonous.

**The ledger leads with the total, and bars show the proportions.** The giving
ledger opens with the total in the largest display type on the page,
then one row per contribution with the figure set large in Arvo and a bar whose
length is the figure's share of the largest. The label is "Given so far": the
total sums the amounts the records state, and a record with no stated amount
keeps an empty figure column rather than a guessed one.

**Sections are separated by space, not by rules.** `section` carries
`padding-block: clamp(3rem, 7vw, 6rem)` and nothing else. There is no hairline
above every block.

**The ledger is for figures, not for page structure.** `.ledger` renders
label/value rows and is used where the content really is an account — the
summary of what alumni funded, on the home page, where every contribution gets a
row and records with no recorded figure keep an empty figure column. Complete
dated indexes (all events, all contributions) use `.records`, which is
`EntryRow.astro`: the date, the record, a place or a figure, and a small
plate when a photograph exists. Curated selections use `EntryCard.astro`, and a
record with no photograph renders as a bordered text card rather than an empty
frame. That text card is an olive block: the date set large in the report gold
(and not repeated in the meta line), the title beneath it, so a record without a photograph looks planned rather than
like a photograph that failed to load.

**No photograph is never faked.** A program with no image gets a composed
typographic panel (see NCL on the home and programs pages), not a placeholder
frame and not a generated image. The panel carries the short name only — never
the full name that already heads the text beside it.

**One archive feature, not a climax.** The full-bleed `Band.astro` is capped in
height so a single historical photograph cannot outweigh the association's
current work.

**A section can carry an accent.** `.accent-program` (gold), `.accent-give`
(burnt orange) and `.accent-brand` (olive) set `--accent`, which `.eyebrow`,
underlines and hover states consume. One accent per section, applied by a wrapper.

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
- Four radii only — `2px`, `4px`, `8px` and `999px` (`--r-pill`, used for pills **and** circles; never `50%`). The verifier fails a page with more than four.
- No CSS animation of any kind (the verifier fails on one). Motion is transitions only: colour, a 2px button lift, an arrow nudge.
- No all-caps headings or labels; no wide letter-spacing; body text is 16px+ at
  a 1.62 line-height and a measure of 66ch.
- No pill or badge above the h1, no icon in a rounded tile, no icon cards in a
  row. Icons appear inline beside text, or not at all.
- No pills, chips or dots in front of text. The nav, the contributions filter,
  the language switch and back links are underlined text; the active one is
  marked by its underline colour. Prose lists use a muted en dash, not a bullet.
- No label that repeats its heading, and no hedging copy ("being confirmed",
  "to be confirmed", "documented so far"). State what is known; leave out what
  is not.
- No stock imagery, no illustrations standing in for documentary evidence. Where
  a record has no photograph it simply has none.
- No invented metrics, testimonials, staff or events. Empty collections render an
  intentional empty state.

## Missing states

- **Contributions filter** — underlined filter buttons show and hide the server-rendered rows by toggling
  `hidden`, so content stays crawlable and works without JavaScript.
- **Empty collections** — stories and any filtered category render an explicit
  message, never blank space. With nothing upcoming, the Events page is the
  timeline alone, and the years are its section headings.
- **Unverified contact** — while `contact.emailVerified` / `phoneVerified` are
  false the email and phone are simply not published; the footer and Connect page
  give the address and the batch-representative route instead.

## The three questions

1. Does it feel like it came from somewhere? Yes: the palette and type come from
   the association's own logotype and printed reports, and every photograph in
   the build is a real one from the archive.
2. Does it have a voice? It reads as a plain record of what batches did, with
   real amounts and real dates, rather than as a template.
3. Could another organisation swap in their logo? Not without changing the
   colours, the slab-serif display face, the batch vocabulary and the ledger.
