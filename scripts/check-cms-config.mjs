#!/usr/bin/env node
/**
 * Validate the Sveltia CMS configuration.
 *
 * Two kinds of check:
 *
 *  1. Offline structure and coverage — required keys, valid widget names, a
 *     valid `auth_scope`, i18n locales matching the content, and (the one that
 *     actually prevents data loss) every field present in `content/` being
 *     declared in `config.yml`. Sveltia drops fields it does not know about when
 *     an editor saves, so an undeclared field is silent data loss.
 *  2. `--schema` — validate the whole file against the JSON Schema published
 *     with the CMS package. Needs network access; run it when editing the config.
 *
 *   bun run cms                 # offline checks
 *   bun run cms --schema        # ...plus validation against the official schema
 *
 * Exported so `bun run verify` can run the offline checks as part of the gate.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCHEMA_URL = "https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json";

/** Widget names taken from the schema published with @sveltia/cms. */
export const WIDGETS = new Set([
  "boolean", "code", "color", "compute", "datetime", "file", "hidden", "image",
  "keyvalue", "list", "map", "markdown", "number", "object", "relation",
  "richtext", "select", "string", "text", "uuid",
]);
export const AUTH_SCOPES = new Set(["repo", "public_repo"]);
export const I18N_STRUCTURES = new Set(["single_file", "multiple_files", "multiple_folders"]);

const fail = (where, message) => console.error(`  ✗ ${where}: ${message}`);

function checkFields(fields, where, problems) {
  if (!Array.isArray(fields)) {
    problems.push(`${where}: fields must be a list`);
    return;
  }
  for (const field of fields) {
    const id = `${where} › ${field?.name ?? "(unnamed)"}`;
    if (!field?.name) problems.push(`${id}: missing name`);
    if (!field?.label) problems.push(`${id}: missing label (every field needs one)`);
    if (!field?.widget) problems.push(`${id}: missing widget`);
    else if (!WIDGETS.has(field.widget)) problems.push(`${id}: unknown widget "${field.widget}"`);
    if (field?.widget === "select") {
      const options = field.options;
      if (!Array.isArray(options) || options.length === 0) {
        problems.push(`${id}: a select needs options`);
      }
    }
    if (field?.widget === "object" || field?.widget === "list") checkFields(field.fields, id, problems);
    if (field?.types) for (const type of field.types) checkFields(type.fields, `${id} › ${type.name}`, problems);
  }
}

export async function checkCmsConfig({ root = ROOT } = {}) {
  const problems = [];
  const notes = [];
  const configPath = path.join(root, "public/admin/config.yml");
  const config = YAML.parse(await readFile(configPath, "utf8"));

  // --- backend -------------------------------------------------------------
  const backend = config.backend ?? {};
  if (backend.name !== "github") problems.push(`backend.name is "${backend.name}", expected "github"`);
  if (!backend.repo || !/^[\w.-]+\/[\w.-]+$/.test(backend.repo)) {
    problems.push(`backend.repo "${backend.repo}" is not OWNER/REPO`);
  }
  if (!backend.branch) problems.push("backend.branch is missing");
  if (!AUTH_SCOPES.has(backend.auth_scope)) {
    problems.push(`backend.auth_scope "${backend.auth_scope}" must be one of ${[...AUTH_SCOPES].join(", ")}`);
  }
  if (backend.base_url === "") problems.push("backend.base_url is an empty string; remove the key or set a URL");

  // --- media ---------------------------------------------------------------
  if (!config.media_folder) problems.push("media_folder is missing");
  if (!config.public_folder) problems.push("public_folder is missing");

  // --- i18n ----------------------------------------------------------------
  if (config.i18n) {
    if (!I18N_STRUCTURES.has(config.i18n.structure)) {
      problems.push(`i18n.structure "${config.i18n.structure}" is not a known value`);
    }
    const contentLocales = new Set();
    const ui = await readFile(path.join(root, "src/i18n/ui.ts"), "utf8").catch(() => "");
    for (const match of ui.matchAll(/^  (\w+): \{/gm)) contentLocales.add(match[1]);
    for (const locale of config.i18n.locales ?? []) {
      if (contentLocales.size && !contentLocales.has(locale)) {
        problems.push(`i18n locale "${locale}" has no dictionary in src/i18n/ui.ts`);
      }
    }
    if (!config.i18n.locales?.includes(config.i18n.default_locale)) {
      problems.push("i18n.default_locale is not in i18n.locales");
    }
  }

  // --- collections ---------------------------------------------------------
  if (!Array.isArray(config.collections) || config.collections.length === 0) {
    problems.push("collections is missing or empty");
  }
  const names = new Set();
  for (const collection of config.collections ?? []) {
    const where = `collection "${collection.name ?? "?"}"`;
    if (!collection.name) problems.push(`${where}: missing name`);
    if (names.has(collection.name)) problems.push(`${where}: duplicate collection name`);
    names.add(collection.name);
    if (!collection.label) problems.push(`${where}: missing label`);
    if (collection.folder) {
      if (!collection.format) problems.push(`${where}: a folder collection needs a format`);
      if (!collection.identifier_field) problems.push(`${where}: set identifier_field`);
      checkFields(collection.fields, where, problems);
    } else if (collection.files) {
      for (const file of collection.files) {
        if (!file.file) problems.push(`${where} › "${file.name}": missing file path`);
        checkFields(file.fields, `${where} › ${file.name}`, problems);
      }
    } else {
      problems.push(`${where}: needs a folder or files`);
    }
  }

  // --- coverage: every content field must be declared ----------------------
  const fieldNames = (fields) => new Set((fields ?? []).map((f) => f.name));
  const subFields = (fields, name) => fieldNames((fields ?? []).find((f) => f.name === name)?.fields);

  for (const collection of config.collections ?? []) {
    if (collection.files) {
      for (const file of collection.files) {
        const data = JSON.parse(await readFile(path.join(root, file.file), "utf8"));
        const declared = fieldNames(file.fields);
        for (const key of Object.keys(data)) {
          if (!declared.has(key)) problems.push(`${file.file}: "${key}" is not declared, so a save would drop it`);
        }
        for (const [name, keys] of [
          ["contact", Object.keys(data.contact ?? {})],
          ["donations", Object.keys(data.donations ?? {})],
        ]) {
          const declaredSub = subFields(file.fields, name);
          for (const key of keys) {
            if (!declaredSub.has(key)) problems.push(`${file.file} ${name}: "${key}" is not declared`);
          }
        }
        for (const social of data.socials ?? []) {
          const declaredSub = subFields(file.fields, "socials");
          for (const key of Object.keys(social)) {
            if (!declaredSub.has(key)) problems.push(`${file.file} socials[]: "${key}" is not declared`);
          }
        }
      }
      continue;
    }
    const dir = path.join(root, collection.folder);
    const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
    const declared = fieldNames(collection.fields);
    const undeclared = new Set();
    const undeclaredImage = new Set();
    const undeclaredDoc = new Set();
    for (const file of files) {
      const data = JSON.parse(await readFile(path.join(dir, file), "utf8"));
      for (const key of Object.keys(data)) if (!declared.has(key)) undeclared.add(key);
      if (data.image) for (const key of Object.keys(data.image)) if (!subFields(collection.fields, "image").has(key)) undeclaredImage.add(key);
      for (const doc of data.documents ?? []) {
        for (const key of Object.keys(doc)) if (!subFields(collection.fields, "documents").has(key)) undeclaredDoc.add(key);
      }
    }
    for (const key of undeclared) problems.push(`${collection.name}: "${key}" is not declared, so a save would drop it`);
    for (const key of undeclaredImage) problems.push(`${collection.name}.image: "${key}" is not declared`);
    for (const key of undeclaredDoc) problems.push(`${collection.name}.documents[]: "${key}" is not declared`);
    notes.push(`${collection.name}: ${files.length} files, ${declared.size} declared fields`);
  }

  return { problems, notes, config, configPath };
}

async function validateAgainstSchema(config) {
  const { default: Ajv } = await import("ajv");
  const response = await fetch(SCHEMA_URL);
  if (!response.ok) throw new Error(`could not fetch the schema (${response.status})`);
  const schema = await response.json();
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
  const validate = ajv.compile(schema);
  if (validate(config)) return [];
  const seen = new Set();
  const out = [];
  for (const error of validate.errors) {
    const key = `${error.instancePath} ${error.keyword}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const allowed = error.params?.allowedValues ? ` (allowed: ${error.params.allowedValues.slice(0, 8).join(", ")})` : "";
    out.push(`${error.instancePath || "(root)"} ${error.message}${allowed}`);
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { problems, notes, config } = await checkCmsConfig();
  for (const note of notes) console.log(`  · ${note}`);
  for (const problem of problems) fail("config.yml", problem);

  if (process.argv.includes("--schema")) {
    try {
      const schemaProblems = await validateAgainstSchema(config);
      for (const problem of schemaProblems) fail("schema", problem);
      if (schemaProblems.length === 0) console.log("  · valid against the official Sveltia schema");
      problems.push(...schemaProblems);
    } catch (error) {
      console.error(`  ! schema validation skipped: ${error.message}`);
    }
  }

  if (problems.length) {
    console.error(`\n✗ cms: ${problems.length} problem(s)\n`);
    process.exit(1);
  }
  console.log("\n✓ cms: config valid\n");
}
