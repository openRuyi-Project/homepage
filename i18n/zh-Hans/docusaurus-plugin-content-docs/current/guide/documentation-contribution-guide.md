---
id: documentation-contribution-guide
title: 文档贡献指南
description: 本文档介绍如何为 openRuyi 添加和更新文档，并说明写作风格、格式约定和维护要求。
slug: /guide/documentation-contribution-guide
---


# 文档贡献指南

openRuyi 的文档基于 Docusaurus 构建。文档的内容以 Markdown 格式文件为主，位于 homepage 主仓库内。文档分为两类: 位于 `docs` 目录下的 openRuyi 系统类文档，以及位于 `governance` 目录下的 openRuyi 社区类文档。图片通常存放在 `static/img/...` 下，并在 Markdown 中通过 `/img/...` 路径引用。

这意味着在多数情况下，你只需要添加 `docs` 和 `governance` 目录下的 Markdown 格式文件，就可以为 openRuyi 的文档做出贡献。

## 写作指南

### 添加新文档

如果你正在编写的内容要添加一篇新文档，请在对应的目录中创建一个新文件。不要忘记对新文件执行 `git add`。

在编写新文档时，请注意以下几点:

* 尝试站在新用户的角度思考，你会想知道什么信息？

* 在帮助文档的相关分区中选择一篇现有文档，并尽可能贴近地复制其格式、措辞、风格等。

* 如果其它发行版中也有类似的内容，可以查看它们的文档以获取灵感。

* 面向用户的文档目标不是面面俱到，而是为目标用户提供正确的信息片段。

### 更新现有文档

如果你正在编写的内容是对已有文档的内容进行改进，或与该内容相关，那么把这些信息加入现有文档会让用户更容易了解这些内容。

在扩展和更新现有文档时，请注意以下几点:

* 保持当前文档的格式和写作风格。

* 思考在当前文档中，哪些位置适合内链到其它文档。

创建内容扎实，信息充分且链接良好的文档，可以让用户更高效地浏览文档中心。

## 写作风格

下面列出了一些通用的风格和写作约定。

### 基本原则

文档应当先说明目标，再给出步骤。

教程类文档应当使用直接、面向读者的表达。例如:

中文:

> 请先安装 `osc`、`obs-build` 和 `qemu-user`。

英文:

> Install `osc`, `obs-build`, and `qemu-user` first.

规范类文档应当使用更正式的语气，并明确要求等级。英文使用 `MUST`、`MUST NOT`、`SHOULD`、`MAY`；中文对应使用“必须”“不得”“应当”“可以”。

### 中文写作风格

中文文档使用简体中文。整体语气应当清晰、直接、专业。教程类文档可以适度使用“请”“您”“我们建议”，但避免过度口语化；规范、政策和治理类文档应保持正式。

技术术语应保留英文，特别是以下情况:

* 命令、文件名、路径、软件包名、配置字段、API 名称。

* 上游项目名称，例如 Open Build Service、Docusaurus、Fedora、openSUSE。

* UI 中实际显示为英文的按钮、选项卡或菜单 (有中文的除外)。

推荐写法:

> 进入 **Repositories** 选项卡，点击 **Add from a Project**。

不推荐写法:

> 进入仓库标签，然后点击从项目添加。

对于常见缩写，首次出现时可写全称:

> Open Build Service (OBS)

之后可以直接使用 OBS。

### 英文写作风格

英文文档使用美式英语。优先使用主动语态、明确主语和短句。尽量避免以含糊的 `This` 开头；如果需要指代前文内容，尽量写出具体对象。

推荐写法:

> The build system fetches the Git source after you upload the `_service` file.

不推荐写法:

> This fetches the Git source after the file is uploaded.

教程类文档可以使用 `you`，例如:

> You can use `osc build` to start a local build.

### 标点符号

中文正文原则上使用中文全角标点，但 openRuyi 文档为了保持中英文混排的一致性，约定以下写法:

* 中文句子的冒号使用半角冒号 `:`。

* 中英文解释使用半角括号 `( )`。

推荐写法:

> 以 Fedora 为例:
>
> Open Build Service (OBS)

不推荐写法:

> 以 Fedora 为例：
>
> Open Build Service （OBS）

中英文、数字和代码混排时，中文与英文/数字之间建议留一个空格，例如:

> openRuyi 基于 RISC-V RVA23 规范构建。
>
> 请安装 3 个核心组件: `osc`、`obs-build` 和 `qemu-user`。

### 用户界面

引用 UI 名称时，应保持 UI 中实际显示的文本，不自行翻译。UI 名称使用粗体，不加引号。

推荐写法:

> 点击 **Create Package**。
>
> 打开 **Meta** 选项卡。
>
> 在 **Project** 字段中填写 `openruyi`。

如果需要描述完整路径，使用 `>` 连接菜单层级:

> 依次点击 **Settings** > **Repositories** > **Add from a Project**。

中文文档中，UI 名称后可以加中文界面元素类型:

> **Repositories** 选项卡
>
> **Create Package** 按钮
>
> **Project** 字段

不要用颜色指代按钮或区域。可以描述位置，但不要过度依赖视觉细节。

推荐写法:

> 点击页面左侧的 **Trigger Services**。

不推荐写法:

> 点击蓝色按钮。

### 命令、代码和配置

命令、文件名、字段名、路径和包名使用行内代码格式:

> 编辑 `~/.config/osc/oscrc`。
>
> 在 `_service` 文件中设置 `revision`。

多行命令和配置使用 fenced code block，并标注语言:

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

展示命令时，默认不要带 shell 提示符 `$`。只有在展示完整终端输出时，才使用 `$` 或其他提示符。

占位符使用尖括号:

```markdown
osc co home:<your-username>:<project-name>/<package-name>
```

中文文档中可以根据上下文使用英文占位符，避免中文占位符影响复制粘贴。

### 图片

只有当图片能明显降低理解成本时才添加图片。以下场景适合使用截图:

* UI 操作路径较复杂。

* 页面中有多个相似选项，容易点错。

* 需要展示最终配置结果。

* 纯文字描述会变得很长。

以下场景不建议使用截图:

* 命令行输出可以直接用代码块表示。

* UI 很可能频繁变化。

* 截图只是重复文字步骤。

* 截图中包含账号、邮箱、Token、私有仓库名或其他敏感信息。

图片放在对应文档的相关段落之后，不要让截图替代文字说明。

建议图片路径:

```text
static/img/docs/<section>/<document-slug>/<number>-<image-name>.png
```

例如:

```text
static/img/docs/guide/quick-start-for-developers/01-obs-add-from-project.png
static/img/docs/guide/quick-start-for-developers/02-obs-meta-tab.png
```

图片文件名使用小写英文和短横线，例如:

```text
obs-create-package.png
obs-trigger-services.png
pre-commit-failed-hook.png
```

不推荐以下写法:

```text
OBS_CreatePackage.png
截图1.png
image.png
```

Markdown 中引用图片时，应提供有意义的 alt text:

```markdown
![OBS Meta tab showing repository attributes](/img/docs/guide/quick-start-for-developers/obs-meta-tab.png)
```

中文文档可以使用中文 alt text:

```markdown
![OBS Meta 选项卡中的仓库属性配置](/img/docs/guide/quick-start-for-developers/obs-meta-tab.png)
```

如果中文和英文文档使用同一张截图，应确保截图中的 UI 语言与正文一致，或者 UI 本身就是英文。若需要分别维护中英文截图，可使用后缀区分:

```text
obs-meta-tab.png
obs-meta-tab-zh-hans.png
```

## 链接

链接文字应描述目标页面，不要只写“点击这里”。

推荐:

```markdown
更多内容，请参见 [Pre-commit 使用指南](/docs/guide/pre-commit-usage-guide)。
```

不推荐:

```markdown
更多内容，请点击[这里](/docs/guide/pre-commit-usage-guide)。
```

除非 URL 本身是读者需要复制的对象，否则不要在正文中直接裸露 URL。

## 文档结构

每篇文档应包含清晰的标题和 front matter。标题应准确描述文档主题，不要过泛，例如:

```markdown
---
id: quick-start-for-developers
title: Quick Start for Developers
description: This document guides developers through the openRuyi packaging workflow.
slug: /guide/quick-start-for-developers
---
```

中文文档应与英文文档保持相同的结构、链接目标和技术含义，但不必逐字翻译。翻译时优先保证准确、自然和可维护。

## 维护要求

新增或修改英文文档时，应同步检查中文版本是否需要更新。新增或修改中文文档时，也应检查英文版本是否需要补齐。

涉及 UI 的文档在产品界面变化后应及时更新。涉及命令、路径、版本、仓库地址和构建平台行为的文档，应在发布前重新验证。
