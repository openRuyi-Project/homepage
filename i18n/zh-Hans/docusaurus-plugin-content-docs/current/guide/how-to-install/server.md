---
id: how-to-install-openruyi-server
title: 如何安装 openRuyi 服务器版
description: 这篇文章教学如何安装 openRuyi 服务器版。
slug: /guide/how-to-install/server
---

# 如何安装 openRuyi 服务器版

本文章介绍了如何启动 openRuyi 的服务器版本。openRuyi 的服务器版为物理服务器、虚拟机及边缘计算节点提供了标准的操作系统环境。

## 安装准备

您需要先获取 openRuyi 的镜像文件和对应校验文件，这些文件可在 [openRuyi 下载页](https://releases.openruyi.cn/creek/)获取。

## 完整性校验

我们对于所有的镜像文件都提供了安装映像的基于 SHA256 算法的校验和。您可以使用任何支持该算法的检验工具来检查文件校验和是否正确。

如果您正在使用的系统上安装了 sha256sum 命令，则可以将校验和文件放在安装映像的同一个目录下，然后运行一下命令来验证:

```bash
$ sha256sum openruyi-xxxx.xx-Server-dvd.iso
```

## 安装要求

在开始安装之前，您需要注意以下事项:

* 准备一张 DVD 或一个 USB 闪存盘 (U 盘)，用于刷写 ISO 安装镜像。

  * 如果您在 SG2044 上安装，可以准备一条 NVMe 固态硬盘，用于刷写 ISO 安装镜像。.时，需要准备一个 SD 卡，用于刷写 [EDK2 固件](https://github.com/revyos/firmware-sg204x/releases/download/20260212/firmware_edk2-sg2044-single-revyos_6.18.y-sg204x-v1.8.1-rva23.img)。

* 准备一个磁盘用于安装 openRuyi 系统。注意，该盘的内容会被覆盖，请提前备份数据。

:::warning 注意

该盘的内容会被覆盖，请提前备份数据。

:::

## 从安装介质启动

要启动安装过程，将 DVD 放入您的 DVD 光驱 (或插入 USB 闪存盘等其它安装介质)，随后通电启动即可。

* 如果您在 SG2044 上安装，安装好带有安装镜像的 NVMe 固态硬盘和 SD 卡即可。

## 开始安装系统

如果出现以下图示的信息，则代表已成功启动安装介质。

![GRUB image](/img/how-to-run/server/image-1-grub.png)

正如提示信息所示，使用向上、向下和回车键来选择想要的选项，这里我们选择 "Install openRuyi-RISCV"。

### 配置存储空间

下一步是配置存储。请仔细选择需要使用哪块磁盘来安装 openRuyi 的系统。

:::danger 注意

选择好磁盘并回车之后，整块磁盘将会被格式化。

:::

![Disk select image](/img/how-to-run/server/image-2-disk-select.png)

### 写入磁盘

安装向导搜集完所有的所需信息后，屏幕将显示安装程序的进度。

![Installation progress image](/img/how-to-run/server/image-3-installation-progress.png)

安装向导会安装一套服务器所需的精简而实用的软件，在安装成功之后，您也可以根据需要安装任何其它软件。

### 安装成功

在安装成功后，系统会自动重启，请记得移除安装介质。如果看到这个画面，代表已经安装成功了，欢迎使用 openRuyi！

![Installation finish image](/img/how-to-run/server/image-4-grub-after-install.png)

## 进入系统

系统启动后，可以登录以下的两个用户:

 - `root` / `openruyi`
 - `openruyi` / `openruyi`

:::warning 注意

`root` 用户不能通过 ssh 远程登录。

:::
