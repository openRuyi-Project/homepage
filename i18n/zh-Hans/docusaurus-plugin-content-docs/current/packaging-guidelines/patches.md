---
id: patches
title: 补丁
description: 这个文档讲述了 openRuyi 的补丁策略。
slug: /guide/packaging-guidelines/Patch
---

# 补丁

这个文档讲述了 openRuyi 的补丁策略。

## 通常策略

所有在 spec 文件中引用的补丁在其上方都应当有一行注释。这行注释可以是包含该补丁文件的作用，也可以是上游链接。

## 补丁文件命名策略

所有补丁文件应该以四位数字开头，这四位数分别代表不同类型的补丁文件：

* 来自同一版本的 upstream 的补丁声明范围为 0001-0999。

* CVE 修复及上游其它版本 backport 补丁，声明范围为 1000-1999。

* openRuyi 特有，而不会被 upstream 的补丁声明范围为 2000-2999。

## 使用单 `Patch` 字段

`Patch` 字段应写在 `BuildOption` 字段（如果有）或者 `BuildRequires` 字段的上方。

```specfile
# https://github.com/pypa/wheel/pull/655
Patch0:         0001-adjusts-tests-for-setuptools-78.patch
```

如果你愿意的话，可以同时添加注释并附上链接：

```specfile
# Upstream has removed this code entirely instead
# https://github.com/pypa/wheel/pull/655
Patch0:         0001-adjusts-tests-for-setuptools-78.patch
```

## 使用 `%patchlist` 字段

如果有大于 3 个 patch，则不宜使用 `Patch` 字段，可直接定义 `%patchlist` 即可。如果定义 `%patchlist`，需要将列表放置于 `%description` 的上方。详见[这里](https://github.com/rpm-software-management/rpm/issues/752)。

```specfile
%patchlist
# Fix executable space protection patch, upstream plans to do this
0001-unzip-6.0-exec-shield.patch
# http://www.info-zip.org/board/board.pl?m-1259575993/
0002-unzip-6.0-attribs-overflow.patch
# ...
# covscan issues
0020-unzip-6.0-COVSCAN-fix-unterminated-string.patch
```

## 应用补丁

在 openRuyi 的构建系统中。通常不需要手动应用补丁，构建系统会在 `prep` 阶段**自动应用**补丁。

默认情况下，补丁路径剥离层级为 `-p1`，通常适用于 `git format-patch` 生成的补丁。这类补丁通常包含 `a/` 和 `b/` 路径前缀。

只有当默认准备阶段不能满足需要时，才应使用 `BuildOption(prep)` 传入额外参数。例如，补丁路径已经以源码根目录下的相对路径开头时，应显式使用 `-p0`：

```specfile
BuildOption(prep):  -p0
```

只有在补丁必须以特殊方式处理，且无法用声明式字段表达时，才应手写 `%prep` 并手动应用补丁。并且必须在 spec 中注释原因。