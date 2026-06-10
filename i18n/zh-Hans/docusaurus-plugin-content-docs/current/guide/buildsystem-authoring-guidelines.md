---
id: buildsystem-authoring-guidelines
title: BuildSystem 编写规范
description: 这个文档讲述了 openRuyi 的 BuildSystem 编写规范。
slug: /guide/buildsystem-authoring-guidelines
---

# BuildSystem 编写规范

openRuyi 推荐在打包时使用声明式构建系统机制，以减少 Spec 文件中的重复样板代码，并提升软件包构建流程的一致性。普通打包者通常只需要在 Spec 中声明 `BuildSystem:`，并根据需要使用 `BuildOption(<stage>):` 或 `%<stage> -p` / `%<stage> -a` 进行调整。

本文面向需要新增、维护或审查 BuildSystem 宏的维护者。本文不重复介绍如何在单个 Spec 中使用已有 BuildSystem；如需了解使用方式，请先阅读\[声明式构建系统]及对应的构建系统子文档。

## 适用范围

当某一类软件包满足以下条件时，可以考虑新增或改进一个 BuildSystem:

* 多个软件包使用相同或高度相似的构建流程。

* 构建流程可以抽象为稳定的 `%prep`、`%conf`、`%build`、`%install`、`%check` 阶段。

* 大部分差异可以通过 `BuildOption(<stage>):`、宏变量或前置/追加段落表达。

* 默认行为可以代表 openRuyi 对该类软件包的推荐构建方式。

如果某个构建流程只服务于单个软件包，或者需要大量包内定制逻辑，则不应新增通用 BuildSystem。维护者应当优先在该软件包的 Spec 中处理特殊逻辑。

## 设计原则

### 减少样板代码

BuildSystem 应当封装重复出现的通用构建流程，例如配置、编译、安装和基础测试。维护者不应把每个包都需要重复编写的宏调用留给 Spec。

例如，当某类软件包普遍需要执行以下流程时:

```specfile
%build
%foo_configure
%foo_build

%install
%foo_install

%check
%foo_check
```

维护者可以考虑将这些步骤封装到对应的 BuildSystem 中，这样打包时只需要在 Spec 内声明:

```specfile
BuildSystem:  foo
```

### 保留可覆盖性

BuildSystem 不应让打包者失去处理特殊情况的能力。维护者必须为常见差异保留明确的扩展接口:

* 使用 `BuildOption(<stage>):` 传递阶段参数。

* 使用 `%<stage> -p` 在自动生成脚本前插入逻辑。

* 使用 `%<stage> -a` 在自动生成脚本后追加逻辑。

* 对确实不适用的阶段，允许 Spec 显式覆盖该阶段，并通过注释说明原因。

对于 `BuildOption(<stage>):`，相关说明应写在对应 `BuildOption` 上方，不得写在参数行末尾；否则，行末注释会被当作选项字符串的一部分拼接进最终命令。

### 默认行为

BuildSystem 的默认行为必须体现 openRuyi 的打包约定。维护者在设计默认参数时，应当优先考虑以下目标:

* 安装路径符合 RPM 路径宏约定。

* 构建输出足够详细，便于排查失败。

* 不在上游构建系统中提前 strip 二进制文件。

* 默认启用共享库，除非该生态不适用。

* 默认测试行为应当安全、稳定、可复现。

* 不依赖构建环境偶然预装的软件包。

注意，BuildSystem 不得包含只针对某个具体软件包的特殊逻辑。

## 命名规则

BuildSystem 名称必须使用小写字母、数字和短横线，并应当与上游生态或主要构建工具名称保持一致。例如:

```specfile
BuildSystem:  cmake
BuildSystem:  pyproject
BuildSystem:  golangmodules
```

我们不推荐这样:

```specfile
BuildSystem:  Cmake
BuildSystem:  PyProject
BuildSystem:  Golangmodules
```

## 阶段划分

BuildSystem 应当按照 RPM 构建过程划分阶段。维护者在新增 BuildSystem 时，必须规划该 BuildSystem 是否接管以下阶段:

| 阶段                        | 作用                 | 是否建议提供            |
| ------------------------- | ------------------ | ----------------- |
| `%prep`                   | 解压源码、应用补丁、准备源码树    | 通常提供              |
| `%generate_buildrequires` | 自动生成构建时所需依赖        | 构建生态支持自动依赖生成时提供   |
| `%conf`                   | 配置构建目录、生成构建文件      | 构建系统需要配置时提供       |
| `%build`                  | 编译源码               | 通常提供              |
| `%install`                | 安装到 `%{buildroot}` | 通常提供              |
| `%check`                  | 执行测试或基础检查          | 应当提供，除非该生态不适合默认测试 |

RPM 声明式 BuildSystem 支持为上述阶段定义对应的 `%buildsystem_<name>_<stage>` 宏。其中 `%conf`、`%build` 和 `%install` 是构建系统必须提供的核心阶段；`%prep`、`%generate_buildrequires`、`%check` 和 `%clean` 可以按需提供。

## 阶段参数传递约定

`BuildOption(<stage>):` 用于向指定构建阶段传递额外参数。BuildSystem 维护者必须确保对应阶段的宏可以接收这些参数，并将其传递给合适的底层命令。

例如，对于名为 `foo` 的 BuildSystem，`BuildOption(conf):` 传入的参数应由 `%buildsystem_foo_conf()` 接收；`BuildOption(build):` 传入的参数应由 `%buildsystem_foo_build()` 接收。至于这些参数最终传给 `configure`、`cmake`、`make`、`pytest`，还是其它命令，由该 BuildSystem 的实现决定。

因此，每个阶段宏都应当按可接收参数的形式编写，并在合适的位置使用传入参数。例如:

```specfile
%buildsystem_foo_conf() foo-configure %*
%buildsystem_foo_build() foo-build %*
%buildsystem_foo_install() foo-install %*
```

如果某个阶段的参数不能直接传给底层命令，BuildSystem 文档必须说明该阶段支持哪些参数，以及这些参数会如何影响最终构建命令。

## 依赖

每个 BuildSystem 子文档必须列出使用该 BuildSystem 通常需要的 `BuildRequires`。

例如，`cmake` 类构建系统文档应当说明需要 `cmake`。`pyproject` 类构建系统文档应当说明需要 `pyproject-rpm-macros` 和 Python 相关构建依赖。

如果某些依赖由构建环境保证预装，文档可以说明不需要显式声明。但 BuildSystem 不应依赖未文档化的隐式依赖。

### 自动生成构建依赖

如果某个语言生态或构建工具可以根据上游元数据生成构建依赖，BuildSystem 可以提供 `%generate_buildrequires` 阶段。

例如，`pyproject` 类构建系统可以通过 PEP 517 和 PEP 518 元数据生成 Python 构建依赖。此类 BuildSystem 应当允许维护者通过 `BuildOption(generate_buildrequires):` 向底层依赖生成宏传递参数。

如果自动生成的构建依赖不足，Spec 仍然必须通过 `BuildRequires` 手动补充缺失依赖。BuildSystem 不应假设自动生成结果一定完整。

## 测试

在编写测试行为时，应当尽量确保默认测试行为安全。默认测试可以是完整的测试套件，也可以是基础冒烟测试。

维护者应当避免以下设计:

* 默认完全跳过 `%check`。 但如果不能提供默认测试，应说明原因。

* 默认执行需要网络访问的测试。

* 默认执行高度不稳定或依赖外部服务的测试。

## 宏文件位置

BuildSystem 相关宏应当放置在对应的 RPM 宏目录中，并使用清晰的文件名。

推荐命名:

```specfile
/usr/lib/rpm/macros.d/macros.<buildsystem>
```

例如:

```specfile
/usr/lib/rpm/macros.d/macros.cmake
/usr/lib/rpm/macros.d/macros.pyproject
```

如果多个 BuildSystem 共享同一组基础宏，可以将公共逻辑放入公共宏文件，但每个 BuildSystem 的入口行为仍应保持清晰。

## 文档要求

每新增一个 BuildSystem，维护者必须同时补充对应文档。文档应至少包含以下内容:

1. BuildSystem 名称。

2. 适用范围。

3. 必要的 `BuildRequires`。

4. 从传统 Spec 写法迁移到声明式写法的示例。

5. 宏文件位置。

可选但是我们建议添加的内容:

1. 支持的 `BuildOption(<stage>):`。

2. 默认开启或关闭的构建参数。

3. 默认测试行为。
