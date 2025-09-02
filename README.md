# P7CO® EcoResupply Blog and UI

Content repository for sustainability, circular economy and innovation articles

[![Content Lint](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml/badge.svg)](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml)  
![License: CC BY 4.0](https://img.shields.io/badge/license-CC--BY--4.0-green)  
![Made in Portugal](https://img.shields.io/badge/made%20in-Portugal-red)  
![GitHub Topics](https://img.shields.io/github/topics/jtlivio/P7CO)  
![Citable](https://img.shields.io/badge/citable-yes-blue)  
![Open Data](https://img.shields.io/badge/open--data-verified-brightgreen)



**P7CO® EcoResupply Blog**
Official blog content repository managed by **pH7x Systems®**.

<p align="center">
  <img src="static/images/p7co.png" alt="P7CO® EcoResupply Logo" width="240"/>
</p>

## 🌍 About the Project

**Our Mission**
To promote a real circular economy worldwide by simplifying the reuse of surplus and waste through innovative technology. We connect companies, public entities, and citizens, making material reuse simple, transparent, and measurable.

**Our Vision**
To become the reference platform for sustainable resource management, inspiring a shift toward a regenerative and collaborative economic model, where every material counts and every contribution creates positive, measurable impact for society and the planet.

**Circularity**
The future begins with every choice: reuse, share, transform! P7CO® EcoResupply is the international community that connects companies, citizens, and organizations to give new life to surpluses. Here, every action matters. Contribute to a more circular economy, reduce waste, and inspire real change. Join us and be part of a new generation of solutions: smarter, more collaborative, and more sustainable.

P7CO® EcoResupply is led by **JOAO LIVIO**, a recognized technology and sustainability professional with a strong background in innovation and community leadership.

* **Microsoft Most Valuable Professional (MVP) Alumni** (11 years of recognition) — [View credential](https://www.credly.com/badges/5826ec68-08fa-437b-b24b-7b33331c15b4)
* **Copilot for Microsoft 365 Technical Champion (2024)** — [View credential](https://www.credly.com/badges/7ac0fc49-a255-4e51-86e6-6475c0617676)

This experience reflects a long-standing commitment to **technology, knowledge sharing, and innovation**, which now extends into the environmental sector. With P7CO, this expertise is applied to empower **companies, municipalities, and civic organizations** to act on sustainability, transparency, and circular economy practices.

## 🗂️ Repository Structure

> **Rooted at `/static`**. All types share the same rules and frontmatter.

* `blog/{pt|en|fr|de|es}/` — Blog posts per language
* `page/{pt|en|fr|de|es}/` — Site pages per language
* `article/{pt|en|fr|de|es}/` — Long-form articles per language
* `ui/{lang}/components/*.json` — JSON files for UI translation (non-application scope)
* `images/` — Images used across posts/pages/articles

Examples:

```
/static/
  blog/pt/hello-world.md
  page/en/privacy.md
  article/fr/industrial-symbiosis.md
  ui/pt/components/header.json
  images/covers/example.jpg
```

## 🙏 Acknowledgements

Special thanks to everyone contributing with **translations**, **content reviews**, and **community feedback**. Your effort helps make the **P7CO® EcoResupply** content accessible in multiple languages and relevant for a global audience.

## 📌 Frontmatter Specification (TOML with `+++`)

All Markdown files (**blog**, **page**, **article**) must start with a TOML frontmatter block delimited by `+++`.

### Required fields

* `title` — Main title (plain text, no HTML)
* `intro` — Short introduction (≤ 280 chars)
* `image` — Cover path starting with `/images/` (1200×675 px, ≤ 150 KB, JPEG)
* `date` — Publication date (`YYYY-MM-DD`)
* `tags` — Non-empty array of strings
* `active` — Visibility flag (`true`/`false`)

### Optional / recommended

* `updated_at` — Last updated date (`YYYY-MM-DD`)
* `category` — One of the allowed categories (see below)
* `reading_time` — Estimated minutes to read (integer)
* `lang` — Language code (`pt`, `en`, `fr`, `de`, `es`) — usually inferred from folder
* `slug` — Custom URL slug (defaults to file name)

### Allowed categories

```
guides, news, case-studies, esg, tech, p7co, policy, community, innovation,
circularity, events, na, opinion, analysis, whitepaper, report, insight,
legal, environment, market, services, about, faq
```

### ✅ Example

```toml
+++
title = "Sample Title"
intro = "A short introduction for P7CO EcoResupply."
image: /proxy/image?path=images/example.jpg"
date = 2025-04-01
updated_at = 2025-04-02
category = "guides"
tags = ["Sustainability", "Circular Economy"]
reading_time = 5
active = true
+++
```

## 🖼️ Image Requirements

* **Format:** `.jpg` / `.jpeg`
* **Dimensions:** **1200 × 675 px** (exact)
* **Max size:** **≤ 150 KB**

> Pull Requests with non-conforming images will be rejected automatically by CI.

## 🔍 Lint & Validation (CI)

The **Content Lint** workflow validates all Markdown and images under `/static`:

* Scanned paths:

  * `blog/{lang}/*.md`
  * `page/{lang}/*.md`
  * `article/{lang}/*.md`
  * `images/**`
* Checks:

  * Frontmatter structure and required fields
  * Image format/size/dimensions and existence
  * Markdown size (≤ 100 KB) and invalid control characters

Badge: see the status at the top of this README.

## 🔐 Branch Protection & CI

* Protected **`main`** branch
* All changes via **Pull Request**
* **Content Lint** must pass before merge
* At least **1 review approval** required

## 🤝 Contributing

This repository is **public but protected** — only the pH7x Systems team can commit directly. Suggestions, corrections, and translations are welcome via **Issues** or **Pull Requests**.

### Contribution Rules

**Markdown content** (`blog/`, `page/`, `article/`)

* Only `.md` files
* Max file size: **100 KB**
* Mandatory frontmatter: `title`, `intro`, `image`, `date`, `tags`, `active`
* UTF-8 only; no invalid control characters

**UI** (`ui/{lang}`)

* Only `.json` files
* Flat key-value structure
* No HTML or JavaScript in values
* Must validate as strict JSON (`jq . file.json`)

Please read our **Contributing Guide** and follow our **Code of Conduct**.

## 📜 License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE-arti.md)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE-content.md)

* **Source code (scripts, helpers):** [GNU GPL v3.0](LICENSE-arti.md)
* **Content (articles, images, markdown):** [CC BY-SA 4.0](LICENSE-content.md)

## 💚 Support this Project

You can support **P7CO® EcoResupply** via:

* Patreon: [https://www.patreon.com/p7co](https://www.patreon.com/p7co)
* OpenCollective: [https://opencollective.com/p7co](https://opencollective.com/p7co)

## 📖 Citation

If you use this project, please cite it using one of the formats below:

- [APA](./CITATION.apa.txt)
- [BibTeX](./CITATION.bib)

Or use the GitHub “Cite this repository” button powered by [CITATION.cff](./CITATION.cff).

## 📬 Contact

For questions, suggestions, or partnerships:

* 🌐 [https://p7co.org](https://p7co.org)
* 📩 [hello@p7co.org](mailto:hello@p7co.org)
