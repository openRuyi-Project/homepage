---
id: how-to-use-openruyi-qemu
title: How to use openRuyi in QEMU
description: This section provides a guide on how to use openRuyi in QEMU.
slug: /guide/how-to-install/qemu
---

# How to use openRuyi in QEMU

## Environment preparation

To use openRuyi in QEMU, install the following packages:

- `qemu-system-riscv64` requires QEMU 10.1 or later. If your QEMU version is preceding, you need to manually build QEMU or update your system version to support the RVA23S64 ISA. For example, Ubuntu requires version 25.10 or later has QEMU 10.1 or later.
- `qemu-efi-riscv64/edk2-riscv64` EDK II is the reference implementation of the UEFI API. If your distribution does not package it, you can download the UEFI firmware from the [openRuyi download page](https://releases.openruyi.cn/creek/).

## Download the image

[openRuyi-2026.03-Server-cloud.qcow2](https://releases.openruyi.cn/creek/2026.03/rva23/openRuyi-2026.03-Server-cloud.qcow2)

We provide SHA256 checksums for all image files. You may use any tool that supports the SHA256 algorithm to verify the integrity of the downloaded files.

If the sha256sum command is available on your current system, place the checksum file in the same directory as the installation image and run the following command:

```sh
$ sha256sum openRuyi-2026.03-Server-cloud.qcow2
```

## Run via QEMU

The command for qcow2 images is as follows:

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

Important options include:

- `-nographic` uses the current terminal to log in through the serial console. Remove this option to log in through the QEMU GUI.
- `-cpu` controls the emulated CPU architecture. `rva23s64` requires QEMU 10.1 or later.
- `-m` and `-smp` specify the amount of memory and the number of CPU cores available to openRuyi.
- `-blockdev node-name=pflash0,driver=file,read-only=on,filename="RISCV_VIRT_CODE.fd"` and `-blockdev node-name=pflash1,driver=file,filename="RISCV_VIRT_VARS.fd"` specify the [RISC-V EDK II firmware](https://github.com/tianocore/tianocore.github.io/wiki/RiscVPkg).
- `netdev user,id=usernet,hostfwd=tcp::12055-:22` configures QEMU port forwarding. You can log in with `ssh -p 12055 root@localhost`.

After startup, log in as user `root` with the default password `openruyi`. In the terminal, press `C-a x` to exit QEMU.
