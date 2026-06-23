---
id: languagesrust
title: Rust
description: This document describes the packaging guidelines for Rustmodules in openRuyi.
slug: /guide/packaging-guidelines/languages/Rust
---

# Rust Packaging Guide

This document describes the Rust packaging guidelines for openRuyi. For the related build systems, see [Rust](/docs/guide/packaging-guidelines/BuildSystems/rust).

Rust packages in openRuyi usually fall into the following categories:

* Rust crate provider packages.
* Rust applications or command-line tools.
* Packages in other languages that contain Rust extensions, such as Python/Rust extension packages.

Different package types should use different build systems and dependency declarations.

## Naming

Rust crate provider packages must use the `rust-` prefix.

The package name of a crate provider package is usually derived from the crate compatibility name. For example:

```specfile
%global crate_name serde
%global full_version 1.0.228
%global pkgname serde-1

Name:           rust-serde-1
Version:        1.0.228
```

Where:

* `crate_name` is the original crate name from upstream `Cargo.toml`.
* `full_version` is the full upstream crate version.
* `pkgname` is the compatibility name used by openRuyi for package names, directory names, and `crate(...)` capabilities.

Underscores in crate names are usually normalized to hyphens in RPM package names and `crate(...)` capabilities. For example, when the upstream crate name is `os_str_bytes`, the provider package name usually uses `os-str-bytes`.

The crate provider directory name, spec file name, and `Name` should be consistent. For example:

```text
SPECS/rust-serde-1/rust-serde-1.spec
```

corresponds to:

```specfile
%global pkgname serde-1
Name:           rust-serde-1
```

If `pkgname` must be changed, the directory name, spec file name, and related `crate(...)` dependency declarations should also be updated accordingly. The reason should be explained in the commit and PR.

## Compatibility Names

Rust crate providers use compatibility names so that different incompatible versions can coexist in the repository.

The usual rules are:

* Versions `1.x.y` and later are grouped by major version.
* Versions `0.y.z` where `y > 0` are grouped by minor version.
* Versions `0.0.z` are grouped by the full patch version.

For example:

```text
serde 1.0.228       -> serde-1
tokenizers 0.22.2   -> tokenizers-0.22
foo 0.0.7           -> foo-0.0.7
```

Unless the crate has a clear compatibility issue, do not introduce unnecessarily fine-grained compatibility names, such as `serde-1.0.15`.

## Build Systems

Rust crate provider packages should use:

```specfile
BuildSystem:    rustcrates
```

Rust applications, command-line tools, or other packages that need to run Cargo build/test workflows should use:

```specfile
BuildSystem:    rust
```

Python packages with Rust extensions should usually continue to use the Python-related build system, for example:

```specfile
BuildSystem:    pyproject
```

## Dependencies

Rust crate dependencies should be declared through `crate(...)` capabilities. For example:

```specfile
BuildRequires:  crate(serde-1/default) >= 1.0.0
BuildRequires:  crate(clap-4/derive) >= 4.5.0
```

If a feature is required, the corresponding feature capability should be declared explicitly.

Do not use ordinary RPM package names instead of `crate(...)` capabilities to declare Rust crate dependencies. `crate(...)` capabilities are the main interface for dependency resolution between Rust ecosystem packages.

When modifying a crate or package, maintainers should confirm that:

* Newly added or modified crate providers follow openRuyi naming, source, patch, and dependency rules.
* The change does not break the build of existing Rust packages in the repository.
* The crate providers already available in the repository can be used to analyze dependencies based on the `Cargo.toml` of software that builds with crate packages.
* The impact of newly added providers, upgraded providers, and existing providers has been checked.

## Rust Crate Provider Packages

Rust crate provider packages install crate source code into the system and provide `crate(...)` capabilities for other Rust packages.

Crate provider packages should be generated with TakoPack. The generated result should be submitted as the initial packaging content for review. Maintainers need to check that the generated result follows openRuyi naming, source, dependency, and patch rules.

A typical crate provider package looks like this:

```specfile
%global crate_name anes
%global full_version 0.1.6
%global pkgname anes-0.1

Name:           rust-anes-0.1
Version:        0.1.6
Release:        %autorelease
Summary:        Benchmarking helper library
License:        MIT OR Apache-2.0
URL:            https://crates.io/crates/%{crate_name}
#!RemoteAsset:  sha256:...
Source:         https://static.crates.io/crates/%{crate_name}/%{full_version}/download#/%{name}-%{version}.tar.gz
BuildArch:      noarch
BuildSystem:    rustcrates

BuildRequires:  rust-rpm-macros
```

Source-related fields such as `Source`, `#!RemoteAsset`, and `Patch` should follow the actual generated result and repository rules. Do not break the consistency between source files, checksums, and spec declarations when making manual changes.

Crate provider packages usually do not need hand-written `%build`, `%install`, or `%check` sections. These behaviors are handled by the `rustcrates` build system.

### `Cargo.toml` in the Provider Directory

When TakoPack generates a crate provider package, it keeps a `Cargo.toml` file in the provider directory. For example:

```text
SPECS/rust-serde-1/Cargo.toml
SPECS/rust-serde-1/rust-serde-1.spec
```

This `Cargo.toml` is a copy of the crate metadata used for packaging. It records the crate name, version, dependencies, and feature information. It is also an important basis for generating `BuildRequires: crate(...)`, feature subpackages, and related dependency relationships.

For providers generated from crates.io, this file usually comes from the upstream crate archive. For providers generated from a local `Cargo.toml`, it comes from the local file specified in the command.

If upstream `Cargo.toml` needs to be patched during packaging, make sure the following remain consistent:

* `Cargo.toml` in the provider directory.
* `Cargo.toml` in the source package after patches are applied.
* `Patch` declarations in the spec file.
* `Requires` and `Provides` generated from crate metadata.

Do not only modify generated dependency declarations in the spec file without updating the corresponding `Cargo.toml`.

### Generating a Provider from crates.io

For crates published on crates.io, TakoPack can be used to generate the initial provider package. For example:

```sh
takopack cargo pkg cbindgen 0.29.2
```

The version may also be omitted, in which case the tool uses the currently resolved version:

```sh
takopack cargo pkg pem
```

The generated result is usually placed in the current directory, for example:

```text
rust-cbindgen-0.29/
rust-pem-3/
```

After generation, check that the directory name, spec file name, `pkgname`, source URL, checksum, and dependency declarations follow the packaging rules.

### Generating a Provider from a Local `Cargo.toml`

If the crate's `Cargo.toml` has already been patched, or if the provider needs to be generated from local source metadata, use the local `Cargo.toml` as input. For example:

```sh
takopack cargo localpkg value-bag-1.12.0/Cargo.toml
```

An output directory can also be specified:

```sh
takopack cargo localpkg value-bag-1.12.0/Cargo.toml -o outdir
```

This is commonly used when:

* Dependency constraints have been relaxed or corrected.
* Git/path dependencies have been changed into a form suitable for openRuyi packaging.

After generating a provider from a local `Cargo.toml`, make sure the `Cargo.toml` in the provider directory stays in sync with the patched `Cargo.toml` in the packaged source.

## Rust Application Packages

Rust application packages usually use:

```specfile
BuildSystem:    rust
```

Rust application packages also need to declare the Rust build environment and the crate dependencies required by the actual build. For example:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
BuildRequires:  crate(clap-4/default) >= 4.5.0
BuildRequires:  crate(clap-4/derive) >= 4.5.0
```

If the application needs to install binaries, explicitly install the build artifacts in `%install`. For example:

```specfile
%install
install -Dm0755 target/release/example-cli %{buildroot}%{_bindir}/example-cli
```

For Rust applications that use git dependencies or in-tree path dependencies, `Cargo.toml` is usually patched so that dependencies point to source locations that actually exist during packaging, or to crate providers already available in the system. After modification, make sure the `Cargo.toml` shipped with the spec, the `Cargo.toml` actually used in the source tree, and the patch content are consistent.

If the Rust application itself is also published on crates.io, TakoPack can be used to generate an initial provider directory first, and then the spec file can be adjusted according to the needs of the application package. In this case, copy the generated `Cargo.toml` into the actual package directory and make sure it stays consistent with the `Cargo.toml` used by the final packaged source.

If the Rust application does not come from crates.io, copy the main `Cargo.toml` from the unpacked upstream source into the package directory as the basis for dependency analysis and review.

## Python/Rust Extension Packages

If a Python package contains a Rust extension, it should usually continue to use a Python-related build system, for example:

```specfile
BuildSystem:    pyproject
```

Declare both Python and Rust build dependencies. For example:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
BuildRequires:  python3dist(maturin)
BuildRequires:  crate(pyo3-0.27/default) >= 0.27.0
BuildRequires:  crate(pyo3-0.27/extension-module) >= 0.27.0
```

For this kind of package, `%prep` usually needs to configure the Rust system registry after the Python build system's default preparation logic, and remove upstream `Cargo.lock` when appropriate. For example:

```specfile
%prep -a
%rust_setup_registry
rm -f Cargo.lock
```

If the Rust source is located in a subdirectory, handle the corresponding `Cargo.lock` in the correct directory. For example:

```specfile
%prep -a
%rust_setup_registry
rm -f rust/Cargo.lock
```

Python/Rust extension packages usually need to copy the main `Cargo.toml` from the unpacked upstream source into the package directory as the basis for dependency analysis and review.

## Patches

Some crate dependency constraints cannot be directly mapped to openRuyi crate provider rules. Common cases include:

* Dependency ranges crossing multiple crate compatibility keys.
* Dependencies on prerelease versions.
* Overly strict version pinning.
* Dependencies on git repositories.
* Dependencies on internal workspace path crates.

In these cases, prefer patching upstream `Cargo.toml`, and then regenerate or update the provider based on the patched `Cargo.toml`.

It is forbidden to only modify generated `Requires` or `Provides` to work around the problem. `Requires` and `Provides` should be regenerated from the corrected crate metadata, otherwise the spec file may become inconsistent with the actual source.

Patches should follow the repository's general patching rules. Make sure `Patch`, source content, `Cargo.toml` in the provider directory, and the generated provider directory remain consistent.

## Practical Recommendations

When packaging Rust software, follow these principles:

* Use `BuildSystem: rustcrates` for crate providers.
* Use `BuildSystem: rust` for Rust applications.
* Usually keep `BuildSystem: pyproject` for Python/Rust extensions.
* Generate Rust crate providers with TakoPack.
* Express Rust crate dependencies with `BuildRequires: crate(...)`.
* Manually review generated providers.
* When dependencies are unreasonable, patch `Cargo.toml` first and regenerate the provider.
* Do not directly modify generated `Requires` or `Provides` as a substitute for metadata fixes.
* When modifying a crate or package, confirm that the change does not break the build of existing Rust packages in the repository.
* Check the impact of newly added providers, upgraded providers, and existing packages.

## Credits

The automatic generation tool for Rust crate providers is adapted from `debcargo` by the Debian Rust Packaging Team to meet openRuyi packaging needs. We thank them for their work.
