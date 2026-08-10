---
id: fontpackageguidelines
title: 字体打包指南
description: 这个文档讲述了 openRuyi 的字体打包指南。
slug: /guide/packaging-guidelines/FontPackagingGuidelines
---

# 字体打包指南

这个文档讲述了 openRuyi 的字体打包指南。

## 包命名

所有字体包的命名都应被命名为 `fonts-fontname`。其中 `fontname` 为字体的规范标识名 (canonical name)。 这个名字可以参考字体文件的 OpenType name table (Family/Typographic Family)，但若与上游项目名冲突时，则优先用上游项目名。

如果上游项目自身长期使用某一种缩写，或在 Linux 生态中已形成事实标准，并且缩写不易与其他字体项目冲突的情况，则允许进行缩写，例如 `WenQuanYi` 可被缩写为 `wqy`，故包名为 `fonts-wqy`。

## 许可证

永远记住：禁止打包不能再分发的专有字体。在引入字体包时，应优先考虑 OFL/GPL 等许可证的字体。

## 构建

在打包时，如果上游提供了源代码包，应当从源码构建字体文件。如不能从源码构建字体文件，则可以直接使用上游提供的字体压缩包。

如果上游压缩包内发布的字体不属于同一个字体家族，那么它们必须分开为不同的字体包。

## 安装位置

系统级别的字体应统一安装至 `%{_datadir}/fonts` 目录内，并按照容器类别进行分类:

* OpenType TT (`*.ttf`/`*.ttc`) 应安装至 `%{_datadir}/fonts/truetype` 目录内。

* OpenType CFF/CFF2 (`*.otf`/`*.otc`) 应安装至`%{_datadir}/fonts/opentype` 目录内。

fontconfig 默认扫描路径下会递归扫描并维护缓存，所以这种分层不会影响发现。

### 位图字体

位图字体分两类处理，其中后者在非必要下不应打包:

* 面向现代 fontconfig/Xft 的 OpenType 位图格式 (`*.otb`) 应安装至 `%{_datadir}/fonts/misc` 目录内。如果需要一并安装确有需要的 X11 位图格式 (`*.pcf`) / (`*.bdf`) 文件，可放置在同一目录下。

* 面向 legacy Core X11 fonts (XLFD) 的位图格式 (`*.pcf`) 需要先通过 gzip 压缩，然后按分辨率安装至 `%{_datadir}/fonts/X11/100dpi/`、`%{_datadir}/fonts/X11/75dpi/`，低分辨率/等宽格子字体安装至 `%{_datadir}/fonts/X11/misc/`。如果字体格式为 `*.bdf`，需要转换为 `*.pcf`。

  * 默认不应依赖 legacy 字体，也不应预装。

### Type1

Type 1 (`*.pfa`/`*.pfb`) 作为遗留格式，虽然依然受到 FreeType 的支持，但不少现代应用已逐步放弃支持，如果上游同时提供 OpenType TT 或者 CFF/CFF2，则应优先打包 OpenType 版本。在有必要打包时，应安装至 `%{_datadir}/fonts/type1` 目录内。如果字体提供指标文件 (`*.afm`)，则需要一并打包进目录内。

### 例外

Linux 的控制台字体 (`*.psf`) 和 Web 字体 (`*.woff`/`*.woff2`) 不应该被安装在 fontconfig 能发现的目录下。尤其是后者，WOFF 规范明确说"不建议把 WOFF 当作桌面可安装字体格式"。

* 控制台字体 (`*.psf`) 应安装至 `%{_datadir}/consolefonts` 目录下。

* Web 字体 (`*.woff`) 应安装至 `%{_datadir}/webfonts` 目录下。

## 子包拆分和命名

如果存在多个字体格式，则字体包的主包应该作为元包，不直接提供字体文件。可按如下推荐进行拆包:

* `fonts-fontname-vf` (变量字体): 放 VF 的字体文件，通常为 `.ttf` 或 `.otf` 的 VF。

  * 同时，在元包内可以编写 `Requires: fonts-fontname-vf`。

* `fonts-fontname-static` (静态字体): 放非 VF 的字体文件，通常为 `.ttf` 或 `.otf` 的非 VF。

  * 有些时候，上游也会只提供集合文件 (`*.ttc`/`*.otc`)，此时可以将子包命名为 `fonts-fontname-ttc` 或 `fonts-fontname-otc`。

## 宏

`fonts-rpm-macros` 包提供了一组 RPM 宏，用于表示上文所述的字体目录，并将字体文件安装到这些目录中。使用这些宏时，需要添加如下 `BuildRequires`:

```specfile
BuildRequires:  fonts-rpm-macros
```

当前版本的宏覆盖 OpenType TT (`*.ttf`/`*.ttc`) 和 OpenType CFF/CFF2 (`*.otf`)。其余格式，例如 `*.otc`、`*.otb`、`*.pcf`、`*.pfb`、`*.psf` 和 `*.woff`，仍需按照[安装位置](#安装位置)一节所述的路径手动安装。

### 目录宏

在 `%install` 和 `%files` 中应使用下列宏，而不是硬编码路径:

| 宏                       | 展开结果                             | 含义                                  |
| ------------------------ | ------------------------------------ | ------------------------------------- |
| `%{_fontdir}`            | `%{_datadir}/fonts`                  | 系统级字体的顶层目录                  |
| `%{_font_truetypedir}`   | `%{_fontdir}/truetype`               | OpenType TT 字体目录                  |
| `%{_font_opentypedir}`   | `%{_fontdir}/opentype`               | OpenType CFF/CFF2 字体目录            |
| `%{_font_fontconfigdir}` | `%{_datadir}/fontconfig/conf.avail`  | fontconfig 可用配置文件目录           |

### %install_font

`%install_font <src> [subdir]` 安装单个字体文件，并根据扩展名选择目标目录: `*.ttf` 和 `*.ttc` 安装至 `%{_font_truetypedir}`，`*.otf` 安装至 `%{_font_opentypedir}`。其他扩展名会导致构建失败。

传入 `subdir` 可以把一个包的字体文件放在类型目录下自己的子目录中。如果省略 `subdir`，字体文件会直接安装到类型目录内。

该宏会自动创建目标目录，以 `0644` 权限安装文件，并保留文件时间戳。

```specfile
%install
%install_font Example-Regular.ttf example
%install_font Example-Bold.otf example
%install_font Example.ttc example
```

### %install_fonts

`%install_fonts <glob> [subdir]` 会把 `<glob>` 匹配到的每个文件交给 `%install_font` 安装。未匹配到任何文件的 glob 会被跳过，因此可以为某个版本可能并未提供的格式预留匹配规则。

```specfile
%install
%install_fonts *.ttf example
%install_fonts *.otf example
```

`%install_fonts_auto [subdir]` 会扫描当前目录下的 `*.ttf`、`*.otf` 和 `*.ttc`，并按扩展名把每个文件安装到对应目录。

```specfile
%install
cd fonts
%install_fonts_auto example
```

### %font_files

`%font_files <subdir> [ext...]` 用于为安装在 `<subdir>` 下的字体生成 `%files` 条目。对每个扩展名，它会生成所属类型目录的 `%dir` 条目和字体文件的 glob 条目。

```specfile
%files
%font_files example ttf
```

上面的宏展开为如下结果:

```specfile
%dir /usr/share/fonts/truetype/example/
/usr/share/fonts/truetype/example/*.ttf
```

在使用时应当列出包实际安装的扩展名。如果省略扩展名，宏会回退为 `ttf`、`otf` 和 `ttc`，此时三个 glob 中任何一个未匹配到文件都会导致 rpmbuild 失败。
