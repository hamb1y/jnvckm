import { defineConfig } from 'astro/config';
import path from 'node:path';

export default defineConfig({
  site: "https://jnvckm.netlify.app", // 🔑 Required
  integrations: [sitemap({
    exclude: ["/admin/**", "/admin"]
  })],
  vite: {
    resolve: {
      alias: {
        'public/staticServe/images': path.resolve('public/images')
      }
    }
  }

});

