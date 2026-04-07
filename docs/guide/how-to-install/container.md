---
id: how-to-use-openruyi-container
title: How to use openRuyi in Container
description: This section provides guide on how to use openRuyi in Container.
slug: /guide/how-to-install/container
---

# How to use openRuyi in Container

## Prerequisites

For non-RISC-V architectures, you must run the registration tool via Docker or Podman.

```bash
$ docker run --privileged --rm tonistiigi/binfmt --install all
```

## Running with Docker or Podman

It's really simple! Just pull our latest docker image, Podman users can simply replace docker with podman.

```bash
$ docker pull ghcr.io/openruyi-project/creek:latest
```

Then run it. And voila, welcome to openRuyi!

```bash
$ docker run -it ghcr.io/openruyi-project/creek:latest
```

We recommend adding the --rm flag to automatically remove the container upon exit, saving disk space.

![Container Image](/img/how-to-run/container/image.jpg)

## Running with systemd-nspawn

Create the target directory.

```bash
$ mkdir -p openruyi-nspawn
```

Extract the rootfs archive.

```bash
$ tar -xf openRuyi-2026.03-rootfs.tar.zst -C openruyi-nspawn --numeric-owner
```

Start with systemd-nspawn.

```bash
$ systemd-nspawn -D openruyi-nspawn
```

![nspawn Image](/img/how-to-run/container/nspawn.png)

## Need the Rootfs Instead?

If you need to download the rootfs separately for any reason, please visit our news site and refer to the latest release article for download links.
