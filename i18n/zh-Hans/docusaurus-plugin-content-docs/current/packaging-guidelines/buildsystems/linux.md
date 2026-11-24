---
id: buildsystemlinux
title: Linux
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 linux 的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/linux
---

# Linux

这个文档讲述了在 openRuyi 打包时，如何使用名为 `linux` 的声明式构建系统。

此构建系统封装了标准的 Linux 内核编译与安装流程，并集成了 openRuyi 特定的发行版集成逻辑。构建得到的内核包可直接在 openRuyi 环境中安装并完成自动配置。

## 使用方法

```specfile
%bcond dtbs  1

%global variant_name foo

Name:           linux-foo
Version:        x.y.z
Release:        %autorelease
Summary:        The Linux Kernel
License:        GPL-2.0-only
URL:            https://xxx.com/xxx
Source:         xxx
Source1:        defconfig
BuildSystem:    linux
BuildOption(conf):  %{SOURCE1}
ExclusiveArch:  riscv64

BuildRequires:  openruyi-linux-build
%linux_package_dependencies

%description
This is the meta package that handles standard %{name} kernel installation.

%linux_package_implementation

%changelog
%autochangelog
```

### 可配置字段说明

#### `%bcond dtbs`

可选项。配置为 `1` 输出 `dtbs` 子包。

#### `%global variant_name`

可选项。用于控制 `uname -r` 的内容，以及在 `/lib/modules` 下的目录名。和包名可以不同。

在打特性包时**强烈推荐**配置该项，避免和 openRuyi 提供的内核包发生文件级冲突。

#### `Name:`

包名。一般将新内核包命名为 `linux-xxx`，使其与默认内核包共存。

#### `Version:`

包版本号。需要与 Linux 源码树根目录的 `Makefile` 内容保持严格一致。

例如：

```Makefile
# SPDX-License-Identifier: GPL-2.0
VERSION = 7
PATCHLEVEL = 2
SUBLEVEL = 6
EXTRAVERSION =
NAME = Baby Opossum Posse
```

则包版本号需要填写为 `7.2.6`。

若 `SUBLEVEL` 为 0，仍然需要在包版本携带 `x.y.0`。

#### `BuildOption(conf):`

提供构建内核使用的 config。配置内核时会先复制该路径至构建目录，再执行 `olddefconfig`。

### 行为覆盖

本构建系统仅处理标准构建流程与发行版集成。特殊的流程可以通过下列方式实现：

- 完全覆盖 `%prep`：自行实现源码解压并提供 defconfig
  - `BuildOption(conf)` 仍在 `%conf` 阶段生效，因此需要在 `%prep` 阶段提供该路径。
- 提供额外的 `%build -a` 与 `%install -a`
  - 可用于添加新的子包，且保留正常的内核构建流程。

## 构建产物

### meta 包

名为 `linux`。

不提供内核二进制产物，仅提供发行版集成逻辑。

安装该包会自动依赖安装其它子包。会触发 `kernel-install` 从而自动配置 bootloader。

### core 包

名为 `linux-core`。

可单独安装，仅提供 `/lib/modules/xxx/vmlinuz` 以及 `/lib/modules/xxx/config.zst`。单独安装不会触发发行版集成逻辑。

### modules 包

名为 `linux-modules`。

依赖 core 包。单独安装不会触发发行版集成逻辑。

安装后额外提供：

- `/lib/modules/xxx/kernel/*`
- `/lib/modules/xxx/modules.builtin`
- `/lib/modules/xxx/modules.builtin.modinfo`
- `/lib/modules/xxx/modules.order`

不提供 `modprobe` 等工具运行时生成的产物，例如 `modules.alias` 等。

### dtbs 包

受控于 `%bcond dtbs`，仅在启用时出包。

名为 `linux-dtbs`。

依赖 core 包。单独安装不会触发发行版集成逻辑。

安装后额外提供 `/lib/modules/xxx/dtb/*`

### devel 包

名为 `linux-devel`。

安装后额外提供：

- `/usr/src/kernels/xxx`
- `/lib/modules/xxx/build`
- `/lib/modules/xxx/source`

## 构建系统宏说明

linux 的相关构建系统宏在 `/usr/lib/rpm/macros.d/macros.linux` 内。
