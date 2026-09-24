---
id: storage-stack-quick-start
title: 使用存储软件栈
description: 本文给出 openRuyi 存储软件栈的使用示例，涵盖 io_uring、NVMe-oF、DPDK、SPDK 和 Ceph。
slug: /guide/storage-stack/quick-start
sidebar_position: 2
---

# 使用存储软件栈

本文通过一组简短的示例介绍 openRuyi 存储软件栈的用法。这些示例都不需要专门的存储或网络硬件，而是使用 loop 设备、虚拟设备和回环连接，因此可以在任意 openRuyi riscv64 物理机或虚拟机上运行，用来检查软件栈是否正常工作。[存储软件栈概览](./overview.md#testing)中介绍的自动化测试也覆盖了相同的场景。

请以具有 `sudo` 权限的用户运行这些示例。

## 大页内存 {#hugepages}

DPDK 和 SPDK 从大页内存中分配内存。请预留一些 2 MiB 大页，并确保已挂载 `hugetlbfs`:

```bash
echo 512 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
mountpoint -q /dev/hugepages || sudo mount -t hugetlbfs nodev /dev/hugepages
```

对于 SPDK，也可以用 `spdk-setup` 脚本完成同样的工作。`PCI_ALLOWED="none"` 可防止它把任何 PCI 设备从内核驱动上解绑:

```bash
sudo env HUGEMEM=1024 PCI_ALLOWED="none" spdk-setup
```

## io_uring 与 fio

安装 fio:

```bash
sudo dnf install fio
```

运行一个随机写任务，写入后用 CRC32C 校验每个块。只有所有块都校验通过时，fio 才以状态码 0 退出:

```bash
mkdir -p ~/fio-test
fio --name=verify --directory=$HOME/fio-test --ioengine=libaio \
    --direct=1 --rw=randwrite --bs=4k --size=32m \
    --verify=crc32c --verify_fatal=1 --do_verify=1
```

运行 `fio --enghelp` 可列出可用的 I/O 引擎，将 `--ioengine=libaio` 替换为 `io_uring`、`psync` 等其他引擎即可进行对比。如果目录位于 tmpfs 上，请使用 `--direct=0`，因为 tmpfs 不支持 `O_DIRECT`。

直接使用 io_uring 的应用程序需链接 `liburing`，它由 `liburing` 和 `liburing-devel` 软件包提供。

## NVMe over Fabrics 回环

内核 NVMe target (`nvmet`) 配合 `loop` 传输，可以在同一台机器上把一个块设备导出为 NVMe 命名空间，便于在没有 NVMe 硬盘的情况下试用 `nvme-cli`。

```bash
sudo dnf install nvme-cli
sudo modprobe nvmet
sudo modprobe nvme-loop
```

创建一个作为后端的 loop 设备，然后通过 configfs 配置 subsystem 和 port:

```bash
truncate -s 128M /tmp/nvmet.img
LOOPDEV=$(sudo losetup --find --show /tmp/nvmet.img)

NQN=nqn.2026-01.cn.openruyi:loop-test
SUBSYS=/sys/kernel/config/nvmet/subsystems/$NQN
PORT=/sys/kernel/config/nvmet/ports/1

sudo mkdir -p $SUBSYS/namespaces/1
echo 1 | sudo tee $SUBSYS/attr_allow_any_host
echo -n $LOOPDEV | sudo tee $SUBSYS/namespaces/1/device_path
echo 1 | sudo tee $SUBSYS/namespaces/1/enable

sudo mkdir -p $PORT
echo loop | sudo tee $PORT/addr_trtype
sudo ln -s $SUBSYS $PORT/subsystems/$NQN
```

连接并列出生成的 NVMe 设备:

```bash
sudo nvme connect -t loop -n $NQN -i 4
sudo nvme list
```

:::tip

`-i 4` 用于限制 I/O 队列数量。如果不指定，主机会为每个 CPU 创建一个队列，在核数较多的机器上可能连接失败。

:::

完成后清理:

```bash
sudo nvme disconnect -n $NQN
sudo rm $PORT/subsystems/$NQN
echo 0 | sudo tee $SUBSYS/namespaces/1/enable
sudo rmdir $SUBSYS/namespaces/1 $SUBSYS $PORT
sudo losetup -d $LOOPDEV
rm /tmp/nvmet.img
```

## Soft-RoCE

`rdma-core` 包含 Soft-RoCE (`rxe`) provider，它在普通以太网接口上实现 RDMA。无需 RDMA 网卡，即可用它测试 RDMA 应用，以及基于 RDMA 传输的 NVMe-oF 和 SPDK。

```bash
sudo dnf install rdma-core libibverbs-utils iproute2
sudo modprobe rdma_rxe
sudo rdma link add rxe0 type rxe netdev eth0
ibv_devinfo -d rxe0
```

请将 `eth0` 替换为一个处于 up 状态的接口名，端口状态应为 `PORT_ACTIVE`。要运行回环 ping-pong 测试，先用 `ibv_devinfo -v -d rxe0` 找到与 IPv4 地址对应的 GID 索引，然后启动服务端和客户端:

```bash
ibv_rc_pingpong -g <gid-index> -d rxe0 &
ibv_rc_pingpong -g <gid-index> -d rxe0 127.0.0.1
```

使用 `sudo rdma link delete rxe0` 删除该设备。

## DPDK

安装 DPDK 及其工具，并按[大页内存](#hugepages)一节预留大页:

```bash
sudo dnf install dpdk dpdk-tools
```

`dpdk-testpmd` 可以在两个 `net_null` 虚拟设备之间转发报文，从而在没有物理网卡的情况下验证 EAL、mempool 和 ethdev 层。运行几秒后按 `Ctrl+C` 停止:

```bash
sudo dpdk-testpmd -l 0-1 --no-pci --in-memory \
    --vdev=net_null0 --vdev=net_null1 -- \
    --total-num-mbufs=4096 --forward-mode=io --stats-period=1 \
    --auto-start --no-mlockall --nb-cores=1
```

`dpdk-tools` 中的 `dpdk-test` 包含 DPDK 的单元测试。例如，以下命令运行 ring 库的测试，成功时输出 `Test OK`:

```bash
sudo dpdk-test -l 0-1 --no-pci --in-memory -- ring_autotest
```

如需使用物理网卡，请用 `dpdk-tools` 中的 `dpdk-devbind.py` 将其绑定到 `vfio-pci`，这需要平台提供 IOMMU 支持。

## SPDK

安装 SPDK 及其工具，并按[大页内存](#hugepages)一节预留大页:

```bash
sudo dnf install spdk spdk-tools
```

在一个核上启动 SPDK target 应用。target 初始化需要几秒钟，第二条命令会等到它在 `/var/tmp/spdk.sock` 上响应 RPC 请求为止:

```bash
sudo spdk_tgt -m 0x1 &
until sudo spdk-rpc bdev_get_bdevs >/dev/null 2>&1; do sleep 1; done
```

### 创建 malloc bdev

malloc bdev 是以内存为后端的块设备。创建一个 64 MiB、块大小为 512 字节的 bdev 并列出它:

```bash
sudo spdk-rpc bdev_malloc_create -b Malloc0 64 512
sudo spdk-rpc bdev_get_bdevs
```

### 通过 NVMe-oF/TCP 导出

将该 bdev 通过 TCP 导出为 NVMe-oF subsystem，然后用内核的 NVMe/TCP 主机驱动连接:

```bash
NQN=nqn.2016-06.io.spdk:cnode1
sudo spdk-rpc nvmf_create_transport -t tcp
sudo spdk-rpc nvmf_create_subsystem $NQN -a -s SPDK00000000000001 -d SPDK_ctrl
sudo spdk-rpc nvmf_subsystem_add_ns $NQN Malloc0
sudo spdk-rpc nvmf_subsystem_add_listener $NQN -t tcp -a 127.0.0.1 -s 4421

sudo modprobe nvme-tcp
sudo nvme connect -t tcp -n $NQN -a 127.0.0.1 -s 4421 -i 4
sudo nvme list
```

新设备的序列号为 `SPDK00000000000001`。完成后断开连接并停止 target:

```bash
sudo nvme disconnect -n $NQN
sudo spdk-rpc spdk_kill_instance SIGTERM
```

`spdk-cli` 在同一套 RPC 接口之上提供了交互式 shell。

## ISA-L

`isa-l-tools` 提供 `igzip`，这是一个基于 ISA-L、与 gzip 兼容的压缩工具:

```bash
sudo dnf install isa-l-tools
igzip -k file.txt
gzip -dc file.txt.gz | cmp - file.txt
```

应用程序通过 `isa-l-devel` 和 `isa-l_crypto-devel` (`pkg-config` 模块 `libisal` 和 `libisal_crypto`) 使用 ISA-L 和 ISA-L crypto。

## Ceph 单节点测试集群 {#ceph-single-node-test-cluster}

由于没有 riscv64 的 Ceph 容器镜像，`cephadm` 无法在 riscv64 上使用 (参见[已知限制](./overview.md#known-limitations))。本节改为直接使用 RPM 软件包搭建一个最小的单节点集群，包含一个 monitor、一个 manager 和三个以文件为后端的 OSD。

:::danger 仅供评估

此配置使用单副本，所有守护进程以 root 身份运行，OSD 数据存放在稀疏文件中。请仅用于评估 Ceph 或测试应用程序。不要在 `/etc/ceph` 中已有 Ceph 配置的机器上运行。

:::

安装软件包。`/var/lib` 下需要约 4 GiB 可用空间:

```bash
sudo dnf install ceph-common ceph-base ceph-mon ceph-mgr ceph-osd
```

### Monitor

写入最小配置:

```bash
FSID=$(uuidgen)
HOST=$(uname -n | cut -d. -f1)
sudo mkdir -p /etc/ceph /var/lib/ceph/bootstrap-osd

sudo tee /etc/ceph/ceph.conf >/dev/null <<EOF
[global]
fsid = $FSID
mon initial members = $HOST
mon host = 127.0.0.1
public network = 127.0.0.0/8
auth cluster required = cephx
auth service required = cephx
auth client required = cephx
osd pool default size = 1
osd pool default min size = 1
osd crush chooseleaf type = 0
mon allow pool delete = true
osd memory target = 1073741824
EOF
```

创建 keyring 和 monitor map，然后启动 monitor:

```bash
sudo ceph-authtool --create-keyring /tmp/ceph.mon.keyring --gen-key -n mon. --cap mon 'allow *'
sudo ceph-authtool --create-keyring /etc/ceph/ceph.client.admin.keyring --gen-key -n client.admin \
    --cap mon 'allow *' --cap osd 'allow *' --cap mds 'allow *' --cap mgr 'allow *'
sudo ceph-authtool --create-keyring /var/lib/ceph/bootstrap-osd/ceph.keyring --gen-key \
    -n client.bootstrap-osd --cap mon 'profile bootstrap-osd' --cap mgr 'allow r'
sudo ceph-authtool /tmp/ceph.mon.keyring --import-keyring /etc/ceph/ceph.client.admin.keyring
sudo ceph-authtool /tmp/ceph.mon.keyring --import-keyring /var/lib/ceph/bootstrap-osd/ceph.keyring

sudo monmaptool --create --add $HOST 127.0.0.1 --fsid $FSID /tmp/monmap
sudo mkdir -p /var/lib/ceph/mon/ceph-$HOST
sudo ceph-mon --mkfs -i $HOST --monmap /tmp/monmap --keyring /tmp/ceph.mon.keyring
sudo ceph-mon -i $HOST --setuser root --setgroup root

sudo ceph -s
```

### Manager

```bash
sudo mkdir -p /var/lib/ceph/mgr/ceph-x
sudo ceph auth get-or-create mgr.x mon 'allow profile mgr' osd 'allow *' mds 'allow *' \
    -o /var/lib/ceph/mgr/ceph-x/keyring
sudo ceph-mgr -i x --setuser root --setgroup root
```

### OSD

创建三个 BlueStore OSD，每个以一个 8 GiB 的稀疏文件为后端:

```bash
sudo ceph osd crush add-bucket $HOST host
sudo ceph osd crush move $HOST root=default

for i in 1 2 3; do
    UUID=$(uuidgen)
    ID=$(sudo ceph osd new $UUID)
    DIR=/var/lib/ceph/osd/ceph-$ID
    sudo mkdir -p $DIR
    sudo truncate -s 8G $DIR/block
    sudo ceph-osd -i $ID --mkfs --mkkey --osd-uuid $UUID --no-mon-config --setuser root --setgroup root
    sudo ceph auth add osd.$ID osd 'allow *' mon 'allow profile osd' mgr 'allow profile osd' -i $DIR/keyring
    sudo ceph osd crush add osd.$ID 1.0 host=$HOST
    sudo ceph-osd -i $ID --setuser root --setgroup root
done

sudo ceph osd stat
```

稍等片刻，`ceph osd stat` 应显示 `3 up, 3 in`。

### 试用

用 RADOS 存入并读回一个对象:

```bash
sudo ceph osd pool create testpool 32 32
sudo ceph osd pool application enable testpool rados
head -c 1M /dev/urandom > /tmp/obj.in
sudo rados -p testpool put myobj /tmp/obj.in
sudo rados -p testpool get myobj /tmp/obj.out
cmp /tmp/obj.in /tmp/obj.out
```

创建一个使用 ISA-L 插件的纠删码池:

```bash
sudo ceph osd erasure-code-profile set isaprofile k=2 m=1 crush-failure-domain=osd plugin=isa
sudo ceph osd pool create ecpool 32 32 erasure isaprofile
sudo ceph osd pool application enable ecpool rados
sudo rados -p ecpool put ecobj /tmp/obj.in
```

创建一个 RBD 镜像，并通过 `rbd-nbd` (需要 `nbd` 内核模块) 或内核 RBD 客户端 (`rbd map`) 将其映射为块设备:

```bash
sudo ceph osd pool create rbdpool 32 32
sudo rbd pool init rbdpool
sudo rbd create --size 256 rbdpool/img0
sudo rbd-nbd map rbdpool/img0
```

启用 prometheus exporter，它在 9283 端口提供指标:

```bash
sudo ceph mgr module enable prometheus
curl -s http://127.0.0.1:9283/metrics | grep ^ceph_ | head
```

### 清理

```bash
sudo rbd-nbd unmap /dev/nbd0
sudo pkill -x ceph-osd; sudo pkill -x ceph-mgr; sudo pkill -x ceph-mon
sudo rm -rf /var/lib/ceph/mon/ceph-$HOST /var/lib/ceph/mgr/ceph-x /var/lib/ceph/osd/ceph-* \
    /var/lib/ceph/bootstrap-osd/ceph.keyring /etc/ceph/ceph.conf /etc/ceph/ceph.client.admin.keyring \
    /tmp/monmap /tmp/ceph.mon.keyring /tmp/obj.in /tmp/obj.out
```

请将 `/dev/nbd0` 替换为 `rbd-nbd map` 输出的设备。

## 延伸阅读

* [io_uring (liburing)](https://github.com/axboe/liburing)
* [fio 文档](https://fio.readthedocs.io/)
* [DPDK 文档](https://doc.dpdk.org/)
* [SPDK 文档](https://spdk.io/doc/)
* [ISA-L](https://github.com/intel/isa-l) 与 [ISA-L crypto](https://github.com/intel/isa-l_crypto)
* [Ceph 文档](https://docs.ceph.com/)
