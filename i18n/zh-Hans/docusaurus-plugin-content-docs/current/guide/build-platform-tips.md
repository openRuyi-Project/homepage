---
id: build-platform-tips
title: openRuyi 构建系统使用技巧
description: 本文档介绍了 openRuyi 构建系统使用技巧。
slug: /guide/build-platform-tips
---

# openRuyi 构建系统使用技巧

openRuyi 使用 Open Build Service (OBS) 作为构建平台，本文主要用于介绍常用的构建平台使用技巧。

## 在 OBS 中快速验证反向依赖

在 OBS 中，可以通过设置元数据，轻松地验证一个或多个软件包发生变更后对 openRuyi 的影响。你可以先在个人 Subproject 中构建修改后的软件包，再通过项目链接和 `linkedbuild="localdep"`，让 OBS 构建依赖这些本地构建结果的链接软件包。本节以 openRuyi 滚动仓为例。

1. 完成一个或多个软件包的修改后，将更改提交并推送到你 Fork 的个人 GitHub 仓库。

2. 登录 OBS，点击右上角的用户菜单，然后选择 **Your Home Project**。

3. 点击页面顶部的 **Subprojects** 选项卡。为减少不必要的测试项目，建议创建一个专用 Subproject，并在后续验证中重复使用。如果尚未创建，请在左侧菜单中选择 **Create Subproject**。

4. 在 **Create Subproject** 页面中，在 **Subproject Name** 字段填写项目名称，然后点击 **Accept**。

5. 如果尚未配置构建目标和仓库路径，请参阅[打包 & 修包快速入门](/zh-Hans/docs/guide/quick-start-for-developers)中的**配置构建架构与元数据**小节，完成 Subproject 的构建配置。确保需要验证的软件包可以在该 Subproject 中成功构建。

6. 确认 Subproject 中所有待验证的本地软件包均已成功构建。如果 OBS 使用 `_service` 从 Git 仓库获取源码，且尚未自动同步最新提交，请在对应软件包页面点击 **Trigger Services**，然后等待源码同步和构建完成。

7. 打开 **Meta** 选项卡。在 `<description>` 元素之后，作为 `<project>` 的直接子元素插入以下配置:

   ```xml
   <link project="openruyi"/>
   ```

8. 点击页面右下角的 **Save**。如果页面顶部显示 `Config successfully saved!`，表示 OBS 已保存项目元数据。

9. 再次打开 **Meta** 选项卡。在每个 `<repository>` 元素的开始标签中添加 `linkedbuild="localdep"`。保留现有的 `rebuild`、`block` 等属性。例如:

   ```xml
   <project name="home:your-username:project-name">
     <title>Your project title</title>
     <description>Your project description</description>
     <link project="openruyi"/>
     <repository name="riscv64" rebuild="local" linkedbuild="localdep">
       <path project="openruyi" repository="riscv64"/>
       <arch>riscv64</arch>
     </repository>
   </project>
   ```

   注意: `rebuild="local"` 和 `linkedbuild="localdep"` 控制不同的构建行为。前者仅针对当前项目中源码发生变化的软件包。后者控制链接项目中的软件包是否参与构建，只有依赖当前项目本地构建结果的链接软件包才会构建。

10. 再次点击页面右下角的 **Save**。如果页面顶部显示 `Config successfully saved!`，表示 OBS 已保存更新后的项目元数据。OBS 随后会根据依赖关系调度符合 `localdep` 条件的链接软件包。你可以在 **Overview** 页面查看构建状态和结果。

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
4. 点击添加 Web 钩子。如果提示 `Web 钩子添加成功！`，代表 Webhook 设置成功。

### 创建配置文件

在项目内新分支做出更改之后，假设我们修改了 nginx 这个软件包，那么需要在 `SPECS` 目录下创建 `_manifest` 文件:

```
packages:
  - nginx
```

我们建议创建/修改配置文件跟真正的软件包修改分开 commit。
