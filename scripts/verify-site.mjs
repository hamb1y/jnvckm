#!/usr/bin/env node
/**
 * Browser verification. A 200 response proves nothing, so this drives a real
 * Chromium against the built output and asserts observable behaviour.
 *
 *   bun run build && bun run verify
 *   bun run verify --shots      # also writes screenshots/ at 1440 and 390
 *
 * Exits non-zero on any failure.
 */
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.VERIFY_PORT ?? 4399);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const WANT_SHOTS = process.argv.includes("--shots");
const SHOT_DIR = path.join(ROOT, "screenshots");
const VIEWPORTS = [320, 390, 1440];

const CHROME = [
  process.env.CHROME_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].filter(Boolean).find((candidate) => existsSync(candidate));

if (!CHROME) {
  console.error("No Chromium found. Set CHROME_PATH.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const problems = [];
const notes = [];
const fail = (route, message) => problems.push(`${route} :: ${message}`);

function startServer() {
  const server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, ORIGIN).pathname);
    const candidates = [path.join(DIST, pathname), `${path.join(DIST, pathname)}.html`];
    for (const candidate of candidates) {
      try {
        const info = await stat(candidate);
        const file = info.isDirectory() ? path.join(candidate, "index.html") : candidate;
        const body = await readFile(file);
        res.writeHead(200, {
          "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
        });
        res.end(body);
        return;
      } catch {
        // try the next candidate
      }
    }
    const body = await readFile(path.join(DIST, "404.html")).catch(() => Buffer.from("Not found"));
    res.writeHead(404, { "content-type": MIME[".html"] });
    res.end(body);
  });
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

/** Islands must actually hydrate — a rendered island that never wakes up is the
 *  single most common silent failure. */
async function waitForHydration(page, timeout = 8000) {
  await page
    .waitForFunction(
      () => {
        const islands = [...document.querySelectorAll("astro-island")];
        // No islands on this page: nothing to wait for.
        if (islands.length === 0) return true;
        return islands.every((el) => !el.hasAttribute("ssr"));
      },
      { timeout, polling: 100 },
    )
    .catch(() => {});
}

async function discoverRoutes() {
  const routes = new Set(["/"]);
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        await walk(full);
      } else if (item.name === "index.html") {
        if (full.startsWith(path.join(DIST, "admin"))) continue;
        const rel = path.relative(DIST, path.dirname(full));
        routes.add(rel === "" ? "/" : `/${rel.split(path.sep).join("/")}`);
      } else if (item.name === "404.html") {
        const rel = path.relative(DIST, path.dirname(full));
        routes.add(rel === "" ? "/404" : `/${rel.split(path.sep).join("/")}/404`);
      }
    }
  }
  if (existsSync(DIST)) await walk(DIST);
  return [...routes].sort();
}

/** In-page audit: structure, images, overflow, typography and colour. */
const AUDIT = () => {
  const out = {
    islands: 0,
    hydrated: 0,
    brokenImages: [],
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    h1Count: document.querySelectorAll("h1").length,
    headingJumps: [],
    longMeasures: [],
    contrastFailures: [],
    gradients: [],
    clippedText: [],
    thickEdges: [],
    borderAndShadow: [],
    radii: [],
    uppercaseCopy: [],
    transformedImages: [],
    animatedElements: [],
    letterSpacing: getComputedStyle(document.body).letterSpacing,
  };

  const islands = [...document.querySelectorAll("astro-island")];
  out.islands = islands.length;
  out.hydrated = islands.filter((el) => !el.hasAttribute("ssr")).length;

  for (const img of document.images) {
    if (!img.complete || img.naturalWidth === 0) out.brokenImages.push(img.currentSrc || img.src);
  }

  let previous = 0;
  for (const heading of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
    const level = Number(heading.tagName[1]);
    if (previous && level > previous + 1) {
      out.headingJumps.push(`${heading.tagName} after H${previous}: ${heading.textContent?.slice(0, 40)}`);
    }
    previous = level;
  }

  const parse = (value) => {
    const match = /rgba?\(([^)]+)\)/.exec(value);
    if (!match) return null;
    const parts = match[1].split(",").map((n) => Number.parseFloat(n.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const channel = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const backgroundOf = (el) => {
    let node = el;
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.5) return bg;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const chCache = new Map();
  const chWidthOf = (style) => {
    const key = `${style.fontSize}|${style.fontFamily}|${style.fontWeight}|${style.letterSpacing}`;
    if (chCache.has(key)) return chCache.get(key);
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:${style.fontFamily};font-size:${style.fontSize};font-weight:${style.fontWeight};letter-spacing:${style.letterSpacing}`;
    probe.textContent = "0".repeat(50);
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width / 50 || style.fontSize * 0.5;
    probe.remove();
    chCache.set(key, width);
    return width;
  };

  for (const el of document.querySelectorAll("p, li, figcaption, dd, dt, span, a, h1, h2, h3, h4")) {
    const text = (el.textContent ?? "").trim();
    if (text === "" || el.children.length > 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;

    const size = Number.parseFloat(style.fontSize);
    if (size < 13) out.longMeasures.push(`tiny text ${size}px: ${text.slice(0, 30)}`);

    const color = parse(style.color);
    if (color) {
      const bg = backgroundOf(el);
      const c = ratio(color, bg);
      const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
      if (c < (large ? 3 : 4.5)) {
        out.contrastFailures.push(`${c.toFixed(2)}:1 ${size}px “${text.slice(0, 30)}”`);
      }
    }

    if (style.textTransform === "uppercase" && text.includes(" ")) {
      out.uppercaseCopy.push(text.slice(0, 40));
    }

    if (el.tagName === "P" && text.length > 120) {
      const width = el.getBoundingClientRect().width;
      const ch = width / chWidthOf(style);
      if (ch > 78 && width > 300) out.longMeasures.push(`${ch.toFixed(0)}ch paragraph`);
    }

    if (style.backgroundImage.includes("gradient")) out.gradients.push(style.backgroundImage.slice(0, 60));
    if (style.backgroundClip === "text") {
      out.clippedText.push(text.slice(0, 30));
    }

    const left = Number.parseFloat(style.borderLeftWidth) || 0;
    const top = Number.parseFloat(style.borderTopWidth) || 0;
    const borderColor = parse(style.borderLeftColor);
    if ((left >= 4 || top >= 4) && borderColor && borderColor.a > 0.3) {
      out.thickEdges.push(`${left}px/${top}px on ${el.tagName} “${text.slice(0, 24)}”`);
    }
  }

  for (const el of document.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    const bw = Number.parseFloat(style.borderTopWidth) || 0;
    const shadow = style.boxShadow;
    if (bw > 0 && shadow !== "none") {
      let max = 0;
      for (const part of shadow.split(" ")) {
        if (part.endsWith("px")) max = Math.max(max, Number.parseFloat(part) || 0);
      }
      if (max > 16) out.borderAndShadow.push(`${el.tagName} ${shadow.slice(0, 50)}`);
    }
    const radius = style.borderTopLeftRadius;
    if (radius && radius !== "0px") out.radii.push(radius);
    if (style.animationName !== "none" && !el.classList.contains("status")) {
      out.animatedElements.push(`${el.tagName} ${style.animationName}`);
    }
  }

  // Hover transforms on images, read from the same-origin stylesheets.
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!rule.selectorText?.includes(":hover")) continue;
      if (!/scale\(|rotate\(|transform\s*:/.test(rule.style?.cssText ?? "")) continue;
      if (/img|image|figure|thumb|photo/i.test(rule.selectorText)) {
        out.transformedImages.push(rule.selectorText.slice(0, 60));
      }
    }
  }

  out.radii = [...new Set(out.radii)];

  return out;
};

async function auditRoute(page, route, viewport, { navigate = true } = {}) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  const onConsole = (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  const onPageError = (error) => pageErrors.push(error.message);
  const onRequestFailed = (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText}`);
  const onResponse = (response) => {
    const url = response.url();
    if (response.status() >= 400 && /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(url)) {
      badResponses.push(`${response.status()} ${url}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  await page.setViewport({ width: viewport, height: 900 });
  if (navigate) {
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "load", timeout: 30000 });
    // Force lazy images to load, then let them settle.
    await page.evaluate(async () => {
      for (const img of document.images) img.loading = "eager";
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => setTimeout(resolve, 120));
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    await page.evaluate(() => document.fonts?.ready);
    await waitForHydration(page);
  } else {
    // Same document, narrower viewport: layout-only re-measure.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
  }

  const audit = await page.evaluate(AUDIT);

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  page.off("response", onResponse);

  for (const message of consoleErrors) fail(route, `console error: ${message}`);
  for (const message of pageErrors) fail(route, `page error: ${message}`);
  for (const message of failedRequests) fail(route, `request failed: ${message}`);
  for (const message of badResponses) fail(route, `image response: ${message}`);

  if (audit.islands !== audit.hydrated) {
    fail(route, `${audit.islands - audit.hydrated} island(s) did not hydrate`);
  }
  if (audit.brokenImages.length) fail(route, `broken images: ${audit.brokenImages.join(", ")}`);
  if (navigate && audit.h1Count !== 1) fail(route, `expected exactly one h1, found ${audit.h1Count}`);
  if (navigate && audit.headingJumps.length) {
    fail(route, `heading level skipped: ${audit.headingJumps.join("; ")}`);
  }
  if (audit.overflow) fail(route, `horizontal overflow at ${viewport}px`);
  if (navigate) {
    if (audit.contrastFailures.length) fail(route, `contrast: ${audit.contrastFailures.join("; ")}`);
    if (audit.longMeasures.length) fail(route, `typography: ${audit.longMeasures.join("; ")}`);
    if (audit.gradients.length) fail(route, `gradient: ${audit.gradients.join("; ")}`);
    if (audit.clippedText.length) fail(route, `background-clip text: ${audit.clippedText.join("; ")}`);
    if (audit.thickEdges.length) fail(route, `thick coloured edge: ${audit.thickEdges.join("; ")}`);
    if (audit.borderAndShadow.length) fail(route, `border and wide shadow: ${audit.borderAndShadow.join("; ")}`);
    if (audit.uppercaseCopy.length) fail(route, `uppercase copy: ${audit.uppercaseCopy.join("; ")}`);
    if (audit.transformedImages.length) fail(route, `image hover transform: ${audit.transformedImages.join("; ")}`);
    if (audit.animatedElements.length) fail(route, `animation: ${audit.animatedElements.join("; ")}`);
    if (audit.radii.length > 4) fail(route, `too many radii: ${audit.radii.join(", ")}`);
    const ls = Number.parseFloat(audit.letterSpacing);
    if (Number.isFinite(ls) && (ls < -1 || ls > 1)) fail(route, `body letter-spacing ${audit.letterSpacing}`);
  }

  return audit;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("dist/ not found. Run `bun run build` first.");
    process.exit(1);
  }

  const server = await startServer();
  const routes = await discoverRoutes();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  let audited = 0;
  const internalLinks = new Set();
  const navHrefs = ["/", "/about", "/programs", "/contributions", "/events", "/stories", "/connect"];
  const page = await browser.newPage();

  for (const route of routes) {
    // One navigation per route; narrower viewports only re-measure layout.
    try {
      await auditRoute(page, route, 1440, { navigate: true });
      await auditRoute(page, route, 320, { navigate: false });
      await auditRoute(page, route, 390, { navigate: false });

      const found = await page.evaluate(() => ({
        links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        nav: [...document.querySelectorAll("header a[href]")].map((a) => a.getAttribute("href")),
      }));
      for (const href of found.links) {
        if (href && href.startsWith("/")) internalLinks.add(href.split("#")[0]);
      }

      const isKn = route === "/kn" || route.startsWith("/kn/");
      for (const target of navHrefs) {
        const expected = isKn ? (target === "/" ? "/kn" : `/kn${target}`) : target;
        if (!found.nav.includes(expected)) fail(route, `nav link missing: ${expected}`);
      }

      if (WANT_SHOTS) {
        await mkdir(SHOT_DIR, { recursive: true });
        const name = route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-/, "");
        await page.setViewport({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(SHOT_DIR, `${name}-1440.png`), fullPage: true });
        await page.setViewport({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(SHOT_DIR, `${name}-390.png`), fullPage: true });
      }
    } catch (error) {
      fail(route, `audit crashed: ${error.message}`);
    }

    audited += 1;
  }

  // Internal links must not 404. Checked over HTTP rather than by navigating,
  // so the crawl stays cheap.
  for (const href of [...internalLinks].sort()) {
    const response = await fetch(`${ORIGIN}${href}`).catch(() => null);
    const status = response?.status ?? 0;
    if (status >= 400 && href !== "/404" && !href.endsWith("/404")) {
      fail(href, `internal link returned ${status}`);
    }
  }

  // Interactions.
  const interactions = await browser.newPage();
  await interactions.setViewport({ width: 390, height: 844 });
  await interactions.goto(`${ORIGIN}/contributions`, { waitUntil: "load" });
  await waitForHydration(interactions);
  const filterBefore = await interactions.evaluate(
    () => document.querySelectorAll("[data-contribution]:not([hidden])").length,
  );
  const chipClicked = await interactions.evaluate(() => {
    const chips = [...document.querySelectorAll(".filter-chip")];
    const target = chips.find((chip) => chip.getAttribute("aria-pressed") === "false");
    if (!target) return false;
    target.click();
    return true;
  });
  await new Promise((resolve) => setTimeout(resolve, 250));
  const filterAfter = await interactions.evaluate(
    () => document.querySelectorAll("[data-contribution]:not([hidden])").length,
  );
  if (!chipClicked) fail("/contributions", "no filter chip to drive");
  else if (filterAfter === filterBefore) {
    fail("/contributions", `filter did not change the visible count (${filterBefore} -> ${filterAfter})`);
  } else {
    notes.push(`filter: ${filterBefore} -> ${filterAfter} visible records`);
  }

  await interactions.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await interactions.setViewport({ width: 390, height: 844 });
  const mobileNav = await interactions.evaluate(async () => {
    const details = document.querySelector(".nav-details");
    const summary = document.querySelector(".nav-summary");
    if (!details || !summary) return { found: false };
    details.open = true;
    await new Promise((resolve) => setTimeout(resolve, 50));
    const links = [...details.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().height > 0);
    return { found: true, open: details.open, visibleLinks: links.length };
  });
  if (!mobileNav.found) fail("/", "mobile nav control not found");
  else if (!mobileNav.open || mobileNav.visibleLinks === 0) {
    fail("/", `mobile nav did not reveal links (${JSON.stringify(mobileNav)})`);
  } else {
    notes.push(`mobile nav: ${mobileNav.visibleLinks} links revealed`);
  }

  await interactions.goto(`${ORIGIN}/about`, { waitUntil: "load" });
  const switched = await interactions.evaluate(() => {
    const link = document.querySelector(".lang-switch");
    return link ? link.getAttribute("href") : null;
  });
  if (switched !== "/kn/about") fail("/about", `language switch points at ${switched}`);
  else notes.push("language switch: /about -> /kn/about");
  await interactions.close();

  // The CMS admin must render its login screen with a valid config.yml.
  const adminPage = await browser.newPage();
  const adminErrors = [];
  adminPage.on("console", (message) => {
    if (message.type() === "error") adminErrors.push(message.text());
  });
  adminPage.on("pageerror", (error) => adminErrors.push(`pageerror: ${error.message}`));
  await adminPage.goto(`${ORIGIN}/admin/`, { waitUntil: "networkidle2", timeout: 45000 }).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const admin = await adminPage.evaluate(() => {
    const el = document.querySelector("sveltia-cms, [class*=sveltia], div");
    const text = (document.body.innerText || "").trim();
    return { hasApp: Boolean(el), text: text.slice(0, 400) };
  });
  for (const message of adminErrors) fail("/admin/", `console error: ${message}`);
  if (!admin.hasApp) fail("/admin/", "admin app did not mount");
  if (/error loading|failed to load config|invalid config|configuration error/i.test(admin.text)) {
    fail("/admin/", `config error shown: ${admin.text.slice(0, 160)}`);
  } else {
    notes.push(`admin: mounted, text starts “${admin.text.slice(0, 60)}”`);
  }
  await adminPage.close();

  await page.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  console.log(`\nAudited ${audited} routes at ${VIEWPORTS.join("/")}px`);
  for (const note of notes) console.log(`  · ${note}`);
  if (problems.length === 0) {
    console.log("\n✓ verify: all checks passed\n");
    process.exit(0);
  }
  console.log(`\n✗ verify: ${problems.length} problem(s)\n`);
  for (const problem of problems) console.log(`  - ${problem}`);
  console.log("");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
