---
id: naming
title: Naming Guidelines
description: This document describes the package-naming policy used by openRuyi.
slug: /guide/packaging-guidelines/Naming
---

# Naming Guidelines

This document describes the package-naming policy used by openRuyi.

## General Naming Rules

In general, package names should follow the upstream name whenever possible.

You should use lowercase for package names, and prefer hyphens (`-`) over underscores (`_`). You may find useful clues in the upstream source tarball name, the software source project name, and the names that other distributions or packagers historically used for the package.

At the same time, always check whether the package type you are building already has its own specific naming rules. Such specific rules apply, for example, to Perl packages and font packages.

During packaging, do not encode the ABI (SONAME major) or the upstream major version into the package name. For example, if the upstream version is `foo v2.3.4`, do not name the package `libfoo` or `libfoo2`.

### Separators

When naming packages, you must use hyphens (-) as separators between name components, with only a few exceptions:

* Packages whose upstream names naturally contain underscores, such as `nss_wrapper`.

* Compatibility packages whose base package name ends with a digit.

* `httpd`, `pam`, and `SDL` extension packages.

### Provides

If the final package name differs from the upstream name, you may add the original name through the `Provides` tag, although this is not mandatory.

### Name Conflicts

openRuyi strictly prohibits conflicting package names, including names that differ only by letter case.

## Multiple Packages with the Same Name

For various reasons, openRuyi may sometimes provide multiple versions of the same package. In such cases, the package names must clearly reflect that distinction.

One package should use the base name (without additional qualifiers). In contrast, all other derived packages must include that base name followed by a hyphen (`-`) and a descriptive suffix (for example, `stable`) or a version number (for example, `21`).

However, openRuyi exempts existing packages whose names have already become established through common use, such as `gcc15` and `llvm23`.

## Letter Case

Although openRuyi does not strictly require case sensitivity, you should use capitalization only when necessary.

If the upstream maintainer refers to the application as `RapidCopy`, then you should use `RapidCopy` as the package name rather than `rapidcopy`. However, if upstream has no clear preference regarding capitalization, you should use lowercase naming by default.

Perl modules are an exception: you must keep CPAN groups and types capitalized in the name.

## Documentation

You should place large documentation files in a subpackage. You must name that subpackage using the format `%{name}-doc`.

The packager’s judgment determines what qualifies as “large”; file size alone does not determine this. “Large” may refer either to the size of the files or to their quantity.

## Font Packages

You must name packages that contain fonts in lowercase using the format `fonts-[fontname]`.

## Module Packages

If a package extends the functionality of an existing openRuyi package, but cannot function on its own, such a subpackage should use the parent package name as a prefix. The format is: `%{parent}-%{child}`

Examples:

* `php-imagemagick`

* `python-setuptools`

### pam and SDL

`pam` and `SDL` plugins use the `%{parent}_%{child}` format, with an underscore (`_`) as the separator.

### Perl Modules

You should name Perl modules `perl-CPANDIST`, where `CPANDIST` is the name of the CPAN distribution that you are packaging.

If you need to split a CPAN distribution into smaller subpackages, you should name the additional subpackages `perl-CPANDIST-Something`.

### Python Modules

Source packages that primarily contain Python libraries must use the `python-` prefix.
