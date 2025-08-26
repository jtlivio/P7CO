# Translations Guide · P7CO® EcoResupply Blog

This document provides guidance for translators contributing to the **P7CO Blog**.

---

## 🌍 Supported Languages

* English → `content/blog/en/`
* Portuguese → `content/blog/pt/`
* French → `content/blog/fr/`
* German → `content/blog/de/`

Future languages may be added as the community grows.

---

## 📂 File Structure

Each blog post exists as a **Markdown file (.md)** inside the correct language folder.
Translations must follow the same filename as the original post.

Example:

```
content/blog/en/2025-04-circular-economy.md
content/blog/pt/2025-04-circular-economy.md
content/blog/fr/2025-04-circular-economy.md
```

---

## 📝 Frontmatter Rules

All posts must start with **YAML frontmatter**. Translators must adapt the fields into the target language:

```
---
title: "Circular Economy: A Global Challenge"
intro: "A short introduction in the target language."
image: /images/circular.jpg
date: 2025-04-01
tags: ["Sustainability", "Circular Economy"]
ativo: true
---
```

* `title` → translated
* `intro` → translated
* `tags` → translated
* `image` and `date` → keep unchanged
* `ativo` → must remain `true` if the post is published

---

## 📖 Style & Terminology

* Keep translations **clear, concise, and accurate**.
* Use consistent terminology for sustainability and circular economy terms.
* Avoid machine translations without revision.
* Respect the tone of the original text (professional, informative, inclusive).

---

## 🔍 Review Process

* Translations must be submitted as Pull Requests.
* PRs are reviewed by the **Core Team** and, when available, native speakers.
* Only reviewed translations will be merged and published.

---

## 📜 License

All translations are licensed under the repository's content license: [CC BY 4.0](LICENSE-content.md).
