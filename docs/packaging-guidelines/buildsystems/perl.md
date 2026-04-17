---
id: buildsystemperl
title: Perl
description: This document explains how to use the declarative build system, perlbuild and perlmaker, when packaging for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/perl
---

# Perl

This document explains how to use the declarative Perl build systems in openRuyi.

In most cases, Perl module packages can be generated automatically with tools such as `cpan2spec`, and only minor fixes are needed afterward.

If you need to write a spec file manually, first check which upstream build script the package uses:

- Use **`perlbuild`** for Module::Build-based packages, usually indicated by `Build.PL`.
- Use **`perlmaker`** for ExtUtils::MakeMaker-based packages, usually indicated by `Makefile.PL`.

## Dependencies

To use the Perl declarative build system, packages typically need:

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
```

You should also add the Perl module dependencies required by the upstream build script, such as:

- `perl(Module::Build)` for `Build.PL`.
- `perl(ExtUtils::MakeMaker)` for `Makefile.PL`.

## Choosing the build system

### `perlbuild`

Use this for packages built with `Build.PL`:

```specfile
BuildSystem:    perlbuild
```

Typical example:

```specfile
BuildSystem:    perlbuild

BuildOption(build):  --installdirs=vendor optimize="%{optflags}"
BuildOption(install):  --destdir=%{buildroot} --create_packlist=0
```

### `perlmaker`

Use this for packages built with `Makefile.PL`:

```specfile
BuildSystem:    perlmaker
```

Typical example:

```specfile
BuildSystem:    perlmaker

BuildOption(build):  INSTALLDIRS=vendor
```

## Build phase

The two Perl build systems mainly differ in how the package is built.

### `perlbuild`

The `perlbuild` build phase runs:

```specfile
perl Build.PL ...
./Build
```

Its core macro is effectively:

```specfile
%buildsystem_perlbuild_build() %{expand:\
  perl Build.PL %* \
  ./Build \
}
```

Use `BuildOption(build)` to pass arguments to `Build.PL`.

### `perlmaker`

The `perlmaker` build phase runs:

```specfile
perl Makefile.PL ...
make
```

Its core macro is effectively:

```specfile
%buildsystem_perlmaker_build() %{expand:\
  perl Makefile.PL %* \
  %{make_build} \
}
```

Use `BuildOption(build)` to pass arguments to `Makefile.PL`.

## Install phase

Both Perl build systems also differ in the install command, but they share the same post-install cleanup and metadata handling.

### `perlbuild`

The `perlbuild` install phase runs:

```specfile
./Build install ...
find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \;
%perl_process_packlist
%perl_gen_filelist
```

Its core macro is:

```specfile
%buildsystem_perlbuild_install() %{expand:\
  ./Build install %* \
  find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \; \
  %perl_process_packlist \
  %perl_gen_filelist \
}
```

Use `BuildOption(install)` to pass arguments to `./Build install`.

### `perlmaker`

The `perlmaker` install phase runs:

```specfile
%perl_make_install ...
find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \;
%perl_process_packlist
%perl_gen_filelist
```

Its core macro is:

```specfile
%buildsystem_perlmaker_install() %{expand:\
  %perl_make_install %* \
  find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \; \
  %perl_process_packlist \
  %perl_gen_filelist \
}
```

## Check phase

Both Perl build systems provide a default check phase.

For packages using `perlbuild`, the default check phase runs:

```specfile
./Build test
```

For packages using `perlmaker`, the default check phase runs:
```specfile
make test
```

In most packages, you do not need to define a custom `%check` section. If the upstream test suite needs extra arguments, pass them through `BuildOption(check)` when appropriate.

For example:
```specfile
BuildOption(check):  TEST_VERBOSE=1
```
If the test suite requires network access, unavailable optional dependencies, or other unsupported runtime behavior, you may need to override or disable the default check phase according to the package policy.

## Notes

- `perlbuild` and `perlmaker` cover most standard CPAN-style Perl module packages.
- In many cases, you only need to choose the correct `BuildSystem`, set `BuildOption(build)` and `BuildOption(install)` as needed, and declare dependencies correctly.
- If the package has unusual build steps, patches, or test requirements, you may still need to override the default sections manually.
- When writing a spec by hand, it is recommended to check the Perl buildsystem macros first and confirm that the package matches one of these two patterns.

## File list

Perl packages commonly use an automatically generated file list:

```specfile
%files -f %{name}.files
%doc Changes README
```

## Build system macro files

The macro files for the two Perl build systems are:

* `/usr/lib/rpm/macros.d/macros.buildsystem.perlbuild`

* `/usr/lib/rpm/macros.d/macros.buildsystem.perlmaker`
