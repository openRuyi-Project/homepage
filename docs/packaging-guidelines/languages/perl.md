---
id: languagesperl
title: Perl
description: This document describes the packaging guidelines for Perl modules in openRuyi.
slug: /guide/packaging-guidelines/languages/Perl
---

# Perl Packaging Guidelines

This document describes the packaging guidelines for Perl modules in openRuyi.

Most CPAN-style Perl module packages can be generated with `cpan2spec` and then reviewed manually. For ordinary packages, the generated spec should usually use one of the declarative Perl build systems rather than custom `%build`, `%install`, or `%check` sections.

## Package Naming

Name Perl module packages in the form of `perl-CPANDIST`, where `CPANDIST` is the name of the CPAN distribution being packaged.

In rare cases, if a CPAN distribution must be split into smaller subpackages because of dependency relationships or similar reasons, name the additional subpackages `perl-CPANDIST-Something`.

Examples:

* `perl-Archive-Zip` (`Archive-Zip` is the CPAN distribution name).
* `perl-Cache-Cache` (`Cache-Cache` is the CPAN distribution name).

## License Tag

Many Perl module authors declare the same licensing terms as Perl 5. Since Perl 5 itself is distributed under a dual license, this is usually expressed with the following SPDX expression:

```specfile
License:        GPL-1.0-or-later OR Artistic-1.0-Perl
```

Always check the upstream metadata and source files before finalizing the `License` tag.

## URL Tag

For CPAN-based packages, the `URL` tag should use a non-versioned `metacpan.org` URL.

For example, when packaging the `Net::XMPP` module:

```specfile
URL:            https://metacpan.org/release/Net-XMPP
```

## Build Dependencies

Perl module packages commonly need the following build dependencies.

* `perl-macros` — Provides RPM macros required for packaging Perl modules, including standard Perl installation paths such as `%perl_vendorarch` and `%perl_vendorlib`, as well as helper macros such as `%perl_gen_filelist` and `%perl_requires`.

* `perl-rpm-macros` — Provides RPM-side integration macros used by the Perl packaging workflow in openRuyi.

* `perl-rpm-packaging` — Provides additional Perl packaging support used by common Perl module specs in openRuyi.

* `perl-devel` — Provides Perl header files. Add this when building architecture-specific code that links against `libperl.so`, such as XS-based Perl modules.

A typical Perl module package using the declarative build systems starts with:

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
```

You should also add the Perl module dependencies required by the upstream build script.

For example:

```specfile
BuildRequires:  perl(Module::Build)
BuildRequires:  perl(ExtUtils::MakeMaker)
BuildRequires:  perl(Test::More)
```

If your package requires specific Perl modules at build time, use the `perl(MODULE)` form. This rule also applies to core modules that Perl itself ships with, because upstream developers may move modules into or out of the base Perl package over time.

## Requires and Provides Tags

When writing `Requires` and `Provides`, use the `perl(MODULE)` form rather than depending directly on package names.

For example, a package requiring the Perl module `Archive::Zip` should not explicitly require the package name `perl-Archive-Zip`. Instead, it should require:

```specfile
Requires:       perl(Archive::Zip)
```

The corresponding package provides that module dependency.

## Choosing a Build System

Most CPAN-style Perl packages can use one of the two declarative Perl build systems:

* `perlbuild` — for Module::Build-based packages, usually indicated by `Build.PL`.
* `perlmaker` — for ExtUtils::MakeMaker-based packages, usually indicated by `Makefile.PL`.

Examples:

```specfile
BuildSystem:    perlbuild
```

```specfile
BuildSystem:    perlmaker
```

In most cases:

* If the source tree contains `Build.PL`, use `perlbuild`.
* If the source tree contains `Makefile.PL`, use `perlmaker`.

When writing a spec file manually, first check which upstream build script is used, then choose the corresponding build system instead of writing `%build`, `%install`, and `%check` logic from scratch.

For detailed build, install, and check behavior, see the Perl build system document:

```text
/guide/packaging-guidelines/BuildSystems/perl
```

## Minimal Spec Structure

A minimal Perl module spec using the declarative build system usually looks like this:

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
BuildRequires:  perl(Module::Build)

BuildSystem:    perlbuild

%description
...

%files -f %{name}.files
%doc Changes README
```

For packages using `Makefile.PL`, use `perlmaker` and add the appropriate build dependency:

```specfile
BuildRequires:  perl(ExtUtils::MakeMaker)

BuildSystem:    perlmaker
```

In most packages, you do not need to define custom `%build`, `%install`, or `%check` sections. Use `BuildOption(...)` entries only when the upstream build script needs extra arguments.

## File Listings

When using the declarative Perl build systems, the install phase usually runs `%perl_gen_filelist`, so packages can normally use:

```specfile
%files -f %{name}.files
%doc Changes README
```

If you write a manual `%install` section or do not use the generated file list, noarch Perl module packages usually install files under:

```specfile
%{perl_vendorlib}/*
```

Architecture-specific Perl module packages usually install files under:

```specfile
%{perl_vendorarch}/*
```

Prefer the generated file list when using the declarative build systems. Manual file entries are mainly useful when custom install logic is required.

## `.h` Files in Module Packages

If a Perl module includes `.h` files, do not split them into a `-devel` subpackage only because of those header files.

## Automated Import

openRuyi provides `cpan2spec`, a small tool for importing CPAN packages. openRuyi adapted this tool from Steven Pritchard’s `cpanspec` to suit its needs. We gratefully acknowledge his contribution.

For example, to package the Perl module `IO::String`:

```specfile
perl ./cpan2spec IO-String
```

The generated spec should still be reviewed manually. In particular, check:

* Whether the selected `BuildSystem` is correct (`perlbuild` vs `perlmaker`).
* Whether the generated Perl module dependencies are complete.
* Whether the `License` field is correct.
* Whether the resulting `%files` section and documentation entries are reasonable.

In many cases, automatic generation is enough to produce a usable initial spec, but it should be treated as a starting point rather than final packaging output.

If needed, you can also generate a spec without using the declarative Perl build system by adding `-x`:

```specfile
perl ./cpan2spec IO-String -x
```

This is useful for comparison and validation. In practice, you can generate two versions of the spec:

* One with the default generated `BuildSystem`.
* One with `-x`, without using the Perl build system.

Then compare the two results to verify whether the package follows the expected `perlbuild` or `perlmaker` pattern, and whether the declarative build system is appropriate for that package.

The `-x` option is intended only for validation and comparison. In the end, packages are expected to be converted to the declarative `BuildSystem` form, and only such packages are accepted.

## RPM Macros for Perl Modules

This section lists some commonly used RPM macros for Perl module packaging.

### `%perl_sitearch`

This macro points to the architecture-dependent library path for modules installed locally by the administrator or through CPAN, which is `/usr/local/lib/perl5`.

### `%perl_sitelib`

This macro points to the architecture-independent library path for modules installed locally by the administrator or through CPAN, which is `/usr/local/share/perl5`.

### `%perl_vendorarch`

This macro points to the architecture-dependent library path for modules packaged and provided by openRuyi: `/usr/lib/perl5/vendor_perl`.

### `%perl_vendorlib`

This macro points to the architecture-independent library path for modules packaged and provided by openRuyi: `/usr/share/perl5/vendor_perl`.

### `%perl_archlib`

This macro points to the architecture-dependent core library path shipped with Perl itself: `/usr/lib/perl5`.

### `%perl_privlib`

This macro points to the architecture-independent core library path shipped with Perl itself: `/usr/share/perl5`.

### `%perl_make_install`

This macro correctly performs the `make install` step for MakeMaker-based Perl packages.

### `%perl_process_packlist` and `%perl_gen_filelist`

These macros prepare Perl-module-related files for the final packaging stage. If you use `%perl_gen_filelist`, you can normally use `-f %{name}.files` in the `%files` section.

For example:

```specfile
%install
%perl_make_install
%perl_process_packlist
%perl_gen_filelist

%files -f %{name}.files
%doc Changes README
```

However, `%perl_gen_filelist` does not collect files that the build process did not actually install.

When using the declarative Perl build systems, these steps are already part of the default install behavior, so they usually do not need to be written manually unless you override the default install stage.

### `%perl_version`

This macro expands to the version of the current Perl interpreter, for example, `5.43.2`.

### `%perl_requires`

Use this macro when a package needs a dependency on the current Perl version.

### `%__perl`

This macro expands to the name of the `perl` executable installed on the system.
