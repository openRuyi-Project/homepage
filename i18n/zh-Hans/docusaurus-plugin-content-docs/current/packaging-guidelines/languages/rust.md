---
id: languagesrust
title: Rust
description: 这个文档讲述了 openRuyi 的 Rust 打包指南。
slug: /guide/packaging-guidelines/languages/rust
---

# Rust打包指南

本文介绍如何在 openRuyi 中使用 **TakoPack** 对 Rust crate 进行打包。对于相关的构建系统，请参阅 [Rust](/docs/guide/packaging-guidelines/BuildSystems/rust).

通常来说，TakoPack 主要用于：

- 为单个 crate 生成初始 spec 文件和软件包目录
- 为 Rust 项目准备 crate 依赖
- 在人工审查和调整之前，辅助完成 Rust 打包的初始引导工作

在大多数情况下，自动生成的结果只是一个起点。对于存在严格版本约束、打过补丁的 `Cargo.toml`、git 依赖、workspace 布局或复杂 feature 关系的 crate，通常仍然需要手动修正。

下面是这份内容的中文翻译，标题层级保持一致，整体风格也尽量统一。

## 打包单个 Crate

### 在线打包

示例：

```sh
cargo pkg cbindgen 0.29.2
Spec file: rust-cbindgen-0.29/rust-cbindgen.spec
```

该命令会从 crates.io 拉取指定的 crate 及其版本，并在当前工作目录下生成对应的打包目录。

同时，它还会将原始的 `Cargo.toml` 备份到：

```text
~/cargo_back/origin
```

备份名称通常为：

```text
crate_name-full_version
```

其中 `_` 会被规范化为 `-`。

这种模式适用于托管在 crates.io 上的普通 crate。

------

### 从本地 `Cargo.toml` 打包

示例：

```sh
cargo localpkg value-bag-1.12.0/Cargo.toml
cargo localpkg value-bag-1.12.0/Cargo.toml -o dir
```

其中 `-o dir` 是可选参数，用于指定输出目录。

输出示例：

```text
Spec file: 1/rust-value-bag-1.0/rust-value-bag.spec
```

这种模式通常用于本地 `Cargo.toml` 已经被修改过的情况，例如已经应用了补丁，或者已经放宽了依赖约束。

需要注意的是，在这种模式下，生成的 spec 中源码归档包的哈希值通常需要你在下载 crate 并自行计算校验和之后再手动补充。

------

## 准备多个 Crate

### `track` 子命令

准备完整依赖集的推荐方式是使用 `track` 子命令。

它通过分析 `Cargo.lock` 工作，这通常比根据 `cargo tree` 推导依赖关系更可靠。

------

### 从本地 `Cargo.lock` 跟踪依赖

示例：

```sh
cargo run -- cargo track -f sieve/Cargo.lock -o 2022
```

输出示例：

```text
[18/19] Processing: unicode-ident 1.0.22
    Updating crates.io index
  ✓ Successfully packaged unicode-ident 1.0.22
[19/19] Processing: windows-sys 0.61.2
    Updating crates.io index
  ✓ Successfully packaged windows-sys 0.61.2

============================================================
Batch Processing Summary
============================================================
Total packages processed: 19
Successfully packaged:    19
Failed:                   0

Output directory: 2022
============================================================
```

这种模式适用于你已经有一个本地项目，并且希望尽可能准确地将锁定后的完整依赖集打包出来的场景。

------

### 根据 crate 名称和版本跟踪依赖

示例：

```sh
cargo run -- cargo track bindgen 0.29
```

这种模式同样依赖类似 lock 的依赖解析方式，但它可能会尝试刷新依赖版本。多数情况下这没有问题，但对于依赖要求异常严格的 crate，仍然可能需要手动调整。

------

### 本地依赖记录

在处理依赖时，`track` 还会把已经打包过的 crate 名称和版本记录到本地数据库中。

示例：

```sh
ls ~/.config/takopack
crate_db.txt
```

这有助于减少重复劳动，但它并不是一个完整的依赖管理系统。可选依赖、feature 关系以及某些版本边界情况，仍然可能需要人工审查。

------

## 常见限制

### Git 依赖

并不是所有 Rust 依赖都来自 crates.io，有些软件包依赖的是 git 仓库。

如果该 git 仓库的结构对应单个 crate，通常可以这样处理：

1. 手动克隆仓库
2. 对它的 `Cargo.toml` 使用 `localpkg`
3. 调整源码哈希值
4. 将生成的 spec 中的源码 URL 替换为合适的 git 归档 URL

如果该仓库采用的是 workspace 布局，打包会复杂得多。这种情况下，你可能需要给 `Cargo.toml` 打补丁、将整个仓库作为源码进行打包，并手动重写 workspace 依赖版本。

------

### Rust 应用比库 crate 更难打包

TakoPack 最适合用于打包单个 crate。

对于完整的 Rust 应用，依赖处理会困难得多：

- `Cargo.lock` 可能会产生非常庞大的依赖列表
- 列出来的某些依赖在最终构建中实际上并不需要
- feature 之间的关系并不总是容易自动推断
- 严格的版本约束往往只有在真正构建应用时才会暴露出来

一种常见的工作流是先用 `localpkg` 生成初始 spec，然后再手动精简依赖列表并调整打包结构。

------

### 严格的依赖约束

有些 crate 并没有很好地遵循 Rust 的版本兼容规则，或者它们把依赖版本钉得过死。

在这种情况下，打包可能需要：

- 给 `Cargo.toml` 打补丁
- 放宽依赖版本范围
- 基于打过补丁的本地源码重新生成 spec

这也是使用 `localpkg` 最常见的原因之一。

------

### 可选依赖与 Feature

即使已经拿到了依赖数据，可选依赖和 feature 组合仍然可能带来问题。

某个 crate 在 API 层面看起来可能是兼容的，但当另一个软件包启用了此前未使用的可选依赖后，它仍可能在后续构建中失败。此时，缺失或过时的依赖往往只有在实际构建时才会暴露出来。

一旦出现这种情况，可能就需要在之后额外单独打包更多 crate。

------

## 实践建议

在实际使用中，这几个命令通常可以这样选择：

- 对于来自 crates.io 的普通单个 crate，使用 **`pkg`**
- 对于 `Cargo.toml` 被打过补丁或手动修改过的 crate，使用 **`localpkg`**
- 当你需要根据 `Cargo.lock` 准备完整依赖集时，使用 **`track`**

对于简单 crate，TakoPack 往往足以生成一个不错的初始 spec。对于应用、workspace、git 依赖、严格版本约束以及复杂 feature 组合，则要预期仍需进行人工审查和调整。

------

## 来源

该工具基于 Debian Rust Packaging Team 的 `debcargo` 改造而来，以满足 openRuyi 的打包需求。我们在此对他们的工作表示感谢。
