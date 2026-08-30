---
id: rpmmacros
title: Macro Tags
description: This document describes the macro-tag mechanism used by openRuyi.
slug: /guide/packaging-guidelines/RPMMacros
---

# Macro Tags

This document describes the macro-tag mechanism used by openRuyi.

RPM provides a rich set of macros that simplify package maintenance and ensure consistency across packages. For example, RPM includes a set of default path definitions that build system macros use, as well as definitions for directories used specifically during RPM package builds. In general, you should use these macros instead of hardcoding directory paths. RPM also provides default compiler flag macros that you should use when compiling software manually rather than relying on a build system.

You can ask RPM to evaluate any string containing macros by running `rpm --eval` on the command line:

```bash
rpm --eval "some text printed on %{_arch}"
some text printed on riscv64
```

## Path macros that build systems use

Macros that invoke build systems, such as `%configure`, `%cmake`, or `%meson`, rely on values defined by RPM to set package installation paths. We recommend that you do not hardcode these paths in spec files; instead, use the same macros to maintain consistency.

You can inspect the values of these macros in `/usr/lib/rpm/platform/*/macros` on the corresponding platform.

Below are some macros that developers commonly use in spec files:

| Macro               | Typical expansion          | Meaning                                                                                     |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `%{_lib}`            | lib64                      | Architecture-dependent library directory name (example)                                     |
| `%{_bindir}`         | `%{_exec_prefix}/bin`      | Standard executable directory (typically `/usr/bin`)                                        |
| `%{_docdir}`         | `%{_datadir}/doc`           | Documentation directory (typically `/usr/share/doc`)                                        |
| `%{_libdir}`         | `%{_exec_prefix}/%{_lib}` | Primary library directory (typically `/usr/%{_lib}`)                                        |
| `%{_libexecdir}`     | `%{_exec_prefix}/libexec`  | Executable directory for internal binaries (typically `/usr/libexec`)                       |
| `%{_datadir}`        | `%{_datarootdir}`           | Architecture-independent shared data directory (typically `/usr/share`)                     |
| `%{_mandir}`         | `%{_datarootdir}/man`       | Manual pages directory (typically `/usr/share/man`)                                         |
| `%{_prefix}`         | /usr                       | Top-level installation prefix                                                               |
| `%{_sysconfdir}`     | /etc                       | System configuration directory                                                              |
| `%{_exec_prefix}`   | `%{_prefix}`                | Executable path prefix                                                                      |
| `%{_includedir}`     | `%{_prefix}/include`        | C/C++ header directory (typically `/usr/include`)                                           |
| `%{_infodir}`        | `%{_datarootdir}/info`      | GNU info files directory (typically `/usr/share/info`)                                      |
| `%{_rundir}`         | /run                       | Runtime data directory (typically used for PID files and sockets)                           |
| `%{_localstatedir}`  | /var                       | Directory for local state data                                                              |
| `%{_sharedstatedir}` | /var/lib                   | Directory for shared state data (typically used for databases and package management state) |

We also provide some additional path macros that you can use as needed:

| Macro              | Meaning                                    | Notes                                                               |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| `%{_sbindir}`       | Same as `%{_bindir}`                        | Directory for system administration executables                     |
| `%{_unitdir}`      | `%{_exec_prefix}/lib/systemd/system`       | Directory for systemd unit files, usually `/usr/lib/systemd/system` |

## Macros that RPM (and SRPM) builds use

These macros define directory locations related to the package build process. In most cases, `%{buildroot}` is the only macro that developers widely use in a `.spec` file.

| Macro             | Meaning                                                   | Notes                                                                                                        |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `%{buildroot}`      | `%{_buildrootdir}/%{name}-%{version}-%{release}.%{_arch}` | Virtual root directory that installation testing uses, equivalent to `$RPM_BUILD_ROOT`                       |
| `%{_topdir}`       | `%{getenv:HOME}/rpmbuild`                                   | Top-level build directory containing subdirectories such as `BUILD`, `RPMS`, `SOURCES`, `SPECS`, and `SRPMS` |
| `%{_builddir}`     | `%{_topdir}/BUILD`                                         | Working directory where rpmbuild unpacks and compiles sources, usually `~/rpmbuild/BUILD`                    |
| `%{_rpmdir}`       | `%{_topdir}/RPMS`                                          | The directory that stores the generated binary RPM packages                                                  |
| `%{_sourcedir}`    | `%{_topdir}/SOURCES`                                       | Directory for source archives, patches, and other resource files                                             |
| `%{_specdir}`      | `%{_topdir}/SPECS`                                         | Directory for `.spec` files                                                                                  |
| `%{_srcrpmdir}`    | `%{_topdir}/SRPMS`                                         | The directory that stores the generated source RPM packages                                                  |
| `%{_buildrootdir}` | `%{_topdir}/BUILDROOT`                                     | Directory containing the buildroot trees for individual package builds                                       |

## Macros providing compiler and linker flags

We provide the `%{optflags}` macro, which contains flags such as `CFLAGS`, `CXXFLAGS`, and `FFLAGS`. The `%{build_ldflags}` macro determines the value of the `LDFLAGS` environment variable that build system macros set.

## Other path macros

### Bash

| Macro                     | Meaning                                  | Notes                                          |
| ------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `%{bash_completions_dir}` | `%{_datadir}/bash-completion/completions` | Standard directory for Bash completion scripts |
