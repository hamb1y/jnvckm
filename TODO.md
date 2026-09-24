# TODO

Open work, roughly in the order it should be tackled.

## Content

- [ ] **NCL seasons since 2017.** The NCL page says seasons are documented to
      2025, and the programme list shows only 2015–2017 because those are the
      only editions with a record on this site. Seasons 11 (2022), 12 (2023) and
      14 (2025) are publicly documented; add them as records once someone can
      confirm venue, winner and date. The page already carries a note saying only
      documented editions are listed.
- [ ] **Financial report figures.** The 2012–2021 record currently shows the
      report cover and says the association keeps the detailed accounts. If the
      association will publish the summary itself, link it rather than describe
      it.
- [ ] **Alumni stories.** The old Alumni Mirror blog holds first-person stories
      (a Japan youth exchange, NITK, the Indian Naval Academy). Migrate two or
      three with author, batch, original date and source — they are the site's
      best chance at an authentic voice. Needs permission (LAUNCH-CHECKLIST #9).
- [ ] **NCL has no photograph.** Every other program page has a real one. Ask the
      NCL organisers for a season photo; until then the page renders with no
      image, which is correct but thin. A generated image is not acceptable here
      — it would be standing in for documentary evidence.
- [ ] **Batch pages.** The association organises by batch, and contribution
      records already carry a batch label. A batch index (year range, projects,
      NCL team, representative) is the natural next step. Do not invent
      representatives.
- [ ] **IGNITE and NCL edition tables.** Only the editions documented in the
      archive are listed. A complete list needs LAUNCH-CHECKLIST items 19–20.

## Site

- [ ] Per-entry OG images. Detail routes currently pass the record's photo when
      it has one, and otherwise fall back to `og-default.png`.
- [ ] `jnvckm.org` redirects from known old paths once the domain is pointed.
- [ ] Search, if the archive grows past a few dozen records.
- [ ] `content/drafts/` is excluded by `load.ts` (any path containing
      `/drafts/`), so quarantined material can be kept in the repo without
      publishing it. Nothing uses it yet.
- [ ] A visual pass on the Kannada pages by a Kannada reader: line breaks,
      heading balance, and whether `Noto Serif Kannada` is the right display
      pairing for Arvo.

## Infrastructure

- [ ] Cloudflare Pages project `jnvckm`, build `bun run build`, output `dist`,
      `BUN_VERSION` pinned.
- [ ] Sveltia OAuth worker (LAUNCH-CHECKLIST #6).
- [ ] `BUN_VERSION` in CI matches the pinned Pages version.
