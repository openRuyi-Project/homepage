---
id: languagesrust
title: Rust
description: 这个文档讲述了 openRuyi 的 Rust 打包指南。
slug: /guide/packaging-guidelines/languages/rust
---

# Rust 打包指南

这个文档讲述了 openRuyi 的 Rust 打包指南。对于相关构建系统的说明，请参阅 [Rust](/docs/guide/packaging-guidelines/BuildSystems/rust)。

openRuyi 中的 Rust 软件包通常分为以下几类:

* Rust crate provider 包。
* Rust 应用或命令行工具。
* 带有 Rust 扩展的其他语言软件包，例如 Python/Rust 扩展包。

不同类型的软件包应选择不同的构建系统和依赖表达方式。
Rust 打包工作中通常会配合 TakoPack 生成 crate provider、分析依赖和辅助审查，项目地址:
https://github.com/TakoPack/TakoPack

## 命名

Rust crate provider 包必须以 `rust-` 为前缀。

crate provider 包名通常来自 crate 的兼容性名称。例如:

```specfile
%global crate_name serde
%global full_version 1.0.228
%global pkgname serde-1

Name:           rust-serde-1
Version:        1.0.228
```

其中:

* `crate_name` 是上游 `Cargo.toml` 中的原始 crate 名称；
* `full_version` 是上游完整 crate 版本；
* `pkgname` 是 openRuyi 中用于包名、目录名和 `crate(...)` 能力的兼容性名称。

crate 名中的 `_` 通常会在 RPM 包名和 `crate(...)` 能力中规范化为 `-`。例如，上游 crate 名为 `os_str_bytes` 时，provider 包名中通常使用 `os-str-bytes`。

crate provider 的目录名、spec 文件名和 `Name` 应保持一致。例如:

```text
SPECS/rust-serde-1/rust-serde-1.spec
```

对应:

```specfile
%global pkgname serde-1
Name:           rust-serde-1
```

如果确实需要修改 `pkgname`，也应同步调整目录名、spec 文件名以及相关的 `crate(...)` 依赖声明，并在 commit 和 PR 中说明原因。

## 兼容性名称

Rust crate provider 使用兼容性名称，以允许不同不兼容版本在仓库中共存。

通常规则如下:

* `1.x.y` 及以上版本按 major 版本划分。
* `0.y.z` 且 `y > 0` 的版本按 minor 版本划分。
* `0.0.z` 版本按完整 patch 版本划分。

例如:

```text
serde 1.0.228       -> serde-1
tokenizers 0.22.2   -> tokenizers-0.22
foo 0.0.7           -> foo-0.0.7
```

除非 crate 存在明确的兼容性问题，不应引入不必要的更细粒度兼容性名称，例如 `serde-1.0.15`。

## 构建系统

Rust crate provider 包应使用:

```specfile
BuildSystem:    rustcrates
```

Rust 应用、命令行工具或其他需要执行 Cargo build/test 流程的软件包应使用:

```specfile
BuildSystem:    rust
```

带有 Rust 扩展的 Python 软件包通常仍应使用 Python 相关构建系统，例如:

```specfile
BuildSystem:    pyproject
```

## 依赖关系

Rust crate 依赖应通过 `crate(...)` 能力声明。例如:

```specfile
BuildRequires:  crate(serde-1/default) >= 1.0.0
BuildRequires:  crate(clap-4/derive) >= 4.5.0
```

如果需要某个 feature，应显式依赖对应 feature 能力。

不要使用普通 RPM 包名替代 `crate(...)` 能力来表达 Rust crate 依赖。`crate(...)` 能力是 Rust 生态包之间进行依赖解析的主要接口。

在修改 crate 或软件包时，应确认:

* 新增或修改的 crate provider 满足 openRuyi 的命名、源码、补丁和依赖规范。
* 变更不会破坏仓库中已有 Rust 软件包的构建。
* 使用仓库中已有的 crate provider，能够基于使用 crate 包构建软件的 `Cargo.toml` 完成依赖分析。
* 新增 provider、升级 provider 和已有 provider 的影响范围已经被检查。

## Rust crate provider 包

Rust crate provider 包用于把 crate 源码安装到系统中，并提供 `crate(...)` 能力供其他 Rust 软件包使用。

crate provider 包应使用 TakoPack 生成，生成结果应作为初始打包内容提交审查。维护者需要检查生成结果是否符合 openRuyi 的命名、源码、依赖和补丁规范。

一个典型 crate provider 包示例:

```specfile
%global crate_name anes
%global full_version 0.1.6
%global pkgname anes-0.1

Name:           rust-anes-0.1
Version:        0.1.6
Release:        %autorelease
Summary:        Benchmarking helper library
License:        MIT OR Apache-2.0
URL:            https://crates.io/crates/%{crate_name}
#!RemoteAsset:  sha256:...
Source:         https://static.crates.io/crates/%{crate_name}/%{full_version}/download#/%{name}-%{version}.tar.gz
BuildArch:      noarch
BuildSystem:    rustcrates

BuildRequires:  rust-rpm-macros
```

`Source`、`#!RemoteAsset`、`Patch` 等源码相关内容应以实际生成结果和仓库规范为准。不要在手工修改时破坏源码文件、哈希值和 spec 声明之间的一致性。

crate provider 包通常不需要手写 `%build`、`%install` 或 `%check`。相关行为由 `rustcrates` 构建系统处理。

### provider 目录中的 `Cargo.toml`

TakoPack 生成 crate provider 包时，会在 provider 目录中保留一个 `Cargo.toml`。例如:

```text
SPECS/rust-serde-1/Cargo.toml
SPECS/rust-serde-1/rust-serde-1.spec
```

这个 `Cargo.toml` 是打包时使用的 crate 元数据副本，主要用于记录 crate 名称、版本、依赖和 feature 信息。它也是生成 `BuildRequires: crate(...)`、feature 子包以及相关依赖关系的重要依据。

对于从 crates.io 生成的 provider，这个文件通常来自上游 crate 归档中的 `Cargo.toml`。对于从本地 `Cargo.toml` 生成的 provider，它来自命令中指定的本地文件。

如果打包过程中需要 patch 上游 `Cargo.toml`，应确保以下内容保持一致:

* provider 目录中的 `Cargo.toml`。
* 源码包中应用补丁后的 `Cargo.toml`。
* spec 中声明的 `Patch`。
* 由 crate 元数据生成的 `Requires` 和 `Provides`。

不要只修改 spec 中生成出来的依赖声明，而不更新对应的 `Cargo.toml`。

### 从 crates.io 生成 provider

对于 crates.io 上的 crate，可以使用 TakoPack 生成初始 provider 包。例如:

```sh
takopack cargo pkg cbindgen 0.29.2
```

也可以省略版本，让工具使用当前解析到的版本:

```sh
takopack cargo pkg pem
```

生成结果通常位于当前目录下，例如:

```text
rust-cbindgen-0.29/
rust-pem-3/
```

生成后应检查目录名、spec 文件名、`pkgname`、源码链接、哈希值和依赖声明是否符合规范。

### 从本地 `Cargo.toml` 生成 provider

如果 crate 的 `Cargo.toml` 已经被补丁修改，或者需要基于本地源码生成 provider，应使用本地 `Cargo.toml` 作为输入。例如:

```sh
takopack cargo localpkg value-bag-1.12.0/Cargo.toml
```

也可以指定输出目录:

```sh
takopack cargo localpkg value-bag-1.12.0/Cargo.toml -o outdir
```

这种方式常用于:

* 放宽或修正依赖约束；
* 把 git/path 依赖改成适合 openRuyi 打包的形式。

使用本地 `Cargo.toml` 生成 provider 后，应确认 provider 目录中的 `Cargo.toml` 与打包源码中补丁后的 `Cargo.toml` 保持同步。

## Rust 应用包

Rust 应用包通常使用:

```specfile
BuildSystem:    rust
```

Rust 应用包也需要声明 Rust 构建环境和实际构建所需的 crate 依赖。例如:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
BuildRequires:  crate(clap-4/default) >= 4.5.0
BuildRequires:  crate(clap-4/derive) >= 4.5.0
```

如果应用需要安装二进制文件，应在 `%install` 中明确安装构建产物。例如:

```specfile
%install
install -Dm0755 target/release/example-cli %{buildroot}%{_bindir}/example-cli
```

对于存在 git 依赖或源码内 path 依赖的 Rust 应用，通常应通过补丁修改 `Cargo.toml`，使其指向打包时实际存在的源码位置或系统中已经提供的 crate provider。修改后，应确认 spec 附带的 `Cargo.toml`、源码中实际使用的 `Cargo.toml` 以及补丁内容相互一致。

如果 Rust 应用本身也发布到了 crates.io，可以先使用 TakoPack 生成初始 provider 目录，再根据应用包实际需要调整 spec。此时，应将生成得到的 `Cargo.toml` 复制到实际软件包目录中，并确保它与最终打包源码中使用的 `Cargo.toml` 保持一致。

如果 Rust 应用并非来自 crates.io，应从解压后的上游源码中复制主要 `Cargo.toml` 到软件包目录中，作为依赖分析和审查依据。

## Python/Rust 扩展包

如果 Python 软件包包含 Rust 扩展，通常仍应使用 Python 相关构建系统，例如:

```specfile
BuildSystem:    pyproject
```

同时声明 Python 和 Rust 构建所需依赖。例如:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
BuildRequires:  python3dist(maturin)
BuildRequires:  crate(pyo3-0.27/default) >= 0.27.0
BuildRequires:  crate(pyo3-0.27/extension-module) >= 0.27.0
```

这类软件包的 `%prep` 通常需要在 Python 构建系统的默认准备逻辑之后配置 Rust system registry，并根据实际情况移除上游 `Cargo.lock`。例如:

```specfile
%prep -a
%rust_setup_registry
rm -f Cargo.lock
```

如果 Rust 源码位于子目录，应在正确目录下处理对应的 `Cargo.lock`。例如:

```specfile
%prep -a
%rust_setup_registry
rm -f rust/Cargo.lock
```

Python/Rust 扩展包一般需要从解压后的上游源码中手动复制主要 `Cargo.toml` 到软件包目录中，作为依赖分析和审查依据。

## CI 检查

打包或更新 Rust crate provider 时，应根据 CI 结果在 spec 中进行必要处理。CI 可能会暴露源码文件权限、解释器路径、feature 依赖闭包缺失等问题，维护者应结合实际情况调整 spec 或相关打包内容。

openRuyi 不一定会使用 crate 的全部 feature。如果 CI 中出现未实际使用 feature 的依赖闭包问题，且确认当前不需要为这些 feature 补齐额外 crate provider，应在 PR 评论中说明原因。

升级 crate provider 后，即使应用包的依赖仍然满足构建要求，也应检查实际 spec 文件中的 `BuildRequires: crate(...)` 是否需要更新。

## 补丁

有些 crate 的依赖约束无法直接映射到 openRuyi 的 crate provider 规则。常见情况包括:

* 依赖范围跨越多个 crate 兼容性 key。
* 依赖 prerelease 版本。
* 依赖版本钉得过死。
* 依赖 git 仓库。
* 依赖 workspace 内部 path crate。

遇到这些情况时，优先修改上游 `Cargo.toml`，形成补丁，然后基于补丁后的 `Cargo.toml` 重新生成或更新 provider。

禁止只手动修改生成后的 `Requires` 或 `Provides` 来绕过问题。`Requires` 和 `Provides` 应当由修正后的 crate 元数据重新生成，以免 spec 与实际源码不一致。

补丁应按仓库通用补丁规范声明，并确保 `Patch`、源码内容、provider 目录中的 `Cargo.toml` 和生成后的 provider 目录保持一致。

## 实践建议

打包 Rust 软件包时，建议遵循以下原则:

* crate provider 使用 `BuildSystem: rustcrates`。
* Rust 应用使用 `BuildSystem: rust`。
* Python/Rust 扩展通常继续使用 `BuildSystem: pyproject`。
* Rust crate provider 应使用 TakoPack 生成。
* Rust crate 依赖使用 `BuildRequires: crate(...)` 表达。
* 对生成出来的 provider 进行人工审查。
* 遇到不合理依赖时，优先 patch `Cargo.toml` 并重新生成 provider。
* 不要直接手改生成的 `Requires`/`Provides` 来代替元数据修正。
* 修改 crate 或软件包时，确认不会破坏仓库中已有 Rust 软件包的构建。
* 新增 provider、升级 provider 和已有包影响面应进行检查。

## 来源

Rust crate provider 的自动生成工具基于 Debian Rust Packaging Team 的 `debcargo` 改造而来，以满足 openRuyi 的打包需求。我们在此对他们的工作表示感谢。
