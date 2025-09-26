# Translations Guide · P7CO® EcoResupply

This guide explains how to translate **P7CO® EcoResupply** content (Blog, Pages, Technical Articles) and how to comply with GDPR/Privacy rules for **blogs and articles**.

## 🌍 Supported Languages

* English → `static/blog/en/`, `static/page/en/`, `static/article/en/`
* Portuguese → `static/blog/pt/`, `static/page/pt/`, `static/article/pt/`
* Spanish → `static/blog/es/`, `static/page/es/`, `static/article/es/`
* French → `static/blog/fr/`, `static/page/fr/`, `static/article/fr/`
* German → `static/blog/de/`, `static/page/de/`, `static/article/de/`

> Future languages may be added as the community grows.

## 📂 File Structure & Naming

Each item is a **Markdown file (`.md`)** inside the proper language folder.
Translations must keep the **same filename** as the source.

**Blog example**

```
static/blog/en/2025-04-circular-economy.md
static/blog/pt/2025-04-circular-economy.md
static/blog/es/2025-04-circular-economy.md
```

**Page example**

```
static/page/en/about.md
static/page/pt/about.md
```

**Technical Article example**

```
static/article/en/industrial-symbiosis-basics.md
static/article/pt/industrial-symbiosis-basics.md
```

## 📝 Frontmatter (TOML, `+++`)

All Markdown starts with **TOML** frontmatter. Translators must localize text fields.

```toml
+++
title = "Circular Economy: A Global Challenge"
intro = "A short introduction in the target language."
image = "/images/circular.jpg"
date = 2025-04-01
updated_at = 2025-04-02
category = "guides"
tags = ["Sustainability", "Circular Economy"]
reading_time = 5
active = true
+++
```

**Translate:** `title`, `intro`, `tags`.
**Keep as source (unless explicitly updated):** `image`, `date`, `updated_at`, `category`, `reading_time`, `active`.
**Language is inferred from folder** (do not add `lang` unless the original has it).

**Image rules**

* Path must start with `/images/`
* JPEG `.jpg/.jpeg`
* **1200×675 px**, **≤150 KB**
* Non-conforming images will fail CI

**Markdown limits**

* Max file size: **100 KB**
* No invalid control characters

## ✍️ Style & Terminology

* Be **clear, concise, and accurate**.
* Keep the tone: professional, informative, inclusive.
* Prefer terminology established in sustainability/circular economy.
* Avoid literal machine translation without human revision.
* Do **not** change links, image paths, file names, or slugs.


## 📚 Technical Articles (category: `whitepaper`, `report`, `analysis`, `tech`, `legal`, etc.)

For files under `static/article/<lang>/…`:

* Prefer **neutral, source-cited** writing.
* If the original includes references, **preserve and translate citation titles**; keep identifiers (DOI, URLs) unchanged.
* Use markdown reference sections, e.g.:

  ```
  ## References
  1. Author A. Title. Journal, 2024. DOI: …
  ```
* Code blocks: keep language fences (`js, `bash).
* Diagrams/images must follow the **Image rules** above.
* If the original includes **disclosures** (funding, conflicts), keep them.
* If you add clarifying translator notes, mark them as:

  > *Translator note:* …


## 🔐 GDPR & Privacy (applies to **Blogs** and **Articles**)

**Goal:** No **personal data** inside Markdown content. Author identity, profile, and contact data come **from the site profile**, not from the file.

### 🚫 Do NOT include in Markdown

* Emails, phone numbers, addresses, IDs, signatures
* Full names or detailed bios of private individuals
* Photos that identify people (faces, license plates) unless licensed and consented
* Special categories of personal data (health, political opinions, etc.)
* Location data more precise than city/region without necessity

### ✅ Allowed with care

* Public quotes from **public sources** (cite source; avoid personal details)
* Public contact of **organizations** (generic inbox like `press@…`)
* Aggregate statistics or anonymized datasets (no re-identification risk)

### 🧹 Redaction Checklist (before committing)

* Remove author bio/contact lines from the Markdown (comes from profile)
* Strip personal names unless they’re necessary and already public in the source
* Replace face-identifiable images with neutral graphics or compliant stock
* Ensure images contain no EXIF with personal data (our pipeline ignores EXIF, but don’t rely on it)

### 📝 Consent & Sources

* Quotes: provide a source link; do not include emails/phones
* If a person explicitly consented to appear: keep consent evidence **outside the repo**
* For minors: **do not** publish identifying data or images

## 🔍 Review & PR Process

* Submit translations as **Pull Requests**.
* CI will validate:

  * Frontmatter fields
  * Image format/size/dimensions
  * Markdown size and characters
* PRs are reviewed by the **Core Team** (and native speakers when available).
* Blogs/Articles must pass **GDPR checks** above before merge.

## 📜 License

All translations are under repository content license: **[CC BY-SA 4.0](LICENSE-content.md)**.
