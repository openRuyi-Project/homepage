---
id: languagesperl
title: Perl
description: 这个文档讲述了 openRuyi 的 Perl 模块打包指南。
slug: /guide/packaging-guidelines/languages/Perl
---

# Perl 打包指南

这个文档讲述了 openRuyi 的 Perl 模块打包指南。

大多数 CPAN 风格的 Perl 模块包可以使用 `cpan2spec` 生成初始 spec 文件，然后再进行人工检查和少量修正。对于普通 Perl 模块包，生成后的 spec 通常应使用 openRuyi 的声明式 Perl 构建系统，而不是手写 `%build`、`%install` 或 `%check` 段。

## 包命名

Perl 模块包的包名应命名为 `perl-CPANDIST`，其中 `CPANDIST` 是所打包的 CPAN 发行版名称。

在极少数情况下，如果一个 CPAN 发行版因为依赖关系等原因需要被拆分成更小的子包，那么额外的子包**应**命名为 `perl-CPANDIST-Something`。

示例:

* `perl-Archive-Zip`，其中 `Archive-Zip` 是 CPAN 发行版名称。
* `perl-Cache-Cache`，其中 `Cache-Cache` 是 CPAN 发行版名称。

## License 标签

许多 Perl 模块会声明自己使用与 Perl 5 相同的许可证。由于 Perl 5 使用双许可证发布，通常可以用以下 SPDX 表达式表示:

```specfile
License:        GPL-1.0-or-later OR Artistic-1.0-Perl
```

在最终确定 `License` 标签之前，应检查上游元数据和源码文件，确认实际许可证声明。

## URL 标签

对于基于 CPAN 的包，`URL` 标签应使用非版本化的 `metacpan.org` URL。

例如，如果打包 `Net::XMPP` 模块，URL 应为:

```specfile
URL:            https://metacpan.org/release/Net-XMPP
```

## 构建依赖

Perl 模块包通常需要以下构建依赖。

* `perl-macros` — 提供打包 Perl 模块所需的一系列 RPM 宏，包括标准安装路径宏，如 `%perl_vendorarch`、`%perl_vendorlib`，以及辅助宏，如 `%perl_gen_filelist`、`%perl_requires`。

* `perl-rpm-macros` — 提供 openRuyi Perl 打包流程中使用的 RPM 侧集成宏。

* `perl-rpm-packaging` — 提供 openRuyi 常见 Perl 模块 spec 所需的额外打包支持。

* `perl-devel` — 提供 Perl 头文件。构建链接到 `libperl.so` 的架构相关代码时需要添加，例如 XS Perl 模块。

使用声明式 Perl 构建系统的软件包通常应包含:

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
```

你还应根据上游构建脚本添加所需的 Perl 模块依赖。

例如:

```specfile
BuildRequires:  perl(Module::Build)
BuildRequires:  perl(ExtUtils::MakeMaker)
BuildRequires:  perl(Test::More)
```

如果在构建时需要特定的 Perl 模块，请使用 `perl(MODULE)` 格式。这也适用于 Perl 本身提供的核心模块，因为这些模块可能会随着时间推移在基础 Perl 包中移入或移出。

## Requires 和 Provides 标签

在编写 `Requires` 和 `Provides` 时，应使用 `perl(MODULE)` 格式，而不是直接依赖包名。

例如，一个需要 Perl 模块 `Archive::Zip` 的包不应显式依赖包名 `perl-Archive-Zip`，而应写成:

```specfile
Requires:       perl(Archive::Zip)
```

对应的软件包会提供这个模块依赖。

## 选择构建系统

大多数 CPAN 风格的 Perl 包可以使用以下两个声明式 Perl 构建系统之一:

* `perlbuild` — 用于基于 `Module::Build` 的软件包，通常表现为源码树中包含 `Build.PL`。
* `perlmaker` — 用于基于 `ExtUtils::MakeMaker` 的软件包，通常表现为源码树中包含 `Makefile.PL`。

示例:

```specfile
BuildSystem:    perlbuild
```

```specfile
BuildSystem:    perlmaker
```

在大多数情况下:

* 如果源码树中包含 `Build.PL`，使用 `perlbuild`。
* 如果源码树中包含 `Makefile.PL`，使用 `perlmaker`。

手写 spec 文件时，应先检查上游源码树使用哪一种构建脚本，然后选择对应的构建系统，而不是从头手写 `%build`、`%install` 和 `%check` 逻辑。

关于 `perlbuild` 和 `perlmaker` 的构建、安装、检查阶段细节，请参考 Perl 构建系统文档:

```text
/guide/packaging-guidelines/BuildSystems/perl
```

## 最小 spec 结构

使用声明式构建系统的 Perl 模块 spec 通常可以写成如下形式:

```specfile
BuildRequires:  perl-rpm-packaging
BuildRequires:  perl-rpm-macros
BuildRequires:  perl-macros
BuildRequires:  perl(Module::Build)

BuildSystem:    perlbuild

%description
...

%files -f %{name}.files
%doc Changes README
```

对于使用 `Makefile.PL` 的软件包，应使用 `perlmaker`，并添加对应的构建依赖:

```specfile
BuildRequires:  perl(ExtUtils::MakeMaker)

BuildSystem:    perlmaker
```

在大多数软件包中，不需要自定义 `%build`、`%install` 或 `%check` 段。只有当上游构建脚本需要额外参数时，才需要使用 `BuildOption(...)`。

## 文件列表

使用声明式 Perl 构建系统时，安装阶段通常会运行 `%perl_gen_filelist`，因此软件包一般可以使用自动生成的文件列表:

```specfile
%files -f %{name}.files
%doc Changes README
```

如果你手写 `%install` 段，或者没有使用自动生成的文件列表，那么架构无关的 Perl 模块包通常会安装到:

```specfile
%{perl_vendorlib}/*
```

架构相关的 Perl 模块包通常会安装到:

```specfile
%{perl_vendorarch}/*
```

使用声明式 Perl 构建系统时，优先使用 `%files -f %{name}.files`。只有在需要自定义安装逻辑时，才通常需要手动列出 `%{perl_vendorlib}` 或 `%{perl_vendorarch}` 下的文件。

## 模块包中的 `.h` 文件

如果一个 Perl 模块包含 `.h` 文件，这些文件不应仅因为是头文件就被拆分到 `-devel` 子包中。

## 自动化引入

openRuyi 提供了一个用于引入 CPAN 软件包的小工具 `cpan2spec`。这个工具基于 Steven Pritchard 的 `cpanspec` 修改而来，以适应 openRuyi 的需求。我们对其原始贡献表示感谢。

例如，要打包 Perl 模块 `IO::String`:

```specfile
perl ./cpan2spec IO-String
```

生成的 spec 仍然需要人工检查，尤其应检查:

* 选择的 `BuildSystem` 是否正确，即 `perlbuild` 或 `perlmaker`。
* 生成的 Perl 模块依赖是否完整。
* `License` 字段是否正确。
* `%files` 段和文档文件声明是否合理。

在很多情况下，自动生成可以得到可用的初始 spec，但它应被视为打包起点，而不是最终结果。

如果需要，也可以通过添加 `-x` 生成不使用声明式 Perl 构建系统的 spec:

```specfile
perl ./cpan2spec IO-String -x
```

这个选项适合用于对比和验证。实际使用时，可以分别生成两个版本:

* 默认生成的、使用 `BuildSystem` 的版本。
* 使用 `-x` 生成的、不使用 Perl 构建系统的版本。

然后比较两者，确认该包是否符合预期的 `perlbuild` 或 `perlmaker` 模式，以及声明式构建系统是否适合该包。

`-x` 选项只用于验证和对比。最终提交的软件包应转换为声明式 `BuildSystem` 形式，只有这种形式的软件包会被接受。

## 用于 Perl 模块的 RPM 宏

这里列出一些 Perl 模块打包中常用的 RPM 宏。

### `%perl_sitearch`

此宏指向管理员或本机通过 CPAN 安装的架构相关库路径，即 `/usr/local/lib/perl5`。

### `%perl_sitelib`

此宏指向管理员或本机通过 CPAN 安装的架构无关库路径，即 `/usr/local/share/perl5`。

### `%perl_vendorarch`

此宏指向 openRuyi 打包提供的架构相关库路径，即 `/usr/lib/perl5/vendor_perl`。

### `%perl_vendorlib`

此宏指向 openRuyi 打包提供的架构无关库路径，即 `/usr/share/perl5/vendor_perl`。

### `%perl_archlib`

此宏指向 Perl 自带的架构相关核心库路径，即 `/usr/lib/perl5`。

### `%perl_privlib`

此宏指向 Perl 自带的架构无关核心库路径，即 `/usr/share/perl5`。

### `%perl_make_install`

此宏会正确执行 MakeMaker 风格 Perl 包的 `make install` 步骤。

### `%perl_process_packlist` 和 `%perl_gen_filelist`

这些宏会为最终的文件打包阶段准备 Perl 模块相关文件。如果使用 `%perl_gen_filelist`，通常可以在 `%files` 段中使用 `-f %{name}.files`。

例如:

```specfile
%install
%perl_make_install
%perl_process_packlist
%perl_gen_filelist

%files -f %{name}.files
%doc Changes README
```

不过，`%perl_gen_filelist` 不会收集构建流程中没有实际安装的文件。

使用声明式 Perl 构建系统时，这些步骤已经包含在默认安装行为中。除非覆盖默认安装阶段，否则通常不需要手写这些宏。

### `%perl_version`

此宏展开为当前 Perl 解释器的版本号，例如 `5.43.2`。

### `%perl_requires`

当软件包需要依赖当前 Perl 版本时，可以使用此宏。

### `%__perl`

此宏展开为系统中安装的 `perl` 可执行文件名称。
