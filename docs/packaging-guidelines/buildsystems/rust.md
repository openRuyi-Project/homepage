---
id: buildsystemrust
title: Rust
description: This document explains how to use the rust and rustcrates declarative build systems when packaging for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/rust
---

# Rust

This document explains how to use the `rust` and `rustcrates` declarative build systems when packaging for openRuyi.

The `rust` and `rustcrates` build systems are intended for different package types:

* Use **`rust`** for Rust applications, command-line tools, or other packages that need to run Cargo build and test workflows.
* Use **`rustcrates`** for Rust crate provider packages, which install crate source code and generate crate feature subpackage metadata.

For Rust crate provider generation, dependency closure handling, compatibility naming, and TakoPack workflows, please refer to the Rust packaging guide. This document only describes the behavior of the build system macros.

## Dependencies

To use the `rust` or `rustcrates` build system, packages normally need:

```specfile
BuildRequires:  rust
BuildRequires:  rust-rpm-macros
```

If the package depends on other Rust crates, declare them through `crate(...)` capabilities, for example:

```specfile
BuildRequires:  crate(clap-4/default) >= 4.5.0
BuildRequires:  crate(serde-1/default) >= 1.0.0
```

## Choosing the build system

### `rust`

The `rust` build system is used for Rust application packages. A minimal example:

```specfile
BuildSystem:    rust
```

If you need to pass arguments to the Cargo build or test workflow, use `BuildOption(build)` and `BuildOption(check)`:

```specfile
BuildSystem:    rust

BuildOption(build):  --no-default-features --features "foo,bar" -p example-cli
BuildOption(check):  --no-default-features --features "foo,bar" -p example-cli
```

### `rustcrates`

The `rustcrates` build system is used for Rust crate provider packages. A typical example:

```specfile
%global crate_name anes
%global full_version 0.1.6
%global pkgname anes-0.1

Name:           rust-%{pkgname}
Version:        0.1.6
BuildSystem:    rustcrates
```

Where:

* `crate_name` is the crate name from upstream `Cargo.toml`;
* `full_version` is the full upstream crate version;
* `pkgname` is the compatibility name used by the provider package.

These macros normally do not need to be changed manually. If a manual change is necessary, please explain it in the commit and pull request.

For detailed compatibility naming rules, please refer to the Rust packaging guide.

## Prep phase

### `rust`

The prep phase of the `rust` build system performs the default source setup and configures Cargo to use the system registry.

Its core behavior is equivalent to:

```specfile
%autosetup -C -p1 ...
%rust_setup_registry
```

If you need to add a small command before or after the default prep phase, use the section extension mechanism provided by the declarative build system:

```specfile
%prep -p
echo "run before default Rust prep"
```

```specfile
%prep -a
echo "run after default Rust prep"
```

If you fully override `%prep`, make sure to preserve the Cargo system registry configuration. Otherwise, the following Cargo build may not be able to use the crate dependencies provided by the system.

### `rustcrates`

The prep phase of the `rustcrates` build system only performs the default source setup.

If you need to add a small command before or after the default prep phase, you can also use the section extension mechanism provided by the declarative build system.

## Build phase

### `rust`

The build phase of the `rust` build system performs a Rust release build.

Use `BuildOption(build)` to pass arguments to the build phase:

```specfile
BuildOption(build):  --no-default-features --features "foo,bar"
```

These arguments are passed to the Cargo build workflow inside the build system.

### `rustcrates`

The build phase of the `rustcrates` build system does not run Cargo build. Instead, it runs a dynamic specpart generation script and generates the corresponding `%files` fragments for crate provider feature subpackages.

Therefore, do not override this phase.

## Install phase

### `rust`

The `rust` build system currently has no default install action.

If a Rust application needs to install binaries, documentation, or additional files, write or extend `%install` according to the package's actual needs.

For example, to install a built binary:

```specfile
%install
install -Dm0755 target/release/example-cli %{buildroot}%{_bindir}/example-cli
```

### `rustcrates`

The install phase of the `rustcrates` build system installs the crate source code.

Its core behavior is equivalent to:

```specfile
%rust_install_crate
```

This macro installs the current crate source to the system location and generates `.cargo-checksum.json`.

Therefore, Rust crate provider packages usually do not need a hand-written `%install` section. If you really need to add steps before or after the default install logic, use `%install -p` or `%install -a`.

## Check phase

### `rust`

The `rust` build system provides a default test phase. It runs the Cargo test workflow.

Use `BuildOption(check)` to pass arguments to the test phase:

```specfile
BuildOption(check):  --no-default-features --features "foo,bar"
```

If upstream tests require network access, unavailable optional dependencies, a specific runtime environment, or are otherwise unsuitable for the build environment, override or disable `%check` according to the package policy.

### `rustcrates`

The `rustcrates` build system currently has no default test phase.

In other words, crate provider packages using `BuildSystem: rustcrates` do not run Cargo test by default. If additional validation is needed, manually override this phase and write the required test logic.

## Notes

* `rust` is used for Rust application packages. It is not used to generate crate provider packages.
* `rustcrates` is used for Rust crate provider packages. It is not used to build Rust applications.
* If a Python package contains a Rust extension, it should usually still use a Python-related build system, such as `BuildSystem: pyproject`.
* If a package has non-standard build steps, use the generic declarative build system extension mechanisms: `%prep -p/-a`, `%build -p/-a`, `%install -p/-a`, and `%check -p/-a`.

## Build system macro files

Rust-related build system macro files are usually located at:

```text
/usr/lib/rpm/macros.d/macros.buildsystem.rust
/usr/lib/rpm/macros.d/macros.buildsystem.rustcrates
/usr/lib/rpm/macros.d/macros.rust
```

Where:

* `macros.buildsystem.rust` defines the prep, build, install, and check phase behavior for `BuildSystem: rust`;
* `macros.buildsystem.rustcrates` defines the prep, build, install, and check phase behavior for `BuildSystem: rustcrates`;
* `macros.rust` provides lower-level macros related to Rust registry setup, build, test, and crate installation.

If you have questions about the exact behavior of these build systems, you are also welcome to check the source code:

```text
https://github.com/openRuyi-Project/rust-rpm-macros
```
