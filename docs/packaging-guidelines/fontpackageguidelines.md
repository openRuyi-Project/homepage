---
id: fontpackageguidelines
title: Font Packaging Guidelines
description: This document describes the font packaging guidelines for openRuyi.
slug: /guide/packaging-guidelines/FontPackagingGuidelines
---

# Font Packaging Guidelines

This document describes the font packaging guidelines for openRuyi.

## Package Naming

You should name all font packages in the form of `fonts-fontname`, where `fontname` is the font’s canonical identifier.

This name may refer to the OpenType name table of the font file, especially the Family or Typographic Family entry. However, if this conflicts with the upstream project name, the upstream project name takes precedence.

If the upstream project has long used a certain abbreviation, or if a de facto abbreviation has already become established in the Linux ecosystem and is unlikely to conflict with other font projects, you may use such an abbreviation. For example, you may abbreviate `WenQuanYi` as `wqy`, so the package name becomes `fonts-wqy`.

## Licensing

Always keep in mind: never package proprietary fonts that forbid redistribution.

When introducing a font package, you should prefer fonts released under licenses such as OFL or GPL.

## Build

When packaging fonts, if the upstream provides a source package, you should build the font files from source.

If you cannot build the font files from source, you may use the upstream-provided font archive directly.

If the fonts released in the upstream archive do not belong to the same font family, you must split them into separate font packages.

## Installation Paths

Install system-wide fonts under `%{_datadir}/fonts` and organize them by container type:

* Install OpenType TT (`*.ttf` / `*.ttc`) under `%{_datadir}/fonts/truetype`.

* Install OpenType CFF/CFF2 (`*.otf` / `*.otc`) under `%{_datadir}/fonts/opentype`.

Since fontconfig recursively scans its default search paths and maintains caches accordingly, this directory hierarchy does not affect font discovery.

### Bitmap Fonts

We handle bitmap fonts in two categories. You should generally not package the latter unless strictly necessary:

* Install OpenType bitmap fonts (`*.otb`) intended for modern fontconfig/Xft environments under `%{_datadir}/fonts/misc`.

* If you need to install accompanying X11 bitmap font files (`*.pcf` / `*.bdf`), you may place them in the same directory.

* For bitmap fonts intended for legacy Core X11 fonts (XLFD) in `*.pcf` format, you must first compress them with `gzip` and then install them by resolution under `%{_datadir}/fonts/X11/100dpi/` or `%{_datadir}/fonts/X11/75dpi/`. Install low-resolution or monospaced grid fonts under `%{_datadir}/fonts/X11/misc/`.

* If the upstream provides the font in `*.bdf` format, you must convert it to `*.pcf`.

  * Do not depend on legacy fonts by default, and do not preinstall them.

### Type 1

Although Type 1 (`*.pfa` / `*.pfb`) is a legacy format and FreeType still supports it, many modern applications have gradually dropped support for it. If the upstream also provides an OpenType TT or CFF/CFF2 version, you should package the OpenType version by preference.

Where packaging Type 1 fonts is necessary, install them under `%{_datadir}/fonts/type1`.

If the font provides metric files (`*.afm`), you must package them in the same directory as the font.

### Exceptions

You must not install Linux console fonts (`*.psf`) and web fonts (`*.woff` / `*.woff2`) in directories that fontconfig can discover.

Keeping these files out of fontconfig's reach is especially important for web fonts: the WOFF specification explicitly states that it is “not recommended” to treat WOFF as a desktop-installable font format.

* Install console fonts (`*.psf`) under `%{_datadir}/consolefonts`.

* Install web fonts (`*.woff`) under `%{_datadir}/webfonts`.

## Subpackage Splitting and Naming

If the upstream provides multiple font formats, the main font package should act as a metapackage and should not directly contain font files.

We recommend the following split:

* `fonts-fontname-vf` (variable fonts): contains VF font files, typically VF variants of `.ttf` or `.otf`.

  * In addition, the metapackage may include `Requires: fonts-fontname-vf`.

* `fonts-fontname-static` (static fonts): contains non-VF font files, typically non-variable `.ttf` or `.otf`.

  * In some cases, the upstream may provide only collection files (`*.ttc` / `*.otc`). In such cases, you may instead name the subpackage `fonts-fontname-ttc` or `fonts-fontname-otc`.

## Macros

The `fonts-rpm-macros` package provides RPM macros that name the font directories described above and install font files into them. To use these macros, add the following `BuildRequires`:

```specfile
BuildRequires:  fonts-rpm-macros
```

The macros currently cover OpenType TT (`*.ttf` / `*.ttc`) and OpenType CFF/CFF2 (`*.otf`). Install the remaining formats, such as `*.otc`, `*.otb`, `*.pcf`, `*.pfb`, `*.psf`, and `*.woff`, with the explicit paths that [Installation Paths](#installation-paths) describes.

### Directory Macros

Use the following macros in `%install` and `%files` instead of hardcoding the paths:

| Macro                    | Expansion                            | Meaning                                              |
| ------------------------ | ------------------------------------ | ---------------------------------------------------- |
| `%{_fontdir}`            | `%{_datadir}/fonts`                  | Top-level directory for system-wide fonts            |
| `%{_font_truetypedir}`   | `%{_fontdir}/truetype`               | Directory for OpenType TT fonts                      |
| `%{_font_opentypedir}`   | `%{_fontdir}/opentype`               | Directory for OpenType CFF/CFF2 fonts                |
| `%{_font_fontconfigdir}` | `%{_datadir}/fontconfig/conf.avail`  | Directory for available fontconfig configuration files |

### %install_font

`%install_font <src> [subdir]` installs one font file and picks the destination from the file extension: `*.ttf` and `*.ttc` go under `%{_font_truetypedir}`, and `*.otf` goes under `%{_font_opentypedir}`. Any other extension fails the build.

Pass `subdir` to keep a package's font files in their own directory under the type directory. If you omit `subdir`, the macro installs the files directly into the type directory.

The macro creates the destination directory, installs the file with mode `0644`, and preserves its timestamp.

```specfile
%install
%install_font Example-Regular.ttf example
%install_font Example-Bold.otf example
%install_font Example.ttc example
```

### %install_fonts

`%install_fonts <glob> [subdir]` passes every file that `<glob>` matches to `%install_font`. A glob that matches nothing is skipped, so you may list patterns for formats that a given release does not ship.

```specfile
%install
%install_fonts *.ttf example
%install_fonts *.otf example
```

`%install_fonts_auto [subdir]` scans the current directory for `*.ttf`, `*.otf`, and `*.ttc`, and installs each file to the directory that matches its extension.

```specfile
%install
cd fonts
%install_fonts_auto example
```

### %font_files

`%font_files <subdir> [ext...]` generates the `%files` entries for the fonts that the macros installed under `<subdir>`. For each extension, it emits a `%dir` entry for the owning type directory and a glob for the font files.

```specfile
%files
%font_files example ttf
```

The macro above expands to the following:

```specfile
%dir /usr/share/fonts/truetype/example/
/usr/share/fonts/truetype/example/*.ttf
```

List the extensions that the package actually installs. When you omit them, the macro falls back to `ttf`, `otf`, and `ttc`, and rpmbuild then fails on every one of the three globs that matches no file.
