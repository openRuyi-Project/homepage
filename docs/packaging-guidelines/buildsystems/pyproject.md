---
id: buildsystempyproject
title: Pyproject
description: This document explains how to use the pyproject declarative build system when packaging software for openRuyi.
slug: /guide/packaging-guidelines/BuildSystems/pyproject
---

# Pyproject

This document explains how to use the `pyproject` declarative build system when packaging software for openRuyi.

When the package you maintain declares its build backend in `pyproject.toml` and follows the [PEP 517](https://peps.python.org/pep-0517/) and [PEP 518](https://peps.python.org/pep-0518/) build workflow. We recommend `BuildSystem: pyproject` to reuse the standardized Python build workflow and reduce repetitive boilerplate.

In general, these packages include most modern Python modules, as well as some projects that primarily use Python but also install command-line tools.

## Dependencies

To use the `pyproject` build system, you usually need to add at least the following `BuildRequires`.

```specfile
BuildRequires:  pyproject-rpm-macros
BuildRequires:  pkgconfig(python3)
```

### Automatically Generating Dependencies

Add the following content to a spec file that uses the `pyproject` declarative build system, so the build system can automatically add build dependencies according to PEP 517 and PEP 518.

```specfile
%generate_buildrequires
%pyproject_buildrequires
```

If the automatically generated build dependencies do not cover everything, or if the package also needs non-Python dependencies or system library dependencies, continue adding the required `BuildRequires` entries.

You can usually generate test dependencies by passing the relevant options to `%pyproject_buildrequires` through `BuildOption(generate_buildrequires)`. For example, use the `-t` option to read test dependencies from the default tox environment. Add test dependencies manually only when the macro cannot generate them automatically.

Note that `%generate_buildrequires` may print error messages in the build log while generating dependencies. You should treat that behavior as expected.

## Scope

The `pyproject` declarative build system applies to the following scenarios:

* The upstream source root contains `pyproject.toml`

* The build process follows the PEP 517 interface

Keep in mind that a project may not fit the `pyproject` declarative build system directly, even if it contains `pyproject.toml`, especially when the actual build process relies on custom scripts, non-standard build steps, or when the project does not primarily package Python code.

## Example

Assume the original configuration for generating build dependencies, building, and installing looks like this:

```specfile
%generate_buildrequires
%pyproject_buildrequires -x test

%build
%pyproject_wheel

%install
%pyproject_install
%pyproject_save_files example_pkg

%check
%pytest
```

After switching to the `pyproject` declarative build system, you can let the build system handle some arguments by default instead of writing them explicitly. You can rewrite the configuration as follows:

```specfile
BuildSystem:  pyproject

BuildOption(generate_buildrequires):  -x test
BuildOption(install):  example_pkg
```

When using the `pyproject` declarative build system, always pass the corresponding module name to `BuildOption(install)`.

If the original install stage also contains extra cleanup logic, for example:

```specfile
%install
%pyproject_install
%pyproject_save_files example_pkg
rm -f %{buildroot}%{_bindir}/debug-helper
```

You can rewrite it as follows:

```specfile
BuildSystem:  pyproject

BuildOption(install):  example_pkg

%install -a
rm -f %{buildroot}%{_bindir}/debug-helper
```

## Testing

The `pyproject` declarative build system runs a smoke test by default, which imports the installed modules. In general, you should not clear the `%check` directly to skip tests.

If you need to exclude certain modules during this process, pass arguments to `%pyproject_check_import` through `BuildOption(check)` and document the reason above the option. For example:

```specfile
BuildSystem:  pyproject

BuildOption(install):  example_pkg
# No module named 'marray'
BuildOption(check):  -e 'example_pkg.tests*'
```

To add extra `pytest` tests, write an appended check step directly:

```specfile
%check -a
%pytest
```

tox-based tests follow the same pattern. Use the `%tox` macro when needed.

## Build System Macro Reference

The build system macros related to `pyproject` reside in `/usr/lib/rpm/macros.d/macros.pyproject`.

For descriptions of some build macros, see the RPM macro reference in the [Python Packaging Guidelines](/docs/guide/packaging-guidelines/languages/Python).
