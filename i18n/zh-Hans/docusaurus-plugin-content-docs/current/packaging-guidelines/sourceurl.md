---
id: sourceurl
title: 源码包
description: 这个文档讲述了 openRuyi 对于 `Source:` 字段处的编写策略。
slug: /guide/packaging-guidelines/SourceURL
---

# 源码包

这个文档讲述了 openRuyi 对于 `Source` 字段处的编写策略。

用于构建软件包的源码应该是从上游获取的源码，故打包者需要指明源码的出处。最常见的情况是，上游将源码打包为 `tar.gz`、`tar.bz2` 或 `zip` 压缩包，供我们从上游网站下载。在这种情况下，你必须在 `Source` 行中使用指向该软件包的完整 URL。例如:

```specfile
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

如果上游源码包提供了多种我们的工具都能解压的压缩格式，最好使用尺寸最小的那一种。这能确保源码 RPM (source rpm) 最小，以节省镜像空间和源码 RPM 包的下载流量。

如果 `URL` 字段已经包含了部分 `Source` 字段的内容，那么可以在后者复用前者:

```specfile
URL:            https://github.com/dracut-ng/dracut-ng
Source:         %{url}/archive/refs/tags/%{version}.tar.gz
```

## SourceForge.net

对于托管在 sourceForge 上的软件包，请使用:

```specfile
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

将 `.tar.gz` 更改为与上游发行版匹配的任何格式。请注意，正确的 URL 是 `downloads.sourceforge.net`，而不是 `download.sourceforge.net`，也不是任意选择的镜像。

## 奇奇怪怪的 URL

当上游的下载 URL 不以 tarball 名称结尾时，rpm 将无法从源码 URL 中解析出 tarball。一种适用于多种情况的变通方法是构建一个 URL，将 tarball 列在 "URL 片段" 中:

```specfile
Source:         https://example.com/foo/1.0/download.cgi#/%{name}-%{version}.tar.gz
```

这样，rpm 在构建的时候将使用 `%{name}-%{version}.tar.gz` 作为 tarball 名称。

## 在 Open Build Service 构建上需要注意的

我们可以搭配 Open Build Service 的远程资产 (Remote Assets) 功能，这样源码可以在构建过程中被自动下载:

```specfile
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

如果在 `Source:` 字段前添加 `#!CreateArchive`，则可以在构建时自动创建一个 tarball 压缩包。该字段在当上游项目从未指定过任何版本号时非常实用。

例如，打包者打包 `rpmpgp_legacy` 的时候发现上游没有发布任何源码压缩包，故只能从 git 标签中获取源码:

```specfile
#!RemoteAsset:  git+https://github.com/rpm-software-management/rpmpgp_legacy#1.1
#!CreateArchive
Source1: rpmpgp_legacy-1.1.tar.gz
```
