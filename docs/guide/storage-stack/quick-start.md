---
id: storage-stack-quick-start
title: Using the Storage Stack
description: This section provides hands-on examples of the openRuyi storage stack, from io_uring and NVMe-oF to DPDK, SPDK and Ceph.
slug: /guide/storage-stack/quick-start
sidebar_position: 2
---

# Using the Storage Stack

This article gives short examples for the openRuyi storage stack. None of them need dedicated storage or network hardware: they use loop devices, virtual devices and loopback connections, so they can be run on any openRuyi riscv64 machine or virtual machine to check that the stack works. The same scenarios are covered by the automated tests described in [Storage Stack Overview](./overview.md#testing).

Run the examples as a user with `sudo` privileges.

## Hugepages {#hugepages}

DPDK and SPDK allocate their memory from hugepages. Reserve some 2 MiB hugepages and make sure `hugetlbfs` is mounted:

```bash
echo 512 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
mountpoint -q /dev/hugepages || sudo mount -t hugetlbfs nodev /dev/hugepages
```

For SPDK, the `spdk-setup` script can do the same. `PCI_ALLOWED="none"` keeps it from unbinding any PCI device from its kernel driver:

```bash
sudo env HUGEMEM=1024 PCI_ALLOWED="none" spdk-setup
```

## io_uring and fio

Install fio:

```bash
sudo dnf install fio
```

Run a random write job that verifies every block with CRC32C after writing it. fio exits with status 0 only if every block is verified:

```bash
mkdir -p ~/fio-test
fio --name=verify --directory=$HOME/fio-test --ioengine=libaio \
    --direct=1 --rw=randwrite --bs=4k --size=32m \
    --verify=crc32c --verify_fatal=1 --do_verify=1
```

Run `fio --enghelp` to list the available I/O engines, and replace `--ioengine=libaio` with another one, such as `io_uring` or `psync`, to compare them. If the directory is on tmpfs, use `--direct=0`, since tmpfs does not support `O_DIRECT`.

Applications that use io_uring directly link against `liburing`, which is provided by the `liburing` and `liburing-devel` packages.

## NVMe over Fabrics Loopback

The kernel NVMe target (`nvmet`) with the `loop` transport exports a block device as an NVMe namespace on the same machine, so you can try `nvme-cli` without an NVMe drive.

```bash
sudo dnf install nvme-cli
sudo modprobe nvmet
sudo modprobe nvme-loop
```

Create a backing loop device, then configure a subsystem and a port through configfs:

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

Connect to it and list the resulting NVMe device:

```bash
sudo nvme connect -t loop -n $NQN -i 4
sudo nvme list
```

:::tip

`-i 4` limits the number of I/O queues. Without it, the host creates one queue per CPU, which can fail on machines with many cores.

:::

Clean up afterwards:

```bash
sudo nvme disconnect -n $NQN
sudo rm $PORT/subsystems/$NQN
echo 0 | sudo tee $SUBSYS/namespaces/1/enable
sudo rmdir $SUBSYS/namespaces/1 $SUBSYS $PORT
sudo losetup -d $LOOPDEV
rm /tmp/nvmet.img
```

## Soft-RoCE

`rdma-core` includes the Soft-RoCE (`rxe`) provider, which implements RDMA over an ordinary Ethernet interface. It can be used to test RDMA applications, as well as NVMe-oF and SPDK over the RDMA transport, without an RDMA NIC.

```bash
sudo dnf install rdma-core libibverbs-utils iproute2
sudo modprobe rdma_rxe
sudo rdma link add rxe0 type rxe netdev eth0
ibv_devinfo -d rxe0
```

Replace `eth0` with the name of an interface that is up. The port state should be `PORT_ACTIVE`. To run a loopback ping-pong test, look up a GID index that corresponds to an IPv4 address with `ibv_devinfo -v -d rxe0`, then start a server and a client:

```bash
ibv_rc_pingpong -g <gid-index> -d rxe0 &
ibv_rc_pingpong -g <gid-index> -d rxe0 127.0.0.1
```

Remove the device with `sudo rdma link delete rxe0`.

## DPDK

Install DPDK and its tools, and reserve hugepages as described in [Hugepages](#hugepages):

```bash
sudo dnf install dpdk dpdk-tools
```

`dpdk-testpmd` can forward packets between two `net_null` virtual devices, which exercises the EAL, the mempool and the ethdev layer without a physical NIC. Stop it with `Ctrl+C` after a few seconds:

```bash
sudo dpdk-testpmd -l 0-1 --no-pci --in-memory \
    --vdev=net_null0 --vdev=net_null1 -- \
    --total-num-mbufs=4096 --forward-mode=io --stats-period=1 \
    --auto-start --no-mlockall --nb-cores=1
```

`dpdk-test` from `dpdk-tools` contains the DPDK unit tests. For example, the following command runs the ring library tests and reports `Test OK` on success:

```bash
sudo dpdk-test -l 0-1 --no-pci --in-memory -- ring_autotest
```

To use a physical NIC, bind it to `vfio-pci` with `dpdk-devbind.py` from `dpdk-tools`. Binding requires IOMMU support from the platform.

## SPDK

Install SPDK and its tools, and reserve hugepages as described in [Hugepages](#hugepages):

```bash
sudo dnf install spdk spdk-tools
```

Start the SPDK target application on one core. The target takes a few seconds to initialize, so the second command waits until it answers RPC requests on `/var/tmp/spdk.sock`:

```bash
sudo spdk_tgt -m 0x1 &
until sudo spdk-rpc bdev_get_bdevs >/dev/null 2>&1; do sleep 1; done
```

### Create a malloc bdev

A malloc bdev is a RAM-backed block device. Create a 64 MiB bdev with 512-byte blocks and list it:

```bash
sudo spdk-rpc bdev_malloc_create -b Malloc0 64 512
sudo spdk-rpc bdev_get_bdevs
```

### Export it over NVMe-oF/TCP

Export the bdev as an NVMe-oF subsystem over TCP, then connect to it with the kernel NVMe/TCP host driver:

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

The new device shows the serial number `SPDK00000000000001`. Disconnect and stop the target when you are done:

```bash
sudo nvme disconnect -n $NQN
sudo spdk-rpc spdk_kill_instance SIGTERM
```

`spdk-cli` provides an interactive shell over the same RPC interface.

## ISA-L

`isa-l-tools` provides `igzip`, a gzip-compatible compressor built on ISA-L:

```bash
sudo dnf install isa-l-tools
igzip -k file.txt
gzip -dc file.txt.gz | cmp - file.txt
```

Applications use ISA-L and ISA-L crypto through `isa-l-devel` and `isa-l_crypto-devel` (`pkg-config` modules `libisal` and `libisal_crypto`).

## Ceph Single-Node Test Cluster {#ceph-single-node-test-cluster}

`cephadm` cannot be used on riscv64 because there is no riscv64 Ceph container image (see [Known Limitations](./overview.md#known-limitations)). This section instead brings up a minimal single-node cluster from the RPM packages, with one monitor, one manager and three file-backed OSDs.

:::danger Evaluation only

This setup uses replica size 1, runs all daemons as root, and stores OSD data in sparse files. Use it only to evaluate Ceph or to test applications. Do not run it on a machine that already has a Ceph configuration in `/etc/ceph`.

:::

Install the packages. About 4 GiB of free space is needed under `/var/lib`:

```bash
sudo dnf install ceph-common ceph-base ceph-mon ceph-mgr ceph-osd
```

### Monitor

Write a minimal configuration:

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

Create the keyrings and the monitor map, then start the monitor:

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

### OSDs

Create three BlueStore OSDs, each backed by an 8 GiB sparse file:

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

After a short while, `ceph osd stat` should report `3 up, 3 in`.

### Try it out

Store and read back an object with RADOS:

```bash
sudo ceph osd pool create testpool 32 32
sudo ceph osd pool application enable testpool rados
head -c 1M /dev/urandom > /tmp/obj.in
sudo rados -p testpool put myobj /tmp/obj.in
sudo rados -p testpool get myobj /tmp/obj.out
cmp /tmp/obj.in /tmp/obj.out
```

Create an erasure-coded pool that uses the ISA-L plugin:

```bash
sudo ceph osd erasure-code-profile set isaprofile k=2 m=1 crush-failure-domain=osd plugin=isa
sudo ceph osd pool create ecpool 32 32 erasure isaprofile
sudo ceph osd pool application enable ecpool rados
sudo rados -p ecpool put ecobj /tmp/obj.in
```

Create an RBD image and map it as a block device through `rbd-nbd` (requires the `nbd` kernel module), or through the kernel RBD client with `rbd map`:

```bash
sudo ceph osd pool create rbdpool 32 32
sudo rbd pool init rbdpool
sudo rbd create --size 256 rbdpool/img0
sudo rbd-nbd map rbdpool/img0
```

Enable the prometheus exporter, which serves metrics on port 9283:

```bash
sudo ceph mgr module enable prometheus
curl -s http://127.0.0.1:9283/metrics | grep ^ceph_ | head
```

### Tear down

```bash
sudo rbd-nbd unmap /dev/nbd0
sudo pkill -x ceph-osd; sudo pkill -x ceph-mgr; sudo pkill -x ceph-mon
sudo rm -rf /var/lib/ceph/mon/ceph-$HOST /var/lib/ceph/mgr/ceph-x /var/lib/ceph/osd/ceph-* \
    /var/lib/ceph/bootstrap-osd/ceph.keyring /etc/ceph/ceph.conf /etc/ceph/ceph.client.admin.keyring \
    /tmp/monmap /tmp/ceph.mon.keyring /tmp/obj.in /tmp/obj.out
```

Replace `/dev/nbd0` with the device printed by `rbd-nbd map`.

## Further Reading

* [io_uring (liburing)](https://github.com/axboe/liburing)
* [fio documentation](https://fio.readthedocs.io/)
* [DPDK documentation](https://doc.dpdk.org/)
* [SPDK documentation](https://spdk.io/doc/)
* [ISA-L](https://github.com/intel/isa-l) and [ISA-L crypto](https://github.com/intel/isa-l_crypto)
* [Ceph documentation](https://docs.ceph.com/)
