---
id: how-to-use-openruyi-virt
title: 如何在 virt-manager 内使用 openRuyi
description: 这篇文章介绍如何在 virt-manager 内使用 openRuyi。
slug: /guide/how-to-install/virt
---

# 如何在 virt-manager 内使用 openRuyi

## 环境准备

要在 virt-manager 内使用 openRuyi，需要安装如下软件包。

- `libvirt`、`virt-manager` 安装并启用 libvirt 服务。
- `qemu-system-riscv64` 需要使用 QEMU 10.1 或更高版本，若版本过低需要手动编译或更新系统版本来支持 RVA23S64 ISA（例如 Ubuntu 需要 25.10 及更高版本）。
- `qemu-efi-riscv64/edk2-riscv64` EDK II 是 UEFI API 的参考实现，若发行版未打包，则可在 [openRuyi 下载页](https://releases.openruyi.cn/creek/)下载 UEFI 固件。

## 下载镜像 

您需要先获取 openRuyi 的镜像文件和对应校验文件，其中 ISO 可用于安装 openRuyi，qcow2 可直接启动 openRuyi，请访问我们的新闻页，在最新的版本文章下方获取 ISO 或 qcow2 文件以及相应的安装映像的校验和。

我们对于所有的镜像文件都提供了安装映像的基于 SHA256 算法的校验和。您可以使用任何支持该算法的检验工具来检查文件校验和是否正确。

如果您正在使用的系统上安装了 sha256sum 命令，则可以将校验和文件放在安装映像的同一个目录下，然后运行一下命令来验证：
```sh
$ sha256sum openruyi-xxxx.xx-Server-dvd.iso
```

## 配置 virt-manager

进入 virt-manager 点击“+”创建新的虚拟机，在下方架构选项中选择架构：`riscv64`。

![step1](/img/how-to-run/virt/image-1-create-vm.png)

前进选择系统种类（可指定为 Generic Linux 2024）、内存和处理器设置、存储空间（若使用 qcow2 可在此指定），在 Step 5 中勾选 `Customize configuration before install` 后点击完成进入虚拟机详细设置界面。

![step5](/img/how-to-run/virt/image-2-customize-config.png)

### 配置 CPU
在 `CPUs` 页面中配置 Model 为`rva23s64`，virt-manager 默认创建虚拟机时如果选择了 rva23s64，默认仍然会采用 Sv39，这可能会造成一些问题，开启 Sv48 则需要在 CPU 参数部分添加如下内容：

```xml
  <cpu mode="custom" match="exact" check="none">
    <model fallback="allow">rva23s64</model>
    <feature policy="require" name="sv48"/>
  </cpu>
```

其等价于 `qemu-system-riscv64 -cpu rva23s64,sv48=on`。

![cpu](/img/how-to-run/virt/image-3-cpu-config.png)

### 配置 RISCV EDK II 固件

:::warning
此小节仅适用于发行版没有打包 EDK2 固件的发行版，若创建虚拟机时 virt-manager 提示找不到 UEFI 二进制，则请按照以下步骤操作；若没有相关提示，可跳过这一节，virt-manager 会自动使用已安装的 UEFI 固件。
:::

该选项在 virt-manager 图形界面内无法配置，需要手动修改 libvirt XML（需要在 virt-manager 中启用 XML 编辑选项）。

在现有 `<os>` 节点中修改为如下配置，并修改指向 UEFI EDK II 固件的路径。

```xml
  <os>
    <type arch="riscv64" machine="virt">hvm</type>
    <loader readonly="yes" type="pflash" format="raw">/path/to/RISCV_VIRT_CODE.fd</loader>
    <nvram format="raw">/path/to/RISCV_VIRT_VARS.fd</nvram>
  </os>
```

![xml](/img/how-to-run/virt/image-7-edk2-xml.png)

### 配置安装盘

如使用 openRuyi server qcow2 可跳过本节的 CDROM 配置。

如使用 ISO 镜像进行启动，如图所示，需要依次点击 `Add Hardware`、`Storage`、`Select or create custom storage` 选择下载的 ISO 镜像，并将 `Device Type` 置于 `CDROM Device`。

![CDROM](/img/how-to-run/virt/image-5-cdrom-storage.png)

点击完成后，需要调整启动顺序，在 `Boot Options` 启用 `Enable boot menu`，将 `SATA CDROM *` 至于在虚拟机创建引导时创建的空硬盘镜像 `VirtIO Disk *`之前。

### 启用 3D 图形渲染（可选）

通过启用 `virtio-gl` 可使用虚拟 GPU 进行图形渲染，避免图形渲染问题并加速图形渲染（需要宿主机硬件支持 OpenGL 并安装 mesa）。

在 `Video Virtio` 中勾选启用 `3D acceleration`，然后在 `Display Spice` 将 `Listen Type` 修改为  `None` 并勾选 `OpenGL`，在下方选择宿主机的显示输出设备。

![virtgl](/img/how-to-run/virt/image-6-virtio-gl.png)

### 启动 openRuyi

点击开始安装后无报错会进行启动，在 `View` 菜单中选择 `Consoles` 可切换显示图形输出或串口控制台。

- 如使用 iso 镜像，稍后可根据您下载的 openRuyi 镜像版本进行安装，可参考在实机安装 openRuyi [工作站版](./workstation)、[服务器版](./server)。
- 如使用 qcow2，则可直接使用 openRuyi。
