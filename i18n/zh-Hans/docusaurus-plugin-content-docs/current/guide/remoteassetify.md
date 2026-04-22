---
id: remoteassetify.py
title: 使用 remoteassetify.py
description: 这篇文章描述 remoteassetify.py 如何本地和自动化使用
slug: /guide/remoteassetify-usage-guide
---

# 使用 `remoteassetify.py`

## 系统依赖

`remoteassetify.py` 脚本依赖以下几个程序来工作

- `enosys`：阻拦任意命令执行
- `rpmspec`：解析 spec 文件
- `curl`：下载文件

在默认情况下 `util-linux` 的 `enosys` 会被用来在解析 spec 文件的时候阻拦任意命令执行。
如果你不使用 Linux，或者你的 Linux 发行版没有提供 `enosys`，可以使用 `--unsafe-optional-enosys` 选项禁用这个功能。

## 安全提示

虽然 `remoteassetify.py` 会尝试过滤掉 spec 文件中的任意代码执行，并使用 `enosys` 阻拦任意命令执行，它并不构成一个安全沙箱。
未经审阅或使用充分安全措施情况下，不要使用 `remoteassetify.py` 处理不可信的 spec 文件。

## 本地使用

默认情况下，`remoteassetify.py` 接收一个 spec 文件的路径作为参数，然后执行如下操作：

- 处理 spec 文件，提取其中的 remote asset
- 将 remote asset 下载到 `_assets` 目录
- 如果 spec 文件有 `#!RemoteAsset` 行缺少 checksum 或 checksum 不同，生成一个修改的补丁

如果这时发现有 remote asset 的 checksum 不同，需要检查：

- 如果有一个包被更新，则它的源码 URL 和 checksum 都应该不同。
  这属于正常情况。
- 如果 URL 没有变化，而 checksum 变了，则说明本次下载的文件与上次不同。
  这种情况下，应当检查变化的原因。

这样的做法对下载的文件实现了首次信任 (trust on first use, TOFU) 模型。
如果上游提供了其它方式验证下载的文件，在此也可以使用。

如需修改 spec 文件，可以将输出的补丁用管道送入 `git apply`：

```
$ scripts/remoteassetify.py SPECS/hello/hello.spec | git apply
```

更多参数信息，请详见

```
$ scripts/remoteassetify.py --help
```

## 自动化使用

向 openRuyi 提交的 PR (Pull Request) 如果包含对 remote asset 的更改，则会触发自动工作流对有 remote asset 变更的 spec 文件进行 `remoteassetify.py` 检查。
为了避免下载量过多，如果 spec 的 remote asset 的 URL 和 checksum 都没有变化，则不会自动重新检查。

对于被检查的 spec，如果缺少 checksum 或 checksum 不同，或文件下载失败，则会导致工作流失败。
在此情况下应根据标注信息和工作流 summary 页面，检查哪些文件需要更改。
如果你的 PR 修改很多文件，请注意 GitHub 上只会显示前 10 个警告。
完整的修改信息需要在工作流 summary 页面查看。

检查失败的情况下，为了更新方便，在工作流 summary 和 artifacts 中会有一个修改补丁。
在工作流详情页点击“Summary”链接可以查看。
但是请注意，所有未预期的 checksum 不同仍需要手动检查。
