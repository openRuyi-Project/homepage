---
id: how-to-use-openruyi-qemu
title: 如何在 QEMU 内使用 openRuyi
description: 这篇文章教学如何在 QEMU 内使用 openRuyi。
slug: /guide/how-to-install/qemu
---

# 如何在 QEMU 内使用 openRuyi

## 环境准备

要在 QEMU 内使用 openRuyi, 需要安装如下软件包

- `qemu-system-riscv64` 需要使用 QEMU 10.1 或更高版本,若版本过低需要手动编译或更新系统版本来支持 RVA23S64 ISA(例如 Ubuntu 需要 25.10 及更高版本)
- `qemu-efi-riscv64/edk2-riscv64` EDK II 是 UEFI API 的参考实现,若发行版未打包,则可在[openRuyi 下载页](https://releases.openruyi.cn/creek/)下载 UEFI 固件

## 下载镜像 

[openRuyi-2026.03-Server-cloud.qcow2](https://releases.openruyi.cn/creek/2026.03/rva23/openRuyi-2026.03-Server-cloud.qcow2)

我们对于所有的镜像文件都提供了安装映像的基于 SHA256 算法的校验和。您可以使用任何支持该算法的检验工具来检查文件校验和是否正确。

如果您正在使用的系统上安装了 sha256sum 命令，则可以将校验和文件放在安装映像的同一个目录下，然后运行一下命令来验证:

```sh
$ sha256sum openRuyi-2026.03-Server-cloud.qcow2
```

## 通过 QEMU 运行

适用于 qcow2 镜像的命令如下

```sh
qemu-system-riscv64 \
  -nographic -machine virt,pflash0=pflash0,pflash1=pflash1 \
  -smp 8 -m 12G \
  -cpu rva23s64 \
  -blockdev node-name=pflash0,driver=file,read-only=on,filename="RISCV_VIRT_CODE.fd" \
  -blockdev node-name=pflash1,driver=file,filename="RISCV_VIRT_VARS.fd" \
  -drive file="openRuyi-2026.03-Server-cloud.qcow2",format=qcow2,id=hd0,if=none \
  -object rng-random,filename=/dev/urandom,id=rng0 \
  -device virtio-vga \
  -device virtio-rng-device,rng=rng0 \
  -device virtio-blk-device,drive=hd0 \
  -device virtio-net-device,netdev=usernet \
  -netdev user,id=usernet,hostfwd=tcp::12055-:22 \
  -device qemu-xhci -usb -device usb-kbd -device usb-tablet
```

重要的选项包括

- `-nographic` 使用当前终端登录串口,删除后可使用 QEMU GUI 登录
- `-cpu` 控制模拟的 CPU 架构, rva23s64 需要 QEMU 10.1 或更高版本
- `-m` `-smp` 指定 openRuyi 可使用的内存和 CPU 核心数量
- `-blockdev node-name=pflash0,driver=file,read-only=on,filename="RISCV_VIRT_CODE.fd"`, `-blockdev node-name=pflash1,driver=file,filename="RISCV_VIRT_VARS.fd"` 指定[RISCV EDK II 固件](https://github.com/tianocore/tianocore.github.io/wiki/RiscVPkg)
- `netdev user,id=usernet,hostfwd=tcp::12055-:22` 配置 QEMU 端口转发,可通过`ssh -p 12055 root@localhost`登录

启动后,使用用户`root`登录,默认密码为`openruyi`,在终端中可按`C-a x`退出 QEMU

