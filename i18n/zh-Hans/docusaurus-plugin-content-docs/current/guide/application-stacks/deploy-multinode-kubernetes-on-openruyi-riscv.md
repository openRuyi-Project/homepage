---
id: deploy-multinode-kubernetes-on-openruyi-riscv
title: 在 openRuyi RISC-V 上部署多节点 Kubernetes
description: 在 openRuyi RISC-V 上部署使用 Calico 和 Kata Containers 的双节点 Kubernetes 集群。
slug: /guide/application-stacks/deploy-multinode-kubernetes-on-openruyi-riscv
---

# 在 openRuyi RISC-V 上部署多节点 Kubernetes

本文介绍如何在 openRuyi RISC-V 上部署双节点 Kubernetes 集群。集群使用 containerd 作为容器运行时接口 (Container Runtime Interface，CRI) 运行时，使用 Calico 实现跨节点网络，并通过 Kata Containers 和 Cloud Hypervisor 运行隔离工作负载。

安装过程优先使用 openRuyi `Base` 仓库中的软件包。补充物料仓库只提供 `Base` 尚未包含的 RISC-V 物料。

## 开始前准备

准备两个 openRuyi RISC-V 节点:

| 项目 | 控制平面节点 | Worker 节点 |
| --- | --- | --- |
| 主机名 | `openruyi-master` | `openruyi-worker` |
| 节点 IP 示例 | `192.168.77.11` | `192.168.77.12` |
| CPU | 不少于 8 核 | 不少于 8 核 |
| 内存 | 不少于 16 GiB | 不少于 16 GiB |
| 存储 | 不少于 80 GiB | 不少于 80 GiB |

两个节点的节点 IP 必须互通。本文使用以下网段:

```text
节点网络: 192.168.77.0/24
Service CIDR: 10.96.0.0/12
Pod CIDR: 10.244.0.0/16
```

如果实际网络不同，请替换本文中的节点 IP 示例。

Kata Containers 会为每个 sandbox 启动一个轻量虚拟机。运行 openRuyi 虚拟机的宿主机必须向两个节点暴露 RISC-V 嵌套 KVM 和 AIA/IMSIC 中断虚拟化能力。请在每个 openRuyi 节点确认 `/dev/kvm` 可用:

```bash
uname -m
test "$(uname -m)" = riscv64
test -c /dev/kvm
```

复制 Kubernetes 凭据前，请配置控制平面节点到 Worker 节点的 root SSH 访问。节点时间必须保持同步；时间错误会导致 TLS 和 Kubernetes 证书校验失败。

## 配置节点

在控制平面节点设置主机名:

```bash
hostnamectl set-hostname openruyi-master
```

在 Worker 节点设置主机名:

```bash
hostnamectl set-hostname openruyi-worker
```

在控制平面节点创建变量文件:

```bash
cat >/root/openruyi-k8s.env <<'EOF'
export CONTROL_PLANE_IP=192.168.77.11
export WORKER_IP=192.168.77.12
export NODE_NAME=openruyi-master
export NODE_IP=192.168.77.11
export KUBELET_KUBECONFIG=/etc/kubernetes/kubelet-openruyi-master.conf
export SERVICE_CIDR=10.96.0.0/12
export POD_CIDR=10.244.0.0/16
export ASSET_BASE=https://nexus.osssc.ac.cn/repository/openruyi-k8s/v1.35.5
export ASSET_DIR=/opt/openruyi-k8s-assets
EOF
```

在 Worker 节点创建变量文件:

```bash
cat >/root/openruyi-k8s.env <<'EOF'
export CONTROL_PLANE_IP=192.168.77.11
export WORKER_IP=192.168.77.12
export NODE_NAME=openruyi-worker
export NODE_IP=192.168.77.12
export KUBELET_KUBECONFIG=/etc/kubernetes/kubelet-openruyi-worker.conf
export SERVICE_CIDR=10.96.0.0/12
export POD_CIDR=10.244.0.0/16
export ASSET_BASE=https://nexus.osssc.ac.cn/repository/openruyi-k8s/v1.35.5
export ASSET_DIR=/opt/openruyi-k8s-assets
EOF
```

本节剩余命令需要在两个节点执行。

安装时间同步服务并检查时间:

```bash
dnf install -y chrony
systemctl enable --now chronyd
chronyc waitsync 30
date -u
```

安装 openRuyi 软件包:

```bash
dnf clean metadata
dnf -y makecache --refresh

dnf install -y runc iptables-nft nftables conntrack-tools socat jq \
  tar gzip findutils procps iproute2 xfsprogs openssl curl

dnf install -y kata-containers cloud-hypervisor virtiofsd containerd \
  etcd kubernetes calico

rpm -q kata-containers cloud-hypervisor virtiofsd containerd \
  etcd kubernetes calico
```

从补充物料仓库下载部分二进制、必需镜像和 Kata guest 物料:

补充物料仓库是公开测试物料镜像，请务必完成后续 SHA256 校验。

```bash
source /root/openruyi-k8s.env

assets=(
  bin/crictl-riscv64.tar.gz
  bin/cni-plugins-riscv64.tar.gz
  images/openruyi-k8s-demo-images-riscv64.tar
  images/calico-v3.32.0-riscv64.tar
  images/local-path-provisioner-v0.0.36-riscv64.tar
  kata/linux-7.0.2-106.1.or
  kata/kata-containers-initrd-rpm-openruyi-20260603.img
  kata/configuration-openruyi-clh-rpm-20260603.toml
  manifests/local-path-storage-v0.0.36-openruyi-riscv64.yaml
  demo/runtimeclass-kata-clh.yaml
  demo/nginx-kata-multinode.yaml
)

for asset in "${assets[@]}"; do
  install -d "$ASSET_DIR/$(dirname "$asset")"
  curl --fail --location --retry 3 \
    --output "$ASSET_DIR/$asset" "$ASSET_BASE/$asset"
done
```

校验补充物料:

```bash
cat >"$ASSET_DIR/SHA256SUMS.selected" <<'EOF'
1539c0ca377dc92e57628523a7d1551b7571e176e10fcd6d9290f01e15d4d7ce  bin/cni-plugins-riscv64.tar.gz
21ad0777d760950a1db0d07fba939d45621bb5b55f23c32ca655352adcb37dc5  bin/crictl-riscv64.tar.gz
2e1bb22cbfc7c82680db39732af2917866d812e3852d911adf36186799db01f6  images/openruyi-k8s-demo-images-riscv64.tar
cf6eecc28bfc25695ac198fdb9c1d2b763638ed9a678f03d51d4f45f17a61076  images/calico-v3.32.0-riscv64.tar
44f0a6313cc91287deb23f2eea0dbb84e8e2c7662aa6516b145da91a6469bf13  images/local-path-provisioner-v0.0.36-riscv64.tar
fdcae1772a43d066126653956cdca1b9551f98d6699f1b71e2f572e8583686f9  kata/linux-7.0.2-106.1.or
9cb0e36517ea57dabc0806415d077d489124376dc8569f68e5fde3714cd8fde7  kata/kata-containers-initrd-rpm-openruyi-20260603.img
b9dc52c9db498d024e52459a96275a0e0bfb534ef75b2a8b9693421c6f299560  kata/configuration-openruyi-clh-rpm-20260603.toml
a03b31656543ba0893fc57d6864f591cd982070e136249f523b867277309562c  manifests/local-path-storage-v0.0.36-openruyi-riscv64.yaml
0b23171326ac232c3dd5ec221a2c55850dd52fbe95d81d3de21dbe1e30933a93  demo/runtimeclass-kata-clh.yaml
ad597a4b67a13819cddd76effb87eda8b38debee8685a2340d23e2564484bb05  demo/nginx-kata-multinode.yaml
EOF

cd "$ASSET_DIR" || exit 1
sha256sum -c SHA256SUMS.selected
```

安装 `crictl` 和 CNI plugins:

```bash
install -d /usr/local/bin /opt/cni/bin
tar -C /usr/local/bin -xf "$ASSET_DIR/bin/crictl-riscv64.tar.gz"
tar -C /opt/cni/bin -xf "$ASSET_DIR/bin/cni-plugins-riscv64.tar.gz"

cat >/etc/crictl.yaml <<'EOF'
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 30
debug: false
EOF
```

配置内核模块和 sysctl:

```bash
cat >/etc/modules-load.d/k8s.conf <<'EOF'
overlay
br_netfilter
nf_conntrack
nf_nat
nf_tables
nft_compat
nft_chain_nat
nft_nat
nft_masq
vxlan
kvm
EOF

while read -r module; do
  modprobe "$module" || true
done </etc/modules-load.d/k8s.conf

cat >/etc/sysctl.d/99-kubernetes.conf <<'EOF'
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

sysctl --system
```

启用 containerd 并导入 RISC-V 镜像:

```bash
systemctl enable --now containerd

for image in \
  images/openruyi-k8s-demo-images-riscv64.tar \
  images/calico-v3.32.0-riscv64.tar \
  images/local-path-provisioner-v0.0.36-riscv64.tar; do
  ctr -n k8s.io images import "$ASSET_DIR/$image"
done
```

## 配置 Kata Containers 和 containerd

本节命令需要在两个节点执行。

安装 Kata guest kernel、initrd 和配置文件:

```bash
source /root/openruyi-k8s.env

KATA_CONFIG_DIR=/usr/share/defaults/kata-containers
KATA_SHARE_DIR=/usr/share/kata-containers

install -d /boot/openruyi/7.0.2-106.1.or "$KATA_CONFIG_DIR" "$KATA_SHARE_DIR"
install -m 0644 "$ASSET_DIR/kata/linux-7.0.2-106.1.or" \
  /boot/openruyi/7.0.2-106.1.or/linux
install -m 0644 "$ASSET_DIR/kata/kata-containers-initrd-rpm-openruyi-20260603.img" \
  "$KATA_SHARE_DIR/kata-containers-initrd-rpm-openruyi-20260603.img"
install -m 0644 "$ASSET_DIR/kata/configuration-openruyi-clh-rpm-20260603.toml" \
  "$KATA_CONFIG_DIR/configuration-openruyi-clh.toml"

sed -i \
  -e 's#^kernel = .*#kernel = "/boot/openruyi/7.0.2-106.1.or/linux"#' \
  -e 's#^path = .*#path = "/usr/bin/cloud-hypervisor"#' \
  -e 's#^valid_hypervisor_paths = .*#valid_hypervisor_paths = ["/usr/bin/cloud-hypervisor"]#' \
  -e 's#^virtio_fs_daemon = .*#virtio_fs_daemon = "/usr/bin/virtiofsd"#' \
  -e 's#^valid_virtio_fs_daemon_paths = .*#valid_virtio_fs_daemon_paths = ["/usr/bin/virtiofsd"]#' \
  "$KATA_CONFIG_DIR/configuration-openruyi-clh.toml"

test -x /usr/bin/containerd-shim-kata-v2
test -x /usr/bin/cloud-hypervisor
test -x /usr/bin/virtiofsd
```

配置 containerd:

```bash
install -d /etc/containerd
cat >/etc/containerd/config.toml <<'EOF'
version = 2

[plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "localhost/pause-riscv64:3.10"

[plugins."io.containerd.grpc.v1.cri".cni]
  bin_dir = "/opt/cni/bin"
  conf_dir = "/etc/cni/net.d"
  max_conf_num = 1

[plugins."io.containerd.grpc.v1.cri".containerd]
  default_runtime_name = "runc"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  runtime_type = "io.containerd.runc.v2"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = false

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-clh]
  runtime_type = "io.containerd.kata.v2"
EOF

install -d /etc/systemd/system/containerd.service.d
cat >/etc/systemd/system/containerd.service.d/10-kata-openruyi.conf <<'EOF'
[Service]
Environment=KATA_CONF_FILE=/usr/share/defaults/kata-containers/configuration-openruyi-clh.toml
EOF

systemctl daemon-reload
systemctl restart containerd
crictl info >/dev/null
```

## 初始化控制平面

本节命令需要在控制平面节点执行。

生成集群证书:

```bash
source /root/openruyi-k8s.env
install -d /etc/kubernetes/pki /var/lib/etcd /var/lib/kubelet /var/lib/kube-proxy
cd /etc/kubernetes/pki || exit 1

openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -subj "/CN=kubernetes-ca" \
  -days 3650 -out ca.crt
openssl genrsa -out sa.key 4096
openssl rsa -in sa.key -pubout -out sa.pub

cat >apiserver.cnf <<EOF
[req]
distinguished_name=req
req_extensions=v3_req
prompt=no
[v3_req]
subjectAltName=@alt_names
[alt_names]
DNS.1=kubernetes
DNS.2=kubernetes.default
DNS.3=kubernetes.default.svc
DNS.4=kubernetes.default.svc.cluster.local
IP.1=10.96.0.1
IP.2=127.0.0.1
IP.3=${CONTROL_PLANE_IP}
EOF

openssl genrsa -out apiserver.key 4096
openssl req -new -key apiserver.key -subj "/CN=kube-apiserver" \
  -out apiserver.csr -config apiserver.cnf
openssl x509 -req -in apiserver.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out apiserver.crt -days 3650 \
  -extensions v3_req -extfile apiserver.cnf

make_client_cert() {
  name=$1
  common_name=$2
  organization=$3
  openssl genrsa -out "${name}.key" 4096
  openssl req -new -key "${name}.key" \
    -subj "/CN=${common_name}/O=${organization}" -out "${name}.csr"
  openssl x509 -req -in "${name}.csr" -CA ca.crt -CAkey ca.key \
    -CAcreateserial -out "${name}.crt" -days 3650
}

make_client_cert admin kubernetes-admin system:masters
make_client_cert controller-manager system:kube-controller-manager system:kube-controller-manager
make_client_cert scheduler system:kube-scheduler system:kube-scheduler
make_client_cert kube-proxy system:kube-proxy system:node-proxier
make_client_cert kubelet-openruyi-master system:node:openruyi-master system:nodes
make_client_cert kubelet-openruyi-worker system:node:openruyi-worker system:nodes
```

生成 kubeconfig 文件:

```bash
make_kubeconfig() {
  file=$1
  user=$2
  certificate=$3
  key=$4
  kubectl config set-cluster openruyi \
    --certificate-authority=/etc/kubernetes/pki/ca.crt \
    --embed-certs=true --server="https://${CONTROL_PLANE_IP}:6443" \
    --kubeconfig="$file"
  kubectl config set-credentials "$user" \
    --client-certificate="$certificate" --client-key="$key" \
    --embed-certs=true --kubeconfig="$file"
  kubectl config set-context default --cluster=openruyi --user="$user" \
    --kubeconfig="$file"
  kubectl config use-context default --kubeconfig="$file"
}

make_kubeconfig /etc/kubernetes/admin.conf admin \
  /etc/kubernetes/pki/admin.crt /etc/kubernetes/pki/admin.key
make_kubeconfig /etc/kubernetes/controller-manager.conf controller-manager \
  /etc/kubernetes/pki/controller-manager.crt /etc/kubernetes/pki/controller-manager.key
make_kubeconfig /etc/kubernetes/scheduler.conf scheduler \
  /etc/kubernetes/pki/scheduler.crt /etc/kubernetes/pki/scheduler.key
make_kubeconfig /etc/kubernetes/kube-proxy.conf kube-proxy \
  /etc/kubernetes/pki/kube-proxy.crt /etc/kubernetes/pki/kube-proxy.key
make_kubeconfig /etc/kubernetes/kubelet-openruyi-master.conf system:node:openruyi-master \
  /etc/kubernetes/pki/kubelet-openruyi-master.crt /etc/kubernetes/pki/kubelet-openruyi-master.key
make_kubeconfig /etc/kubernetes/kubelet-openruyi-worker.conf system:node:openruyi-worker \
  /etc/kubernetes/pki/kubelet-openruyi-worker.crt /etc/kubernetes/pki/kubelet-openruyi-worker.key

install -d /root/.kube
install -m 0600 /etc/kubernetes/admin.conf /root/.kube/config
```

创建控制平面服务:

```bash
cat >/etc/systemd/system/openruyi-etcd.service <<'EOF'
[Unit]
Description=openRuyi Kubernetes etcd
After=network-online.target
Wants=network-online.target

[Service]
Environment=ETCD_UNSUPPORTED_ARCH=riscv64
ExecStart=/usr/bin/etcd \
  --name openruyi-master \
  --data-dir /var/lib/etcd \
  --listen-client-urls http://127.0.0.1:2379 \
  --advertise-client-urls http://127.0.0.1:2379
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/openruyi-kube-apiserver.service <<EOF
[Unit]
Description=openRuyi Kubernetes API Server
After=openruyi-etcd.service
Requires=openruyi-etcd.service

[Service]
ExecStart=/usr/bin/kube-apiserver \
  --advertise-address=${CONTROL_PLANE_IP} \
  --bind-address=0.0.0.0 \
  --secure-port=6443 \
  --etcd-servers=http://127.0.0.1:2379 \
  --service-cluster-ip-range=${SERVICE_CIDR} \
  --client-ca-file=/etc/kubernetes/pki/ca.crt \
  --tls-cert-file=/etc/kubernetes/pki/apiserver.crt \
  --tls-private-key-file=/etc/kubernetes/pki/apiserver.key \
  --service-account-key-file=/etc/kubernetes/pki/sa.pub \
  --service-account-signing-key-file=/etc/kubernetes/pki/sa.key \
  --service-account-issuer=https://kubernetes.default.svc.cluster.local \
  --authorization-mode=Node,RBAC \
  --enable-admission-plugins=NodeRestriction \
  --allow-privileged=true
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/openruyi-kube-controller-manager.service <<EOF
[Unit]
Description=openRuyi Kubernetes Controller Manager
After=openruyi-kube-apiserver.service
Requires=openruyi-kube-apiserver.service

[Service]
ExecStart=/usr/bin/kube-controller-manager \
  --kubeconfig=/etc/kubernetes/controller-manager.conf \
  --cluster-cidr=${POD_CIDR} \
  --service-cluster-ip-range=${SERVICE_CIDR} \
  --allocate-node-cidrs=true \
  --cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt \
  --cluster-signing-key-file=/etc/kubernetes/pki/ca.key \
  --root-ca-file=/etc/kubernetes/pki/ca.crt \
  --service-account-private-key-file=/etc/kubernetes/pki/sa.key
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/openruyi-kube-scheduler.service <<'EOF'
[Unit]
Description=openRuyi Kubernetes Scheduler
After=openruyi-kube-apiserver.service
Requires=openruyi-kube-apiserver.service

[Service]
ExecStart=/usr/bin/kube-scheduler --kubeconfig=/etc/kubernetes/scheduler.conf
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now openruyi-etcd openruyi-kube-apiserver \
  openruyi-kube-controller-manager openruyi-kube-scheduler
```

从控制平面节点复制 Worker 节点凭据:

```bash
ssh "root@${WORKER_IP}" 'install -d /etc/kubernetes'
scp /etc/kubernetes/pki/ca.crt \
  /etc/kubernetes/kubelet-openruyi-worker.conf \
  /etc/kubernetes/kube-proxy.conf \
  "root@${WORKER_IP}:/etc/kubernetes/"
```

## 启动节点服务

本节命令需要在两个节点执行:

```bash
source /root/openruyi-k8s.env
install -d /var/lib/kubelet /var/lib/kube-proxy /etc/kubernetes

cat >/var/lib/kubelet/config.yaml <<'EOF'
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: cgroupfs
clusterDNS:
- 10.96.0.10
clusterDomain: cluster.local
failSwapOn: false
containerRuntimeEndpoint: unix:///run/containerd/containerd.sock
EOF

install -d /etc/systemd/system/kubelet.service.d
cat >/etc/systemd/system/kubelet.service.d/99-openruyi.conf <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/kubelet \
  --config=/var/lib/kubelet/config.yaml \
  --kubeconfig=${KUBELET_KUBECONFIG} \
  --container-runtime-endpoint=unix:///run/containerd/containerd.sock \
  --hostname-override=${NODE_NAME} \
  --node-ip=${NODE_IP}
Restart=always
EOF

cat >/var/lib/kube-proxy/config.yaml <<'EOF'
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
bindAddress: 0.0.0.0
clusterCIDR: 10.244.0.0/16
mode: iptables
clientConnection:
  kubeconfig: /etc/kubernetes/kube-proxy.conf
EOF

cat >/etc/systemd/system/openruyi-kube-proxy.service <<'EOF'
[Unit]
Description=Kubernetes Kube Proxy
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/kube-proxy --config=/var/lib/kube-proxy/config.yaml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now kubelet openruyi-kube-proxy
```

`kubernetes` RPM 提供 `10-kubeadm.conf`。本文使用优先级更高的 `99-openruyi.conf`，为手工 bootstrap 流程覆盖其 `ExecStart`。

## 安装集群插件

本节命令需要在控制平面节点执行。

使用 openRuyi 软件包安装 Calico:

```bash
kubectl apply -f /usr/share/kubernetes/calico/calico-v3.32.0-crds.yaml
kubectl apply -f /usr/share/kubernetes/calico/calico-v3.32.0-openruyi-riscv64.yaml
```

使用 openRuyi `kubernetes` 软件包中的 `kubeadm` 安装 CoreDNS:

```bash
source /root/openruyi-k8s.env
cat >/root/kubeadm-addons.yaml <<EOF
apiVersion: kubeadm.k8s.io/v1beta4
kind: ClusterConfiguration
kubernetesVersion: v1.35.5
controlPlaneEndpoint: ${CONTROL_PLANE_IP}:6443
networking:
  serviceSubnet: ${SERVICE_CIDR}
  podSubnet: ${POD_CIDR}
  dnsDomain: cluster.local
EOF

kubeadm init phase addon coredns \
  --config /root/kubeadm-addons.yaml \
  --kubeconfig /etc/kubernetes/admin.conf
```

安装 Kata RuntimeClass 和 Local Path Provisioner:

```bash
source /root/openruyi-k8s.env
kubectl apply -f "$ASSET_DIR/demo/runtimeclass-kata-clh.yaml"
kubectl apply -f "$ASSET_DIR/manifests/local-path-storage-v0.0.36-openruyi-riscv64.yaml"

kubectl -n local-path-storage rollout status \
  deployment/local-path-provisioner --timeout=300s
```

等待两个节点和系统 Pod 就绪:

```bash
kubectl wait --for=condition=Ready node/openruyi-master --timeout=300s
kubectl wait --for=condition=Ready node/openruyi-worker --timeout=300s
kubectl -n kube-system rollout status deployment/coredns --timeout=300s
kubectl -n kube-system rollout status deployment/calico-kube-controllers --timeout=300s

kubectl get nodes -o wide
kubectl -n kube-system get pods -o wide
kubectl get runtimeclass,storageclass
```

## 验证 Kata Containers 工作负载

在控制平面节点部署双节点 nginx 示例:

```bash
source /root/openruyi-k8s.env
kubectl apply -f "$ASSET_DIR/demo/nginx-kata-multinode.yaml"

kubectl rollout status deployment/nginx-kata-1 --timeout=20m
kubectl rollout status deployment/nginx-kata-2 --timeout=20m
kubectl get pod,service,pvc,pv -o wide
```

确认两个 Pod 都运行在 RISC-V Kata sandbox 中:

```bash
POD1=$(kubectl get pod -l app=nginx-kata-1 -o jsonpath='{.items[0].metadata.name}')
POD2=$(kubectl get pod -l app=nginx-kata-2 -o jsonpath='{.items[0].metadata.name}')

kubectl exec "$POD1" -- uname -m
kubectl exec "$POD2" -- uname -m
```

验证 Service DNS 和 Calico 跨节点网络:

```bash
kubectl exec "$POD2" -- \
  wget -qO- http://nginx-kata-1/data.txt
```

在 nginx Pod 所在节点确认 Cloud Hypervisor 已启动 Kata 虚拟机:

```bash
pgrep -af cloud-hypervisor
crictl pods | grep nginx-kata
```

验证完成后删除示例工作负载:

```bash
kubectl delete -f "$ASSET_DIR/demo/nginx-kata-multinode.yaml"
```

## 故障排查

Pod 长时间处于 `ContainerCreating` 时，检查 containerd 和 kubelet:

```bash
journalctl -u containerd -n 200 --no-pager
journalctl -u kubelet -n 200 --no-pager
```

检查 Kata 运行时路径和嵌套虚拟化:

```bash
test -c /dev/kvm
test -x /usr/bin/cloud-hypervisor
test -x /usr/bin/virtiofsd
test -r /boot/openruyi/7.0.2-106.1.or/linux
```

跨节点网络失败时检查 Calico:

```bash
kubectl -n kube-system get pods -l k8s-app=calico-node -o wide
kubectl get ippools.crd.projectcalico.org -o yaml
ip -brief address | grep -E 'vxlan.calico|cali'
```

TLS 报告证书已过期或尚未生效时，检查时间同步:

```bash
date -u
chronyc tracking
```
