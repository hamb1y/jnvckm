#!/usr/bin/env node
/**
 * Social cards. Every site image ships as WebP, but not every link scraper
 * renders WebP, so each one gets a 1200×630 JPEG twin in `public/og/`.
 * BaseLayout points `og:image` and `twitter:image` at the twin.
 *
 * Runs before `astro build` (see the `build` script) and writes into `public/`,
 * which Astro copies to `dist/`. Generated, so not committed.
 */
import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/images");
const OUT = path.join(ROOT, "public/og");
const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  if (!existsSync(SRC)) {
    console.warn("no public/images yet; skipping social cards");
    return;
  }
  await mkdir(OUT, { recursive: true });

  const sources = (await readdir(SRC)).filter((file) => file.endsWith(".webp"));
  let written = 0;
  for (const file of sources) {
    const dest = path.join(OUT, file.replace(/\.webp$/, ".jpg"));
    try {
      await sharp(path.join(SRC, file))
        .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(dest);
      written += 1;
    } catch (error) {
      console.warn(`skip ${file}: ${error.message}`);
    }
  }
  console.log(`Wrote ${written} social cards to public/og/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
