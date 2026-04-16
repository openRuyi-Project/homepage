---
id: buildsystemcmake
title: CMake
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 cmake 的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/cmake
---

# CMake

这个文档讲述了在 openRuyi 打包时，如何使用名为 `cmake` 的声明式构建系统。

当你所打包的软件包在编译时使用 `%cmake`、`%cmake --build` 和 `%cmake --install` 等指令的时候，我们推荐使用 `BuildSystem: cmake`，以便利用其提供的标准化构建流程和宏支持。

## 依赖

如需要使用 `cmake` 构建系统，那么需要添加这些 `BuildRequires`，因为 `gcc` 在构建环境预装，可不显式声明。

```specfile
BuildRequires:  cmake
```

## 示例

假设原有的准备 (`%build`) 配置如下:

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

使用 `cmake` 构建系统后，需要根据指令出现的位置进行修改，又因为我们有新增的配置部分 (`%conf`)，故最后修改为如下:

```specfile
BuildOption(conf):  -DENABLE_CCACHE=1
BuildOption(conf):  -DINSTALL_GTEST:BOOL=OFF
BuildOption(build):  -- all doc

%build -p
export CC=clang CXX=clang++
```

假设原有的安装 (`%install`) 配置如下:

```specfile
%install
cmake --install build
rm -v %{buildroot}%{_libdir}/*.a
```

修改后的配置如下:

```specfile
%install -a
rm -v %{buildroot}%{_libdir}/*.a
```

## 构建系统说明

cmake 的相关构建系统宏在 `/usr/lib/rpm/macros.d/macros.cmake` 内。

其中配置部分 (`%conf`)，我们已经预先设置了这些值:

 - 默认源码目录 (`%_vpath_srcdir`) 为 `.`，默认构建目录 (`%__cmake_builddir`) 为 `%_target_platform`，即默认 out-of-source build。
 - `CMAKE_BUILD_TYPE: RelWithDebInfo`: 默认编译带调试信息的优化构建。
 - `CMAKE_VERBOSE_MAKEFILE:BOOL=ON`: 打开详细构建输出。
 - `CMAKE_INSTALL_DO_STRIP:BOOL=OFF`: 防止 CMake 在安装阶段自己 strip 二进制，让 RPM 自己统一处理。
 - `BUILD_SHARED_LIBS:BOOL=ON`: 默认打开共享库构建。
 - `CMAKE_INSTALL_PREFIX:PATH=%{_prefix}`
 - `CMAKE_INSTALL_LIBDIR:PATH=%{_lib}`
 - `CMAKE_INSTALL_FULL_LIBDIR:PATH=%{_libdir}`
 - `CMAKE_INSTALL_SBINDIR:PATH=...`
 - `CMAKE_INSTALL_FULL_SBINDIR:PATH=%{_sbindir}`
 - `CMAKE_INSTALL_LIBEXECDIR:PATH=...`
 - `CMAKE_INSTALL_FULL_LIBEXECDIR:PATH=%{_libexecdir}`
 - `INCLUDE_INSTALL_DIR:PATH=%{_includedir}`
 - `LIB_INSTALL_DIR:PATH=%{_libdir}`
 - `SYSCONF_INSTALL_DIR:PATH=%{_sysconfdir}`
 - `SHARE_INSTALL_PREFIX:PATH=%{_datadir}`
   - 将上游项目的安装路径对齐到相应的位置。
 - `LIB_SUFFIX=64`: 对某些认 LIB_SUFFIX 的上游项目，告知当前 64 位库的目录后缀位 `64`。
