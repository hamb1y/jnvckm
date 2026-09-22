#!/usr/bin/env node
/**
 * Derive every logo asset from the source artwork in `originals/assets/`.
 *
 * The supplied logotype is a white-plate raster with no alpha channel, so this
 * script keys white to transparent (un-premultiplying each channel so grey and
 * orange keep their apparent weight on the paper ground) and then emits:
 *
 *   public/logo-mark.webp      transparent lockup for header/footer
 *   public/favicon.svg         paper tile + embedded mark
 *   public/favicon-32.png      classic tab icon
 *   public/favicon-192.png     Android / manifest
 *   public/apple-touch-icon.png
 *   public/og-default.png      social card built from a real photograph
 *
 *   bun run logo
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "originals/assets/logo.webp");
const PAPER = { r: 247, g: 243, b: 232, alpha: 1 };

/** Key a white plate to transparency, keeping apparent colour weight. */
async function whiteToAlpha(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = 255 - Math.min(r, g, b);
    if (alpha === 0) continue;
    const un = (c) => Math.max(0, Math.min(255, Math.round((c - (255 - alpha)) * (255 / alpha))));
    out[o] = un(r);
    out[o + 1] = un(g);
    out[o + 2] = un(b);
    out[o + 3] = alpha;
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** Mark on a paper tile, centred, at `inset` fraction of the tile width. */
async function tile(mark, size, inset) {
  const inner = Math.round(size * inset);
  const scaled = await sharp(mark)
    .resize({ width: inner, height: inner, fit: "inside", withoutEnlargement: true })
    .toBuffer();
  const meta = await sharp(scaled).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: PAPER } })
    .composite([
      {
        input: scaled,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(path.join(ROOT, "public"), { recursive: true });

  const transparent = await whiteToAlpha(SRC);
  const trimmed = await sharp(transparent).trim({ threshold: 2 }).png().toBuffer();

  await sharp(trimmed).webp({ quality: 90 }).toFile(path.join(ROOT, "public/logo-mark.webp"));

  const icons = [
    ["favicon-32.png", 32, 0.94],
    ["favicon-192.png", 192, 0.8],
    ["apple-touch-icon.png", 180, 0.78],
  ];
  for (const [name, size, inset] of icons) {
    await writeFile(path.join(ROOT, "public", name), await tile(trimmed, size, inset));
  }

  const svgIcon = await tile(trimmed, 192, 0.8);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <image href="data:image/png;base64,${svgIcon.toString("base64")}" width="192" height="192"/>
</svg>
`;
  await writeFile(path.join(ROOT, "public/favicon.svg"), svg, "utf8");

  // Social card: a real photograph, with the association's olive rule along the
  // foot. No fabricated imagery, no baked-in text that would only say "JNVCKM".
  const photo = path.join(ROOT, "originals/hero/hero-1.webp");
  const card = await sharp(await readFile(photo))
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .toBuffer();
  const band = await sharp({
    create: { width: 1200, height: 14, channels: 4, background: { r: 61, g: 74, b: 33, alpha: 1 } },
  })
    .png()
    .toBuffer();
  await sharp(card)
    .composite([{ input: band, left: 0, top: 630 - 14 }])
    .png()
    .toFile(path.join(ROOT, "public/og-default.png"));

  console.log("Wrote logo-mark, favicons and og-default");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
