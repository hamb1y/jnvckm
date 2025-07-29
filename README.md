# JNVCKM Alumni Site

This is the official alumni website for JNVCKM, built with [Astro](https://astro.build), [Decap CMS](https://decapcms.org), and [Netlify Identity](https://docs.netlify.com/visitor-access/identity/).  
It’s fast, content-editable, and designed to run with **zero JavaScript for theming** and **robust, maintainable CSS**. Dynamic behavior is powered only where necessary, using Astro islands.

---

## 🧱 Tech Stack

- **Astro** – Static-first site builder with partial hydration
- **Decap CMS** – Markdown-powered, Git-based headless CMS at `/admin`
- **Netlify Identity** – Handles CMS logins and permissions
- **CSS** – Custom, semantic, themeable; no frameworks used
- **JavaScript** – Used only for dynamic components (not theming, not nav)

---

## 🚀 Getting Started

To run this project locally:

```bash
# 1. Clone the repository
git clone https://github.com/hamb1y/jnvckm.git
cd jnvckm

# 2. Install dependencies (pnpm preferred)
pnpm install

# 3. Start local dev server
pnpm dev
```

The site will be available at `http://localhost:4321`.

---

## 🌐 Live Editing with Decap CMS

- Visit `/admin` in your browser
- Login using your Netlify Identity account
- Create, update, or delete content through a clean CMS UI
- Content is saved as Markdown in the repo and triggers rebuilds

---

## 🔐 Netlify Identity Access

- Only invited users can log into the CMS
- Identity roles and email invites are handled through Netlify’s dashboard
- Identity is connected to Git for commit-based CMS updates

---

## 🌗 Theme Support

- **CSS-only light/dark mode**
- Powered by the `:has()` pseudo-class on `<body>`
- No JavaScript required — instant, flicker-free theme transitions
- Logos/images can be swapped based on the active theme using pure CSS

---

## 🗂 Project Structure

This project follows a modular folder layout separating setup templates, CMS, static assets, and dynamic components.  
Includes Astro `.astro` components, Markdown content folders, CMS config, and public assets.
jnvckm
├── public/                  # Static files served as-is
│   ├── admin/               # Decap CMS setup
│   │   └── config.yml
│   ├── fonts/               # Font files
│   ├── images/              # Optimized image assets
│   ├── staticServe/         # Files for direct download (e.g. gallery)
│   │   ├── images/
│   │   └── jnvckm/
│   ├── favicon.{png,svg}
│   └── main.css             # CSS
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── BlogGrid.astro
│   │   ├── BlogLayout.astro
│   │   ├── Button.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Layout.astro
│   │   └── ThemeSwitcher.astro
│   ├── pages/               # Markdown + Astro pages
│   │   ├── about.astro
│   │   ├── contributions.astro
│   │   ├── events.astro
│   │   ├── faq.astro
│   │   ├── index.astro
│   │   ├── students.astro
│   │   ├── contributions/
│   │   │   └── blog1.md ... blog14.md
│   │   └── events/
│   │       └── blog1.md ... blog18.md
│   └── images/              
├── astro.config.mjs         # Astro project config
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
---

## 📦 Deployment

- Hosted on **Netlify**
- Automatic builds triggered on Git pushes
- CMS edits are committed directly to the repository by Decap

---

## ✅ Project Status

- ✅ Production-ready
- ✅ Minimal JS footprint
- ✅ All client feedback incorporated (finalized)
- ✅ Responsive, accessible, and lightweight

---

## 📜 License

MIT License — see `LICENSE.md` for details.