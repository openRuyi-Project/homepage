---
id: build-platform-tips
title: openRuyi 构建系统使用技巧
description: 本文档介绍了 openRuyi 构建系统使用技巧。
slug: /guide/build-platform-tips
---

# openRuyi 构建系统使用技巧

openRuyi 使用 Open Build Service (OBS) 作为构建平台，本文主要用于介绍常用的构建平台使用技巧。

## 控制构建机器配置

在 OBS 里，通过两种方法可以控制构建机器的配置，用来指定构建时的 worker 参数。

### 通过 Project Config 控制

第一种通过在 Project Config 内编写对应的条件语句进行。这种方法适用于约束整个工程。

示例:

```text
%if "%_repository" == "riscv64"
Constraint: hostlabel exclude="true" RVA23
Constraint: hostlabel NATIVE
%endif
```

### 通过 `_constraints` 文件控制

第二种通过创建 `_constraints` 文件来控制，`_constraints` 是放在某个 package 源码目录中的构建约束文件。即，这种方法适用于约束单包。

文件示例:

```xml
<constraints>
  <overwrite>
    <conditions>
      <arch>riscv64</arch>
    </conditions>
    <hardware>
      <jobs>32</jobs>
    </hardware>
    <hostlabel exclude="true">RVA23</hostlabel>
    <hostlabel>RVA20</hostlabel>
  </overwrite>
</constraints>
```

这代表了只在 riscv64 架构构建时，覆盖已有的构建约束，要求该构建使用 `jobs=32`，同时仅在 RVA20 机器上构建，不能将这个构建任务发到其它机器上代构建。

### 常用约束类型

#### hardware:jobs

使得包仅在 `$(nproc)` 大于该值的 worker 上构建。

目前该值仅支持 `4` 和 `32`。

#### hostlabel (workerlabel)

使得包仅在满足所有 label 限制的 worker 上构建。在使用单一表达式的时候，支持反选。

##### 示例

1. 需要 RVA23 机器上构建
   - `RVA23`

2. 需要 RVA23，同时需要在原生机器上构建
   - `RVA23`
   - `NATIVE`

3. 需要 RVA20 机器上构建
   - `RVA20`
   - 注: 目前构建可能会被发送到 RVA23 机器上，需要纯 RVA20 环境请看下方

4. 需要 RVA20 机器上构建，且不能将这个构建任务发到其它机器上构建
   - `RVA20`
   - `!RVA23`

## Webhook 推送即编译

:::warning 注意

本节内容只面向内源使用者。

:::

通过 Webhook 与 OBS 的结合，这种方法可以让开发者快速的验证软件包。

### 获取 Authorization token

1. 在本地配置 `osc` 并登录。
2. 输入以下命令，其中将 `username` 替换为你的用户名: `osc -A https://build.openruyi.cn --http-full-debug api /source/home:username`
3. 在输出的 DEBUG 信息中，找到 send 一行，并提取其中的 `Authorization: Basic aBcDeF...=` 字段。其中后面的值就是 Webhook 需要的 Secret，记录下来。

### 设置 OBS 仓库

1. 登入 OBS 之后，在右上角下拉栏内点击 "Your Home Project"。
2. 点击上方的 "Subprojects"，然后在左侧菜单栏内选择 "Create Subproject"。
3. 在 Create Subproject 页面，填写你需要创建的 Subproject Name。然后点击 Accept。
4. 在新创建的 Subproject 内，点击上方的 "Meta"。
5. 在 description 下方，新插入: ``<scmsync>ssh://git@git.openruyi.cn:54865/username/openRuyi.git#branchname</scmsync>``
   - 其中，`username` 为你的用户名，`#` 号之前为 Git 地址，`#` 号之后为你的分支名称。
6. 点击右下方的 "Save" 之后，如果页面上方出现 `Config successfully saved!` 的提示，并且点击上方 "Overview" 后，Packages 选项卡下方出现 `This project is managed in SCM`，代表仓库设置成功。

### 在 Gitea 上创建 Webhook

1. 派生 `openRuyi-Project/openRuyi` 项目，然后在新仓库内点击右上角的**设置**。在左侧的侧边栏中，选择 **Web 钩子**。
2. 点击**添加 Web 钩子**，在弹出的下拉栏中选择 **Gitea**。
3. 在添加 Web 钩子页面中，填写以下信息:
   - 目标 URL: `https://build.openruyi.cn/source/home:username:project/_project?cmd=runservice`。其中替换 `home:username:project` 为你需要的 OBS 仓库。
   - HTTP 方法: POST
   - Content type: `application/x-www-form-urlencoded`。
   - 勾选激活。
   - 授权标头: 填写 `Token`，中间加一个空格，然后后面跟着刚刚记下来的 Secret。
   - 密钥留空。
   - 分支过滤填写你要创建的新分支名称。
   - 触发条件选择**推送事件**。
4. 点击添加 Web 钩子。如果提示 `Web 钩子添加成功！`，代表 Webhoook 设置成功。

### 创建配置文件

在项目内新分支做出更改之后，假设我们修改了 nginx 这个软件包，那么需要在 `SPECS` 目录下创建 `_manifest` 文件:

```
packages:
  - nginx
```

我们建议创建/修改配置文件跟真正的软件包修改分开 commit。
