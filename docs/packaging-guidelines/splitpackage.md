---
id: splitpackage
title: Package Splitting
description: This document outlines the package-splitting policy for openRuyi packages.
slug: /guide/packaging-guidelines/SplitPackage
---

# Package Splitting

This document outlines the package-splitting policy for openRuyi packages.

In general, package splitting applies when a single source package builds two or more RPM Spec–based binary packages. Packagers usually split packages for various reasons, such as separating different types of functionality or documentation.

Packagers must follow the following rules when writing an RPM Spec.

## Split by Major Functional Category

If a package provides multiple distinct types of functionality, packagers must split it into major functional categories rather than by individual modules or plugins. Packagers must name subpackages in the form `%{name}-<feature>`, where `<feature>` is a short functional identifier, such as `client` or `server`.

This helps reduce fragmentation, lower maintenance costs, and make it easier for users to infer the package’s purpose directly from its name.

## Naming

When splitting by functionality, subpackage names should clearly indicate their purpose, and packagers should avoid names based on implementation details. For example, packagers should avoid names such as `%{name}-featureX-moduleY`, which reflect internal code structure rather than user-facing functionality.

Once packagers introduce a subpackage name, they should keep it stable for as long as possible. Packagers should avoid renaming whenever possible. If renaming or split-package migration is unavoidable, packagers must use mechanisms such as `Obsoletes` and `Provides` to ensure a smooth upgrade path.

### Separators

Packagers must separate all components of a package name with hyphens (`-`). Packagers must not use underscores (`_`), plus signs (`+`), periods (`.`), and other characters as separators, except in special cases where they explicitly justify them.

## Development Files

If a package provides files needed for development, packagers should place those files in a dedicated subpackage named `%{name}-devel`.

### Which Library Files Belong in the Development Package

For “system shared libraries” that packagers install under `%{_libdir}` and make visible to the dynamic linker’s search path, packagers should classify files into the following three categories:

1. **The real library file**: belongs to the runtime package; packagers **must not** place it in `-devel`, but should put it into the main package.

Example: `%{_libdir}/libfoo.so.3.2.0`

* **The SONAME symlink** belongs to the runtime package; packagers must not place it in -devel but should put it in the main package.

Example: `%{_libdir}/libfoo.so.3 -> libfoo.so.3.2.0`

The dynamic linker resolves libraries by SONAME, so this symlink should be present as expected, usually exactly as upstream installs it.

* **The unversioned symlink**: belongs to the development package; packagers **must** place it in `-devel`.

Example: `%{_libdir}/libfoo.so -> libfoo.so.3.2.0`

Compilers and linkers only use this file for compilation and linking; the system does not require it at runtime.

### What the Development Package Should Contain

Development files generally include, but are not limited to:

* Headers (`*.h`, usually under `/usr/include`)

* `pkgconfig/*.pc` files and CMake package configuration files

* **The unversioned `libfoo.so`** symlink (see above)

### Handling Plugins and Private `.so` Files

Some software produces unversioned `.so` files that are not system libraries, commonly for plugins or modules. The build process does not install these files in the system dynamic linker search path; instead, the main program loads them at runtime from private directories. Packagers do not need to place such `.so` files in the development subpackage, and should keep them in the main package or the relevant functional subpackage.

In addition, if these “private `.so` files" trigger automatically generated global `Provides` or `Requires` entries from RPM, packagers must filter out those entries to avoid publishing private capabilities as global ones.

## Documentation

If a package includes documentation and the total size of the documentation is large, packagers must place the relevant files in a dedicated subpackage named `%{name}-doc`.

The packager’s judgment defines “large”, and size alone does not limit this definition. It may refer to either the total size of the files or the number of files.

## Recommended Rules

### Runtime Libraries

If a package ships runtime libraries, packagers should not place the related files in a separate subpackage such as `%{name}-libs`. For now, such files may remain in the main package, with an explicit dependency declaration such as:

```specfile
Provides:       %{name}-libs = %{name}-%{version}
```

At the same time, the `%files` section should document, in comments, which files are runtime libraries, to facilitate review and any future migration. For example:

```specfile
%files
# ...
# samba libs
%{_libdir}/libdcerpc-samr.so.*
# ...
# client libs
%{_libdir}/libdcerpc-binding.so.*
# ...
```

Note: for packages shipping shared libraries, it is generally unnecessary to call `ldconfig` explicitly in scriptlets.

#### Exceptions for Splitting Out Runtime Library Packages

The policy recommends a separate runtime library package when any of the following conditions apply:

* Multiple unrelated software packages require the library, i.e., it has become a “platform” or “general-purpose” library.

* Packagers need to deliver security updates or ABI changes for the library independently of the main program, for example, to satisfy operational requirements.

* Use cases require parallel installation of multiple ABIs.

### Subpackage Dependencies

If a subpackage depends on the main package, it must require an exact version match of the main package. This exact version match avoids mismatches between headers or linker files and the runtime libraries:

```specfile
Requires:       %{name}%{?_isa} = %{version}-%{release}
```

In addition, the policy recommends appending `%{?_isa}` to the main package name to make the dependency architecture-specific, thereby avoiding incorrect dependency resolution in multilib environments.

### Language Packs

Packagers must split translation and locale resources into a separate subpackage. See [Language Packs](/docs/guide/packaging-guidelines/LangPacks) for details.
