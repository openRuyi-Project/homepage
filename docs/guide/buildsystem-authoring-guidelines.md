---
id: buildsystem-authoring-guidelines
title: BuildSystem Authoring Guidelines
description: This document describes BuildSystem authoring guidelines for openRuyi.
slug: /guide/buildsystem-authoring-guidelines
---

# BuildSystem Authoring Guidelines

openRuyi recommends using the declarative build system mechanism for packaging. Declarative BuildSystems reduce duplicated boilerplate code in Spec files and improve consistency across package build workflows. In most cases, packagers only need to declare `BuildSystem:` in the Spec file and adjust the build with `BuildOption(<stage>):` or `%<stage> -p` / `%<stage> -a` when needed.

Maintainers who add, maintain, or review BuildSystem macros should use these guidelines. The guidelines do not explain how to use an existing BuildSystem in an individual Spec file. To learn how to use an existing BuildSystem, read \[Declarative Build Systems] and the corresponding BuildSystem subdocuments first.

## Scope

Maintainers may consider adding or improving a BuildSystem when a class of packages meets the following conditions:

* Multiple packages use the same or highly similar build workflow.

* The build workflow can map cleanly to stable `%prep`, `%conf`, `%build`, `%install`, and `%check` stages.

* `BuildOption(<stage>):`, macro variables, or prepend/append scriptlets can express most differences between packages.

* The default behavior can represent the openRuyi recommended build workflow for that class of packages.

Maintainers should not add a generic BuildSystem to a workflow that serves only a single package or requires extensive package-specific logic. In those cases, maintainers should handle the special logic in the corresponding Spec file.

## Design Principles

### Reduce boilerplate code

BuildSystems should encapsulate recurring build workflows, such as configuration, compilation, installation, and basic tests. Maintainers should not leave macro calls that every package needs to repeat in individual Spec files.

For example, when a class of packages commonly uses the following workflow:

```specfile
%build
%foo_configure
%foo_build

%install
%foo_install

%check
%foo_check
```

Maintainers may encapsulate these steps in the corresponding BuildSystem. Packagers can then declare only the following line in the Spec file:

```specfile
BuildSystem:  foo
```

### Preserve overridability

BuildSystems should not take away a packager's ability to handle special cases. Maintainers must preserve clear extension interfaces for common differences:

* Use `BuildOption(<stage>):` to pass stage-specific parameters.

* Use `%<stage> -p` to insert logic before the automatically generated script.

* Use `%<stage> -a` to append logic after the automatically generated script.

* Allow the Spec file to explicitly override a stage that does not apply, and require a comment that explains the reason.

For `BuildOption(<stage>):`, write related explanations above the corresponding `BuildOption` line, not at the end of the parameter line. Otherwise, the trailing comment becomes part of the option string and gets appended to the final command.

### Define default behavior

BuildSystem default behavior must reflect openRuyi packaging conventions. When maintainers design default parameters, they should prioritize the following goals:

* Installation paths follow RPM path macro conventions.

* Build output remains detailed enough for troubleshooting.

* The upstream build system does not strip binaries before RPM processing.

* Shared libraries are built by default unless the ecosystem does not support that model.

* Default test behavior remains safe, stable, and reproducible.

* The BuildSystem does not rely on packages that only happen to exist in the build environment.

A BuildSystem must not contain special logic for one specific package.

## Naming Rules

BuildSystem names must use lowercase letters, digits, and hyphens. The name should match the upstream ecosystem or the primary build tool name. For example:

```specfile
BuildSystem:  cmake
BuildSystem:  pyproject
BuildSystem:  golangmodules
```

Avoid names such as:

```specfile
BuildSystem:  Cmake
BuildSystem:  PyProject
BuildSystem:  Golangmodules
```

## Stage Layout

BuildSystems should follow the RPM build process when defining stages. When maintainers add a new BuildSystem, they must decide whether the BuildSystem takes over the following stages:

| Stage                     | Purpose                                                    | Recommendation                                                            |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `%prep`                   | Unpack sources, apply patches, and prepare the source tree | Usually provide                                                           |
| `%generate_buildrequires` | Generate build-time dependencies automatically             | Provide when the build ecosystem supports automatic dependency generation |
| `%conf`                   | Configure the build directory and generate build files     | Provide when the build system needs a configuration stage                 |
| `%build`                  | Compile source code                                        | Usually provide                                                           |
| `%install`                | Install files into `%{buildroot}`                          | Usually provide                                                           |
| `%check`                  | Run tests or basic checks                                  | Should provide, unless the ecosystem cannot support default tests         |

The RPM declarative BuildSystem mechanism supports corresponding `%buildsystem_<name>_<stage>` macros for the stages above. `%conf`, `%build`, and `%install` are the core stages that a BuildSystem must provide. `%prep`, `%generate_buildrequires`, `%check`, and `%clean` may be provided when needed.

## Stage Parameter Passing Conventions

`BuildOption(<stage>):` passes extra parameters to the specified build stage. BuildSystem maintainers must ensure that the macro for the corresponding stage can receive these parameters and pass them to the appropriate underlying command.

For example, for a BuildSystem named `foo`, `%buildsystem_foo_conf()` should receive parameters passed through `BuildOption(conf):`, and `%buildsystem_foo_build()` should receive parameters passed through `BuildOption(build):`. The BuildSystem implementation decides whether these parameters eventually go to `configure`, `cmake`, `make`, `pytest`, or another command.

Therefore, each stage macro should accept parameters and use them in the appropriate position. For example:

```specfile
%buildsystem_foo_conf() foo-configure %*
%buildsystem_foo_build() foo-build %*
%buildsystem_foo_install() foo-install %*
```

If a stage cannot pass parameters directly to the underlying command, the BuildSystem documentation must explain which parameters the stage supports and how those parameters affect the final build command.

## Dependencies

Each BuildSystem subdocument must list the `BuildRequires` entries that the BuildSystem usually needs.

For example, documentation for a `cmake`-based BuildSystem should state that it requires `cmake`. Documentation for a `pyproject`-based BuildSystem should state that it requires `pyproject-rpm-macros` and the relevant Python build dependencies.

When the build environment guarantees certain dependencies, the documentation may state that packagers do not need to declare them explicitly. However, a BuildSystem should not rely on undocumented implicit dependencies.

### Automatic Build Dependency Generation

If a language ecosystem or build tool can generate build dependencies from upstream metadata, the BuildSystem may provide a `%generate_buildrequires` stage.

For example, a `pyproject`-based BuildSystem can generate Python build dependencies from PEP 517 and PEP 518 metadata. Such a BuildSystem should allow maintainers to pass parameters to the underlying dependency generation macro via `BuildOption(generate_buildrequires):`.

If automatic dependency generation does not produce all required build dependencies, the Spec file must still declare the missing dependencies manually with `BuildRequires`. A BuildSystem should not assume that automatic dependency generation always produces a complete result.

## Tests

When maintainers define test behavior, they should keep the default test behavior safe. A default test may run a complete test suite or only a basic smoke test.

Maintainers should avoid the following designs:

* Skip `%check` by default. If the BuildSystem cannot provide default tests, explain the reason.

* Run tests that require network access by default.

* Run highly unstable tests or tests that depend on external services by default.

## Macro File Location

BuildSystem-related macros should reside in the corresponding RPM macro directory and use clear file names.

Recommended naming:

```specfile
/usr/lib/rpm/macros.d/macros.<buildsystem>
```

For example:

```specfile
/usr/lib/rpm/macros.d/macros.cmake
/usr/lib/rpm/macros.d/macros.pyproject
```

If multiple BuildSystems share the same basic macros, maintainers may place common logic in a shared macro file. However, each BuildSystem entry point should remain clear.

## Documentation Requirements

Maintainers must add corresponding documentation for every new BuildSystem. The documentation must include at least the following content:

1. BuildSystem name.

2. Scope.

3. Required `BuildRequires`.

4. An example that migrates a traditional Spec workflow to the declarative workflow.

5. Macro file location.

Optional but recommended content:

1. Supported `BuildOption(<stage>):`.

2. Build parameters that the BuildSystem enables or disables by default.

3. Default test behavior.
