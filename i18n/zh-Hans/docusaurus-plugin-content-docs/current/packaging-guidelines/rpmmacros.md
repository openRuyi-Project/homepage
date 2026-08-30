---
id: rpmmacros
title: 宏标签
description: 这个文档讲述了 openRuyi 的宏标签机制。
slug: /guide/packaging-guidelines/RPMMacros
---

# 宏标签

这个文档讲述了 openRuyi 的宏标签机制。

RPM 提供了一套丰富的宏，旨在使软件包的维护工作更简单，并确保跨软件包的一致性。例如，RPM 包含了一系列默认的路径定义（供构建系统宏使用），以及 RPM 软件包构建专用目录的定义。通常情况下，您应当使用这些宏，而不是硬编码目录路径。此外，RPM 还提供了默认的编译器标志宏，当您不依赖构建系统、而是手动编译时，应当使用这些宏。

通过在命令行中运行 `rpm --eval`，可以让 RPM 计算包含宏的任意字符串：

```bash
rpm --eval "some text printed on %{_arch}"
some text printed on riscv64
```

## 供构建系统设置和使用的路径宏

用于调用构建系统 (例如 `%configure`、`%cmake` 或 `%meson`) 的宏会使用 RPM 定义的值来为软件包设置安装路径。我们推荐不要在 spec 文件中硬编码这些路径，而是使用相同的宏以保持一致性。

这些宏的值可以通过查看相应平台的 `/usr/lib/rpm/platform/*/macros` 文件来检视。

以下列出了一些在 spec 文件中常见的宏:

| 宏标签               | 含义          | 注释                                                                                     |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `%{_lib}`            | lib64                      |                                      |
| `%{_bindir}`         | `%{_exec_prefix}/bin`      | 可执行文件的目 (通常为 `/usr/bin`)                                        |
| `%{_docdir}`         | `%{_datadir}/doc`           | 文档目录 (通常为 `/usr/share/doc`)                                        |
| `%{_libdir}`         | `%{_exec_prefix}/%{_lib}` | 库文件目录 (通常为 `/usr/%{_lib}`)                                        |
| `%{_libexecdir}`     | `%{_exec_prefix}/libexec`  | 可执行程序的目录 (通常为 `/usr/libexec`)                       |
| `%{_datadir}`        | `%{_datarootdir}`           | 共享数据文件的目录 (通常为 `/usr/share`)                     |
| `%{_mandir}`         | `%{_datarootdir}/man`       | 手册页文件的目录 (通常为 `/usr/share/man`)                                         |
| `%{_prefix}`         | /usr                       | 顶级安装前缀                                                                |
| `%{_sysconfdir}`     | /etc                       | 系统配置文件的目录                                                              |
| `%{_exec_prefix}`   | `%{_prefix}`                | 可执行文件路径前缀                                                                      |
| `%{_includedir}`     | `%{_prefix}/include`        | C/C++ 头文件目录 (通常为 `/usr/include`)                                           |
| `%{_infodir}`        | `%{_datarootdir}/info`      | GNU info 文件目录 (通常为 `/usr/share/info`)                                      |
| `%{_rundir}`         | /run                       | 运行时数据目录 (通常用于 PID 文件、socket)                           |
| `%{_localstatedir}`  | /var                       | 本地状态数据目录                                                              |
| `%{_sharedstatedir}` | /var/lib                   | 共享状态数据目录 (通常用于数据库、包管理状态等) |

我们还有一些其他的路径宏标签，可以根据需要使用:

| 宏标签              | 含义                                    | 注释                                                               |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| `%{_sbindir}`       | 跟 `%{_bindir}` 相同                       | 系统管理可执行文件目录 executables                     |
| `%{_unitdir}`       | `%{_exec_prefix}/lib/systemd/system`       | systemd 单元文件的目录，通常为 `/usr/lib/systemd/system` |

## 为 RPM (和 SRPM) 构建过程设置的宏

这些为与软件包构建过程相关的目录位置宏。通常来说，在 `.spec` 文件中唯一广泛使用的宏是 `%{buildroot}`。

| 宏标签             | 含义                                                   | 注释                                                                                                        |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `%{buildroot}`      | `%{_buildrootdir}/%{name}-%{version}-%{release}.%{_arch}` | 安装测试时的虚拟根目录，同 `$RPM_BUILD_ROOT`                       |
| `%{_topdir}`       | `%{getenv:HOME}/rpmbuild`                                   | 构建的顶级目录，包含 `BUILD`、`RPMS`、`SOURCES`、`SPECS`、 `SRPMS` 等子目录 |
| `%{_builddir}`     | `%{_topdir}/BUILD`                                         | 源码展开和编译时的工作目录。通常为 `~/rpmbuild/BUILD`                    |
| `%{_rpmdir}`       | `%{_topdir}/RPMS`                                          | 存放生成的二进制 RPM 包                                                  |
| `%{_sourcedir}`    | `%{_topdir}/SOURCES`                                       | 存放源代码、补丁和资源文件                                              |
| `%{_specdir}`      | `%{_topdir}/SPECS`                                         | 存放 `.spec` 文件                                                                                  |
| `%{_srcrpmdir}`    | `%{_topdir}/SRPMS`                                         | 存放生成的源代码 RPM 包                                                  |
| `%{_buildrootdir}` | `%{_topdir}/BUILDROOT`                                     | 存放各个构建包的 buildroot 根目录                                       |

## 提供编译器和链接器标志的宏

我们提供`%{optflags}` 宏，包含 `CFLAGS`、`CXXFLAGS`、`FFLAGS` 等的 FLAG。由构建系统设置的 `LDFLAGS` 环境变量的值由 `%{build_ldflags}` 宏决定。

## 其它路径宏

### Bash

| 宏标签                     | 含义                                  | 注释                                          |
| ------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `%{bash_completions_dir}` | `%{_datadir}/bash-completion/completions` | 存放 bash 的自动补全脚本  |
