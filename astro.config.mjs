import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

// Canonical domain is jnvckm.org. The Cloudflare Pages project is named
// "jnvckm" so the secondary origin is jnvckm.pages.dev.
export default defineConfig({
  site: "https://jnvckm.org",
  output: "static",
  integrations: [svelte(), sitemap()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "kn"],
    routing: { prefixDefaultLocale: false },
  },
  server: { port: 4321 },
});
