# 🔐 Security Policy · P7CO® EcoResupply

This document defines how vulnerabilities, data protection concerns, and security issues are managed in the **P7CO® EcoResupply Blog & Articles repository**.

## 📌 Scope

* **Content**: Markdown files (Blog, Page, Article)
* **Assets**: Images, JSON translations
* **Scripts/Helpers**: Build and linting tools
* **CI/CD**: GitHub Actions workflows

> ⚠️ Note: This repository does not contain production application code. Security concerns here mainly relate to **content integrity, repository automation, GDPR compliance, and contributor safety**.

## 📩 Reporting Vulnerabilities

* Do **not** open public Issues or Pull Requests for sensitive security concerns.
* Instead, report directly and privately to our security team:

📧 Email: [hello@p7co.org](mailto:hello@p7co.org)
🌍 Website: [p7co.org](https://p7co.org)

We commit to acknowledge your report within **72 hours**.

## ⚡ Response Process

1. **Triage** → Validate report and assess severity.
2. **Containment** → Apply immediate mitigations if content, workflows, or GDPR aspects are at risk.
3. **Resolution** → Patch or adjust repository rules, scripts, or CI/CD.
4. **Disclosure** → Inform the reporter and, if relevant, the public.

## 🛡️ GDPR & Personal Data

* No personal data must be embedded in blog posts or articles.
* Author details (name, bio, profile picture) are automatically sourced from **site user profiles**.
* Contributors must not include **emails, phone numbers, or identifiers** directly inside Markdown files.

## 🔒 Dependencies

* Managed via **Dependabot**.
* All updates are subject to CI validation:

  * Content Linter (structure, images, licenses)
  * CodeQL (security scanning)
  * Branch protection rules

## ✅ Contributor Guidelines

* Ensure **frontmatter** is valid and free of sensitive data.
* Images must comply with repository rules (JPG, ≤150 KB, 1200×675 px).
* Do not bypass linting or CI checks — they exist for integrity and compliance.

## 🧭 Responsible Disclosure

If you believe you have identified a vulnerability affecting content workflows, GDPR compliance, or CI/CD integrity:

* Contact us privately.
* Do not exploit or share details publicly before remediation.
* We value and credit responsible security researchers.

## 📜 License of This Policy

This policy is provided under the repository’s **GNU GPL v3** license (scripts/tools) and **CC BY-SA 4.0** (content).

✍️ Maintained by **pH7x Systems® Security Team** — safeguarding sustainability and compliance at **P7CO® EcoResupply**.
