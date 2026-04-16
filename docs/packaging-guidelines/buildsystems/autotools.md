---
id: buildsystemautotools
title: Autotools
description: This document explains how to use the declarative build system, autotools, when packaging for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/autotools
---

# Autotools

This document explains how to use the declarative build system, `autotools`, when packaging for openRuyi.

When you build the software you are packaging using commands such as `configure`, `make`, and `make install`, we recommend using `BuildSystem: autotools` to take advantage of its standardized build workflow and macro support.

## Dependencies

To use the `autotools` build system, add the following `BuildRequires`. Since the build environment preinstalls `gcc`, you do not need to declare `gcc` explicitly.

```specfile
BuildRequires:  autoconf
BuildRequires:  automake
BuildRequires:  libtool
BuildRequires:  make
```

## Using `autoreconf`

We recommend running `autoreconf -fiv` before the configuration phase (`%conf`). This command regenerates the build scripts using the toolchain available in the build environment, producing a fresh `configure` script that aligns better with the current system environment.

Regenerating the build scripts helps prevent outdated, upstream-generated build scripts from causing build failures in newer, incompatible build environments.

```specfile
%conf -p
autoreconf -fiv
```

More specifically, `autoreconf` is a high-level wrapper script in the GNU Autotools suite. It invokes other tools in the proper order—such as `aclocal`, `libtoolize`, `autoconf`, `autoheader`, and `automake`—to generate the final `configure` script and `Makefile.in` template files from `configure.ac` and `Makefile.am` in the source tree.

* `-f`, `--force`: Force regeneration of all files, even if they appear up to date. Forcing regeneration ensures that the tool regenerates all build scripts from scratch and maintains internal consistency.

* `-i`, `--install`: Automatically copy missing auxiliary scripts into the project directory. These auxiliary scripts include common helper scripts such as `config.guess`, `config.sub`, `install-sh`, and `missing` from your Autotools installation.

* `-v`, `--verbose`: Show detailed execution output.

### When autoreconf is not needed

If the source tree does not contain a `configure` script, do not run `autoreconf`. In that case, you may still use the `autotools` build system. Compared with projects that provide a configure script, you only need to override the default `autotools` behavior by providing an empty configuration section (`%conf`).

```specfile
%conf
# No configuration needed
```

## Examples

Assume the original preparation section (`%prep`) looks like the following snippet:

```specfile
%prep
%autosetup -p0 -n %{name}-%{version}
cp {SOURCE1} .
```

Here, you unpack the source archive, apply patches first, and then copy `Source1` into the current directory. After switching to the `autotools` build system, you can rewrite the preparation section as follows:

```specfile
BuildOptin(prep): -p0

# ...

%prep -a
cp {SOURCE1} .
```

You must move the arguments that originally followed `%autosetup` into `BuildOption(prep)`, while you should move any commands after `%autosetup` into `%prep -a` as needed.

In this example, however, we omit `-n %{name}-%{version}`. We omit this flag because RPM assumes by default that the top-level directory it creates after extracting the source archive follows that naming convention. You only need to specify the `-n` option explicitly when the extracted directory name does not match that pattern. For example:

```specfile
# Suppose that after you extract the upstream archive, the second component is not the version number
# but %%{short_commit_id}
BuildOptin(prep): -p0 -n %{name}-%{short_commit_id}

# ...

%prep -a
cp {SOURCE1} .
```

Likewise, assume the original build section (`%build`) is as follows:

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

After converting the build section to the `autotools` build system, you need to adjust the commands to reflect their proper locations. Since we are also adding an explicit configuration section (`%conf`), the final result becomes:

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

Assume the original install section (`%install`) is as follows:

```specfile
%install
%make_install pkglibdir=%_libdir/tcl/%name%version
ln -s libexpect%{majorver}.so %{buildroot}%{_libdir}/libexpect.so
rm -f %{buildroot}%{_bindir}/{cryptdir,decryptdir}
rm -f %{buildroot}%{_mandir}/man1/{cryptdir,decryptdir}.1*
rm -f %{buildroot}%{_bindir}/autopasswd
```

You can rewrite the install section as:

```specfile
BuildOption(install): pkglibdir=%{_libdir}/tcl/%{name}-%{version}

%install -a
ln -s libexpect%{majorver}.so %{buildroot}%{_libdir}/libexpect.so
rm -f %{buildroot}%{_bindir}/{cryptdir,decryptdir}
rm -f %{buildroot}%{_mandir}/man1/{cryptdir,decryptdir}.1*
rm -f %{buildroot}%{_bindir}/autopasswd
```

## Build system macros

The `/usr/lib/rpm/macros.d/macros.buildsystem` file defines the build system macros related to `autotools`.

For the configuration phase (%conf), we already add the following options by default:

* `--disable-silent-rules`

* `--disable-rpath`

* `--docdir=%{_docdir}/%{name}`
