---
id: quick-start-for-developers
title: 打包 & 修包快速入门
description: 这份文档旨在指导开发者如何贡献 openRuyi。
slug: /guide/quick-start-for-developers
---

# 打包 & 修包快速入门

这份文档旨在指导开发者如何从源码开始，配置环境、编写 Spec、对接 Open Build Service (OBS) 并完成本地与云端的构建流程。

## 环境准备与工具安装

由于 openRuyi 基于 RISC-V RVA23 规范构建，对构建环境的 `qemu-user` 版本有较高要求。

**推荐操作系统：** Fedora、openSUSE Tumbleweed 或 Arch Linux。

:::tip 注意

类似 Ubuntu 24.04 LTS 或 Debian Stable 等这类发行版的系统软件源中的 QEMU 版本较旧，不支持 RVA23 指令集，会导致构建失败 (除非您手动编译安装最新版 QEMU)。

:::

**安装必要工具：** 请在您的 Linux 开发机上安装以下核心组件：

* `osc`: Open Build Service 命令行客户端

* `obs-build`: 用于本地构建环境的脚本

* `qemu-user`: 用于模拟 RISC-V 架构

以 Fedora 为例:

```bash
sudo dnf install osc obs-build qemu-user
```

## 代码仓库与 Git 工作流

在确认需要打包或修改的软件名称后，在 Git 平台上 Fork 对应的仓库到您的个人账号下，随后将仓克隆到本地。

我们推荐安装和配置 pre-commit hooks，这样可以在提交前自动检查代码规范:

```bash
pre-commit install
```

更多内容，请见 [Pre-commit 使用指南](/docs/guide/pre-commit-usage-guide)。

## 编写 RPM Spec 文件

请按照 [openRuyi Packaging Specification](/docs/guide/packaging-guidelines)，在本地编写或修改 `.spec` 文件。完成后，将更改提交并推送到您的个人远程仓库。

为了减轻负担，可以参考其它发行版的构建脚本文件来编写我们的 RPM Spec，但不可全文复制粘贴。

## Open Build Service 工程初始化

我们的构建平台地址是: https://build.openruyi.cn/

如果已经有帐号的话可以直接登录，否则需要注册一个帐号。之后，进入你的 `home:您的用户名` 项目。为了方便归类管理，我们建议为每个复杂的软件包或一组软件包创建一个独立的子项目( Subproject)，而不是直接在 `home:您的用户名` 内开始操作。

例如，如果我要修复或者打包 cryptsetup 相关的软件包，那么就创建名为 `home:您的用户名:cryptsetup` 的子项目。

## 配置构建架构与元数据

进入您刚创建的 Subproject，点击 Repositories 选项卡进行配置。

我们需要添加 x86_64 和 riscv64 两个构建目标，点击 Add from a Project:

* Project 名字选择 **openruyi**，Repositories 选择 **x86_64**，名字可根据个人喜好取，例如 amd64。下方的 Architectures 仅选择 x86_64。

* 同理，Project 名字选择 **openruyi**，Repositories 选择 **riscv64**，名字可根据个人喜好取，例如 riscv64。下方的 Architectures 仅选择 riscv64。

之后，我们需要对两个构建目标设置额外的属性，因为 UI 界面无法直接设置，需要点击 Meta 选项卡进行配置。

在每个 repository 标签后面添加 `rebuild="local"` 和 `block="local"`，示例如下:

```xml
<project name="home:您的用户名:项目名">
  <title>Your project title</title>
  <description>Your project description</description>
  <repository name="riscv64" rebuild="local" block="local">
    <path project="openruyi" repository="riscv64"/>
    <arch>riscv64</arch>
  </repository>
  <repository name="amd64" rebuild="local" block="local">
    <path project="openruyi" repository="x86_64"/>
    <arch>x86_64</arch>
  </repository>
</project>
```

这样，可以防止引用的源项目发生变化时，不自动触发本项目进行构建，避免上游微小变动导致工程频繁重编。同时，让使用范围偏向本项目，减少跨项目链路带来的不可控影响。

## 创建 Package 并对接 Git 源码

接下来我们可以添加软件包了。在项目内点击 Create Package，输入软件包名称。

然后我们需要上传本地编写好的 `_service` 文件，示例内容如下:

```xml title="_service"
<services>
  <service name="obs_scm">
    <param name="scm">git</param>
    <param name="url">https://github.com/misaka00251/openruyi.git</param>
    <param name="revision">add-cryptsetup</param>
    <param name="extract">core/cryptsetup/*</param>
  </service>
  <service name="download_files"/>
</services>
```

其中，`revision` 为分支名称，`extract` 代表从仓库里只抽取某个子目录。因为我们是 mono-repo，所以一定要设置对应的目录。

上传之后，构建系统会拉取对应的 Git 代码。如果遇到无法获取代码的错误，请检查 Git 仓库的访问权限，确保它是公开的。

### 源码有更新的情况

如果你在 Git 仓库内更新了源码，需要将这个更改同步到构建平台上，可直接点击左侧的 Trigger Services。

## 本地 OSC 客户端配置

若要在本地进行验证构建和调试，需先配置 API 访问凭证。创建或编辑 `~/.config/osc/oscrc` 文件，填入您的 OBS 账号信息:

```toml
[general]
apiurl = https://build.openruyi.cn

[https://build.openruyi.cn]
user = 您的用户名
pass = 您的密码
```

或者，第一次使用 osc 的时候会提示你输入这些信息，无需手动创建。

## 本地构建验证

> 这一段从 Open Build Service 的角度其实不太规范，如果有更好的办法请告诉我

首先，使用 osc checkout 将工程拉取到本地:

```bash
# 格式: osc co <Project>/<Package> && cd $_
osc co home:misaka00251:cryptsetup/cryptsetup && cd $_
```

然后，我们需要运行 service 来从构建系统上下载代码:

```bash
osc up -S
```

之后，因为 service 下载的文件通常带有前缀 (如 `_service:tar_scm:`)，我们需要将其重命名为标准文件名以便 `obs-build` 识别。

```bash
rm -f _service; for file in `ls`; do new_file=${file##*:}; mv $file $new_file; done
```

在准备就绪过后，就可以使用 osc build 调用本地的 chroot 环境进行编译了:

```bash
# Build for riscv64
osc build riscv64 riscv64

# Build for amd64
osc build amd64 x86_64
```

如果构建成功，生成的 RPM 包将位于本地的 `/var/tmp/build-root/...` (具体路径会在构建日志最后显示) 目录下。
