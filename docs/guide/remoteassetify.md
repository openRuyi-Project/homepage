---
id: remoteassetify.py
title: Using remoteassetify.py
description: This document describes the usage of remoteassetify.py locally and in automation
slug: /guide/remoteassetify-usage-guide
---

# Using `remoteassetify.py`

## Requirements

The `remoteassetify.py` script requires these programs to function:

- `enosys`: Blocking command execution
- `rpmspec`: Processing specs
- `curl`: Downloading files

By default, the `enosys` program from `util-linux` is required to block command execution while processing specs.
If you are not on Linux, or you use a Linux distribution that does not provide it, use the `--unsafe-optional-enosys` option to disable this feature.

## Security note

Even though `remoteassetify.py` makes an attempt to filter out arbitrary code execution and uses `enosys` to block command execution, it is not a sandbox.
Do not run `remoteassetify.py` on untrusted specs without review or adequate protection.

## Local usage

By default, `remoteassetify.py` accepts the path to a spec file and performs these actions:

- Parse the spec to extract remote assets
- Download the remote assets from it into the `_assets` directory
- If any `#!RemoteAsset` lines have missing or differing checksums, generate a patch to update them.

Differing checksums at this point should be verified:

- If you updated a package, the URL and checksum to source code packages should change.
  This is expected.
- If the URL did not change at all, but the checksum changed, then the old and the new download are different.
  This requires manual verification.

This on its own implements a trust on first use (TOFU) model for the downloaded files.
If upstream provides methods to further verify the downloaded files, you can also do that after downloading.

You can pipe the output patch into `git apply` to fix the spec file:

```
$ scripts/remoteassetify.py SPECS/hello/hello.spec | git apply
```

For details on options, see:

```
$ scripts/remoteassetify.py --help
```

## Automation usage

Pull requests to openRuyi that contains changes to remote assets will trigger a automatic workflow to check all specs with changed remote assets using `remoteassetify.py`.
To avoid excessive downloads, if the URLs and checksums of remote assets are all changed for a spec, it is not checked.

For checked specs, any missing or differing checksum on a remote asset or a remote asset that failed to download causes the workflow to fail.
Please follow the annotations and workflow summary to see what needs updating.
If your pull request changes many files, note that on GitHub, only the first 10 warnings will be shown.
Therefore, check the workflow summary for full details.

On failure, a patch is provided in the workflow summary and as an artifact for convenience.
These can be accessed using the "Summary" link in the sidebar in workflow details.
However, any unexpected differing checksums still requires verification.
