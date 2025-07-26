import { defineConfig } from 'astro/config';
import path from 'node:path';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        'public/staticServe/images': path.resolve('public/images')
      }
    }
  }
});

