---
id: quick-start-for-developers
title: Quick Start for Developers
description: This document guides developers for how to contribute to openRuyi.
slug: /guide/quick-start-for-developers
---

# Quick Start for Developers

This document guides developers through the full workflow of packaging software from source: setting up the environment, writing RPM Spec files, integrating with Open Build Service (OBS), and completing both local and cloud-based builds.

## Environment Setup and Tool Installation

Because openRuyi relies on the RISC-V RVA23 specification, it places relatively strict requirements on the version of `qemu-user` available in the build environment.

**Recommended operating systems:** Fedora, openSUSE Tumbleweed, or Arch Linux.

:::tip Notes

On distributions such as Ubuntu 24.04 LTS or Debian Stable, the QEMU version available in the default repositories is typically too old and does not support the RVA23 instruction set. This causes builds to fail unless you manually build and install a newer QEMU release.

:::

**Install the required tools:** Please install the following core components on your Linux development machine:

* `osc`: the command-line client for Open Build Service

* `obs-build`: the scripts developers use for local build environments

* `qemu-user`: the tool that emulates the RISC-V architecture

Using Fedora as an example:

```bash
sudo dnf install osc obs-build qemu-user
```

## Source Repositories and Git Workflow

Once you have identified the software package you want to create or modify, fork the corresponding repository on the Git platform to your personal account, then clone it locally.

We also recommend installing and enabling pre-commit hooks so the system can automatically check code style and basic issues before each commit:

```bash
pre-commit install
```

For more details, see the [Pre-commit Usage Guide](/docs/guide/pre-commit-usage-guide).

## Writing the RPM Spec File

Please write or modify the `.spec` file locally in accordance with the [openRuyi Packaging Specification](/docs/guide/packaging-guidelines). Once you finish, commit your changes and push them to your personal remote repository.

To reduce the workload, you may refer to build scripts from other distributions when writing our RPM Spec file, but you must not copy and paste them verbatim.

## Initializing an Open Build Service Project

You can access our build platform at: `https://build.openruyi.cn/`

If you already have an account, you can sign in directly. Otherwise, you will need to register for one first. After signing in, enter your home project: `home:<your-username>`.

For better organization, we recommend creating a dedicated subproject for each complex package or package set, rather than working directly under `home:<your-username>`.

For example, if I want to package or fix software related to `cryptsetup`, I would create a subproject named:

`home:<your-username>:cryptsetup`

## Configuring Build Architectures and Metadata

Open the subproject you just created, then go to the Repositories tab to configure it.

You need to add two build targets: `x86_64` and `riscv64`. Click **Add from a Project** and configure them as follows:

* Set **Project** to **openruyi**, **Repository** to **x86_64**, and choose any name you prefer, such as `amd64`. Under **Architectures**, select only `x86_64`.

* Likewise, set **Project** to **openruyi**, **Repository** to **riscv64**, and choose any name you prefer, such as `riscv64`. Under **Architectures**, select only `riscv64`.

After that, you must set additional attributes for both build targets. You cannot configure these options directly in the UI, so you need to open the **Meta** tab and edit the project metadata manually.

Add `rebuild="local"` and `block="local"` to each repository entry, as shown below:

```xml
<project name="home:<your-username>:<project-name>">
  <title>Your project title</title>
  <description>Your project description</description>
  <repository name="riscv64" rebuild="local" block="local">
    <path project="openruyi" repository="riscv64"/>
    <arch>riscv64</arch>
  </repository>
  <repository name="amd64" rebuild="local" block="local">
    <path project="openruyi" repository="x86_64"/>
    <arch>x86_64</arch>
  </repository>
</project>
```

This prevents the platform from automatically rebuilding the project whenever the referenced upstream project changes, thereby avoiding frequent rebuilds caused by minor upstream updates. It also makes dependency resolution prefer the current project, reducing the unpredictability introduced by cross-project build chains.

## Creating a Package and Connecting It to the Git Source

Next, you can add a package. Inside the project, click **Create Package** and enter the package name.

Then upload the locally prepared `_service` file. A sample configuration is shown below:

```xml title="_service"
<services>
  <service name="obs_scm">
    <param name="scm">git</param>
    <param name="url">https://github.com/misaka00251/openruyi.git</param>
    <param name="revision">add-cryptsetup</param>
    <param name="extract">core/cryptsetup/*</param>
  </service>
  <service name="download_files"/>
</services>
```

Here, `revision` is the branch name, and `extract` specifies that the build system should take only a particular subdirectory from the repository. Because we use a monorepo layout, you must set the correct directory.

Once you upload the file, the build system will fetch the corresponding Git source. If you encounter an error indicating that the system cannot retrieve the source, please check the access permissions of your Git repository and ensure that it is public.

### When the source code updates

If you update the source code in the Git repository and need to synchronise that change to the build platform, simply click **Trigger Services** in the left-hand sidebar.

## Configuring the Local OSC Client

To perform local verification builds and debugging, you must first configure your API credentials. Create or edit the `~/.config/osc/oscrc` file and fill in your OBS account information:

```toml
[general]
apiurl = https://build.openruyi.cn

[https://build.openruyi.cn]
user = your-username
pass = your-password
```

Alternatively, the first time you use `osc`, it will prompt you for this information, so creating the file manually is optional.

## Local Build Verification

> This section might not represent the most standard approach. If you have a better method, we welcome your suggestions.

First, check out the project locally with `osc checkout`:

```bash
# Format: osc co <Project>/<Package> && cd $_
osc co home:misaka00251:cryptsetup/cryptsetup && cd $_
```

Then run the service so you can download the source code from the build system:

```bash
osc up -S
```

After that, because the files the service downloads usually carry a prefix such as `_service:tar_scm:`, you need to rename them to standard filenames so that `obs-build` can recognise them properly:

```bash
rm -f _service; for file in `ls`; do new_file=${file##*:}; mv $file $new_file; done
```

Once you have everything ready, you can use `osc build` to invoke the local chroot build environment:

```bash
# Build for riscv64
osc build riscv64 riscv64

# Build for amd64
osc build amd64 x86_64
```

If the build succeeds, you will find the generated RPM packages under `/var/tmp/build-root/...` on your local machine. The build log will display the exact path near the end.
