---
id: languagesrust
title: Rust
description: This document describes the packaging guidelines for Rustmodules in openRuyi.
slug: /guide/packaging-guidelines/languages/Rust
---

# Rust Packaging Guidelines

This document describes how to use **TakoPack** for Rust crate packaging in openRuyi. For the relevant build system, please refer to [Rust](/docs/guide/packaging-guidelines/BuildSystems/rust).

In general, TakoPack is used to:

- generate an initial spec and package directory for a single crate
- prepare crate dependencies for a Rust project
- help bootstrap Rust packaging before manual review and adjustment

In most cases, the generated result is only a starting point. For crates with strict version constraints, patched `Cargo.toml`, git dependencies, workspace layouts, or complex feature relationships, manual fixes are still required.

------

## Packaging a Single Crate

### Online packaging

Example:

```sh
cargo pkg cbindgen 0.29.2
Spec file: rust-cbindgen-0.29/rust-cbindgen.spec
```

This command fetches the specified crate and version from crates.io and generates the corresponding packaging directory in the current working directory.

It also saves the original `Cargo.toml` to:

```text
~/cargo_back/origin
```

The backup name is usually:

```text
crate_name-full_version
```

with `_` normalized to `-`.

This mode is suitable for ordinary crates hosted on crates.io.

------

### Packaging from a local `Cargo.toml`

Example:

```sh
cargo localpkg value-bag-1.12.0/Cargo.toml
cargo localpkg value-bag-1.12.0/Cargo.toml -o dir
```

where `-o dir` is optional and specifies the output directory.

Example output:

```text
Spec file: 1/rust-value-bag-1.0/rust-value-bag.spec
```

This mode is typically used when the local `Cargo.toml` has already been modified, for example after applying a patch or relaxing dependency constraints.

Note that in this mode, the source archive hash in the generated spec usually needs to be filled in manually after downloading the crate and calculating the checksum yourself.

------

## Preparing Multiple Crates

### `track` subcommand

The recommended way to prepare a complete set of dependencies is the `track` subcommand.

It works by analyzing `Cargo.lock`, which is generally more reliable than deriving dependencies from `cargo tree`.

------

### Tracking dependencies from a local `Cargo.lock`

Example:

```sh
cargo run -- cargo track -f sieve/Cargo.lock -o 2022
```

Example output:

```text
[18/19] Processing: unicode-ident 1.0.22
    Updating crates.io index
  ✓ Successfully packaged unicode-ident 1.0.22
[19/19] Processing: windows-sys 0.61.2
    Updating crates.io index
  ✓ Successfully packaged windows-sys 0.61.2

============================================================
Batch Processing Summary
============================================================
Total packages processed: 19
Successfully packaged:    19
Failed:                   0

Output directory: 2022
============================================================
```

This mode is suitable when you already have a local project and want to package the full set of locked dependencies as accurately as possible.

------

### Tracking dependencies from a crate name and version

Example:

```sh
cargo run -- cargo track bindgen 0.29
```

This mode also relies on lock-style dependency resolution, but it may try to refresh dependency versions. In most cases this works well, but crates with unusually strict dependency requirements may still need manual adjustment.

------

### Local dependency record

While processing dependencies, `track` also records already packaged crate names and versions in a local database.

Example:

```sh
ls ~/.config/takopack
crate_db.txt
```

This helps reduce repeated work, but it is not a full dependency management system. Optional dependencies, feature relationships, and version corner cases may still require manual review.

------

## Common Limitations

### Git dependencies

Not all Rust dependencies come from crates.io. Some packages depend on git repositories.

If the git repository structure matches a single crate, you can often:

1. clone the repository manually
2. use `localpkg` on its `Cargo.toml`
3. adjust the source hash
4. replace the source URL in the generated spec with the appropriate git archive URL

If the repository uses a workspace layout, packaging becomes much more complicated. In that case you may need to patch `Cargo.toml`, package the whole repository as a source, and rewrite workspace dependency versions manually.

------

### Rust applications are harder than library crates

TakoPack works best for packaging individual crates.

For full Rust applications, dependency handling is much harder:

- `Cargo.lock` may produce a very large dependency list
- some listed dependencies are not actually needed for the final build
- feature relationships are not always easy to infer automatically
- strict version constraints often only become visible during the real application build

A common workflow is to use `localpkg` to generate an initial spec, then manually refine the dependency list and packaging structure.

------

### Strict dependency constraints

Some crates do not follow Rust version compatibility rules very well, or they pin dependency versions too tightly.

In those cases, packaging may require:

- patching `Cargo.toml`
- relaxing dependency version ranges
- regenerating the spec from the patched local source

This is one of the most common reasons to use `localpkg`.

------

### Optional dependencies and features

Even when dependency data is available, optional dependencies and feature combinations can still cause trouble.

A crate may appear compatible at the API level, but later fail when a previously unused optional dependency is enabled by another package. In such cases, missing or outdated dependencies are often discovered only during the actual build.

When this happens, additional crates may need to be packaged separately afterward.

------

## Practical Recommendations

In practice, the commands are usually used like this:

- use **`pkg`** for a normal single crate from crates.io
- use **`localpkg`** for a crate with a patched or manually edited `Cargo.toml`
- use **`track`** when you need to prepare a full dependency set from `Cargo.lock`

For simple crates, TakoPack is often enough to generate a good initial spec. For applications, workspaces, git dependencies, strict version constraints, and complicated feature sets, expect to do manual review and adjustment.

------

## Origin

This tool is adapted from Debian Rust Packaging Team’s `debcargo` to meet openRuyi’s packaging needs. We gratefully acknowledge their work.
