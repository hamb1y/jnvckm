import { defineConfig } from 'astro/config';
import path from 'node:path';

export default defineConfig({
  site: "https://jnvckm.netlify.app",
  vite: {
    resolve: {
      alias: {
        'public/staticServe/images': path.resolve('public/images')
      }
    }
  }

});

