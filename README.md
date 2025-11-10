# Jawahar Navodaya Vidyalaya Chikkamagluru (JNVCKM)

Static-first Astro site for the alumni network with Decap CMS content editing and Clerk-protected admin access.

## Tech Stack

- [Astro 5](https://astro.build) with Node adapter (needed for Clerk middleware)
- Plain CSS (no UI kit) and lightweight Astro islands for the hero carousel + contact form mailto
- Decap CMS (`git-gateway`) writing Markdown into `content/`
- Clerk authentication guarding `/admin` and `public/admin/*`

## Getting Started

```bash
bun install
bun dev
```

Build & preview:

```bash
bun run build
bun run preview
```

Environment variables (`.env`):

```
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

Add optional `PUBLIC_CLERK_SIGN_IN_URL` if you prefer a hosted Clerk sign-in URL for the guard message.

## Project Structure

```
content/                # Markdown collections managed by Decap
public/
  admin/                # Decap bootstrap + config.yml
  hero/                 # Hero carousel images (jpg/png/webp)
  uploads/              # Media uploaded via CMS
src/
  components/           # Header, footer, hero carousel, cards, FAQ accordion, contact form
  layouts/BaseLayout    # Global <head>, fonts, CSS imports
  pages/                # Routes: home, events, contributions, admin, 404
  styles/               # global.css & components.css
```

## Content Authoring

- **Events / Contributions**: Markdown files in `content/events` and `content/contributions`. Each file stores metadata in frontmatter (`title`, `date`, `summary`, etc.) and rich Markdown body for detail pages.
- **FAQs**: Markdown files in `content/faqs`. Decap exposes `question`, `answer` (markdown string), and `order`. Answers render via a custom accordion component.

Decap CMS is available at `/admin` (Clerk-protected) and renders the static bundle from `public/admin/index.html`.

## Assets & Styling

- Brand color tokens and transitions live in `src/styles/global.css`; component-specific rules in `src/styles/components.css`.
- Hero images: drop `.jpg/.png/.webp` files into `public/hero/`. They are auto-detected for the carousel.
- Favicon assets are generated from `public/assets/logo.webp` and linked in `BaseLayout`.

## Authentication & Admin

- Middleware (`src/middleware.ts`) guards `/admin` and `/admin/*`. Authenticated users see the Decap iframe; others get a lightweight “Sign in required” screen with a link to the configured Clerk sign-in page.
- `/admin/index.astro` is `prerender = false` so it can read the Clerk session at request time.

## Deployment Notes

- Because Clerk middleware runs on the Edge/Node runtime, keep the Node adapter in `astro.config.mjs`.
- Ensure your hosting platform exposes the Clerk environment variables and allows SSR routes.
- Decap uses Git Gateway; configure Netlify/Render accordingly so CMS commits land on `main`.
