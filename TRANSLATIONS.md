# Translations Guide · P7CO® EcoResupply

This document provides guidance for translators contributing to the **P7CO® EcoResupply** content (Blog, Pages, Articles).

## 🌍 Supported Languages

* English → `blog/en/`, `page/en/`, `article/en/`
* Portuguese → `blog/pt/`, `page/pt/`, `article/pt/`
* Spanish → `blog/es/`, `page/es/`, `article/es/`
* French → `blog/fr/`, `page/fr/`, `article/fr/`
* German → `blog/de/`, `page/de/`, `article/de/`

Future languages may be added as the community grows.

## 📂 File Structure

Each content type (Blog, Page, Article) exists as a **Markdown file (.md)** inside the correct language folder.
Translations must follow the same filename as the original file.

Example (Blog):

```
blog/en/2025-04-circular-economy.md
blog/pt/2025-04-circular-economy.md
blog/es/2025-04-circular-economy.md
blog/fr/2025-04-circular-economy.md
```

Example (Page):

```
page/en/about.md
page/pt/about.md
page/es/about.md
```

## 📝 Frontmatter Rules

All Markdown files must start with **TOML frontmatter** using `+++` delimiters. Translators must adapt the fields into the target language:

```toml
+++
title = "Circular Economy: A Global Challenge"
intro = "A short introduction in the target language."
image: /proxy/image?path=images/circular.jpg"
date = 2025-04-01
category = "guides"
tags = ["Sustainability", "Circular Economy"]
reading_time = 5
active = true
+++
```

* `title` → translated
* `intro` → translated
* `tags` → translated
* `category` → keep from source unless a localized version exists
* `image` and `date` → keep unchanged
* `active` → must remain `true` if the post is published

## 📖 Style & Terminology

* Keep translations **clear, concise, and accurate**.
* Use consistent terminology for sustainability, environment, and circular economy.
* Avoid machine translations without revision.
* Respect the tone of the original text (professional, informative, inclusive).
* Do not change links, image paths, or file names.

## 🔍 Review Process

* Translations must be submitted as Pull Requests.
* PRs are reviewed by the **Core Team** and, when available, native speakers.
* Only reviewed translations will be merged and published.

## 📜 License

All translations are licensed under the repository's content license: [CC BY-SA 4.0](LICENSE-content.md).
