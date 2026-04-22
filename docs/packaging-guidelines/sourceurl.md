---
id: sourceurl
title: Source Packages
description: This document describes the openRuyi policy for writing the Source tag in RPM spec files.
slug: /guide/packaging-guidelines/SourceURL
---

# Source Packages

This document describes the openRuyi policy for writing the `Source` tag in RPM spec files.

The source code that packagers use to build a package must originate from upstream. Therefore, this policy requires packagers to specify the exact location where they can obtain the upstream source code.

The most common case is that upstream distributes source code as compressed archives such as `tar.gz`, `tar.bz2`, or `zip`, which users can download from the upstream website. In this situation, you must provide the full URL to the source archive in the `Source` field. For example:

```specfile
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

If upstream provides multiple compression formats that our tooling can extract, you should prefer the smallest archive. Choosing the smallest archive helps minimize the size of the Source RPM (SRPM), reducing mirror storage usage and download bandwidth.

If the `URL` field already contains part of the source location, you may reuse it when defining `Source`. For example:

```specfile
URL:            https://github.com/dracut-ng/dracut-ng
Source:         %{url}/archive/refs/tags/%{version}.tar.gz
```

## SourceForge.net

For software hosted on SourceForge, you should use the following format:

```specfile
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

Replace `.tar.gz` with the archive format that upstream actually provides.

Note that the correct hostname is **`downloads.sourceforge.net`**, not `download.sourceforge.net`, and not an arbitrary mirror.

## Non-standard Download URLs

Sometimes upstream provides download URLs that do not end with the tarball filename. In such cases, RPM cannot automatically determine the source archive name from the URL.

A common workaround is to append the archive filename as a URL fragment:

```specfile
Source:         https://example.com/foo/1.0/download.cgi#/%{name}-%{version}.tar.gz
```

In this case, RPM will treat `%{name}-%{version}.tar.gz` as the archive filename during the build process.

## Considerations for Open Build Service

When building packages with Open Build Service (OBS), you can use the Remote Assets feature so that OBS automatically downloads the source code during the build process:

```specfile
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source:         https://downloads.sourceforge.net/%{name}/%{name}-%{version}.tar.gz
```

If you add `#!CreateArchive` before a `Source` tag, OBS can automatically create a tarball archive during the build. This automatic archive creation is particularly useful when the upstream project does not provide any official release archives.

For example, when packaging `rpmpgp_legacy`, the packager discovered that upstream does not publish any source tarballs and that packagers must obtain the source from a Git tag:

```specfile
#!RemoteAsset:  git+https://github.com/rpm-software-management/rpmpgp_legacy#1.1
#!CreateArchive
Source1: rpmpgp_legacy-1.1.tar.gz
```
