#!/usr/bin/env node
/**
 * Verify a deployed Sveltia CMS Authenticator before trusting it.
 *
 *   bun run cms:worker https://sveltia-cms-auth.<sub>.workers.dev
 *   bun run cms:worker <worker-url> --site jnvckm.pages.dev --deny evil.example
 *
 * The CMS contract, from `sveltia/sveltia-cms-auth`:
 *   GET <worker>/auth?provider=github&site_id=<hostname>
 * must answer 302 to GitHub's authorize endpoint, carrying the OAuth app's
 * client_id. The hostname is a bare hostname, never a URL. A hostname that is
 * not in ALLOWED_DOMAINS must NOT get that redirect, or any site on the
 * internet could use your worker to drive its own sign-in.
 *
 * Exits non-zero on any failure.
 */
const argv = process.argv.slice(2);

function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}

const worker = argv.find((a) => !a.startsWith("--") && /^https?:\/\//.test(a));
const allowedHost = flag("site", "jnvckm.pages.dev");
const deniedHost = flag("deny", "not-allowed.example");

if (!worker) {
  console.error(
    "Usage: bun run cms:worker <worker-url> [--site <allowed-hostname>] [--deny <unlisted-hostname>]",
  );
  process.exit(1);
}
if (!worker.startsWith("https://")) {
  console.error("The worker URL must be https; Sveltia refuses credentials over http.");
  process.exit(1);
}

const base = worker.replace(/\/+$/, "");
const problems = [];

async function redirectTo(path) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") ?? "" };
}

// 1. An allowed hostname must reach GitHub with a real client_id.
try {
  const { status, location } = await redirectTo(
    `/auth?provider=github&site_id=${encodeURIComponent(allowedHost)}`,
  );
  if (status !== 302) {
    problems.push(`allowed host: expected 302, got ${status}`);
  } else if (!/github\.com\/login\/oauth\/authorize/.test(location)) {
    problems.push(`allowed host: 302 does not point at GitHub (${location || "no location"})`);
  } else if (!/[?&]client_id=/.test(location)) {
    problems.push("allowed host: redirect has no client_id (GITHUB_CLIENT_ID is not set)");
  } else if (!/[?&]state=/.test(location)) {
    problems.push("allowed host: redirect has no state parameter");
  } else {
    console.log(`✓ ${allowedHost} -> 302 GitHub authorize, client_id present`);
  }
} catch (error) {
  problems.push(`allowed host: request failed (${error.message})`);
}

// 2. Anything not in ALLOWED_DOMAINS must not be handed a GitHub redirect.
try {
  const { status, location } = await redirectTo(
    `/auth?provider=github&site_id=${encodeURIComponent(deniedHost)}`,
  );
  if (/github\.com\/login\/oauth\/authorize/.test(location)) {
    problems.push(
      `${deniedHost} was redirected to GitHub — it is in ALLOWED_DOMAINS and must not be`,
    );
  } else {
    console.log(`✓ ${deniedHost} refused (status ${status}, no GitHub redirect)`);
  }
} catch (error) {
  problems.push(`denied host: request failed (${error.message})`);
}

// 3. The OAuth callback path must exist, since GitHub redirects to it.
try {
  const res = await fetch(`${base}/callback`, { redirect: "manual" });
  if (res.status >= 500) {
    problems.push(`/callback answered ${res.status}; GitHub's redirect target is broken`);
  } else {
    console.log(`✓ /callback reachable (status ${res.status})`);
  }
} catch (error) {
  problems.push(`/callback: request failed (${error.message})`);
}

if (problems.length) {
  console.error(`\n✗ worker not ready (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    "\nA failing first check usually means GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET are unset," +
      " or ALLOWED_DOMAINS does not list this hostname.",
  );
  process.exit(1);
}

console.log(`\n✓ ${base} answered the Sveltia auth contract. Set backend.base_url to this origin.`);
