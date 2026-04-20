---
id: buildsystemrust
title: Rust
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 rust和 rustcrates的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/rust
---

# Rust

这个文档讲述了在 openRuyi 打包时，如何使用名为 `rust` 和 `rustcrates` 的声明式构建系统。

通常来说，Rust语言的库包可用自动化工具生成大部分的内容，不需要人工编写。

## 依赖

如需要使用 `rust` 或 `rustcrates` 构建系统，那么需要添加这些 `BuildRequires`。

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
```

## 必需宏

对于使用 `rustcrates` 构建系统的软件包，你应当在 spec 文件顶部附近定义以下宏：

```specfile
# Cargo.toml 中的原始 crate 名称。
# 保持其不变，便于参考和调试。
# 在大多数其他地方，下划线会被规范化为连字符。
%global crate_name anes

# 来自 crates.io 的完整上游版本字符串。
# 即使包含额外后缀，这里也必须写完整版本。
%global full_version 0.1.6

# 用于 Provides/Requires 和目录命名的兼容性软件包名称。
# spec 文件所在目录名也应与该值一致。
%global pkgname anes-0.1

Name:           rust-%{pkgname}
Version:        0.1.6
```

在大多数情况下：

- `crate_name` 是 `Cargo.toml` 中的原始 crate 名称
- `full_version` 是精确的上游 crate 版本
- `pkgname` 是用于依赖解析的兼容性名称

对于兼容性规则更严格的 crate，`pkgname` 可能需要包含更具体的版本段。例如：

```specfile
%global crate_name toml
%global full_version 0.9.11+spec-1.1.0
%global pkgname toml-0.9.11

Name:           rust-%{pkgname}
Version:        0.9.11
```

如果你修改了 `pkgname`，请确保所有相关的依赖声明也同步更新，例如：

```
BuildRequires:  crate(toml-0.9.11)
```

同时还要确保 spec 文件目录名与 `pkgname` 一致。

## 何时需要手动调整

大多数 Rust 库软件包都可以自动生成，几乎不需要或只需要极少量手动编辑。通常只有在以下情况下才需要手动修改：

1. **依赖约束过于严格**
    有些 crate 会在 `Cargo.toml` 中把依赖版本钉得过死。这种情况下，你可能需要给 crate 打补丁，以放宽版本约束。
2. **上游兼容性行为有问题**
    如果某个 crate 没有可靠地遵循兼容性约定，你可能需要调整 `pkgname`，使用更具体的版本字符串。
3. **自动生成的 spec 文件明显不合理**
    如果生成出来的 spec 明显不正常，可以对照已有的、打包良好的 Rust crate 软件包进行手动修正。

## 源码准备

在使用 `rust` 或 `rustcrates` 时，通常**不需要**手动解压源码，也不需要手动应用补丁。

如果确实需要额外准备步骤，尽量使用 `%prep -a`。这是更推荐的方式，因为默认的 `%prep` 逻辑还会为 Cargo 配置系统注册表。

如果你必须在使用 `rust` 构建系统时完全覆盖 `%prep`，请务必保留 Cargo 注册表配置。一个典型的替代写法如下：

```
%prep -a
mkdir -p ~/.cargo
cat > ~/.cargo/config.toml <<EOF
[source.crates-io]
replace-with = "system-registry"
[source.system-registry]
directory = "/usr/share/cargo/registry"
EOF
rm -rf Cargo.lock
```

## 打包仅包含库的 crate

对于大多数仅包含库的 crate 软件包，`rustcrates` 构建系统已经提供了所需的安装和测试行为。在很多情况下，不需要自定义 `%build`、`%install` 或 `%check` 段。

这通常是打包 Rust 库时的首选方式。

## 关于构建行为的说明

目前，Rust 构建系统封装的是常见的 `cargo build --release` 工作流。如果你的软件包需要额外的构建步骤，或者需要使用不同的 Cargo 命令，可以覆盖 `%build`，或者通过 `%build -a` 进行扩展。

对于 `rustcrates` 来说，库软件包通常比应用软件包需要更少的定制。

## 构建系统宏说明

Rust 语言的两个构建系统宏为 `/usr/lib/rpm/macros.d/macros.buildsystem.rust` 和 `/usr/lib/rpm/macros.d/macros.buildsystem.rustcrates`。
