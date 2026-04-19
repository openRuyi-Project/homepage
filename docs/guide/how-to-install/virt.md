---
id: how-to-use-openruyi-virt
title: How to use openRuyi in virt-manager
description: This section provides a guide on how to use openRuyi in virt-manager.
slug: /guide/how-to-install/virt
---

# How to use openRuyi in virt-manager

## Environment preparation

To use openRuyi in virt-manager, install the following packages:

- `libvirt` and `virt-manager`. Install them and enable the libvirt service.
- `qemu-system-riscv64` requires QEMU 10.1 or later. If your QEMU version is too old, you need to manually build QEMU or update your system version to support the RVA23S64 ISA. For example, Ubuntu requires version 25.10 or later.
- `qemu-efi-riscv64/edk2-riscv64`. EDK II is the reference implementation of the UEFI API. If your distribution does not package it, you can download the UEFI firmware from the [openRuyi download page](https://releases.openruyi.cn/creek/).

## Download the image

You will first need to obtain the openRuyi image files and the corresponding checksum files. Please visit our news site and refer to the latest release article, where you can find the ISO or qcow2 image and the checksums for the installation media.

We provide SHA256 checksums for all image files. You may use any tool that supports the SHA256 algorithm to verify the integrity of the downloaded files.

If the sha256sum command is available on your current system, place the checksum file in the same directory as the installation image and run the following command:
```sh
$ sha256sum openruyi-xxxx.xx-Server-dvd.iso
```

## Configure virt-manager

Open virt-manager, click `+` to create a new virtual machine, and select `riscv64` in the architecture option at the bottom.

![step1](/img/how-to-run/virt/image-1-create-vm.png)

Proceed to select the operating system type (you can specify Generic Linux 2024), memory and processor settings, and storage space. If you use a qcow2 image, you can specify it here. In Step 5, check `Customize configuration before install`, and then click Finish to enter the virtual machine details page.

![step5](/img/how-to-run/virt/image-2-customize-config.png)

### Configure the CPU

On the `CPUs` page, set Model to `rva23s64`. When virt-manager creates a virtual machine, even if you select rva23s64, it still uses Sv39 by default, which may cause some issues. To enable Sv48, add the following content to the CPU parameters:

```xml
  <cpu mode="custom" match="exact" check="none">
    <model fallback="allow">rva23s64</model>
    <feature policy="require" name="sv48"/>
  </cpu>
```

This is equivalent to `qemu-system-riscv64 -cpu rva23s64,sv48=on`.

![cpu](/img/how-to-run/virt/image-3-cpu-config.png)

### Configure the RISC-V EDK II firmware

:::warning
This subsection applies only to distributions that do not package the EDK2 firmware. If virt-manager reports that it cannot find a UEFI binary when creating the virtual machine, follow the steps below. If no such prompt appears, you can skip this section because virt-manager will automatically use the installed UEFI firmware.
:::

Because this part cannot be configured in the virt-manager graphical interface, you need to manually edit the libvirt XML.(Need to enable the XML editing option in virt-manager preference)

Modify the existing `<os>` node as follows, and update the paths to point to the UEFI EDK II firmware:

```xml
  <os>
    <type arch="riscv64" machine="virt">hvm</type>
    <loader readonly="yes" type="pflash" format="raw">/path/to/RISCV_VIRT_CODE.fd</loader>
    <nvram format="raw">/path/to/RISCV_VIRT_VARS.fd</nvram>
  </os>
```

![xml](/img/how-to-run/virt/image-7-edk2-xml.png)

### Configure the install image

If you use an openRuyi Server qcow2 image, you can skip the CDROM configuration in this section.

If you boot from an ISO image, as shown in the figure, click `Add Hardware` -> `Storage` -> `Select or create custom storage` to select the downloaded ISO image, and set `Device Type` to `CDROM Device`.

![CDROM](/img/how-to-run/virt/image-5-cdrom-storage.png)

After clicking Finish, adjust the boot order. In `Boot Options`, enable `Enable boot menu`, and place `SATA CDROM *` before the empty disk image `VirtIO Disk *` that was created when creating the virtual machine.

### Enable 3D graphics rendering (optional)

By enabling `virtio-gl`, you can use the virtual GPU for graphics rendering. This can avoid graphics rendering issues and accelerate graphics rendering. The host hardware must support OpenGL and have mesa installed.

In `Video Virtio`, check `3D acceleration`. Then, in `Display Spice`, set `Listen Type` to `None`, check `OpenGL`, and select the host display output device below.

![virtgl](/img/how-to-run/virt/image-6-virtio-gl.png)

### Start openRuyi

Click Start Installation. If there are no errors, the virtual machine will boot. In `View` -> `Consoles`, you can switch between graphical output and the serial console.

- If you use an ISO image, you can install openRuyi according to the version of the openRuyi image you downloaded. For reference, see installing openRuyi on physical machines: [Workstation Edition](./workstation) and [Server Edition](./server).
- If you use a qcow2 image, you can run openRuyi directly.
