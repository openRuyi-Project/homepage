---
id: buildsystempyproject
title: Pyproject  
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 pyproject 的声明式构建系统。  
slug: /guide/packaging-guidelines/BuildSystems/pyproject
---

# Pyproject

这个文档讲述了在 openRuyi 打包时，如何使用名为 `pyproject` 的声明式构建系统。

当你所打包的软件包使用 `pyproject.toml` 声明构建后端，并遵循 [PEP 517](https://peps.python.org/pep-0517/) 和 [PEP 518](https://peps.python.org/pep-0518/) 构建流程时，  
推荐使用 `BuildSystem: pyproject`，以便复用标准化的 Python 构建流程，并减少重复样板代码。

通常来说，这类软件包包括绝大多数现代 Python 模块，也包括一部分以 Python 为主、但同时会安装命令行工具的项目。

## 依赖

如需要使用 `pyproject` 构建系统，那么通常至少需要添加这些 `BuildRequires`。

```specfile
BuildRequires:  pyproject-rpm-macros
BuildRequires:  pkgconfig(python3)
```

### 自动生成依赖

通过在使用 `pyproject` 声明式构建系统的 spec 文件中编写以下内容来让构建系统自动根据 PEP 517 和 PEP 518 添加构建依赖项。

```specfile
%generate_buildrequires
%pyproject_buildrequires
```

如果自动生成的构建依赖不足，或者软件包还需要非 Python 依赖、系统库依赖，则应继续按需补充 `BuildRequires`。

测试依赖通常可以通过 `BuildOption(generate_buildrequires)` 传递给 `%pyproject_buildrequires` 的相关参数生成，例如用于从 tox 默认环境读取测试依赖的  `-t` 选项；无法自动生成时再手动补充。

注意，通过 `%generate_buildrequires` 自动生成依赖时，它可能会在构建日志中输出错误信息，这是预期行为。

## 适用范围

`pyproject` 声明式构建系统适用于以下场景:

- 上游源码根目录存在 `pyproject.toml`
- 构建过程遵循 PEP 517 接口

需要注意的是，如果项目虽然包含 `pyproject.toml`，但实际构建流程依赖自定义脚本、非标准构建步骤，或者主要不是 Python 包，则不一定适合直接使用 `pyproject` 声明式构建系统。

## 示例

假设原有的生成构建依赖、构建与安装配置如下:

```specfile
%generate_buildrequires
%pyproject_buildrequires -x test

%build
%pyproject_wheel

%install
%pyproject_install
%pyproject_save_files example_pkg

%check
%pytest
```

使用 `pyproject` 声明式构建系统后，部分参数可以直接交由构建系统默认处理，而无需显式写明。我们可以改写为如下形式:

```specfile
BuildSystem:  pyproject

BuildOption(generate_buildrequires):  -x test
BuildOption(install):  example_pkg
```

注意，在使用 `pyproject` 声明式构建系统时，一定要在 `BuildOption(install)` 处传入对应的模块名。

如果原有安装阶段还有额外清理逻辑，例如:

```specfile
%install
%pyproject_install
%pyproject_save_files example_pkg
rm -f %{buildroot}%{_bindir}/debug-helper
```

那么修改后可以写为:

```specfile
BuildSystem:  pyproject

BuildOption(install):  example_pkg

%install -a
rm -f %{buildroot}%{_bindir}/debug-helper
```

## 测试

`pyproject` 声明式构建系统默认会进行冒烟测试，即对已安装的模块做 import 检查。通常来说，不应直接置空 `%check` 来跳过测试。

如果在这个过程中需要排除某些模块，可以通过 `BuildOption(check)` 向 `%pyproject_check_import` 传递参数，并且在上方写明跳过的原因。例如:

```specfile
BuildSystem:  pyproject

BuildOption(install):  example_pkg
# No module named 'marray'
BuildOption(check):  -e 'example_pkg.tests*'
```

如需额外补充 `pytest` 测试，可以直接编写追加操作步骤:

```specfile
%check -a
%pytest
```

tox 等测试同理，可使用 `%tox` 宏。

## 构建系统宏说明

`pyproject` 的相关构建系统宏在 `/usr/lib/rpm/macros.d/macros.pyproject` 内。

部分构建宏的介绍，可参考 [Python 打包指南](/docs/guide/packaging-guidelines/languages/Python)下方的 RPM 宏说明。
