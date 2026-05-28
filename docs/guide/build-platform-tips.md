---
id: build-platform-tips
title: Tips for Using the openRuyi Build System
description: This document provides openRuyi Build System tips for developers.
slug: /guide/build-platform-tips
---

# Tips for Using the openRuyi Build System

openRuyi uses Open Build Service (OBS) as its build platform. This document introduces common tips for working with the build platform.

## Control Build Worker Configuration

OBS provides two ways to control build worker configuration and specify worker-side parameters for a build.

### Control Configuration Through Project Config

The first method defines conditional rules in Project Config. Use this method when you want to apply constraints to an entire project.

Example:

```text
%if "%_repository" == "riscv64"
Constraint: hostlabel exclude="true" RVA23
Constraint: hostlabel NATIVE
%endif
```

### Control Configuration Through the `_constraints` File

The second method uses a `_constraints` file. The `_constraints` file lives in a package source directory and defines build constraints for that package. Use this method when you want to apply constraints to a single package.

Example:

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

The example above applies only when OBS builds the package for the `riscv64` architecture. It overwrites existing build constraints, requires the build to use `jobs=32`, and restricts the build to RVA20 machines. OBS must not dispatch the build job to other machines for delegated builds.

### Common Constraint Types

#### hardware:jobs

The package builds only on workers where `$(nproc)` exceeds the specified value.

Currently, openRuyi supports only `4` and `32` for this value.

#### hostlabel / workerlabel

The package builds only on workers that satisfy all label constraints. When you use a single expression, OBS also supports negation.

##### Examples

1. Build on RVA23 machines:

   * `RVA23`

2. Build on RVA23 machines and require native hardware:

   * `RVA23`
   * `NATIVE`

3. Build on RVA20 machines:

   * `RVA20`
   * Note: OBS may currently dispatch the build to RVA23 machines. For a pure RVA20 environment, see the example below.

4. Build on RVA20 machines and prevent OBS from dispatching the build job to other machines:

   * `RVA20`
   * `!RVA23`

## Build on Push with Webhooks

:::warning Note

This section only applies to innersource users.

:::

By combining Webhooks with OBS, developers can quickly validate package changes after pushing code.

### Get the Authorization Token

1. Configure `osc` locally and log in.

2. Run the following command. Replace `username` with your username:

   ```bash
   osc -A https://build.openruyi.cn --http-full-debug api /source/home:username
   ```

3. In the DEBUG output, find the `send` line and extract the `Authorization: Basic aBcDeF...=` field. The value after `Authorization: Basic` serves as the Secret required by the Webhook. Save it for later use.

### Configure the OBS Repository

1. Log in to OBS, then click **Your Home Project** from the drop-down menu in the upper-right corner.

2. Click **Subprojects** at the top, then select **Create Subproject** from the left sidebar.

3. On the **Create Subproject** page, enter the Subproject Name that you want to create, then click **Accept**.

4. In the newly created Subproject, click **Meta** at the top.

5. Insert the following line under `description`:

   ```xml
   <scmsync>ssh://git@git.openruyi.cn:54865/username/openRuyi.git#branchname</scmsync>
   ```

   * `username` refers to your username.
   * The part before `#` refers to the Git URL.
   * The part after `#` refers to your branch name.

6. Click **Save** in the lower-right corner. If the page shows `Config successfully saved!` at the top, and the **Packages** tab under **Overview** shows `This project is managed in SCM`, you have configured the repository successfully.

### Create a Webhook in Gitea

1. Fork the `openRuyi-Project/openRuyi` project. In the new repository, click **Settings** in the upper-right corner, then select **Webhooks** from the left sidebar.

2. Click **Add Webhook**, then select **Gitea** from the drop-down menu.

3. On the **Add Webhook** page, fill in the following fields:

   * **Target URL**: `https://build.openruyi.cn/source/home:username:project/_project?cmd=runservice`

     Replace `home:username:project` with the OBS repository that you want to use.

   * **HTTP Method**: `POST`

   * **POST Content Type**: `application/x-www-form-urlencoded`

   * Enable **Active**.

   * **Authorization Header**: Enter `Token`, followed by a space, followed by the Secret that you saved earlier.

   * **Secret**: Leave this field empty.

   * **Branch Filter**: Enter the name of the new branch that you want to use.

   * **Trigger On**: Select **Push Events**.

4. Click **Add Webhook**. If Gitea shows `Webhook has been added`, you have configured the Webhook successfully.

### Create the Configuration File

After you create a new branch and make changes in the project, create a `_manifest` file under the `SPECS` directory. For example, if you modified the `nginx` package, create the following file:

```yaml
packages:
  - nginx
```

We recommend that you commit configuration file changes separately from actual package changes.
