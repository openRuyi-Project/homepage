---
id: documentation-contribution-guide
title: Documentation Contribution Guide
description: The guide explains how to add and update openRuyi documentation, follow writing style conventions, and keep documents maintainable.
slug: /guide/documentation-contribution-guide
---

# Documentation Contribution Guide

openRuyi builds its documentation with Docusaurus. The homepage repository stores most of the documentation as Markdown files. The documentation falls into two categories: openRuyi system documentation in the `docs` directory, and openRuyi community documentation in the `governance` directory. Images usually live under `static/img/...`, and Markdown files reference them via `/img/...` paths.

In most cases, you can contribute to the openRuyi documentation by adding Markdown files under the `docs` and `governance` directories.

## Writing Guide

### Add a New Document

When your contribution adds a new document, create a new file in the appropriate directory. Remember to run `git add` for the new file.

When writing a new document, keep the following points in mind:

* Think from a new user's perspective: what information would you want to know?

* Choose an existing document from the relevant documentation section, and follow its format, wording, style, and structure as closely as possible.

* If other distributions cover similar topics, consult their documentation for inspiration.

* User-facing documentation should not try to cover every possible detail. Instead, it should provide the target audience with the right information.

### Update an Existing Document

When your contribution improves or relates to an existing document, adding the new information to that document will help users understand the topic more easily.

When expanding or updating an existing document, keep the following points in mind:

* Keep the current document's format and writing style.

* Think about where the current document should link to other documents.

Well-structured documents with solid content, sufficient information, and useful links help users navigate the documentation portal more efficiently.

## Writing Style

The following sections describe general style and writing conventions.

### General Principles

Documents should explain the goal first, and then provide the steps.

Tutorial-style documents should use direct, reader-oriented wording. For example, in Chinese:

> 请先安装 `osc`、`obs-build` 和 `qemu-user`。

In English:

> Install `osc`, `obs-build`, and `qemu-user` first.

Specification-style documents should use a more formal tone and clearly indicate the levels of requirements. Use `MUST`, `MUST NOT`, `SHOULD`, and `MAY` in English. Use “必须”, “不得”, “应当”, and “可以” in Chinese.

### Chinese Writing Style

Use Simplified Chinese for Chinese documentation. Keep the overall tone clear, direct, and professional. Tutorial-style documents may use polite wording such as “请”, “您”, and “我们建议”, but should avoid overly casual expressions. Specifications, policies, and governance documents should maintain a formal tone.

Keep technical terms in English, especially in the following cases:

* Commands, file names, paths, package names, configuration fields, and API names.

* Upstream project names, such as Open Build Service, Docusaurus, Fedora, and openSUSE.

* Buttons, tabs, or menus that appear in the UI in English, unless the UI provides Chinese text.

Recommended:

> 进入 **Repositories** 选项卡，点击 **Add from a Project**。

Not recommended:

> 进入仓库标签，然后点击从项目添加。

For common abbreviations, write the full name on first use when appropriate:

> Open Build Service (OBS)

After that, use OBS directly.

### English Writing Style

Use American English for English documentation. Prefer active voice, clear subjects, and short sentences. Avoid starting a sentence with the vague "`This`"; name the specific object from the previous context when needed.

Recommended:

> The build system fetches the Git source after you upload the `_service` file.

Not recommended:

> This fetches the Git source after the file is uploaded.

Tutorial-style documents may use `you`. For example:

> You can use `osc build` to start a local build.

### Punctuation

Chinese body text generally uses full-width Chinese punctuation. However, openRuyi documentation uses the following conventions to keep mixed Chinese and English text consistent:

* Use the half-width colon `:` as the colon in Chinese sentences.

* Use half-width parentheses `( )` for Chinese and English explanations.

Recommended:

> 以 Fedora 为例:
>
> Open Build Service (OBS)

Not recommended:

> 以 Fedora 为例：
>
> Open Build Service （OBS）

When Chinese text appears next to English words, numbers, or inline code, add a space between them. For example:

> openRuyi 基于 RISC-V RVA23 规范构建。
>
> 请安装 3 个核心组件: `osc`、`obs-build` 和 `qemu-user`。

### User Interface

When referring to UI names, use the exact text that appears in the UI. Do not translate UI text on your own. Format UI names in bold, and do not use quotation marks.

Recommended:

> Click **Create Package.**
>
> Open the **Meta** tab.
>
> Enter `openruyi` in the **Project** field。

When describing a full UI path, use `>` to connect menu levels:

> Go to **Settings** > **Repositories** > **Add from a Project.**

In Chinese documentation, you may add the Chinese UI element type after the UI name:

> **Repositories** 选项卡
>
> **Create Package** 按钮
>
> **Project** 字段

Do not refer to a button or area by color. You may describe its location, but do not rely too heavily on visual details.

Recommended:

> Click **Trigger Services** in the left-hand sidebar.

Not recommended:

> Click the blue button.

### Commands, Code, and Configuration

Use inline code formatting for commands, file names, field names, paths, and package names:

> Edit `~/.config/osc/oscrc`.
>
> Set `revision` in the `_service` file.

Use fenced code blocks for multi-line commands and configuration, and specify the language:

````markdown
```bash
osc up -S
osc build --skip-local-service-run riscv64 riscv64
```
````

````markdown
```xml
<service name="obs_scm">
  <param name="scm">git</param>
</service>
```
````

When showing commands, do not include a shell prompt such as `$` by default. Use `$` or another prompt only when showing complete terminal output.

Use angle brackets for placeholders:

```markdown
osc co home:<your-username>:<project-name>/<package-name>
```

In Chinese documentation, use English placeholders when the context allows it. English placeholders help users copy and paste commands without interference from Chinese text.

### Images

Add images only when they clearly reduce the reader's effort to understand the content. Screenshots work well in the following cases:

* The UI operation path has multiple steps.

* The page contains several similar options, and users may easily choose the wrong one.

* The document needs to show the final configuration result.

* A text-only explanation would become too long.

Avoid screenshots in the following cases:

* A code block can represent command-line output directly.

* The UI may change frequently.

* The screenshot only repeats the written steps.

* The screenshot contains accounts, email addresses, tokens, private repository names, or other sensitive information.

Place each image after the related paragraph in the document. Do not let screenshots replace written explanations.

Recommended image path:

```text
static/img/docs/<section>/<document-slug>/<number>-<image-name>.png
```

For example:

```text
static/img/docs/guide/quick-start-for-developers/01-obs-add-from-project.png
static/img/docs/guide/quick-start-for-developers/02-obs-meta-tab.png
```

Use lowercase English words and hyphens in image file names. For example:

```text
obs-create-package.png
obs-trigger-services.png
pre-commit-failed-hook.png
```

Do not use names like the following:

```text
OBS_CreatePackage.png
Screenshot1.png
image.png
```

When referencing an image in Markdown, provide meaningful alt text:

```markdown
![OBS Meta tab showing repository attributes](/img/docs/guide/quick-start-for-developers/obs-meta-tab.png)
```

Chinese documentation may use Chinese alt text:

```markdown
![OBS Meta 选项卡中的仓库属性配置](/img/docs/guide/quick-start-for-developers/obs-meta-tab.png)
```

If Chinese and English documents use the same screenshot, make sure the UI language matches the document language, or make sure the UI itself appears in English. If you need to maintain separate screenshots for Chinese and English documents, use suffixes to distinguish them:

```text
obs-meta-tab.png
obs-meta-tab-zh-hans.png
```

## Links

Link text should describe the target page. Do not use vague text such as `click here`.

Recommended:

```markdown
For more details, see the [Pre-commit Usage Guide](/docs/guide/pre-commit-usage-guide)。
```

Not recommended:

```markdown
For more details, [click here](/docs/guide/pre-commit-usage-guide)。
```

Do not expose raw URLs in body text unless readers need to copy the URL itself.

## Document Structure

Each document should include a clear title and front matter. The title should accurately describe the document's topic and avoid overly broad wording. For example:

```markdown
---
id: quick-start-for-developers
title: Quick Start for Developers
description: This document guides developers through the openRuyi packaging workflow.
slug: /guide/quick-start-for-developers
---
```

Chinese documents should match English documents in structure, link targets, and technical meaning, but they do not need to follow the English wording word for word. When translating, prioritize accuracy, natural wording, and maintainability.

## Maintenance Requirements

When you add or update an English document, check whether the Chinese version also needs an update. When you add or update a Chinese document, check whether the English version also needs coverage.

Update UI-related documents after the product UI changes. Re-verify documents that involve commands, paths, versions, repository addresses, or build platform behavior before publication.
