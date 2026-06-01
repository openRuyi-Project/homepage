---
id: how-to-install-openruyi-workstation
title: How to install openRuyi Workstation
description: This section provides guide on how to install openRuyi Workstation.
slug: /guide/how-to-install/workstation
---

# How to install openRuyi Workstation

This article explains how to install and use the openRuyi Workstation Edition. The Workstation Edition provides a standard desktop operating system environment.

## Before You Begin

You will first need to obtain the openRuyi image files and the corresponding checksum files from the [openRuyi download page](https://releases.openruyi.cn/creek/).

## Verify Image Integrity

We provide SHA256 checksums for all image files. You may use any tool that supports the SHA256 algorithm to verify the integrity of the downloaded files.

If the sha256sum command is available on your current system, place the checksum file in the same directory as the installation image and run the following command:

```bash
$ sha256sum openRuyi-xxxx.xx-Workstation-labwc-dvd.iso
```

## Installation Requirements

Before starting the installation, please note the following:

* Prepare either a DVD or a USB flash drive to write the ISO installation image.

  * If you are installing on SG2044, you may instead prepare an NVMe SSD for the ISO installation image. Additionally, you will need an SD card for the [EDK2 firmware](https://github.com/revyos/firmware-sg204x/releases/download/20260212/firmware_edk2-sg2044-single-revyos_6.18.y-sg204x-v1.8.1-rva23.img).

* Prepare another drive as the target disk for the openRuyi system.

:::warning Warning

All data on the target disk will be overwritten. Please back up any important data in advance.

:::

## Boot from the Installation Media

To start the installation process, insert the DVD into the optical drive, or connect the USB flash drive or other installation media, and then power on the machine.

* If you are installing on SG2044, simply install the NVMe SSD containing the installation image together with the SD card.

## Install the System

If the following screen appears, the installation media has booted successfully.

![GRUB image](/img/how-to-run/workstation/image-1-grub.png)

As indicated on the screen, use the **Up Arrow**, **Down Arrow**, and **Enter** keys to select the desired option. Here, choose **`Install openRuyi`**.

Click the desktop, then select Launcher from the pop-up menu.

![Desktop image](/img/how-to-run/workstation/image-2.png)

Select Install System.

![Desktop image](/img/how-to-run/workstation/image-3.png)

### Configuration

Wait a moment for the installer to launch, then select your language.

![Installer image](/img/how-to-run/workstation/image-4-installer.png)

On the next page, select your time zone.

![Timezone image](/img/how-to-run/workstation/image-5-timezone.png)

Then select your keyboard layout.

![Keyboard image](/img/how-to-run/workstation/image-6-keyboard.png)

The next step is storage configuration. Carefully select the target disk on which openRuyi will be installed.

![Partition image](/img/how-to-run/workstation/image-7-partition.png)

Select which software you want to install.

![Package image](/img/how-to-run/workstation/image-8-package.png)

Finally, set up your account infomation.

![Users image](/img/how-to-run/workstation/image-9-users.png)

Before clicking install, please double-check your partition layout.

:::danger Warning

Once it's confirmed, the entire disk will be formatted.

:::

![Users image](/img/how-to-run/workstation/image-10-summary.png)

### Write the System to Disk

After the installer has collected all required information, it will begin writing the system to disk and display the installation progress.

![Installation progress image](/img/how-to-run/workstation/image-11-install.png)

### Installation Complete

Once installation is complete, you can reboot the system. Please remember to remove the installation media.

![Install finish image](/img/how-to-run/workstation/image-12-finish.png)

If you see the following screen, the installation has completed successfully. Welcome to openRuyi!

![Installation finish image](/img/how-to-run/workstation/image-13-grub-after-install.png)
