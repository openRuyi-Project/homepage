---
id: buildsystemrust
title: Rust
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 rust 和 rustcrates 的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/rust
---

# Rust

这个文档讲述了在 openRuyi 打包时，如何使用 `rust` 和 `rustcrates` 两个声明式构建系统。

`rust` 和 `rustcrates` 面向不同类型的软件包:

* 使用 **`rust`** 构建 Rust 应用、命令行工具或其他需要执行 Cargo 编译与测试流程的软件包；
* 使用 **`rustcrates`** 构建 Rust crate provider 包，也就是安装 crate 源码并生成 crate feature 子包相关文件的软件包。

关于 Rust crate provider 的生成、依赖闭包、兼容性命名和 TakoPack 使用流程，请参考 Rust 语言打包指南。本文只说明构建系统宏本身的行为。

## 依赖

使用 `rust` 或 `rustcrates` 构建系统时，通常需要添加:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
```

如果软件包依赖其他 Rust crate，应通过 `crate(...)` 能力声明对应的构建依赖，例如:

```specfile
BuildRequires:  crate(clap-4/default) >= 4.5.0
BuildRequires:  crate(serde-1/default) >= 1.0.0
```

## 选择构建系统

### `rust`

`rust` 构建系统用于 Rust 应用包。一个最小示例:

```specfile
BuildSystem:    rust
```

如果需要向 Cargo 构建或测试流程传递参数，可以使用 `BuildOption(build)` 和 `BuildOption(check)`:

```specfile
BuildSystem:    rust

BuildOption(build):  --no-default-features --features "foo,bar" -p example-cli
BuildOption(check):  --no-default-features --features "foo,bar" -p example-cli
```

### `rustcrates`

`rustcrates` 构建系统用于 Rust crate provider 包。一个典型示例:

```specfile
%global crate_name anes
%global full_version 0.1.6
%global pkgname anes-0.1

Name:           rust-%{pkgname}
Version:        0.1.6
BuildSystem:    rustcrates
```

其中:

* `crate_name` 是上游 `Cargo.toml` 中的 crate 名；
* `full_version` 是上游完整 crate 版本；
* `pkgname` 是 provider 包使用的兼容性名称。

以上宏一般不需手动修改，如确需修改，请在 `commit` 及 `pr` 中进行说明。
具体兼容性命名规则请参考 Rust 语言打包指南。

## 准备阶段

### `rust`

`rust` 构建系统的准备阶段会执行默认源码展开，并配置 Cargo 使用系统 registry。

其核心行为相当于:

```specfile
%autosetup -C -p1 ...
%rust_setup_registry
```

如果需要在默认准备阶段之前或之后添加少量命令，可以使用声明式构建系统提供的 section 扩展方式:

```specfile
%prep -p
echo "run before default Rust prep"
```

```specfile
%prep -a
echo "run after default Rust prep"
```

如果完整覆盖 `%prep`，需要注意保留 Cargo 使用系统 registry 的配置，否则后续 Cargo 构建可能无法使用系统提供的 crate 依赖。

### `rustcrates`

`rustcrates` 构建系统的准备阶段只执行默认源码展开。

如果需要在默认准备阶段之前或之后添加少量命令，也可以使用声明式构建系统提供的 section 扩展方式。

## 构建阶段

### `rust`

`rust` 构建系统的构建阶段会执行 Rust release 构建。

可以通过 `BuildOption(build)` 向构建阶段传递参数:

```specfile
BuildOption(build):  --no-default-features --features "foo,bar"
```

这些参数会传递给构建系统内部的 Cargo 构建流程。

### `rustcrates`

`rustcrates` 构建系统的构建阶段不执行 Cargo build。它会运行动态 specpart 生成脚本，根据 crate provider 的 feature 子包生成对应的 `%files` 片段。因此，请不要覆盖此阶段。

## 安装阶段

### `rust`

`rust` 构建系统当前没有默认安装动作。

如果 Rust 应用需要安装二进制文件、补充文档或处理额外文件，应根据包的实际情况编写或扩展 `%install`。

例如，安装构建产物:

```specfile
%install 
install -Dm0755 target/release/example-cli %{buildroot}%{_bindir}/example-cli
```

### `rustcrates`

`rustcrates` 构建系统的安装阶段会安装 crate 源码。

其核心行为相当于:

```specfile
%rust_install_crate
```

该宏会把当前 crate 源码安装到系统位置，并生成 `.cargo-checksum.json`。

因此，Rust crate provider 包通常不需要手写 `%install`。如果确实需要在默认安装逻辑前后追加操作，可以使用 `%install -p` 或 `%install -a`。

## 检查阶段

### `rust`

`rust` 构建系统提供默认测试阶段。它会执行 Cargo test 流程。

可以通过 `BuildOption(check)` 向测试阶段传递参数:

```specfile
BuildOption(check):  --no-default-features --features "foo,bar"
```

如果上游测试依赖网络、不可用的可选依赖、特定运行环境，或者在构建环境中不适合运行，可以按照软件包策略覆盖或禁用 `%check`。

### `rustcrates`

`rustcrates` 构建系统当前没有默认测试阶段。

也就是说，使用 `BuildSystem: rustcrates` 的 crate provider 包默认不会执行 Cargo test。如果需要额外校验，请手动覆盖本阶段并编写测试逻辑。

## 注意事项

* `rust` 用于 Rust 应用包，不用于生成 crate provider 包。
* `rustcrates` 用于 Rust crate provider 包，不用于构建 Rust 应用。
* Python 软件包如果包含 Rust 扩展，通常仍应使用 Python 相关构建系统，例如 `BuildSystem: pyproject`。
* 如果软件包有非常规构建步骤，可以使用通用声明式构建系统的 `%prep -p/-a`、`%build -p/-a`、`%install -p/-a`、`%check -p/-a` 机制扩展默认流程。

## 构建系统宏文件

Rust 相关构建系统宏文件通常位于:

```text
/usr/lib/rpm/macros.d/macros.buildsystem.rust
/usr/lib/rpm/macros.d/macros.buildsystem.rustcrates
/usr/lib/rpm/macros.d/macros.rust
```

其中:

* `macros.buildsystem.rust` 定义 `BuildSystem: rust` 的准备、构建、安装和检查阶段行为；
* `macros.buildsystem.rustcrates` 定义 `BuildSystem: rustcrates` 的准备、构建、安装和检查阶段行为；
* `macros.rust` 提供 Rust registry 配置、构建、测试和 crate 安装相关的底层宏。

如需确认 rust 和 rustcrates 构建系统的精确行为，也可以直接查阅 `rust-rpm-macros` 源:
https://github.com/openRuyi-Project/rust-rpm-macros