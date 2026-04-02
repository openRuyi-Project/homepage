---
id: how-to-use-openruyi-zero
title: 如何使用 openRuyi Zero
description: 这篇文章教学如何使用 openRuyi Zero。
slug: /guide/how-to-install/zero
---

# 如何使用 openRuyi Zero

本文章介绍了如何使用 openRuyi Zero。

openRuyi Zero 旨在简化硅前验证与内核开发。如需了解更多，请访问[这里](https://github.com/openRuyi-Project/openRuyi-zero)。

## 启动

您可以通过设备树或者 UEFI 将 openRuyi 的 initramfs 提供给内核，以启动 openRuyi。具体采用哪种方式取决于设备自身的启动流程，因此本文不再展开说明。

下面是一个通过 QEMU 启动的命令例子，既支持 CLI 又支持 GUI。

```bash
$ qemu-system-riscv64 \
  -M virt -smp 1 -m 4G -cpu rva23s64 \
  -object rng-random,filename=/dev/urandom,id=rng0 \
  -device virtio-rng-device,rng=rng0 \
  -device virtio-net-device,netdev=usernet \
  -netdev user,id=usernet,hostfwd=tcp::12055-:22 \
  -display sdl,gl=on -device virtio-gpu-gl-pci \
  -device qemu-xhci -usb -device usb-kbd -device usb-mouse \
  -serial mon:stdio \
  -kernel /path/to/your-kernel \
  -initrd /path/to/openruyi-base.cpio.gz
```

如果需要内核模块，请继续阅读。

### 使用预构建内核与模块附加包

openRuyi 内核的发布文件通常需要配合模块附加包使用，以提供 USB、GPU 等硬件支持。我们提供了这些文件。

例如，如果想使用如下的内核与模块附加包:

```
openRuyi-2026.03-zero.kernel
openRuyi-2026.03-zero.kernel-modules.cpio
```

您可以将这个 `.cpio` 文件拼接到基础 initramfs 后面，生成最终使用的 initramfs，例子如下:

```bash
$ cat /path/to/openruyi-base.cpio.gz /path/to/openRuyi-2026.03-zero.kernel-modules.cpio > final-initramfs.img
```

请将 `/path/to/...` 替换为实际路径。

之后，在启动时使用 `final-initramfs.img`，替换原先的 initramfs 即可。以 QEMU 为例，可将命令末尾替换为:

```bash
# ...
  -kernel /path/to/openRuyi-2026.03-zero.kernel \
  -initrd final-initramfs.img
```

## 启动后

由于该 initramfs 内含一个相对完整的系统，因此相比传统 initramfs 体积更大，启动所需时间也会更长。具体耗时需取决于 FPGA 仿真的运行速度，完整解包 initramfs 可能需要几分钟。

启动成功后，您将看到类似如下的信息:

```
[   90.019455] Run /init as init process
Welcome to openRuyi

Please press Enter to activate this console.
```

此时，在终端中按下 Enter，即可进入 root shell。

至此。openRuyi 已经启动成功。欢迎使用 openRuyi！
