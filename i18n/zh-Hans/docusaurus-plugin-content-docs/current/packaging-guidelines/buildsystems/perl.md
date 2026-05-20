---
id: buildsystemperl
title: Perl
description: 这个文档讲述了在 openRuyi 打包时，如何使用名为 perlbuild 和 perlmaker 的声明式构建系统。
slug: /guide/packaging-guidelines/BuildSystems/perl
---

# Perl

这个文档讲述了在 openRuyi 打包时，如何使用名为 `perlbuild` 和 `perlmaker` 的声明式构建系统。

通常来说，Perl 模块包可以使用 `cpan2spec` 等工具生成大部分内容，之后只需要进行少量人工修正。

如果需要手写 spec 文件，应先检查上游源码树使用的是哪一种构建脚本:

- 如果源码树中包含 `Build.PL`，使用 **`perlbuild`**。
- 如果源码树中包含 `Makefile.PL`，使用 **`perlmaker`**。

## 依赖

如需要使用 Perl 声明式构建系统，通常需要添加以下 `BuildRequires`。

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
```

你还应根据上游构建脚本添加所需的 Perl 模块依赖，例如:

```specfile
BuildRequires:  perl(Module::Build)
BuildRequires:  perl(ExtUtils::MakeMaker)
```

其中:

- 使用 `perlbuild` 时，通常需要 `perl(Module::Build)`。
- 使用 `perlmaker` 时，通常需要 `perl(ExtUtils::MakeMaker)`。

如果测试阶段还需要额外模块，也应按实际情况添加，例如:

```specfile
BuildRequires:  perl(Test::More)
```

## 选择构建系统

Perl 声明式构建系统主要分为两种。

### `perlbuild`

如果上游源码树使用 `Build.PL`，应使用 `perlbuild`:

```specfile
BuildSystem:    perlbuild
```

这类软件包通常基于 `Module::Build`。

在大多数情况下，不需要手写 `%build`、`%install` 或 `%check` 段。只有当上游构建脚本需要额外参数时，才需要使用 `BuildOption(...)` 进行补充。

例如:

```specfile
BuildOption(build):  --installdirs=vendor optimize="%{optflags}"
BuildOption(install):  --destdir=%{buildroot} --create_packlist=0
```

### `perlmaker`

如果上游源码树使用 `Makefile.PL`，应使用 `perlmaker`:

```specfile
BuildSystem:    perlmaker
```

这类软件包通常基于 `ExtUtils::MakeMaker`。

如果需要给 `Makefile.PL` 传递额外参数，可以使用 `BuildOption(build)`。例如:

```specfile
BuildOption(build):  INSTALLDIRS=vendor
```

## 构建阶段

两个 Perl 构建系统在构建阶段的行为不同。

### `perlbuild`

`perlbuild` 的构建阶段通常执行:

```specfile
perl Build.PL ...
./Build
```

其核心逻辑大致等价于:

```specfile
%buildsystem_perlbuild_build() %{expand:\
  perl Build.PL %* \
  ./Build \
}
```

如需要向 `Build.PL` 传递参数，可使用 `BuildOption(build)`。

### `perlmaker`

`perlmaker` 的构建阶段通常执行:

```specfile
perl Makefile.PL ...
make
```

其核心逻辑大致等价于:

```specfile
%buildsystem_perlmaker_build() %{expand:\
  perl Makefile.PL %* \
  %{make_build} \
}
```

如需要向 `Makefile.PL` 传递参数，可使用 `BuildOption(build)`。

## 安装阶段

两个 Perl 构建系统的安装命令不同，但安装后都会执行 Perl 包常用的清理和文件列表生成步骤。

### `perlbuild`

`perlbuild` 的安装阶段通常执行:

```specfile
./Build install ...
find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \;
%perl_process_packlist
%perl_gen_filelist
```

其核心逻辑大致等价于:

```specfile
%buildsystem_perlbuild_install() %{expand:\
  ./Build install %* \
  find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \; \
  %perl_process_packlist \
  %perl_gen_filelist \
}
```

如需要向 `./Build install` 传递参数，可使用 `BuildOption(install)`。

### `perlmaker`

`perlmaker` 的安装阶段通常执行:

```specfile
%perl_make_install ...
find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \;
%perl_process_packlist
%perl_gen_filelist
```

其核心逻辑大致等价于:

```specfile
%buildsystem_perlmaker_install() %{expand:\
  %perl_make_install %* \
  find %{buildroot} -type f -name '*.bs' -size 0 -exec rm -f {} \; \
  %perl_process_packlist \
  %perl_gen_filelist \
}
```

如需要向安装阶段传递参数，可使用 `BuildOption(install)`。

## 检查阶段

两个 Perl 构建系统都提供默认的检查阶段。

对于使用 `perlbuild` 的软件包，默认检查阶段执行:

```specfile
./Build test
```

这对应常见的 `Module::Build` 工作流:

```specfile
perl Build.PL
./Build
./Build test
./Build install
```

对于使用 `perlmaker` 的软件包，默认检查阶段执行:

```specfile
make test
```

这对应常见的 `ExtUtils::MakeMaker` 工作流:

```specfile
perl Makefile.PL
make
make test
make install
```

在大多数软件包中，不需要自定义 `%check` 段。如果上游测试套件需要额外参数，可在合适的情况下通过 `BuildOption(check)` 传入。

例如:

```specfile
BuildOption(check):  TEST_VERBOSE=1
```

如果测试套件需要网络访问、不可用的可选依赖，或其他当前打包环境不支持的运行时行为，可能需要根据软件包策略覆盖或禁用默认检查阶段。

## 文件列表

Perl 软件包通常使用自动生成的文件列表:

```specfile
%files -f %{name}.files
%doc Changes README
```

`%perl_gen_filelist` 会在安装阶段生成 `%{name}.files`。因此，在使用 `perlbuild` 或 `perlmaker` 时，通常不需要手动列出所有 Perl 模块文件。

如果软件包有额外文档、示例或特殊文件，仍然可以在 `%files` 段中补充声明。

## 何时需要手动调整

大多数 CPAN 风格的 Perl 模块包都可以通过 `cpan2spec` 生成，并使用 `perlbuild` 或 `perlmaker` 完成构建。通常只有在以下情况下才需要手动修改:

1. **上游构建脚本需要额外参数**
    如果 `Build.PL` 或 `Makefile.PL` 需要额外选项，可使用 `BuildOption(build)`、`BuildOption(install)` 或 `BuildOption(check)`。
2. **测试套件依赖特殊环境**
    如果测试需要网络、外部服务、不可用的可选依赖，或不适合在打包环境中运行，可能需要调整或禁用默认 `%check` 行为。
3. **自动生成的 spec 文件明显不合理**
    如果 `cpan2spec` 生成的 spec 明显不正常，可以对照已有的、打包良好的 Perl 模块包进行手动修正。
4. **软件包包含非标准安装步骤**
    如果上游包不遵循常见的 `Build.PL` 或 `Makefile.PL` 工作流，可能需要覆盖默认阶段。

## 说明

- `perlbuild` 和 `perlmaker` 覆盖了大多数标准 CPAN 风格的 Perl 模块包。
- 在很多情况下，只需要选择正确的 `BuildSystem`，按需设置 `BuildOption(...)`，并正确声明依赖。
- 如果软件包有特殊构建步骤、补丁或测试需求，仍然可以覆盖默认阶段。
- 手写 spec 时，建议先查看 Perl 构建系统宏，确认软件包是否符合这两种模式之一。

## 构建系统宏说明

Perl 语言的两个构建系统宏为 `/usr/lib/rpm/macros.d/macros.buildsystem.perlbuild` 和 `/usr/lib/rpm/macros.d/macros.buildsystem.perlmaker`。
