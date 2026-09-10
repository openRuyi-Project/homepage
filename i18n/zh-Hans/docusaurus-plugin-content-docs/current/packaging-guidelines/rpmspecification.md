---
id: rpmspecification
title: openRuyi Packaging Specification
description: 本文档介绍了 openRuyi Packaging Specification
slug: /guide/packaging-guidelines
---

# openRuyi Packaging Specification

## 前言

openRuyi 项目需要大量第三方软件包以构建可用、可维护的发行版。为降低包维护与审查成本、提升仓库一致性与可预测性，本规范定义 openRuyi 软件包 RPM Spec 文件 (以下简称 Spec) 的最低一致性要求与格式约定。

本规范关注的对象是 Spec 这一 “目标产物” 本身：我们期望交付到仓库中的 Spec 在结构、字段、组织、命名与宏使用上应呈现的形态。任何满足本规范的 Spec，均应可被一致地理解、审查与复用。

本规范适用于 openRuyi 仓库中所有以 RPM 形式发布的软件包的 Spec (包括单包与多子包)。

本规范由以下两类文档构成：

1. **主规范 (本文件)**: 规定 Spec 的通用结构、关键字段与通用策略 (“必须/应当/不得”)。

2. **补充规范 (子文档)**: 对特定主题给出更细的约束或范式 (如命名、版本号、语言生态、脚本、补丁等)。主规范只保留必要的“总规则”，细节以补充规范为准。

当本文件与补充规范存在冲突时，补充规范优先。

## 术语与定义

### 规范性用语

本规范使用以下术语表达要求强度:

- **必须**: 示强制性要求；不满足即不符合本规范。

- **不得**: 示强制性禁止；出现即不符合本规范。

- **应当**: 示推荐性要求；通常应满足，除非有明确、合理的例外。

- **可以**: 示可选项；是否采用由软件包具体情况决定。

### 术语

- **Spec** RPM 软件包的描述文件 (`.spec`)，定义源代码、构建、安装、文件清单、依赖与变更记录等。

- **字段 (Tag)**: Spec 头部的键值字段，如 `Name:` `Version:` 等。

- **段落 (Section)**: Spec 中以 `%` 开头的段落，如 `%prep` `%build` `%install` `%files` 等。

- **子包 (Subpackage)**: 由一个 Spec 生成的多个二进制包（例如 `-devel`、语言包等）。

- **RemoteAsset**: 通过网络位置引用的外部资源。

- **BuildSystem**: 用于声明该 Spec 采用的构建系统类型的字段。

## Spec 文件总体结构要求

### SPDX 版权与许可证声明

Spec 文件起始位置必须包含 SPDX 形式的版权与许可证声明，格式如下 (其中 `SPDX-FileContributor` 为可选项):

```specfile
# SPDX-FileCopyrightText: (C) 2026 Institute of Software, Chinese Academy of Sciences (ISCAS)
# SPDX-FileCopyrightText: (C) 2026 openRuyi Project Contributors
# SPDX-FileContributor: Your Name <your.email@example.com>
#
# SPDX-License-Identifier: MulanPSL-2.0
```

### 基础字段与段落

Spec 必须包含以下字段与段落，且应当按如下顺序出现:

```specfile
Name:
Version:
Release:
Summary:
License:

%description

%files

%changelog
```

当软件包有意生成空包时，例如仅用于表达依赖关系的 meta-package，对应的 `%files` 段可以为空。

缺少一个条件字段或条件段落本身不构成规范违反。

常见的条件字段与段落包括:

| 字段或段落                                                                 | 需要使用的情形                         |
| --------------------------------------------------------------------- | ------------------------------- |
| `URL`                                                                 | 上游项目存在有意义的官方网站或公开源码仓库时          |
| `VCS`                                                                 | 存在可用的上游源码仓库，且 `URL` 未指向该仓库时     |
| `Source` / `SourceN` / `%sourcelist`                                  | 软件包需要源码文件或其他 source input 时     |
| `BuildArch`                                                           | 软件包需要覆盖默认目标架构行为时                |
| `BuildSystem`                                                         | Spec 使用声明式构建系统机制时               |
| `Patch` / `%patchlist`                                                | 软件包需要应用下游补丁或 backport 时         |
| `BuildOption`                                                         | 声明式构建系统需要额外的阶段参数时               |
| `BuildRequires`                                                       | 构建过程需要 openRuyi 基础构建环境不保证提供的依赖时 |
| `Requires`                                                            | 软件包需要显式声明运行期依赖时                 |
| `Provides` / `Conflicts` / `Obsoletes` / `Recommends` / `Supplements` | 软件包之间的关系需要对应字段表达时               |
| `%package`                                                            | Spec 生成子包时                      |
| `%prep` / `%build` / `%install` / `%check`                            | 软件包需要在对应阶段执行显式操作时               |

下列字段存在时，应当按照如下相对顺序出现:

```specfile
Name:
Version:
Release:
Summary:
License:
URL:
VCS:
Source:
BuildArch:
BuildSystem:

Patch:

BuildOption:

BuildRequires:

Provides:
Conflicts:
Obsoletes:

Recommends:

Requires:

Supplements:

%description
```

以上示例只规定字段之间的相对顺序，并不表示 Spec 必须包含完整的字段列表。Spec 省略条件字段时，不需要为该字段保留位置。`Source`、`Source0`、`Source1` 等编号形式属于同一位置，`%sourcelist` 等等价的 source declaration 也属于 source declaration block。

相同的字段相对顺序也应当适用于各子包定义中的字段。子包只需要包含适用于该子包的字段，不需要重复主包字段。

特定软件包类型的补充规范可以规定额外字段或更具体的顺序。当补充规范存在相关规则时，以补充规范为准。

对于没有明确顺序要求的字段，维护者应当将语义相关的字段放置在一起，并可以按照 A-Z 顺序排列。

段落与段落之间必须用空行隔开。

### 最小骨架示例

以下示例展示一个不需要上游 source input、构建系统、构建依赖或显式运行期依赖的软件包可以使用的最小结构:

```specfile
Name:           <package-name>
Version:        <version>
Release:        %autorelease
Summary:        <summary>
License:        <SPDX-license-expression>

%description
<package-description>

%files

%changelog
%autochangelog
```

### 排版与可读性

1. Spec 必须使用 UTF-8 编码。

2. Spec 中字段书写应当使用对齐风格 (字段名、冒号与值之间用空格对齐)，以便审阅。

3. `BuildRequires` 与 `Requires` 必须采用“一行一个依赖”的形式。

4. Spec 中的说明性文字 (如 `Summary`、注释与 `%description`) 应当使用美式英语 (除非软件包类型的补充规范另有规定)。

## 基础字段

### Name

1. `Name` 必须定义软件包名称。

2. 软件包名称应当为小写，并优先使用短横线 (`-`) 作为分隔符；下划线 (`_`) 仅在补充规范允许的例外情形下使用。

3. 软件包名称不得编码 ABI (如 SONAME major) 或上游主版本号 (例如不得为 `libfoo2` 之类命名)。

4. 当包名与上游常用名称不一致时，Spec 可以通过 `Provides:` 提供上游名称别名；是否提供由兼容性需求决定。

命名的完整策略 (例如模块包、Perl/Python/字体包等专门规则)，请见补充规范[命名规则](/docs/guide/packaging-guidelines/Naming)。

### Version

`Version` 必须反映上游版本，并应当按如下规则进行规范化:

| **情形**                       | **规则化规则**                      | **示例 (上游 → Spec)**               |
| ------------------------------ | ----------------------------------- | ------------------------------------ |
| 版本号仅包含半角句号           | 可直接使用上游版本号                | `1.5.7` → `1.5.7`                    |
| 含发布阶段标记 `alpha/beta/rc` | 字母转小写，且在字母前加 `~`        | `3.5.0-rc1` → `3.5.0~rc1`            |
| 版本号含短横线 `-`             | 将 `-` 替换为 `.`                   | `7.1.1-44` → `7.1.1.44`              |
| 版本号含下划线 `_`             | 将 `_` 替换为 `.`                   | `17_6` → `17.6`                      |
| 版本号为带 . 的日期格式        | 可直接使用上游版本号                | `2025.07` → `2025.07`                |
| 版本号基于 VCS 提交哈希        | 以 `0+<vcs><YYYYMMDD>.<hash7>` 表示 | `ee5b7e3…` → `0+git20250808.ee5b7e3` |

版本号规范化与快照/预发布规则，请见补充规[版本号](/docs/guide/packaging-guidelines/Versioning)。

### Release

1. `Release` 应当使用 `%autorelease`。

2. `Release` 中不得硬编码发行版后缀或覆盖 `%{dist}` 的值。

3. 在同一 `Version` 下，`Release` 对应的修订序号必须递增。

4. 当 `Version` 更新时，`Release` 对应的修订序号必须复位为 `1`。

### Epoch (可选)

`Epoch` 通常用于解决版本号歧义。由于其不可逆特性，`Epoch` 应当尽量避免使用；当使用 `Epoch` 时，Spec 必须在相邻位置以注释说明原因，并确保后续版本策略可持续。

### Summary

1. `Summary` 必须为软件包功能的简短描述。

2. `Summary` 应当仅包含必要的英文介绍。

3. `Summary` 不得以英文句号 `.` 结尾。

### License

1. `License` 必须使用 SPDX License Identifier 或 SPDX License Expression。

2. 当存在多个许可证时，表达式中许可证之间必须使用 `AND` / `OR` 等 SPDX 连接符。

3. 若源代码中存在许可证文本文件，Spec 必须在 `%files` 中使用 `%license` 将其标记并打包；若子包的许可证与主包不符，则必须在子包内写明对应的许可证信息。

许可证字段的详细规则，请见补充规范[许可证](/docs/guide/packaging-guidelines/Licenses)。

### URL

1. 当上游项目有官方网站，`URL` 必须为软件包官方网站链接。

2. 当上游项目没有官方网站，但存在公开的源码仓库时，Spec 必须将 `URL` 设置为有意义的项目地址，通常可以直接使用源码仓库地址。

3. 当软件包不存在有意义的上游项目 URL 时，Spec 可以省略 `URL`。发行版内部的 meta-package、配置软件包等可能属于此类情况。Spec 必须在 `URL` 字段位置写入以下注释 (`# URL:` 前缀必须保留):

```specfile
# URL: No URL link available
```

4. `URL` 字段中不得使用 `%{name}` 等宏进行拼接。

### VCS

1. `VCS` 应当为源代码仓库链接，用于定位源代码位置。

2. 若 `URL` 已为源代码仓库链接，则 `VCS` 可以省略。

3. 若不存在可用的源代码仓库链接，则必须在 `VCS` 字段位置写入以下注释 (`# VCS:` 前缀必须保留):

```specfile
# VCS: No VCS link available
```

4. 当源代码托管于 Git 仓库时，`VCS` 应当使用可克隆链接，例如:

```specfile
VCS:            git:https://git.example.org/project.git
```

### Source

1. 当 Spec 需要源码文件或其他 source input 时，必须使用适合的 RPM source declaration 声明这些输入，例如 `Source`、`SourceN` 或 `%sourcelist`。当软件包不需要任何 source input 时，可以完全省略 source declaration。

2. 当 `Source` 表示上游源码时，必须提供上游源码的获取位置，或提供等价、可重现的源码归档来源。

3. 本地 source input 可以直接使用本地文件名而不提供 URI。当文件名本身无法清楚说明用途或来源时，Spec 应当在相邻位置添加注释说明。

4. 当 Spec 只有一个 `Source` 时，可以使用 `Source` 或 `Source0`。两种形式都表示 source index `0`。

5. 当 Spec 使用带编号的 `SourceN` 字段时，source index 应当从 `0` 开始依次递增，除非软件包存在明确理由采用其他编号方式。

6. 若 `URL` 可复用为 `Source` 的前缀，`Source` 可以复用 `%{url}`。

7. 对于网络来源的 `Source`，其行前必须添加 `#!RemoteAsset` 注释；存在多条网络来源 `Source` 时，每条均必须标识。

8. 对于通过 HTTP 或 HTTPS 获取的 `Source`，对应的 `#!RemoteAsset` 注释必须在同一行包含 SHA-256 校验值。
   为了方便，可以使用 [remoteassetify](/docs/guide/remoteassetify-usage-guide) 自动生成。

9. 当需要从远程 VCS source 创建归档时，Spec 必须将 `#!CreateArchive` 放置在对应的 `#!RemoteAsset` 注释与 `Source` declaration 之间:

```specfile
#!RemoteAsset:  git+https://example.org/project.git#<revision>
#!CreateArchive
Source:         <archive-name>.tar.gz
```

10. 对于无法从 URL 解析出 tarball 文件名的情形，`Source` 应当使用 URL 片段显式给出 tarball 名称，以保证源文件命名可预测。

11. `Source` 编号规则:
   1. 默认编号为 `0`，每增加一条递增 1。
   2. 若仅有一条源代码文件，编号可以省略。

示例:

```specfile
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source0:        https://example.org/example-%{version}.tar.gz
#!RemoteAsset:  sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
Source1:        https://example.org/example-%{version}-additional.tar.gz
```

当一组本地 source input 更适合使用 RPM source-list 机制表达时，Spec 也可以使用 `%sourcelist`:

```specfile
%sourcelist
file1.conf
file2.conf
file3.conf
```

源码 URL 的细节，请见补充规范[源码包](/docs/guide/packaging-guidelines/SourceURL)。

### BuildArch (可选)

1. `BuildArch` 用于声明目标架构。

2. `BuildArch` 字段应当位于最后一个 `Source` 字段与 `BuildSystem` 字段之间。

3. 若 `BuildArch` 为 `noarch`，表示该软件包与 CPU 架构无关。

### BuildSystem

1. 当 Spec 使用 RPM 声明式构建系统机制时，必须通过 `BuildSystem` 声明对应的构建系统。

2. 当 Spec 不使用声明式构建系统机制时，可以省略 `BuildSystem`。例如 source-less meta-package、仅包含数据的软件包，以及通过显式段落完整实现所需构建阶段的软件包。

3. Spec 不得仅为了表示“不适用声明式构建系统”而添加空的 `BuildSystem` 字段。

4. 当 `BuildSystem` 存在时，其值必须对应受支持的声明式构建系统。可用的构建系统及其具体要求由补充规范[声明式构建系统](/docs/guide/packaging-guidelines/BuildSystems)定义。

主规范不单独维护 `BuildSystem` 可用值列表。

在需要补充阶段性动作时，Spec 可以使用标签声明附加步骤，例如:

- `%prep -a`：表示在 `%prep` 阶段之后的附加步骤。

- `%conf -p`：表示在 `configure` 阶段之前的附加步骤。

对各构建系统的具体要求与范式，请见补充规范[声明式构建系统](/docs/guide/packaging-guidelines/BuildSystems)及其对应的构建系统子文档。

### Patch and %patchlist (可选)

1. Spec 中引用的每个补丁必须在其上方提供至少一行注释，说明补丁用途或给出上游链接；补丁内已经说明的除外。

2. 补丁文件名必须以四位数字开头，并按以下范围表达补丁类型:
   - `0001–0999`: 同一版本 upstream 补丁

   - `1000–1999`: CVE 修复或跨版本 backport 补丁

   - `2000–2999`: openRuyi 特有补丁 (预期不进入 upstream)

3. 当 patch 数量 大于 3 时，Spec 应当使用 `%patchlist`，且列表 必须放置于 `%description` 之上。

4. Patch 的放置顺序:
   - 当 Spec 含 `BuildOption` 字段时，Patch 应当位于 `BuildSystem` 与 `BuildOption` 之间。

   - 当 Spec 不含 `BuildOption` 字段时，Patch 应当位于 `BuildSystem` 与 `BuildRequires` 之间。

对补丁策略的细节，请见补充规[补丁](/docs/guide/packaging-guidelines/Patch)。

### BuildOption (可选)

1. 当需要为特定构建阶段声明额外参数时，Spec 可以使用 `BuildOption(<stage>):` 字段。

2. `BuildOption(<stage>):` 与参数之间必须以两个空格分隔。

3. 多个参数必须按行分别声明。

4. 若使用 `BuildOption`，其位置应当位于 `BuildSystem` 与 `BuildRequires` 之间。

5. `BuildOption` 的书写顺序，应当与 RPM 的构建过程保持一致，例如:

```specfile
BuildOption(conf):  <configuration-option>
BuildOption(build):  <build-option>
BuildOption(install):  <installation-option>
BuildOption(check):  <test-option>
```

### BuildRequires

1. Spec 必须确保所有构建期依赖通过静态 BuildRequires、动态构建依赖生成机制或两者结合的方式完整声明。

2. 当软件包使用动态构建依赖生成机制时，静态 BuildRequires 必须包含运行依赖生成机制之前所需的依赖，以及动态机制无法生成的其他必要构建依赖。

3. 当软件包除 openRuyi 基础构建环境和动态生成的依赖之外不需要其他构建期依赖时，可以省略静态 BuildRequires。例如，对于 C 程序，通常不需要显式声明 `gcc`。

4. 静态 BuildRequires 必须按“一行一个依赖包”的形式书写。

5. openRuyi 基础构建环境由构建配置保证在软件包构建开始前提供的软件包组成。[Preinstall 镜像](https://build.openruyi.cn/projects/openruyi/packages/preinstallimage/files/_preinstallimage?expand=1)是该集合的权威来源。

6. Spec 不得因为某个依赖碰巧存在于当前 build root 中而省略必要的构建依赖。

7. 当依赖通过 `pkg-config` 发现时，`BuildRequires` 应当优先使用 `pkgconfig(xxx)` 形式声明，而不是直接依赖 `xxx-devel`。

关于 `pkgconfig(xxx)` 的详细策略，请见补充规范[使用 pkgconfig(xxx)](/docs/guide/packaging-guidelines/PkgConfigBuildRequires)。

### Requires / Provides / Conflicts / Obsoletes / Recommends / Supplements (可选)

1. `Requires` 用于列出运行时依赖；依赖项必须按“一行一个依赖包”的形式书写。

2. 当软件包不需要任何显式运行期依赖时，可以省略 `Requires`。

3. 没有显式 `Requires` 字段并不意味着软件包可以缺少正确的运行期依赖。维护者必须确保自动依赖机制与显式依赖声明共同正确表达软件包的运行期要求。

4. 当软件包需要表达对应的软件包关系时，可以使用 `Provides`、`Recommends` 和 `Supplements`。

5. 当发生包名迁移、拆分或重命名时，Spec 必须使用 `Provides`/`Obsoletes` 等机制提供平滑升级路径 (详见补充规范[软件包拆分](/docs/guide/packaging-guidelines/SplitPackage))。

6. 若需要声明冲突关系，可使用 `Conflicts`；其使用应当谨慎，避免造成依赖求解不可用。

## 段落规范

### `%description`

`%description` 段必须提供软件包的详细描述。

### %prep / %build / %install / %check (按需)

1. 当软件包需要构建或安装动作时，Spec 必须包含相应段落，或通过 `BuildSystem` 与其补充机制表达等价内容。

2. 若存在测试套件且可在构建环境运行，Spec 应当包含 `%check` 并执行测试；确有合理原因无法运行测试时，Spec 应当以注释说明原因。

### %files

Spec 实际生成的每个二进制包都必须具有对应的 `%files` 段。当 Spec 有意不生成主包时，可以省略主包的 `%files` 段。

当对应的二进制包有意不包含任何文件时，例如仅用于表达依赖关系的 meta-package，`%files` 段可以为空。

各 `%files` 段必须满足以下要求:

1. 许可证文本文件必须使用 `%license` 标记；文档文件应当使用 `%doc` 标记。

2. `%files` 列表不得重复列出同一文件 (允许的特定情形除外)。

3. 软件包不得包含 `.la` (libtool archive) 文件；若构建过程产生该类文件，Spec 必须移除。

4. 本地化文件必须在 `%install` 段落内使用 `%find_lang` 机制处理；不得直接在 `%files` 中通配包含 `%{_datadir}/locale/*`。

关于语言包的推荐用法，请见补充规范[语言包](/docs/guide/packaging-guidelines/LangPacks)。

### %changelog

`%changelog` 段内容必须为 `%autochangelog`，不得手写更新日志。

## Subpackaging and Splitting Rules

当同一份源码生成多个二进制包时，Spec 必须遵守以下总规则:

1. **按功能大类拆分**: 若软件包提供多类功能，必须按功能大类拆分，而不得按细碎模块/插件拆分；子包名 必须为 `%{name}-<feature>` 形式。

2. **开发文件必须拆分**: 当存在开发所需文件时，相关文件必须进入 `%{name}-devel` 子包。

3. **文档包**: 当文档体积或数量显著时，相关文件必须进入 `%{name}-doc` 子包。

4. **库文件归属**: 系统共享库文件与符号链接的归属必须符合[软件包拆分](/docs/guide/packaging-guidelines/SplitPackage)对运行时库/SONAME 链接/无版本链接的划分要求。

5. **重命名与迁移**: 若拆分导致包名变化，必须通过 `Obsoletes/Provides` 提供平滑升级路径。

更多关于拆包与子包细节，请见补充规范[软件包拆分](/docs/guide/packaging-guidelines/SplitPackage)与[命名规则](/docs/guide/packaging-guidelines/Naming)。

## 路径宏与常用宏

### 通用路径宏

Spec 中引用标准路径应当优先使用 RPM 路径宏。常用路径宏如下：

| 宏             | 典型展开         | 含义                                                                 |
| ----------------- | ------------------------- | ----------------------------------------------------------------------- |
| `%{_lib}`         | `lib64`                   | 体系结构相关库目录名 (示例值)                  |
| `%{_bindir}`      | `%{_exec_prefix}/bin`     | 可执行文件目录 (通常为 `/usr/bin`)                    |
| `%{_docdir}`      | `%{_datadir}/doc`         | 文档目录 (通常为 `/usr/share/doc`)                    |
| `%{_libdir}`      | `%{_exec_prefix}/%{_lib}` | 库文件目录 (通常为 `/usr/%{_lib}`)                    |
| `%{_libexecdir}`  | `%{_exec_prefix}/libexec` | libexec 目录 (通常为 `/usr/libexec`)   |
| `%{_datadir}`     | `%{_datarootdir}`         | 共享数据目录 (通常为 `/usr/share`) |
| `%{_mandir}`      | `%{_datarootdir}/man`     | man 目录 (通常为 `/usr/share/man`)                     |
| `%{_prefix}`      | `/usr`                    | 顶级安装前缀                                           |
| `%{_sysconfdir}`  | `/etc`                    | 系统配置目录                                          |
| `%{_exec_prefix}` | `%{_prefix}`              | 可执行文件路径前缀                                                  |
| `%{_includedir}`  | `%{_prefix}/include`      | 头文件目录 (通常为 `/usr/include`)                       |

### Bash 相关宏

| 宏                     | 含义                                   | 注释                                          |
| ------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `%{bash_completions_dir}` | `%{_datadir}/bash-completion/completions` | bash 自动补全脚本目录 |

### Python 相关宏

| 宏                | 含义                                                            | 注释 |
| -------------------- | ------------------------------------------------------------------ | ----- |
| `%{__python}`        | Python 解释器                             |       |
| `%{python_sitelib}`  | Python 第三方库安装目录 |       |
| `%{python_sitearch}` | Python 架构相关库安装目录     |       |

### Perl 相关宏

| 宏                | 含义                                                            | 注释 |
| -------------------- | ------------------------------------------------------------------ | ----- |
| `%{__perl}`          | Perl 解释器                               |       |
| `%{perl_vendorlib}`  | Perl 第三方库安装目录 |       |
| `%{perl_vendorarch}` | Perl 架构相关库安装目录   |       |

## 脚本段

当 Spec 使用 `%pre` `%post` `%preun` `%postun` `%pretrans` `%posttrans` 等脚本段时:

1. 脚本段必须是幂等的，并能正确处理安装/升级/卸载情形 (通过 `$1` 等事务参数区分)。

2. 脚本段必须以成功状态结束；不得因非关键步骤失败而中断事务。

3. 当可直接调用单一程序时，脚本段应当使用 `-p` 形式以减少 shell 复杂度。

脚本段的完整规则与推荐模板，详见补充规[脚本](/docs/guide/packaging-guidelines/Scriptlets)。

## 条件构建

1. 当需要定义可选构建开关时，Spec 应当使用 `%bcond`。

2. Spec 应当尽量避免使用 `%bcond_with` 与 `%bcond_without`。

示例:

```specfile
%bcond bootstrap 0
%bcond bootstrap 1

%if %{with bootstrap}
# ...
%endif

%if %{without bootstrap}
# ...
%endif
```

## 参考文献

本规范使用的外部概念参考如下:

1. RPM Packaging / Spec 文件语法与宏文档

2. SPDX License List 与 SPDX License Expression
