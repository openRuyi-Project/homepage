---
id: buildsystemautotools
title: Autotools
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 autotools 的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/autotools
---

# autotools

这个文档讲述了在 openRuyi 打包时，如何使用名为 `autotools` 的声明式构建系统。

当你所打包的软件包在编译时使用 `configure`、`make` 和 `make install` 等指令的时候，我们推荐使用 `BuildSystem:  autotools`，以便利用其提供的标准化构建流程和宏支持。

## 依赖

如需要使用 `autotools` 构建系统，那么需要添加这些 `BuildRequires`，因为 `gcc` 在构建环境预装，可不显式声明。

```specfile
BuildRequires:  autoconf
BuildRequires:  automake
BuildRequires:  libtool
BuildRequires:  make
```

## 使用 autoreconf

我们推荐在配置部分 (`%conf`) 前置运行 `autoreconf -fiv`。这个命令是为了利用构建系统中的工具链，为当前的特定系统环境生成一个全新的、兼容性更好的构建脚本 (`configure`)。

这可以有效避免因软件包自带的旧构建脚本与当前新系统环境不匹配而导致的各种编译错误。

```specfile
%conf -p
autoreconf -fiv
```

展开来说，`autoreconf` 是 GNU Autotools 工具集中的一个高级脚本，它会按照正确的顺序调用其他工具 (如 `aclocal`, `libtoolize`, `autoconf`, `autoheader`, `automake`) 来从源码中的 `configure.ac` 和 `Makefile.am` 文件生成最终的 `configure` 脚本和 `Makefile.in` 模板文件。

* `-f`, `--force`: 强制重新生成所有文件，即使它们看起来是最新的。这可以确保所有构建脚本都是全新且一致的。

* `-i`, `--install`: 自动复制缺失的辅助脚本。它会从你的 Autotools 安装目录中复制 `config.guess`, `config.sub`, `install-sh`, `missing` 等通用脚本到项目目录中。

* `-v`, `--verbose`: 显示详细的执行过程。

### 在什么时候不需要使用

如果打包的软件包源码内没有 `configure` 脚本，此时请不要使用该命令。但这种情况下你依然可以使用 `autotools` 构建系统，对比有 `configure` 脚本的项目，仅需要使用一个空的配置部分 (`%conf`) 覆盖 `autotools` 构建系统的默认行为即可。

```specfile
%conf
# No configuration needed
```

## 示例

假设原有的准备 (`%prep`) 配置如下:

```specfile
%prep
%autosetup -p0 -n %{name}-%{version}
cp {SOURCE1} .
```

可以看到，首先我们指定解压源码并加载补丁，最后再将定义的 Source1 复制到当前目录下。通过使用 `autotools` 构建系统，可以修改为如下:

```specfile
BuildOptin(prep): -p0

# ...

%prep -a
cp {SOURCE1} .
```

其中，`%autosetup` 后面的参数移到前面，它之后的指令，根据需要该移动到 `%prep -a` 区段去。

不过在这里，我们省略了 `-n %{name}-%{version}`。因为，RPM 默认会认为下载的源码压缩包解压后，生成的顶级目录名一定是这样的格式。只有当目录名不符合这种命名规范时，才需要自定义，例如:

```specfile
# 假设上游的压缩包解压之后，第二部分不是版本号，而是 %%{short_commit_id}
BuildOptin(prep): -p0 -n %{name}-%{short_commit_id}

# ...

%prep -a
cp {SOURCE1} .
```


同样的，假设原有的编译 (`%build`) 配置如下:

```specfile
%build
export CFLAGS="%{optflags} -fPIC -pie -std=gnu89"
autoreconf
%configure --with-tcl=%{_libdir} --with-tk=%{_libdir} --enable-shared \
        --with-tclinclude=%{_includedir}/tcl-private/generic
# remove rpath from libtool
sed -i 's|^hardcode_libdir_flag_spec=.*|hardcode_libdir_flag_spec=""|g' libtool
sed -i 's|^runpath_var=LD_RUN_PATH|runpath_var=DIE_RPATH_DIE|g' libtool
 
make SHLIB_LD="gcc -shared" %{?_smp_mflags} all pkglibdir=%_libdir/tcl/%name%version
```

使用 `autotools` 构建系统后，需要根据指令出现的位置进行修改。又因为我们有新增的配置部分 (`%conf`)，故最后修改为如下:

```specfile
BuildOption(conf):  --with-tcl=%{_libdir}
BuildOption(conf):  --with-tk=no_tk
BuildOption(conf):  --with-tclinclude=%{_includedir}
BuildOption(conf):  --enable-shared
BuildOption(build):  CFLAGS="%{optflags} -fPIC -pie -std=gnu89"
BuildOption(build):  SHLIB_LD="gcc -shared"
BuildOption(build):  pkglibdir=%{_libdir}/tcl/%{name}-%{version}

%conf -p
autoreconf -fiv

%conf -a
# remove rpath from libtool
sed -i 's|^hardcode_libdir_flag_spec=.*|hardcode_libdir_flag_spec=""|g' libtool
sed -i 's|^runpath_var=LD_RUN_PATH|runpath_var=DIE_RPATH_DIE|g' libtool
```

假设原有的安装 (`%install`) 配置如下:

```specfile
%install
%make_install pkglibdir=%_libdir/tcl/%name%version
ln -s libexpect%{majorver}.so %{buildroot}%{_libdir}/libexpect.so
rm -f %{buildroot}%{_bindir}/{cryptdir,decryptdir}
rm -f %{buildroot}%{_mandir}/man1/{cryptdir,decryptdir}.1*
rm -f %{buildroot}%{_bindir}/autopasswd
```

修改后的配置如下:

```specfile
BuildOption(install): pkglibdir=%{_libdir}/tcl/%{name}-%{version}

%install -a
ln -s libexpect%{majorver}.so %{buildroot}%{_libdir}/libexpect.so
rm -f %{buildroot}%{_bindir}/{cryptdir,decryptdir}
rm -f %{buildroot}%{_mandir}/man1/{cryptdir,decryptdir}.1*
rm -f %{buildroot}%{_bindir}/autopasswd
```

## 构建系统宏说明

autotools 的相关构建系统宏在 `/usr/lib/rpm/macros.d/macros.buildsystem` 内。

其中配置部分 (`%conf`)， 我们已经预先添加了 `--disable-silent-rules`、`--disable-rpath` 和 `--docdir=%{_docdir}/%{name}` 三个配置。
