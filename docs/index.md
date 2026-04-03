---
sidebar_position: 1
---

# openRuyi Docs

Welcome to the openRuyi Documentation Center. This repository provides developers and package maintainers with comprehensive technical guidance to ensure package quality and consistency.

## 🚀 Getting Started

If you are contributing to openRuyi development or packaging for the first time, please read the following guides first:

* openRuyi Developer Contribution Guide: Learn how to submit code and participate in community contributions.

* [Quick Start](/docs/guide/quick-start-for-developers): Get your first package up and running in just a few minutes.

* [Pre-commit Usage Guide](/docs/guide/pre-commit-usage-guide): Ensure that your package complies with submission requirements.

## 📜 Packaging Style Guide

These are the core principles of packaging. All packages should follow the [openRuyi Packaging Specification](/docs/guide/packaging-guidelines). You should also refer to the more detailed guidelines below when constructing packages.

### Metadata

* [Naming Guidelines](/docs/guide/packaging-guidelines/Naming) & [Version Numbers](/docs/guide/packaging-guidelines/Versioning): Establish clear and unique package names and versions.

* [Licenses](/docs/guide/packaging-guidelines/Licenses) & [SPDX License Expressions](/governance/legal/spdx): Review detailed guidance on the licensing mechanism.

* [Macro Tags](/docs/guide/packaging-guidelines/RPMMacros): Standardize variable definitions in RPM spec files.

### Build & Files

* [Source Packages](/docs/guide/packaging-guidelines/SourceURL): Follow the guidelines for declaring upstream source code in RPM spec files.

* [Patches](/docs/guide/packaging-guidelines/Patch): Learn how to manage and apply patches.

* [Scripts](/docs/guide/packaging-guidelines/Scriptlets): Regulate the behavior of installation and removal scriptlets such as `%pre` and `%post`.

* [Font Packaging Guidelines](/docs/guide/packaging-guidelines/FontPackagingGuidelines): Guidelines for font package naming, licensing, installation paths, and subpackage splitting.

### Package Structure and Other Features

* [Package Splitting](/docs/guide/packaging-guidelines/SplitPackage): Properly divide `-devel` packages, runtime libraries, and related components.

* [Language Packs](/docs/guide/packaging-guidelines/LangPacks): Apply placement conventions to enable multilingual support.

## 🧪 Quality Gates and Review

Learn about the automated checks and manual review policies that packages must pass before the review team merges them.

* [Package Review Guidelines](/docs/guide/review/ReviewGuidelines): Understand the CI/CD gate checks, acceptance criteria, and common reasons for rejection in detail.

* [Using pkgconfig(xxx)](/docs/guide/packaging-guidelines/PkgConfigBuildRequires): Standardize dependency tracking and avoid hard-coded dependencies.

## 📚 Language-Specific Guidelines and Build Systems

Review practical recommendations for specific programming languages and toolchains.

| Category | Detailed Guide                                                                              | Declarative Build System                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| C/C++    |                                                                                             | [autotools](/docs/guide/packaging-guidelines/BuildSystems/autotools) / [meson](/docs/guide/packaging-guidelines/BuildSystems/meson) |
| Python   | [Python Packaging Guidelines](/docs/guide/packaging-guidelines/languages/Python) |                                                                                                                                                   |
| Perl     | [Perl Packaging Guidelines](/docs/guide/packaging-guidelines/languages/Perl)   |                                                                                                                                                   |
| Golang   | [Golang Packaging Guidelines](/docs/guide/packaging-guidelines/languages/Golang) | [Golang](/docs/guide/packaging-guidelines/BuildSystems/golang)                                                                            |

## 🤝 Contribute

If you find anything missing in these guidelines or believe the community needs to update a specific section, please open an Issue and let us know.
