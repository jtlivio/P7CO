# P7CO® EcoResupply Blog

Content repository for sustainability, circular economy and innovation articles

[![Content Lint](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml/badge.svg)](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml)

**P7CO® EcoResupply Blog**
Official blog content repository managed by **pH7x Systems®**.

![P7CO® EcoResupply Logo](/images/p7co.png)

## 🌍 About the Project

**Our Mission**
To promote a real circular economy worldwide by simplifying the reuse of surplus and waste through innovative technology.
We connect companies, public entities, and citizens, making material reuse simple, transparent, and measurable.

**Our Vision**
To become the reference platform for sustainable resource management, inspiring a shift toward a regenerative and collaborative economic model — where every material counts, and every contribution creates positive, measurable impact for society and the planet.

**Circularity**
The future begins with every choice: reuse, share, transform!
P7CO® EcoResupply is the international community that connects companies, citizens, and organizations to give new life to surpluses.
Here, every action matters — contribute to a more circular economy, reduce waste, and inspire real change.
Join us and be part of a new generation of solutions: smarter, more collaborative, and more sustainable.

## 🗂️ Repository Structure

* `content/blog/pt/` — Blog posts in Portuguese
* `content/blog/en/` — Blog posts in English
* `content/blog/fr/` — Blog posts in French
* `content/blog/de/` — Blog posts in German
* `content/blog/es/` — Blog posts in Spanish (**new**)
* `ui/` — JSON files for UI translation (non-application scope)

  * `ui/pt/components/*.json`
  * `ui/en/components/*.json`
  * `ui/fr/components/*.json`
  * `ui/de/components/*.json`
  * `ui/es/components/*.json`
* `images/` — Images used in blog posts

All articles are written in **Markdown** with structured YAML frontmatter using `+++` delimiters:

## 📌 Blog Frontmatter Specification (P7CO® EcoResupply)

Each article must begin with a **frontmatter block** in YAML, delimited by `+++`.  
This metadata controls how the blog content is structured, displayed, and indexed.

### Required fields
- **title** → Main article title (used in headers and listing cards).
- **intro** → Short introduction (used in previews and summaries).
- **image** → Path to the cover image (1200×675 px, ≤150 KB).
- **date** → Publication date (`YYYY-MM-DD`).
- **active** → Controls visibility (`true` or `false`).

### Recommended fields
- **updated_at** → Last updated date (helps with SEO and freshness).
- **category** → Main category of the article (`guides`, `news`, `case-studies`, `esg`, `tech`).
- **tags** → Array of keywords (e.g. `["Sustainability", "Circular Economy"]`).
- **summary** → Extended SEO description for search engines and social previews.
- **slug** → Unique identifier for the URL (defaults to file name but can be overridden).

### Author fields
- **author** → Name of the main author.
- **author_bio** → Short biography or role.
- **author_image_url** → Author’s photo (e.g. `/images/authors/jtlivio.jpg`).

### Optional fields
- **reading_time** → Estimated reading time in minutes.
- **lang** → Language code (`pt`, `en`, `es`, `fr`, `de`).  
  Usually inferred from folder path (`/content/blog/en/`), but can be explicitly set for validation.

### ✅ Example

```yaml
+++
title: "Sample Blog Post Title"
intro: "A short introduction for the P7CO EcoResupply blog."
image: /images/example.jpg
date: 2025-04-01
updated_at: 2025-04-02
category: "guides"
tags: ["Sustainability", "Circular Economy"]
author: "João Tito Livio"
author_bio: "Founder of pH7x Systems"
author_image_url: /images/authors/jtlivio.jpg
reading_time: 5
lang: "en"
active: true
+++
```
---

## 🖼️ Image Requirements

To keep the blog consistent and performant, all images must follow:

* **Format:** `.jpg`
* **Dimensions:** **1200 × 675 px**
* **Max size:** **≤ 150 KB**

> Pull Requests with non-conforming images will be rejected automatically by CI.

## 🔐 Branch Protection & CI

This repository uses a protected **`main`** branch:

* All changes must come via **Pull Request**.
* The **Content Lint** workflow must pass before merging.
* At least **1 review approval** is required.

## 🤝 Contributing

This repository is **public but protected** — only the pH7x Systems team can commit directly.
Suggestions, corrections, and translations are welcome via **Issues** or **Pull Requests**.

### Contribution Rules

* **Blog (`/content/blog/{lang}`)**

  * Only `.md` files are allowed.
  * Maximum file size: **100 KB**.
  * Mandatory frontmatter: `title`, `intro`, `image`, `date`, `ativo`.
  * Only UTF-8 valid characters (no invalid control chars).

* **UI (`/ui/{lang}`)**

  * Only `.json` files are allowed.
  * Structure: flat key-value (`"key": "value"`).
  * No HTML or JavaScript inside values.
  * Must validate as strict JSON (`jq . file.json`).

Please read our [Contributing Guide](CONTRIBUTING.md) and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📜 License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE-content.md)

* **Source code (scripts, helpers):** [GNU GPL v3.0](LICENSE)
* **Content (articles, images, markdown):** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](LICENSE-content.md)

## 📬 Contact

For questions, suggestions, or partnerships:
🌐 [ph7x.pt](https://ph7x.pt)
📩 [eco@ph7x.pt](mailto:eco@ph7x.pt)
