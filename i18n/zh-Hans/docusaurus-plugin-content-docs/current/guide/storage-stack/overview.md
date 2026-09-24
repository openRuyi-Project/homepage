---
id: storage-stack-overview
title: 存储软件栈概览
description: 本文介绍 openRuyi 提供的存储软件栈及其测试情况。
slug: /guide/storage-stack/overview
sidebar_position: 1
---

# 存储软件栈概览

openRuyi 提供了一套从本地块设备到分布式存储的存储软件栈: io_uring、NVMe 等内核接口，文件系统与软件 RAID，网络存储协议，用户态 I/O 框架，存储加速库，以及 Ceph。这些软件包均在 riscv64 上原生构建。

本文列出各组件及已知限制，并介绍这套软件栈的测试情况。使用示例请参阅[使用存储软件栈](./quick-start.md)。

## 组件

软件包版本以仓库为准，可运行 `dnf info <软件包>` 查看当前可用的版本。

| 层次 | 软件包 | 说明 |
|---|---|---|
| 异步 I/O | `liburing` | io_uring 用户态库 |
| 性能测试 | `fio` | 灵活的 I/O 测试工具，也可用于数据校验 |
| NVMe | `nvme-cli`、`libnvme` | NVMe 管理，NVMe over Fabrics (TCP/RDMA/loop) 主机端工具 |
| 文件系统 | `xfsprogs`、`btrfs-progs`、`e2fsprogs` | 创建、检查与修复工具 |
| 软件 RAID 与卷管理 | `mdadm`、`lvm2`、`multipath-tools` | MD RAID、逻辑卷、多路径 |
| RDMA | `rdma-core`、`libibverbs-utils`、`librdmacm-utils`、`infiniband-diags` | Verbs/RDMA CM 库与工具，包括 Soft-RoCE (rxe) |
| 网络块存储 | `open-iscsi`、`libnbd`、`qemu-tools` | iSCSI initiator；NBD 客户端库及 `nbdcopy`/`nbdinfo`；`qemu-nbd` |
| 网络文件系统 | `nfs-client`、`nfs-kernel-server` | NFS 客户端与服务端 |
| 用户态 I/O 框架 | `dpdk`、`spdk` | 轮询模式报文处理；用户态 NVMe、NVMe-oF、iSCSI 与 vhost target |
| 加速库 | `isa-l`、`isa-l_crypto` | 纠删码、RAID、CRC、压缩；多缓冲哈希与 AES |
| 分布式存储 | `ceph` | RADOS、RBD、CephFS、RGW |

子包遵循通常的约定: 主包提供运行时库和守护进程，`-devel` 提供头文件和 `pkg-config` 文件，`-tools` 提供辅助命令行工具。

| 软件包 | 主包 | `-tools` 子包 |
|---|---|---|
| `dpdk` | `dpdk-testpmd`、`dpdk-proc-info`、PMD 库 | `dpdk-test`、`dpdk-dumpcap`、`dpdk-pdump`、`dpdk-graph`、`dpdk-test-*`、`dpdk-*.py` 脚本 (如 `dpdk-devbind.py`) |
| `spdk` | `spdk_tgt`、`nvmf_tgt`、`iscsi_tgt`、`vhost`、`spdk_*` 工具、`spdk-setup` | `spdk-rpc`、`spdk-cli`、`spdk-sma`、`spdk-mcp` |
| `isa-l` | `libisal` | `igzip` |

Ceph 拆分为 `ceph-common` (客户端工具)、`ceph-base`、`ceph-mon`、`ceph-mgr`、`ceph-osd`、`ceph-mds`、`ceph-radosgw`、`rbd-mirror`、`ceph-fuse` 等子包。纠删码插件 (包括 ISA-L 插件 `libec_isa.so`) 位于 `ceph-base` 中。

SPDK 构建时启用了 DPDK、RDMA、iSCSI initiator、io_uring 和 Ceph RBD 支持，并使用系统的 ISA-L 和 ISA-L crypto 库。

## 已知限制 {#known-limitations}

* **无法在 riscv64 上用 cephadm 部署集群。** 虽然提供了 `cephadm` 软件包，但 cephadm 通过容器镜像部署守护进程，而上游没有 riscv64 的 Ceph 容器镜像。请直接使用 RPM 软件包部署守护进程，参见[使用存储软件栈](./quick-start.md#ceph-single-node-test-cluster)。
* **未提供 Ceph mgr dashboard。** 构建时去掉了 dashboard 模块及其 Web 前端。`prometheus` 等其他 mgr 模块可以正常使用。
* Ceph 构建中**未启用 Crimson OSD 和基于 SPDK 的 BlueStore**。
* **DPDK 和 SPDK 需要大页内存**，绑定真实设备还需要平台提供 IOMMU/VFIO 或 UIO 支持。没有真实硬件时，使用虚拟设备 (`net_null`、malloc bdev、回环 NVMe-oF) 即可完成功能测试。

## 测试 {#testing}

存储软件栈由基于 tmt/fmf 和 beakerlib 的 [openruyi-autotest](https://git.openruyi.cn/woqidaideshi/openruyi-autotest) 测试套件覆盖，用例位于:

* `tests/functional/pkgs/`: `liburing`、`fio`、`nvme-cli`、`mdadm`、`xfsprogs`、`btrfs-progs`、`rdma-core`、`open-iscsi`、`libnbd`，以及 `storage-stack` 打包完整性检查，用于验证整个软件栈中所有 systemd unit 的 `Exec=` 与 udev 规则的 `RUN`/`PROGRAM` 目标都存在。
* `tests/feature/`: `dpdk`、`spdk`、`isa-l`、`isa-l_crypto` 和 `ceph`。其中包括一个端到端的单节点 Ceph 集群测试，覆盖 RADOS、RBD、基于 ISA-L 插件的纠删码池和 prometheus mgr 模块。

当硬件、内核模块或大页内存等前提条件缺失时，用例报告为 SKIP 而非 FAIL。完整用例列表请参阅测试仓库中的 `docs/coverage/storage-coverage_zh.md`。

## 报告问题

如果某个存储软件包在 openRuyi 上工作异常，请在 [openRuyi 仓库](https://github.com/openRuyi-Project/openRuyi)中提交 issue，并附上软件包名称、`rpm -q <软件包>` 与 `uname -r` 的输出，以及复现步骤。
