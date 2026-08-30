---
id: pre-commit-usage-guide
title: Pre-commit 使用指南
description: 这篇文章教学如何使用 Pre-commit。
slug: /guide/pre-commit-usage-guide
---

# Pre-commit 使用指南

Pre-commit 是提升代码质量、统一团队代码风格的神器，一旦配置完成，它就像一位不知疲倦的“守门员”，在代码进入仓库前自动拦截并修复低级错误。openRuyi 在 Spec 源码仓中引入了 Pre-commit 配置，以确保 RPM Spec 文件的提交规范化。

## 安装

### Linux

在 Linux 下，可以使用包管理器:

**Debian/Ubuntu:** `sudo apt install pre-commit`

**Fedora:** `sudo dnf install pre-commit`

**Arch Linux:** `sudo pacman -S pre-commit`

### macOS

在 macOS 下，可以使用 Homebrew:

```bash
brew install pre-commit
```

### Windows

在 Windows 下，需要先安装 Python 环境，然后通过 pip 安装 pre-commit。

```powershell
winget install python
```

需要提前确认 Python Scripts 目录是否在环境变量内。

例如，对于 Python 3.13，需检查以下目录是否在环境变量内: `%LOCALAPPDATA%\Programs\Python\Python313\Scripts`

确认无误后，安装 pre-commit:

```powershell
pip install pre-commit
```

### 验证安装

使用以下命令来验证安装是否成功:

```bash
pre-commit --version
```

如果输出了版本号，则代表已经安装成功。

## 配置

在 openRuyi 的 Spec 源码仓内已经有一份配置文件，但有配置文件是不够的，还必须将其"安装"到 Git 的钩子目录中:

```bash
pre-commit install
```

在运行指令之后，如果终端提示 `pre-commit installed at .git/hooks/pre-commit` 则代表配置成功。

## 使用

配置完成后，因为 Pre-commit 的运行是完全自动化的，所以只需按照往常一样执行 `git commit` 即可。

当执行提交时，Pre-commit 会依据 `.pre-commit-config.yaml` 定义的规则，按顺序检查所有暂存区 (Staged) 的文件。如果所有钩子都显示 Passed 或 Skipped，Git 提交将自动完成，以下是一个示例:

```bash
~/openruyi-repo/ git commit -m "SPECS: helloworld: Format spec file."
trim trailing whitespace.................................................Passed
fix end of files.........................................................Passed
check for added large files..............................................Passed
check for merge conflicts................................................Passed
check for case conflicts.................................................Passed
check toml...........................................(no files to check)Skipped
check yaml...........................................(no files to check)Skipped
Run reuse annotate.......................................................Passed
[fix-helloworld 86ee28c1] SPECS: helloworld: Format spec file.
 1 file changed, 1 insertion(+), 1 deletion(-)
```

如果 Pre-commit 发现了问题 (例如 `.spec` 文件行尾有多余空格)，钩子状态会显示 Failed，并且提交会被拦截，即不会产生 Commit ID。在确认修改无误之后，将修改后的文件重新加入暂存区并重新执行 commit 命令即可。
