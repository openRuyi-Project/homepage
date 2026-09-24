---
id: storage-stack-overview
title: Storage Stack Overview
description: This section introduces the storage software stack shipped by openRuyi and how it is tested.
slug: /guide/storage-stack/overview
sidebar_position: 1
---

# Storage Stack Overview

openRuyi ships a storage software stack that reaches from local block devices to distributed storage: kernel interfaces such as io_uring and NVMe, file systems and software RAID, network storage protocols, user-space I/O frameworks, storage acceleration libraries, and Ceph. All of these packages are built natively for riscv64.

This article lists the components and their known limitations, and describes how the stack is tested. For hands-on examples, see [Using the Storage Stack](./quick-start.md).

## Components

The versions follow the repository. Run `dnf info <package>` to see the version currently available.

| Layer | Packages | Description |
|---|---|---|
| Asynchronous I/O | `liburing` | io_uring user-space library |
| Benchmarking | `fio` | Flexible I/O tester, also used for data verification |
| NVMe | `nvme-cli`, `libnvme` | NVMe management, NVMe over Fabrics (TCP/RDMA/loop) host tools |
| File systems | `xfsprogs`, `btrfs-progs`, `e2fsprogs` | Creation, checking and repair tools |
| Software RAID and volumes | `mdadm`, `lvm2`, `multipath-tools` | MD RAID, logical volumes, multipath |
| RDMA | `rdma-core`, `libibverbs-utils`, `librdmacm-utils`, `infiniband-diags` | Verbs/RDMA CM libraries and tools, including Soft-RoCE (rxe) |
| Network block storage | `open-iscsi`, `libnbd`, `qemu-tools` | iSCSI initiator; NBD client library and `nbdcopy`/`nbdinfo`; `qemu-nbd` |
| Network file systems | `nfs-client`, `nfs-kernel-server` | NFS client and server |
| User-space I/O frameworks | `dpdk`, `spdk` | Poll-mode packet processing; user-space NVMe, NVMe-oF, iSCSI and vhost targets |
| Acceleration libraries | `isa-l`, `isa-l_crypto` | Erasure code, RAID, CRC, compression; multi-buffer hashing and AES |
| Distributed storage | `ceph` | RADOS, RBD, CephFS, RGW |

Subpackages follow the usual convention: the main package provides the runtime libraries and daemons, `-devel` provides headers and `pkg-config` files, and `-tools` provides auxiliary command-line tools.

| Package | Main package | `-tools` subpackage |
|---|---|---|
| `dpdk` | `dpdk-testpmd`, `dpdk-proc-info`, PMD libraries | `dpdk-test`, `dpdk-dumpcap`, `dpdk-pdump`, `dpdk-graph`, `dpdk-test-*`, `dpdk-*.py` scripts (such as `dpdk-devbind.py`) |
| `spdk` | `spdk_tgt`, `nvmf_tgt`, `iscsi_tgt`, `vhost`, `spdk_*` tools, `spdk-setup` | `spdk-rpc`, `spdk-cli`, `spdk-sma`, `spdk-mcp` |
| `isa-l` | `libisal` | `igzip` |

Ceph is split into `ceph-common` (client tools), `ceph-base`, `ceph-mon`, `ceph-mgr`, `ceph-osd`, `ceph-mds`, `ceph-radosgw`, `rbd-mirror`, `ceph-fuse` and others. The erasure code plugins, including the ISA-L plugin `libec_isa.so`, are shipped in `ceph-base`.

SPDK is built with DPDK, RDMA, iSCSI initiator, io_uring and Ceph RBD support, and uses the system ISA-L and ISA-L crypto libraries.

## Known Limitations {#known-limitations}

* **cephadm cannot deploy clusters on riscv64.** The `cephadm` package is available, but cephadm deploys daemons from container images, and there is no upstream riscv64 Ceph container image. Deploy daemons from the RPM packages directly instead, as shown in [Using the Storage Stack](./quick-start.md#ceph-single-node-test-cluster).
* **The Ceph mgr dashboard is not shipped.** The build leaves out the dashboard module and its web frontend. Other mgr modules such as `prometheus` work.
* **Crimson OSD and SPDK-backed BlueStore are not enabled** in the Ceph build.
* **DPDK and SPDK need hugepages**, and binding real devices requires IOMMU/VFIO or UIO support from the platform. Without real hardware, virtual devices (`net_null`, malloc bdev, NVMe-oF over loopback) are enough for functional testing.

## Testing {#testing}

The storage stack is covered by the [openruyi-autotest](https://git.openruyi.cn/woqidaideshi/openruyi-autotest) suite, which is based on tmt/fmf and beakerlib. The cases are located in:

* `tests/functional/pkgs/`: `liburing`, `fio`, `nvme-cli`, `mdadm`, `xfsprogs`, `btrfs-progs`, `rdma-core`, `open-iscsi`, `libnbd`, and a `storage-stack` packaging integrity check that verifies every systemd unit `Exec=` and udev `RUN`/`PROGRAM` target of the stack exists.
* `tests/feature/`: `dpdk`, `spdk`, `isa-l`, `isa-l_crypto` and `ceph`. These include an end-to-end single-node Ceph cluster test covering RADOS, RBD, erasure-coded pools on the ISA-L plugin and the prometheus mgr module.

A case is reported as SKIP rather than FAIL when a prerequisite such as hardware, a kernel module or hugepages is missing. See `docs/coverage/storage-coverage.md` in the test repository for the full list of cases.

## Reporting Issues

If a storage package misbehaves on openRuyi, open an issue in the [openRuyi repository](https://github.com/openRuyi-Project/openRuyi) with the package name, the output of `rpm -q <package>`, the output of `uname -r`, and the steps to reproduce.
