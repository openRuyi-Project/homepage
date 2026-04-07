---
id: how-to-use-openruyi-container
title: 如何在容器内使用 openRuyi
description: 这篇文章教学如何在容器内使用 openRuyi。
slug: /guide/how-to-install/container
---

# 如何在容器内使用 openRuyi

## 环境准备

非 RISC-V 的架构的环境需要使用 Docker 或 Podman 运行注册工具。

```bash
$ docker run --privileged --rm tonistiigi/binfmt --install all
```

## 使用 Docker 或 Podman 运行

真的很简单！只需要拉取我们最新的 Docker 镜像，Podman 用户将 docker 替换为 podman 即可使用。

```bash
$ docker pull ghcr.io/openruyi-project/creek:latest
```

然后运行即可。欢迎使用 openRuyi！

```bash
$ docker run -it ghcr.io/openruyi-project/creek:latest
```

推荐添加 --rm 参数，退出即销毁，不占用空间。

![Container Image](/img/how-to-run/container/image.jpg)

## 使用 systemd-nspawn 运行

创建目标目录。

```bash
$ mkdir -p openruyi-nspawn
```

解压压缩包。

```bash
$ tar -xf openRuyi-2026.03-rootfs.tar.zst -C openruyi-nspawn --numeric-owner
```

使用 systemd-nspawn 启动。

```bash
$ systemd-nspawn -D openruyi-nspawn
```

![nspawn Image](/img/how-to-run/container/nspawn.png)

## 需要单独下载 Rootfs？

如果您因某些原因需要单独下载 rootfs，请访问我们的新闻页，在最新的版本文章下方获取下载链接。
