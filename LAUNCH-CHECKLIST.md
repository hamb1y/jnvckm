# Launch checklist

Nothing on this page is published on the site. These are the things that still
need a human answer before or shortly after launch. It is deliberately specific,
so it can be sent to the association as-is.

## Must be confirmed before going public

| # | Item | Current handling on the site |
| --- | --- | --- |
| 1 | **Official alumni email** (and whether a phone number may be public) | `contact.email`/`phone` are empty and `*Verified` are `false`; the footer and Connect page render "To be confirmed" |
| 2 | **Registration**: certificate, exact registered name, number, date, current status. Is "JNVCKM Alumni Association (R)" still the legal name? | The site says only "Formed in 1993" and publishes no registration number |
| 3 | **Current office bearers / executive committee** — who, and what roles may be public? | Not published |
| 4 | **Kannada review by a native speaker.** All Kannada in `src/i18n/ui.ts`, `content/site.json`, `content/programs/*`, and every record's `title`, `summary`, `batch`, `archiveNote` and `source` was written during this rebuild, not by the association | Published, and needs review. `bun run verify` now checks key parity, empty values and leftover Latin text, but it cannot judge whether the Kannada reads naturally |
| 5 | **`jnvckm.org` control** — confirm registrar access, then point it at Cloudflare Pages and set up redirects from known old paths | Canonical is set to `https://jnvckm.org` in `astro.config.mjs` |
| 6 | **CMS OAuth worker** — deploy `sveltia/sveltia-cms-auth`, set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS=jnvckm.org,www.jnvckm.org,jnvckm.pages.dev`, create the GitHub OAuth app with callback `<worker-url>/callback`, then set `backend.base_url` in `public/admin/config.yml`. Full procedure in README. Until it exists, editors sign in with a GitHub token (`contents: write`) — both methods are enabled in the config | `base_url` is unset, so OAuth falls back to Netlify's endpoint and will not work. Token sign-in and local repository mode both work now |
| 7 | **Who may edit the site** (GitHub write access is the access control) | Repo is public; only collaborators with write access can save |
| 8 | **Do the six quarantined 2024 entries really exist?** Alumni Day 2024, Balehonnur Outreach & Career Day, Library Drive Kick-off, Batch of 2004 University Scholarships, Girls' Hostel Reading Room Refresh, Village Health Clinic Camp | **Not migrated.** They are on the `archive` branch only. If they happened, supply dates/photos and they can be re-added |

## Photographs, names and permissions

| # | Item | Current handling |
| --- | --- | --- |
| 9 | **Permission for the photographs already in use**, especially images showing identifiable current students | Published as documentary photos with descriptive alt text. Nothing claims who is in them |
| 10 | **Captions, dates and people shown** for the archive photos. Filenames from the earlier migration are not captions | Recorded as unknown in `MEDIA.md`; records carry only descriptive alt text |
| 11 | **Students who are minors.** Historic student stories and photos should not identify current minors | No current student is named anywhere on the site |
| 12 | **The teachers' tribute poster** (`To our Beloved teachers`) and the press clippings are in the archive but not published | Held back pending permission |
| 13 | **Privacy of assistance records.** Bank details, IFSC, payment handles, personal phone numbers, medical diagnoses and family hardship detail from the old archive | **Redacted.** Those records show only the fact of the campaign, the amount raised where it was public, and the outcome. Each carries an archive note saying so |
| 14 | **Names in assistance records.** Two records name the person helped | Kept only where the name was central and already public; no family or medical detail |

## Facts used on the site that should be double-checked

| # | Claim | Source |
| --- | --- | --- |
| 15 | Founded 1986; began at the Coffee Research Station in Koppa Taluk; moved to Seegodu about 5 km from Balehonnur | Historical school account |
| 16 | Formed in 1993 | Association's own historical archive |
| 17 | CBSE affiliation 840012; PM SHRI; managed by Navodaya Vidyalaya Samiti | CBSE SARAS |
| 18 | IGNITE roots in the mid-2000s; 2014 was the tenth edition; 2017 the thirteenth | Association archive |
| 19 | NCL seasons documented 2015 (5) to 2025 (14) | Association archive + public tournament records |
| 20 | The annual alumni meet falls on the first Sunday of December | Association archive and NVS policy |

**Deliberately omitted:** campus acreage (the old site said 15 acres, the historic
account says 36; neither is published), the CBSE "date of first opening" field of
31 March 2011 (a database anomaly, not the founding date), the old
`jnvckm@example.com` placeholder, and any claim that this site is an official
school or Navodaya Vidyalaya Samiti website.

## Still to be supplied if wanted

- **The CWSL-1.1 licence text, if it exists.** The footer and `LICENSE` say
  CWSL-1.0, taken from the licence text used on the sibling project. Confirm
  whether 1.0 or a newer revision should apply, and who the copyright holder
  should be named as.
- Complete IGNITE edition list, and the year the name IGNITE was first used
- Complete NCL season list: years, champions, venues
- Whether the Cultural Park project was completed, and completion photographs
- Financial reports the association is willing to publish as documents
- Old `jnvckm.org` backups, Blogger exports, newsletters, higher-resolution
  clippings
- Whether the association currently accepts donations, and the wording that
  must be shown if so (`donations.enabled` is `false`, so the Connect page says
  the ways to contribute are being confirmed)
