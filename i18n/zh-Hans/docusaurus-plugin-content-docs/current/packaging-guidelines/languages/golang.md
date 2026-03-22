---
id: languagesgolang
title: Golang
description: 这个文档讲述了 openRuyi 的 Golang 打包指南。
slug: /guide/packaging-guidelines/languages/Golang
---

# Golang 打包指南

这个文档讲述了 openRuyi 的 Golang 打包指南。对于相关的构建系统，请参阅 [Golang](/docs/guide/packaging-guidelines/BuildSystems/golang).

## Versioning

许多 Go 库 (以及部分 Go 程序) 是直接存在于版本控制系统中的，而从未发布过版本。关于版本号的编写，请参阅[版本号](/docs/guide/packaging-guidelines/Versioning)。

## 仅包含二进制的软件包

仅包含二进制的软件包是指包含由 Go 编写的程序，但不包含源代码的软件包。例如 `ollama`，它由 Go 编写，但不提供 API，因此不提供源码包供其它 Go 包引用。

### 命名

这类软件包的名称应与上游项目一致，例如 `ollama`。命名为 `go-ollama` 是错误的。同样，生成的二进制软件包名称中也禁止包含 `go-` 前缀。

## 仅包含库 (或二进制+库的) 软件包

在 openRuyi 内，打包 Go 编写的库的唯一目的是为了构建 openRuyi 系统中其它 Go 程序，不应该被用户在日常开发流程中使用。对于日常开发的情形，用户应该使用 `go get`。

### 命名

所有的 Go 库都有自己的导入路径 (import path)，我们将其的所有斜杠替换为横杠，并使用规范的标识符代替主机名来给软件包命名。

在理想的情况下，软件包最终的名称通常都是导入路径。以下是一些例子:

| 导入路径                     | openRuyi 软件包名称          |
| --------------------------- | -------------------------- |
| golang.org/x/oauth2         | go-golang-x-oauth2         |
| google.golang.org/protobuf  | go-google-protobuf         |
| github.com/jpillora/backoff | go-github-jpillora-backoff |
| git.sr.ht/\~sbinet/cmpimg   | go-sourcehut-sbinet-cmpimg |

### 文件存放位置

所有文件必须安装至 `/usr/share/gocode/src`，这对应于 `$GOPATH/src`。

例如，对于 `github.com/boombuler/barcode` 来说 (即 `go-github-boombuler-barcode`)，其中一个文件的路径应该为 `/usr/share/gocode/src/github.com/boombuler/barcode/code93/encoder.go`。

### 多版本的情况处理

Go 库在不同的大版本之间经常会有破坏性变更。通常来说，这能从 Go 库的导入路径看出来。如果出现需要打包相同 Go 库但不同版本的情况，需要在软件包名称后面跟导入路径一样添加大版本号。

例如，`github.com/cespare/xxhash` 对于 v1.x 和 v2.x 的 Go 库导入路径就不同:

* 前者在打包时可命名为 `go-github-cespare-xxhash` (即 `go(github.com/cespare/xxhash)`)。

* 后者在打包时可命名为 `go-github-cespare-xxhash-v2` (即 `go(github.com/cespare/xxhash/v2)`)。

当然，也有一些例外情况。这通常是上游在发布具有破坏性变更的大版本时，没有变更导入路径。

例如，`github.com/olekukonko/tablewriter` 存在 `v0.0.5` 的遗留 (legacy) 和最新 (latest) 两个版本，但它们共用一个导入路径。这种情况下，应该让最新的包使用导入名称，而遗留的包添加大版本号。

* 遗留版本在打包时可命名为 `go-github-olekukonko-tablewriter-v0`。

* 最新版本在打包时可命名为 `go-github-olekukonko-tablewriter`。

同时，因为导入路径相同，需要在 RPM Spec 内声明两者互斥，不可同时安装，例如最新版本需要加入:

```specfile
Conflicts:      go(github.com/olekukonko/tablewriter) = 0.0.5
```

而遗留版本需要加入:

```specfile
Conflicts:      go(github.com/olekukonko/tablewriter) >= 1.0.0
```

## 依赖关系

库软件包需要在 RPM Spec 中的 BuildRequires 和 Requires 列出其依赖的所有其它 Go 库。这些依赖项在构建时需要可用以运行测试，在安装时也需要可用以便其他软件包进行构建。

在编写 Go 库依赖的时候，必须使用规定的虚拟依赖，格式为 `go(<import path>)`。

其中，库软件包本身必须要显式在 RPM Spec 内写出自己提供的导入路径和版本，例如:

```specfile
Provides:       go(github.com/clipperhouse/uax29/v2) = %{version}
```

这样可以方便的被其它库软件包引用:

```specfile
BuildRequires:  go(github.com/clipperhouse/stringish)
# ...
Requires:       go(github.com/clipperhouse/stringish)
```

### 必须的 BuildRequires

以下两个编译依赖是不可或缺的:

* `go` - 提供 Go 程序本身。

* `go-rpm-macros` - 提供打包 Go 库所需的一系列 RPM 宏。例如，对于 `/usr/share/gocode/src` 这个路径，可以直接使用 `%{go_sys_gopath}` 代替。

## 当上游迁移仓库地址

有些时候，上游软件包可能会从一个托管商迁移到另一个托管商。此时需要重命名软件包，并且提供新的 Provides，还需要在构建过程中创建一个兼容性的符号链接。

## 自动化引入

openRuyi 目前有一个将 Go 库/程序引入的小程序 go2spec。这个小工具是基于 Debian Go Package Team 的 dh-make-golang 修改的，以适应 openRuyi 的需求。对此表示感谢。

例如，要打包 Go 库 `github.com/fsnotify/fsnotify`:

```bash
./go2spec pack github.com/fsnotify/fsnotify
```

`go2spec` 将会自动处理相关的信息 (目前仅限 GitHub)，随后会产出对应的 Spec 文件。

## 用于 Go 模块的 RPM 宏

这里包含了一些常用的用于 Go 模块的 RPM 宏。

### %go_common

此宏会做两件事情:

* 告诉 Go 忽略 `go.mod` 文件，让 Go 回到旧版的 GOPATH 模式。

* 定义 Go 的工作空间 (GOPATH) 路径，让 Go 把当前正在构建的项目源码和系统级 Go 依赖包的默认位置当作 GOPATH 的一部分。

### %__go

此宏为系统中安装的 go 可执行文件的名称。

### 定义宏

在使用以下宏的时候，我们希望能在定义上方编写一行注释说明意图。

#### go_test_exclude

如果需要在测试的时候屏蔽某个失败的库，可直接在 RPM Spec 顶部定义:

```specfile
%define go_test_exclude github.com/minio/c2goasm/cgocmp
```

如果需要屏蔽多个失败的库:

```specfile
%define go_test_exclude %{shrink:
    github.com/json-iterator/go/type_tests
    github.com/json-iterator/go/benchmarks
}
```

#### go_test_exclude_glob

如果需要在测试的时候通过正则屏蔽某类失败的库，可直接在 RPM Spec 顶部定义:

```specfile
%define go_test_exclude_glob github.com/pierrec/lz4/v4/cmd*
```

如果需要屏蔽多个失败的库:

```specfile
%define go_test_exclude_glob %{shrink:
    github.com/gogo/protobuf/protoc-gen-gogo
    github.com/gogo/protobuf/test/dashfilename
    github.com/gogo/protobuf/test/embedconflict
    github.com/gogo/protobuf/test/issue270
}
```

除此之外，还可以在测试 (`%check`) 配置内使用 `export GO_TEST_EXCLUDE_GLOB` 达到同样的效果。

#### go_test_include

如果需要在测试的时候只测试某个库，可直接在 RPM Spec 顶部定义:

```specfile
%define go_test_include github.com/cespare/xxhash/v2
```

不推荐使用本宏添加多个库用于测试，应考虑屏蔽测试失败的库。

#### go_test_include_glob

如果需要在测试的时候只测试某类库，可直接在 RPM Spec 顶部定义:

```specfile
%define go_test_include_glob github.com/cespare/xxhash/v2*
```

不推荐使用本宏添加多个库用于测试，应考虑屏蔽测试失败的库。

除此之外，还可以在测试 (`%check`) 配置内使用 `export GO_TEST_INCLUDE_GLOB` 达到同样的效果。

#### go_test_ignore_failure

如果出于某种原因，需要在测试不通过的情况下继续进行打包操作，可直接在 RPM Spec 顶部定义:

```specfile
%define go_test_ignore_failure 1
```

除此之外，还可以在测试 (`%check`) 配置内使用 `export GO_TEST_IGNORE_FAILURE` 达到同样的效果。
