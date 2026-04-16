---
id: buildsystemcmake
title: CMake
description: This document explains how to use the declarative build system, cmake, when packaging for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/cmake
---

# CMake

This guide explains how to use the declarative build system, `cmake`, when packaging software for openRuyi.

When you build the software you are packaging using commands such as `%cmake`, `%cmake --build`, and `%cmake --install`, we recommend using `BuildSystem: cmake` to take advantage of its standardized build workflow and macro support.

## Dependencies

To use the `cmake` build system, add the following `BuildRequires`. Since the build environment preinstalls `gcc`, you do not need to declare `gcc` explicitly.

```specfile
BuildRequires:  cmake
```

## Examples

Assume the original build configuration in `%build` looks like the following snippet:

```specfile
%build
export CC=clang CXX=clang++
cmake -S . -B build \
    -DCMAKE_C_FLAGS_RELEASE:STRING=-DNDEBUG \
    -DCMAKE_CXX_FLAGS_RELEASE:STRING=-DNDEBUG \
    -DCMAKE_Fortran_FLAGS_RELEASE:STRING=-DNDEBUG \
    -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON \
    -DCMAKE_INSTALL_DO_STRIP:BOOL=OFF \
    -DCMAKE_INSTALL_PREFIX:PATH=%{_prefix} \
    -DCMAKE_INSTALL_FULL_SBINDIR:PATH=%{_bindir} \
    -DCMAKE_INSTALL_SBINDIR:PATH=bin \
    -DINCLUDE_INSTALL_DIR:PATH=%{_includedir} \
    -DLIB_INSTALL_DIR:PATH=%{_libdir} \
    -DSYSCONF_INSTALL_DIR:PATH=%{_sysconfdir} \
    -DSHARE_INSTALL_PREFIX:PATH=%{_datadir} \
    -DLIB_SUFFIX=64 \
    -DENABLE_CCACHE=1 \
    -DINSTALL_GTEST:BOOL=OFF

cmake --build build --verbose -- all doc
```

After converting the build section to the `cmake` build system, you need to adjust the commands to reflect their proper locations. Since we are also adding an explicit configuration section (`%conf`), the final result becomes:

```specfile
BuildOption(conf):  -DENABLE_CCACHE=1
BuildOption(conf):  -DINSTALL_GTEST:BOOL=OFF
BuildOption(build):  -- all doc

%build -p
export CC=clang CXX=clang++
```

Assume the original installation configuration in `%install` is as follows:

```specfile
%install
cmake --install build
rm -v %{buildroot}%{_libdir}/*.a
```

The updated configuration is:

```specfile
%install -a
rm -v %{buildroot}%{_libdir}/*.a
```

## Build System Notes

The file `/usr/lib/rpm/macros.d/macros.cmake` defines macros for the `cmake` build system.

For the configuration phase (%conf), the system presets the following values by default:

* The system sets the default source directory (`%_vpath_srcdir`) to `.` and the default build directory (`%__cmake_builddir`) to `%_target_platform`. This setting ensures the system performs an out-of-source build by default.

* `CMAKE_BUILD_TYPE: RelWithDebInfo`: The system builds an optimized binary with debug information by default.

* `CMAKE_VERBOSE_MAKEFILE:BOOL=ON`: This flag enables verbose build output.

* `CMAKE_INSTALL_DO_STRIP:BOOL=OFF`: This setting prevents CMake from stripping binaries during installation, which allows RPM to handle stripping in a unified way.

* `BUILD_SHARED_LIBS:BOOL=ON`: The system enables shared library builds by default.

* `CMAKE_INSTALL_PREFIX:PATH=%{_prefix}`

* `CMAKE_INSTALL_LIBDIR:PATH=%{_lib}`

* `CMAKE_INSTALL_FULL_LIBDIR:PATH=%{_libdir}`

* `CMAKE_INSTALL_SBINDIR:PATH=...`

* `CMAKE_INSTALL_FULL_SBINDIR:PATH=%{_sbindir}`

* `CMAKE_INSTALL_LIBEXECDIR:PATH=...`

* `CMAKE_INSTALL_FULL_LIBEXECDIR:PATH=%{_libexecdir}`

* `INCLUDE_INSTALL_DIR:PATH=%{_includedir}`

* `LIB_INSTALL_DIR:PATH=%{_libdir}`

* `SYSCONF_INSTALL_DIR:PATH=%{_sysconfdir}`

* `SHARE_INSTALL_PREFIX:PATH=%{_datadir}`

  * These settings align upstream project installation paths with the appropriate system locations.

* `LIB_SUFFIX=64`: For upstream projects that recognize `LIB_SUFFIX`, this value indicates that the directory suffix for 64-bit libraries is `64`.
