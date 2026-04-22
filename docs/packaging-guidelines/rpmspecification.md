---
id: rpmspecification
title: openRuyi Packaging Specification
description: This document describes the RPM Packaging Specification for openRuyi.
slug: /guide/packaging-guidelines
---

# openRuyi Packaging Specification

## Foreword

The openRuyi project relies on a vast array of third-party software packages to construct a robust and maintainable distribution. To minimize package maintenance and review overhead and enhance repository consistency and predictability, this document establishes baseline consistency requirements and formatting conventions for openRuyi RPM Spec files (hereafter referred to as "Specs").

This specification focuses on the Spec as the target artifact itself—dictating the expected structure, tags, organization, naming conventions, and macro usage for any Spec submitted to the repository. A Spec adhering to this specification SHOULD be universally understandable, reviewable, and reusable.

This specification applies to all Specs for RPM packages published within the openRuyi repositories, encompassing both single-package and multi-subpackage Specs.

This specification comprises two types of documents:

1. **Main Specification (this document):** Defines the universal structure, mandatory tags, and overarching policies (utilizing "MUST/SHOULD/MUST NOT" constraints).

2. **Supplementary Specifications (sub-documents):** Provide granular constraints and design patterns for specific domains (e.g., naming, versioning, language ecosystems, scriptlets, patches). The main specification outlines essential "general rules," while intricate details are delegated to these supplementary documents.

In the event of a conflict between this document and a supplementary specification, the supplementary specification shall take precedence.

## Terms and Definitions

### Normative Language

This specification employs the following terms to denote requirement levels:

- **MUST**: An absolute requirement; failure to comply means the Spec does not conform to this specification.

- **MUST NOT**: An absolute prohibition; the presence of such elements renders the Spec non-compliant.

- **SHOULD**: A highly recommended practice; expected to be followed unless a clear and justified exception exists.

- **MAY**: An optional practice; adoption depends on the specific needs of the package.

### Terminology

- **Spec**: The RPM package description file (`.spec`) defining the source, build instructions, installation steps, file lists, dependencies, and changelog.

- **Tag**: A key-value header field within a Spec, such as `Name` or `Version`.

- **Section**: A segment in a Spec prefixed with `%`, such as `%prep`, `%build`, `%install`, or `%files`.

- **Subpackage**: Additional binary packages generated from a single Spec (e.g., `-devel` packages or language packs).

- **RemoteAsset**: An external resource accessed via a network URI.

- **BuildSystem**: A declarative tag specifying the build system utilized by the Spec.

## Overall Structural Requirements for Spec Files

### SPDX Copyright and License Declarations

The top of every Spec file MUST feature SPDX-compliant copyright and license declarations in the following format (where `SPDX-FileContributor` is optional):

```specfile
# SPDX-FileCopyrightText: (C) 2026 Institute of Software, Chinese Academy of Sciences (ISCAS)
# SPDX-FileCopyrightText: (C) 2026 openRuyi Project Contributors
# SPDX-FileContributor: Your Name <your.email@example.com>
#
# SPDX-License-Identifier: MulanPSL-2.0
```

### Mandatory Tags and Sections

A Spec MUST include the following tags and sections, and they SHOULD appear in the specified order:

```specfile
Name:
Version:
Release:
Summary:
License:
URL:
VCS:
Source:
BuildSystem:

BuildRequires:
Requires:

%description

%files

%changelog
```

### Minimal Skeleton Example

TODO

### Formatting and readability

1. Specs MUST be strictly UTF-8 encoded.

2. Spec tags SHOULD be horizontally aligned (aligning tag names, colons, and values using spaces) to facilitate code review.

3. `BuildRequires` and `Requires` MUST adhere to a "one dependency per line" format.

4. Descriptive text within a Spec (e.g., `Summary`, comments, and `%description`) SHOULD be written in American English, unless a package-specific supplementary specification dictates otherwise.

## Core Tags

### Name

1. `Name` MUST define the package's base name.

2. Package names SHOULD be entirely lowercase and SHOULD prefer hyphens (`-`) as word separators. Underscores (`_`) are strictly limited to exceptional cases explicitly permitted by supplementary specifications.

3. Package names MUST NOT embed ABI information (e.g., SONAME major versions) or upstream major version numbers (e.g., `libfoo2` is prohibited).

4. If the chosen package name diverges from the widely recognized upstream name, the Spec MAY provide an upstream alias via `Provides`. The necessity of this depends on compatibility requirements.

For a comprehensive naming strategy (e.g., module packages, Perl/Python/font packaging), see the [Naming Guidelines](/docs/guide/packaging-guidelines/Naming) supplementary specification.

### Version

`Version` MUST accurately reflect the upstream release version and SHOULD be normalized according to the following rules:

| **Case**                                         | **Normalization rule**                   | **Example (upstream → Spec)**        |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------ |
| Contains only dots (`.`)                         | Retain the upstream version as-is        | `1.5.7` → `1.5.7`                    |
| Includes pre-release markers `alpha`/`beta`/`rc` | Convert to lowercase and prefix with `~` | `3.5.0-rc1` → `3.5.0~rc1`            |
| Contains hyphen (`-`)                            | Replace `-` with `.`                     | `7.1.1-44` → `7.1.1.44`              |
| Contains underscore (`_`)                        | Replace `_` with `.`                     | `17_6` → `17.6`                      |
| Date-based version with dots                     | Retain the upstream version as-is        | `2025.07` → `2025.07`                |
| VCS commit-hash-based version                    | Format as `0+<vcs><YYYYMMDD>.<hash7>`    | `ee5b7e3…` → `0+git20250808.ee5b7e3` |

For version normalization and snapshot/pre-release rules, see the [Version Numbers](/docs/guide/packaging-guidelines/Versioning) supplementary specification.

### Release

1. `Release` SHOULD utilize the `%autorelease` macro.

2. `Release` MUST NOT hardcode distribution-specific suffixes or override the predefined `%{dist}` macro.

3. For a given `Version`, the revision number defined in the `Release` MUST increment monotonically.

4. Upon any update to the `Version`, the revision number in the `Release` MUST be reset to `1`.

### Epoch (optional)

`Epoch` is traditionally used to resolve ambiguous version sorting. Because it is practically irreversible, the use of `Epoch` SHOULD be strictly avoided. If `Epoch` is absolutely necessary, the Spec MUST include an adjacent comment detailing the rationale and guaranteeing that the subsequent versioning trajectory remains sustainable.

### Summary

1. `Summary` MUST provide a concise overview of the package's primary function.

2. `Summary` SHOULD be written in straightforward English.

3. `Summary` MUST NOT terminate with a period (`.`).

### License

1. `License` MUST utilize standard SPDX License Identifiers or SPDX License Expressions.

2. If multiple licenses apply, the expression MUST connect them using standard SPDX operators (e.g., `AND` / `OR`).

3. If the upstream source includes license text files, the Spec MUST package them using the `%license` directive within `%files`. If a subpackage operates under a different license than the main package, this specific license MUST be explicitly declared within that subpackage's definition.

For detailed licensing rules, see the [Licenses](/docs/guide/packaging-guidelines/Licenses) supplementary specification.

### URL

1. `URL` MUST point to the upstream project's official homepage; if one does not exist, it MAY point to the source code repository.

2. The `URL` tag MUST NOT dynamically construct its value using macros such as `%{name}`.

### VCS

1. `VCS` SHOULD contain the source code repository URL to facilitate locating the upstream source.

2. If the `URL` tag already points to the source repository, `VCS` MAY be omitted.

3. If no publicly accessible source repository exists, the Spec MUST include the following exact comment in place of the `VCS` tag (the `# VCS:` prefix MUST remain intact):

```specfile
# VCS: No VCS link available
```

4. For Git-hosted upstreams, `VCS` SHOULD utilize a cloneable URL format, for instance:

```specfile
VCS:            git:https://git.example.org/project.git
```

### Source

1. `Source` MUST specify the URI for downloading the upstream source archive (or a mathematically equivalent, reproducible archive).

2. If the `URL` tag value can serve as a valid prefix for the source link, `Source` MAY leverage the `%{url}` macro.

3. For any network-fetched `Source`, a `#!RemoteAsset` comment MUST immediately precede the `Source` declaration. If multiple external sources exist, each MUST be individually annotated.

4. For any `Source` fetched using the HTTP or HTTPS protocol, the SHA-256 checksum of the source archive MUST be documented on the line following the `#!RemoteAsset` comment.

5. If the tarball filename is obscured or cannot be algorithmically inferred from the URL, `Source` SHOULD explicitly dictate the desired tarball name via a URL fragment (e.g., `#/name.tar.gz`) to guarantee predictable local file naming.

6. `Source` Indexing Rules:
   1. The base index defaults to `0` and increments by 1 for each subsequent source.
   2. If the Spec specifies only a single-source archive, the index MAY be omitted entirely.

Example:

```specfile
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source0:        https://example.org/example-%{version}.tar.gz
#!RemoteAsset:  sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
Source1:        https://example.org/example-%{version}-additional.tar.gz
```

For details regarding source URLs, see the [Source Packages](/docs/guide/packaging-guidelines/SourceURL) supplementary specification.

### BuildArch (optional)

1. `BuildArch` explicitly defines the target CPU architecture.

2. `BuildArch` SHOULD be positioned between the final `Source` declaration and the `BuildSystem` tag.

3. Setting `BuildArch` to `noarch` signifies that the resulting package is entirely architecture-independent.

### BuildSystem

1. Every Spec MUST declare a `BuildSystem` tag.

2. `BuildSystem` values SHOULD be restricted to the following supported systems (or formally introduced future systems):
   - `autotools`
   - `cmake`
   - `meson`
   - `golang`
   - `golangmodules`

3. If the package utilizes an unsupported build system, or requires no configuration phase whatsoever, `BuildSystem` MAY be left blank. However, the Spec MUST include an adjacent comment explicitly justifying this omission.

When supplementary pre- or post-stage interventions are required, the Spec MAY deploy modifier tags. For example:

- `%prep -a`: Appends custom instructions after the standard `%prep` macro completes.

- `%conf -p`: Prepends custom instructions before the standard `configure` stage initiates.

For system-specific build patterns, see the [Declarative Build Systems](/docs/guide/packaging-guidelines/BuildSystems) supplementary specification.

### Patch and %patchlist (optional)

1. Every patch integrated into the Spec MUST be preceded by at least one comment line that elucidates its purpose or provides a link to the relevant upstream discussion. This requirement is waived only if the patch file's internal headers already contain exhaustive documentation.

2. Patch filenames MUST be prefixed with a four-digit sequence categorizing the patch type:
   - `0001–0999`: Upstream patches backported to the current release.

   - `1000–1999`: Security (CVE) remediations or cross-release backports.

   - `2000–2999`: openRuyi-specific architectural or downstream patches (not intended for upstreaming).

3. If a Spec accumulates more than 3 patches, it SHOULD group them using the `%patchlist` directive, which MUST be positioned directly above the `%description` section.

4. Patch Ordering:
   - If the Spec utilizes `BuildOption`, patches SHOULD be inserted between `BuildSystem` and `BuildOption`.

   - If `BuildOption` is absent, patches SHOULD be located between `BuildSystem` and `BuildRequires`.

For the comprehensive patch strategy, see the [Patches](/docs/guide/packaging-guidelines/Patch) supplementary specification.

### BuildOption (optional)

1. If specific build stages demand custom parameters, the Spec MAY leverage the `BuildOption(<stage>):` tag.

2. Formatting MUST include exactly two spaces separating `BuildOption(<stage>):` from its corresponding argument.

3. Multiple arguments MUST be spread across multiple lines (one argument per line).

4. When utilized, `BuildOption` SHOULD reside between the `BuildSystem` and `BuildRequires` blocks.

### BuildRequires

1. `BuildRequires` MUST list all build-time dependencies exhaustively.

2. These dependencies MUST adhere to the "one dependency per line" formatting rule.

3. For standard C/C++ applications, it is generally unnecessary to explicitly specify a compiler like `gcc`.

4. If a dependency is dynamically resolved via `pkg-config`, `BuildRequires` SHOULD utilize the `pkgconfig(xxx)` syntax rather than hardcoding the `xxx-devel` package name.

5. The Spec MUST guarantee absolute completeness of build dependencies; it MUST NOT omit required packages under the assumption that the build root happens to have them pre-installed.

For strategies on resolving dependencies, see the [Using pkgconfig(xxx)](/docs/guide/packaging-guidelines/PkgConfigBuildRequires) supplementary specification.

### Requires / Provides / Conflicts / Obsoletes (optional)

1. `Requires` dictates runtime dependencies; these MUST also follow the "one dependency per line" rule.

2. During package renaming, logical splitting, or major migrations, the Spec MUST guarantee a seamless upgrade path using Provides and Obsoletes (see the [Package Splitting](/docs/guide/packaging-guidelines/SplitPackage) supplementary specification).

3. If strict incompatibilities exist, `Conflicts` MAY be utilized. However, it SHOULD be applied with extreme caution to prevent creating unresolvable dependency graphs.

## Section Requirements

### %description

The `%description` section MUST provide a comprehensive, informative overview of the package's capabilities.

### %prep / %build / %install / %check (as needed)

1. If custom build or installation procedures are necessary, the Spec MUST declare the relevant sections, or alternatively, represent these actions declaratively via `BuildSystem` extensions.

2. If upstream provides a test suite that can run within the build chroot, the Spec SHOULD invoke it in the `%check` section. If executing tests is technically infeasible, the Spec SHOULD document the technical blockers in a comment.

### %files

The `%files` section MUST inventory all artifacts bundled into the resulting binary package, adhering to the following constraints:

1. Licensing documents MUST be tagged with `%license`; standard documentation SHOULD be tagged with `%doc`.

2. The `%files` manifest MUST NOT duplicate file entries (exemptions apply only to highly specific, documented edge cases).

3. Packages MUST NOT distribute `.la` (libtool archive) artifacts. If the build process generates them, the Spec MUST forcefully remove them during the `%install` phase.

4. Internationalization (i18n) and localization (l10n) assets MUST be processed using `%find_lang` within the `%install` section; they MUST NOT be captured via brute-force globbing (e.g., `%{_datadir}/locale/*`) within `%files`.

For recommended practices regarding language localization, see the [Language Packs](/docs/guide/packaging-guidelines/LangPacks) supplementary specification.

### %changelog

The `%changelog` section MUST rely entirely on the `%autochangelog` macro; manual or handwritten changelog entries MUST NOT be used.

## Subpackaging and Splitting Rules

When a single source archive yields multiple discrete binary packages, the Spec MUST adhere to these foundational principles:

1. **Logical Functional Splitting:** If a monolithic package bundles disparate functionalities, it MUST be structurally divided along major functional boundaries. It MUST NOT be hyper-fragmented into microscopic modules or plugins. Subpackage nomenclature MUST adopt the `%{name}-<feature>` pattern.

2. **Segregation of Development Headers:** Any C/C++ headers or development-centric files MUST be strictly isolated within a `%{name}-devel` subpackage.

3. **Documentation Offloading:** If bundled documentation is excessively large, it MUST be shipped in a dedicated `%{name}-doc` subpackage.

4. **Shared Library Ownership:** The distribution of shared objects (`.so`) and their associated symlinks MUST strictly comply with the guidelines defined in the [Package Splitting](/docs/guide/packaging-guidelines/SplitPackage) supplementary specification (specifically regarding runtime libraries, SONAME symlinks, and unversioned symlinks).

5. **Upgrade Continuity:** If structural splitting alters the primary package name, a transparent upgrade path MUST be engineered via `Obsoletes` and `Provides`.

For further nuances, refer to the [Package Splitting](/docs/guide/packaging-guidelines/SplitPackage) and [Naming Guidelines](/docs/guide/packaging-guidelines/Naming) supplementary specifications.

## Standard Path and Common Macros

### Standard Path Macros

When referencing standard filesystem hierarchies within a Spec, native RPM path macros SHOULD be prioritized. Essential path macros include:

| Macro             | Typical expansion         | Meaning                                                                 |
| ----------------- | ------------------------- | ----------------------------------------------------------------------- |
| `%{_lib}`         | `lib64`                   | Architecture-dependent library directory name (example)                 |
| `%{_bindir}`      | `%{_exec_prefix}/bin`     | Standard executable directory (typically `/usr/bin`)                    |
| `%{_docdir}`      | `%{_datadir}/doc`         | Documentation directory (typically `/usr/share/doc`)                    |
| `%{_libdir}`      | `%{_exec_prefix}/%{_lib}` | Primary library directory (typically `/usr/%{_lib}`)                    |
| `%{_libexecdir}`  | `%{_exec_prefix}/libexec` | Executable directory for internal binaries (typically `/usr/libexec`)   |
| `%{_datadir}`     | `%{_datarootdir}`         | Architecture-independent shared data directory (typically `/usr/share`) |
| `%{_mandir}`      | `%{_datarootdir}/man`     | Manual pages directory (typically `/usr/share/man`)                     |
| `%{_prefix}`      | `/usr`                    | Top-level installation prefix                                           |
| `%{_sysconfdir}`  | `/etc`                    | System configuration directory                                          |
| `%{_exec_prefix}` | `%{_prefix}`              | Executable path prefix                                                  |
| `%{_includedir}`  | `%{_prefix}/include`      | C/C++ header directory (typically `/usr/include`)                       |

### Bash Integration macros

| Macro                     | Meaning                                   | Notes                                          |
| ------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `%{bash_completions_dir}` | `%{_datadir}/bash-completion/completions` | Standard directory for Bash completion scripts |

### Python Integration macros

| Macro                | Meaning                                                            | Notes |
| -------------------- | ------------------------------------------------------------------ | ----- |
| `%{__python}`        | Path to the default Python interpreter                             |       |
| `%{python_sitelib}`  | Installation path for architecture-independent Python pure modules |       |
| `%{python_sitearch}` | Installation path for architecture-dependent Python extensions     |       |

### Perl Integration macros

| Macro                | Meaning                                                            | Notes |
| -------------------- | ------------------------------------------------------------------ | ----- |
| `%{__perl}`          | Path to the default Perl interpreter                               |       |
| `%{perl_vendorlib}`  | Installation path for architecture-independent vendor Perl modules |       |
| `%{perl_vendorarch}` | Installation path for architecture-dependent vendor Perl modules   |       |

## RPM Scriptlets

When a Spec necessitates operational scriptlets (e.g., `%pre` `%post` `%preun` `%postun` `%pretrans` `%posttrans`):

1. Scriptlets MUST be strictly idempotent and accurately differentiate between initial installation, upgrade, and uninstallation events (typically evaluated via the transaction argument, e.g., `$1`).

2. Scriptlets MUST guarantee a zero exit code (success); they MUST NOT trigger a transaction rollback due to the failure of trivial, non-critical operations.

3. If a scriptlet merely executes a standalone binary, it SHOULD utilise the `-p` parameter to bypass unnecessary shell invocation overhead.

For comprehensive operational rules and templates, see the [Scripts](/docs/guide/packaging-guidelines/Scriptlets) supplementary specification.

## Conditional Builds

1. When designing optional compile-time feature toggles, the Spec SHOULD implement them via `%bcond`.

2. The Spec SHOULD strictly avoid the legacy `%bcond_with` and `%bcond_without` macros.

Example:

```specfile
%bcond bootstrap 0
%bcond bootstrap 1

%if %{with bootstrap}
# ...
%endif

%if %{without bootstrap}
# ...
%endif
```

## References

This specification builds upon and interacts with the following external standards:

1. Official RPM Packaging Guidelines, Spec syntax, and Macro Documentation

2. The SPDX License List and SPDX License Expression definitions
