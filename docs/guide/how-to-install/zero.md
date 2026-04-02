---
id: how-to-use-openruyi-zero
title: How to use openRuyi Zero
description: This section provides guide on how to use openRuyi Zero.
slug: /guide/how-to-install/zero
---

# How to use openRuyi Zero

This article explains how to use the openRuyi Zero Edition.

The openRuyi Zero edition is created to facilitate SoC bringup and kernel development, especially in the pre-Silicon stage. For more information please visit [here](https://github.com/openRuyi-Project/openRuyi-zero).

## Bootup

You can start openRuyi initramfs by providing it to your kernel through Devicetree or UEFI. This will depend on your device's boot process and thus is not described here.

Here's an example command for booting through QEMU with basic hardware emulation support for both CLI and GUI.

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

If kernel modules are required, read on.

### Using the pre-build kernel and module addons

You can use openRuyi-provided kernels and module addons. The release files with openRuyi kernels require module addons for hardware support such as USB or GPU.

As an example, to use the following kernel and module addon:

```
openRuyi-2026.03-zero.kernel
openRuyi-2026.03-zero.kernel-modules.cpio
```

You can concat the `.cpio` into the base initramfs to create the final initramfs, with a command like (replacing `/path/to/...` with actual paths):

```bash
$ cat /path/to/openruyi-base.cpio.gz /path/to/openRuyi-2026.03-zero.kernel-modules.cpio > final-initramfs.img
```

And use `final-initramfs.img` instead for booting. As an example, for QEMU, replace the final command line arguments with:

```bash
# ...
  -kernel /path/to/openRuyi-2026.03-zero.kernel \
  -initrd final-initramfs.img
```

## After boot

Since the initramfs contains a mostly complete system, it is larger than a typical initramfs and will take longer to boot with. Depending on your FPGA emulation speed, it may take a few minutes to fully unpack the initramfs.

On successful boot, you will see messages such as:

```
[   90.019455] Run /init as init process
Welcome to openRuyi

Please press Enter to activate this console.
```

Pressing Enter here on the terminal should bring up a root shell.

That's it. Welcome to openRuyi!
