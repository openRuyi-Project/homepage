---
id: languagespython
title: Python
description: 这个文档讲述了 openRuyi 的 Python 模块打包指南。
slug: /guide/packaging-guidelines/languages/Python
---

# Python 打包指南

这个文档讲述了 openRuyi 的 Python 模块打包指南。

## 命名

Python 库的软件包，其名称必须以 `python-` 为前缀。

对于软件包的名称 (`DISTNAME`)，应该以上游项目在 PyPi 上的名称为准。我们必须在 SPEC 顶部添加以下宏:

```specfile
%global srcname DISTNAME
```

简言之，`srcname` 宏代表项目在 PyPi 上的名称。

## 源码链接

在任何时候，都应该优先考虑使用发布在 PyPi 上的源码包作为源码链接。在 PyPi 上并没有提供源码下载的库，或者 PyPi 上不存在的库除外，例如 `python-pyperclip`:

```specfile
%global srcname pyperclip

Source0:        https://files.pythonhosted.org/packages/source/p/%{srcname}/%{srcname}-%{version}.tar.gz
```

对于软件包的名称 (`DISTNAME`) 和下载链接的名称不同的情况，需要在 SPEC 顶部添加 `pypi_name` 宏，例如 `python-aiohttp-socks`:

```specfile
%global srcname aiohttp-socks
%global pypi_name aiohttp_socks

Source0:        https://files.pythonhosted.org/packages/source/a/%{pypi_name}/%{pypi_name}-%{version}.tar.gz
```

:::warning 注意

`pypi_name` 宏代表**项目在 PyPi 上下载链接的文件名称**，并不代表**项目本身在 PyPi 上的名称**。后者必须用 `srcname` 宏表示。

:::

我们再举一个例子，例如 `python-pytest-rerunfailures`:

```specfile
%global srcname pytest-rerunfailures
%global pypi_name pytest_rerunfailures

Source0:        https://files.pythonhosted.org/packages/source/p/%{srcname}/%{pypi_name}-%{version}.tar.gz
```

## 依赖关系

软件包不应该对 `python3` 有显式的运行时依赖，在以下情况会自动依赖:

* 当它们向 `%{python3_sitelib}` 或 `%{python3_sitearch}` 安装文件时，会自动依赖 `python(abi) = 3.X`。

* 如果它们有可执行的 Python 脚本，会自动依赖 `/usr/bin/python3`。

### BuildRequires: pkgconfig(python3)

使用 Python 和/或安装 Python 模块的每一个软件包，必须在 spec 内添加 `BuildRequires: pkgconfig(python3)`，即使在构建时并未实际调用 Python。

### Provides: python3-DISTNAME

因为在 openRuyi 中，不将 python3 作为子包拆分，而是直接在主包中提供。故如果软件包为架构无关，应该在 spec 中加入:

```specfile
Provides:       python3-DISTNAME = %{version}-%{release}
%python_provide python3-DISTNAME
```

如果软件包为架构相关，则应该在 spec 中加入:

```specfile
Provides:       python3-%{srcname} = %{version}-%{release}
Provides:       python3-%{srcname}%{?_isa} = %{version}-%{release}
%python_provide python3-%{srcname}
````

可以将这里的 DISTNAME 替换为上述已定义的宏，通常为 `%{srcname}`。

## 用于 Python 模块的 RPM 宏

这里包含了一些常用的用于 Python 模块 RPM 宏。

### 构建宏

#### %pyproject_buildrequires

此宏用于 `spec` 文件的 `%generate_buildrequires` 部分，为软件包生成 BuildRequires。

#### %pyproject_wheel

此宏用于构建软件包。通常，这是 `%build` 部分中唯一需要的宏。 此宏需要由 `%pyproject_buildrequires` 生成的 BuildRequires。

#### %pyproject_install

此宏用于安装由 `%pyproject_wheel` 构建的软件包。此宏需要由 `%pyproject_buildrequires` 生成的 BuildRequires。

#### %pyproject_save_files

此宏用于生成与给定可导入模块相对应的文件列表，并将其保存为 `%{pyproject_files}`。生成的列表不包括 README 文件。当 LICENSE 文件在 metadata 中指定时，它会被包含在内。

#### %pyproject_check_import

此宏用于读取 `%pyproject_save_files` 生成的可导入 Python 模块列表。它作为可以快速发现缺少运行时依赖、安装路径错误、扩展模块加载失败等问题的冒烟测试。

#### %pyproject_files

此宏为由 `%pyproject_save_files` 写入的文件的路径。使用范例:

```specfile
%files -n python-DISTNAME -f %{pyproject_files}
```
