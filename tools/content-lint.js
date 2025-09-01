// tools/content-lint.js
/**
 * ================================================================
 *  P7CO® EcoResupply — Content Linter (blog/page/article)
 * ================================================================
 *
 * Checked paths:
 * - blog/{pt|en|fr|de|es}/*.md
 * - page/{pt|en|fr|de|es}/*.md
 * - article/{pt|en|fr|de|es}/*.md
 * - images/**
 *
 * Regras: iguais às anteriores (title, intro, image, date, tags, active, etc)
 * ================================================================
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const toml = require("@iarna/toml");
const sharp = require("sharp");

const REPO_ROOT = process.cwd();
const CONTENT_ROOTS = ["blog", "page", "article"].map((t) =>
  path.join(REPO_ROOT, t)
);
const IMAGES_ROOT = path.join(REPO_ROOT, "images");

const SUPPORTED_LANGS = new Set(["pt", "en", "fr", "de", "es"]);
const ALLOWED_CATEGORIES = new Set([
  "guides",       // Tutorials, how-to articles
  "news",         // News, announcements
  "case-studies", // Real-world case studies
  "esg",          // Environmental, Social, Governance
  "tech",         // Technology & tools
  "p7co",         // Internal / brand-specific
  "policy",       // Legislation, regulations, policies
  "community",    // Community contributions & stories
  "innovation",   // R&D, startups, new methods
  "circularity",  // Circular economy best practices
  "events",       // Conferences, webinars, events
  "na",           // Not applicable
  "opinion",      // Opinion, editorial
  "analysis",     // Analysis and comparisons
  "whitepaper",   // Technical or academic papers
  "report",       // Reports or studies
  "insight",      // Market trends and insights
  "legal",        // Legal articles
  "environment",  // Environment & sustainability
  "market",       // Market or sector-specific
  "services",     // Service pages
  "about",        // Institutional / About us
  "faq",          // Frequently asked questions
]);

const IMG_MAX_BYTES = 150 * 1024; // 150 KB
const IMG_WIDTH = 1200;
const IMG_HEIGHT = 675;

const MD_MAX_BYTES = 100 * 1024; // 100 KB
const INVALID_CTRL_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/* ------------------------------ utils ------------------------------ */
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) acc.push(full);
  }
  return acc;
}

function normalizeDate(val) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof val === "string") {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

function isIsoDate(dateOnly) {
  if (typeof dateOnly !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly))
    return false;
  const d = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const [y, m, day] = dateOnly.split("-").map(Number);
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() + 1 === m &&
    d.getUTCDate() === day
  );
}

function normalizeImagePath(val) {
  if (typeof val !== "string") return val;
  const PREFIX = "/proxy/image?path=";
  if (val.startsWith(PREFIX)) {
    const q = val.slice(PREFIX.length);
    if (q.startsWith("images/")) return "/" + q;
  }
  return val;
}

function ghaError(file, message, startLine = 1) {
  const rel = path.relative(REPO_ROOT, file).replace(/\\/g, "/");
  console.error(`::error file=${rel},line=${startLine},col=1::${message}`);
}

/* ---------------------------- validators --------------------------- */
function validateFrontmatter(f, data, langFromPath) {
  const errs = [];
  const required = ["title", "intro", "image", "date", "tags", "active"];

  for (const key of required) {
    if (!(key in data))
      errs.push(`Missing required frontmatter field: "${key}"`);
  }

  if ("title" in data) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errs.push(`"title" must be a non-empty string`);
    } else if (/<[^>]+>/.test(data.title)) {
      errs.push(`"title" should not contain HTML`);
    }
  }

  if ("intro" in data) {
    if (typeof data.intro !== "string" || !data.intro.trim()) {
      errs.push(`"intro" must be a non-empty string`);
    } else if (data.intro.length > 280) {
      errs.push(`"intro" too long (> 280 chars)`);
    }
  }

  if ("date" in data) {
    const dOnly = normalizeDate(data.date);
    if (!dOnly || !isIsoDate(dOnly)) {
      errs.push(`"date" must be ISO YYYY-MM-DD (got: ${JSON.stringify(data.date)})`);
    } else {
      data.date = dOnly;
    }
  }

  if ("tags" in data) {
    const ok =
      Array.isArray(data.tags) &&
      data.tags.length > 0 &&
      data.tags.every((t) => typeof t === "string" && t.trim());
    if (!ok) errs.push(`"tags" must be non-empty array of strings`);
  }

  if ("active" in data && typeof data.active !== "boolean") {
    errs.push(`"active" must be boolean (true/false)`);
  }

  if ("category" in data && data.category) {
    if (
      typeof data.category !== "string" ||
      !ALLOWED_CATEGORIES.has(data.category)
    ) {
      errs.push(`"category" must be one of: ${[...ALLOWED_CATEGORIES].join(", ")}`);
    }
  }

  if ("lang" in data && data.lang) {
    if (typeof data.lang !== "string" || !SUPPORTED_LANGS.has(data.lang)) {
      errs.push(`"lang" must be one of: ${[...SUPPORTED_LANGS].join(", ")}`);
    } else if (data.lang !== langFromPath) {
      errs.push(`"lang" (${data.lang}) does not match folder (${langFromPath})`);
    }
  }

  if ("image" in data) {
    data.image = normalizeImagePath(data.image);
    if (typeof data.image !== "string" || !data.image.startsWith("/images/")) {
      errs.push(`"image" must start with "/images/" (got: ${JSON.stringify(data.image)})`);
    } else {
      const rel = data.image.replace(/^\/+/, "");
      const imgPath = path.join(REPO_ROOT, rel);
      if (!fs.existsSync(imgPath)) errs.push(`Image not found: ${data.image}`);
    }
  }

  for (const e of errs) ghaError(f, e, 1);
  return errs;
}

async function validateImageFile(postFile, imageRel) {
  const errs = [];
  const rel = imageRel.replace(/^\/+/, "");
  const full = path.join(REPO_ROOT, rel);

  if (!fs.existsSync(full)) {
    errs.push(`Image file does not exist: ${imageRel}`);
  } else {
    const ext = path.extname(full).toLowerCase();
    if (!(ext === ".jpg" || ext === ".jpeg")) {
      errs.push(`Image must be JPG (.jpg/.jpeg). Got: ${ext}`);
    }
    const stats = fs.statSync(full);
    if (stats.size > IMG_MAX_BYTES) {
      errs.push(`Image too large: ${stats.size} bytes (max ${IMG_MAX_BYTES})`);
    }
    try {
      const meta = await sharp(full).metadata();
      if (meta.format !== "jpeg") {
        errs.push(`Image format must be JPEG. Detected: ${meta.format}`);
      }
      if (meta.width !== IMG_WIDTH || meta.height !== IMG_HEIGHT) {
        errs.push(`Image must be ${IMG_WIDTH}x${IMG_HEIGHT}. Detected: ${meta.width}x${meta.height}`);
      }
    } catch (e) {
      errs.push(`Unable to read image metadata: ${e.message}`);
    }
  }

  for (const e of errs) ghaError(postFile, `Image rule: ${e}`);
  return errs;
}

function validateMarkdownFileBytesAndChars(filePath) {
  const errs = [];
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length > MD_MAX_BYTES) {
      errs.push(`Markdown too large: ${buf.length} bytes (max ${MD_MAX_BYTES})`);
    }
    if (INVALID_CTRL_REGEX.test(buf.toString("utf8"))) {
      errs.push(`Markdown contains invalid control characters.`);
    }
  } catch (e) {
    errs.push(`Unable to read file: ${e.message}`);
  }
  for (const e of errs) ghaError(filePath, e);
  return errs;
}

/* ------------------------------- main ------------------------------ */
async function lintFolder(root, type) {
  if (!fs.existsSync(root)) {
    console.log(`No ${type}/ directory found. Skipping.`);
    return 0;
  }
  const files = walk(root);
  if (files.length === 0) {
    console.log(`No Markdown in ${type}/`);
    return 0;
  }

  let totalErrors = 0;

  for (const f of files) {
    const rel = path.relative(REPO_ROOT, f);
    const parts = rel.split(path.sep);
    const idx = parts.indexOf(type);
    const langFromPath = idx >= 0 ? parts[idx + 1] : undefined;

    if (!langFromPath || !SUPPORTED_LANGS.has(langFromPath)) {
      ghaError(f, `Invalid language folder "${langFromPath}". Must be one of: ${[...SUPPORTED_LANGS].join(", ")}`);
      totalErrors++;
      continue;
    }

    totalErrors += validateMarkdownFileBytesAndChars(f).length;

    let fm;
    try {
      fm = matter.read(f, {
        delimiters: "+++",
        language: "toml",
        engines: { toml: (src) => toml.parse(src) },
      });
    } catch (e) {
      ghaError(f, `Invalid frontmatter: ${e.message}`);
      totalErrors++;
      continue;
    }

    if (!fm || !fm.data || Object.keys(fm.data).length === 0) {
      ghaError(f, `Missing frontmatter block ("+++ ... +++").`);
      totalErrors++;
      continue;
    }

    totalErrors += validateFrontmatter(f, fm.data, langFromPath).length;

    const body = (fm.content || "").trim();
    if (!body) {
      ghaError(f, `Empty Markdown body`);
      totalErrors++;
    }

    if (fm.data && typeof fm.data.image === "string" && fm.data.image.startsWith("/images/")) {
      totalErrors += (await validateImageFile(f, fm.data.image)).length;
    }
  }

  return totalErrors;
}

async function main() {
  let totalErrors = 0;
  for (const type of ["blog", "page", "article"]) {
    totalErrors += await lintFolder(path.join(REPO_ROOT, type), type);
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Content linter found ${totalErrors} issue(s).`);
    process.exit(1);
  } else {
    console.log("✅ Content linter passed. All content is valid.");
  }
}

main().catch((err) => {
  console.error(`::error::Unexpected linter failure: ${err.message}`);
  process.exit(1);
});
