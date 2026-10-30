---
id: buildsystemlinux
title: Linux
description: This document describes how to use the declarative build system named linux when packaging for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/linux
---

# Linux

This document describes how to use the declarative build system named `linux` when packaging for openRuyi.

This build system encapsulates the standard Linux kernel build and installation process and integrates openRuyi-specific distribution integration logic. The resulting kernel packages can be installed directly in an openRuyi environment and configured automatically.

## Usage

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

### Configurable Fields

#### `%bcond dtbs`

Optional. Set to `1` to produce the `dtbs` subpackage.

#### `%global variant_name`

Optional. Controls the value of `uname -r` and the directory name under `/lib/modules`. It may differ from the package name.

**Strongly recommended** when building kernel variants with additional features to avoid file-level conflicts with the kernel packages provided by openRuyi.

#### `Name:`

The package name. New kernel packages are generally named `linux-xxx` so that they can coexist with the default kernel packages.

#### `Version:`

The package version. It must match the version specified in the `Makefile` at the root of the Linux source tree exactly.

For example:

```Makefile
# SPDX-License-Identifier: GPL-2.0
VERSION = 7
PATCHLEVEL = 2
SUBLEVEL = 6
EXTRAVERSION =
NAME = Baby Opossum Posse
```

In this case, the package version must be set to `7.2.6`.

If `SUBLEVEL` is `0`, the package version must still include the trailing `.0`, in the form `x.y.0`.

#### `BuildOption(conf):`

Specifies the kernel configuration file to use for the build. During kernel configuration, the file at the specified path is first copied into the build directory, and then `olddefconfig` is executed.

### Overriding Default Behavior

This build system handles only the standard build process and distribution integration. Custom build procedures can be implemented in the following ways:

- Completely override `%prep` to implement source extraction and provide the defconfig file yourself.
  - `BuildOption(conf)` still takes effect during the `%conf` stage, so the specified path must be made available during `%prep`.
- Provide additional `%build -a` and `%install -a` sections.
  - These can be used to add new subpackages while preserving the standard kernel build process.

## Build Artifacts

### meta package

Named `linux`.

This package does not contain any kernel binaries; it only provides distribution integration logic.

Installing this package automatically pulls in the other subpackages as dependencies. It also triggers `kernel-install` to configure the bootloader automatically.

### core package

Named `linux-core`.

This package can be installed independently. It only provides `/lib/modules/xxx/vmlinuz` and `/lib/modules/xxx/config.zst`. Installing it independently does not trigger the distribution integration logic.

### modules package

Named `linux-modules`.

Depends on the core package. Installing it independently does not trigger the distribution integration logic.

After installation, it additionally provides:

- `/lib/modules/xxx/kernel/*`
- `/lib/modules/xxx/modules.builtin`
- `/lib/modules/xxx/modules.builtin.modinfo`
- `/lib/modules/xxx/modules.order`

It does not provide files generated at runtime by tools such as `modprobe`, such as `modules.alias`.

### dtbs package

Controlled by `%bcond dtbs`. This subpackage is built only when the option is enabled.

Named `linux-dtbs`.

Depends on the core package. Installing it independently does not trigger the distribution integration logic.

After installation, it additionally provides `/lib/modules/xxx/dtb/*`.

### devel package

Named `linux-devel`.

After installation, it additionally provides:

- `/usr/src/kernels/xxx`
- `/lib/modules/xxx/build`
- `/lib/modules/xxx/source`

## Build System Macros

The build system macros for `linux` are located in `/usr/lib/rpm/macros.d/macros.linux`.
