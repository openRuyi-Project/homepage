---
sidebar_position: 1
---

# openRuyi 文档中心

欢迎来到 openRuyi 文档中心。本仓库旨在为开发者和打包者提供全方位的技术指引，确保软件包的质量与一致性。

## 🚀 快速入门

如果你是第一次参与 openRuyi 的开发或打包，请先阅读以下指南:

- openRuyi 开发者贡献指南: 了解如何提交代码及参与社区贡献。

* [打包 & 修包快速入门](/docs/guide/quick-start-for-developers): 让你几分钟上手第一个软件包。

* [Pre-commit 使用指南](/docs/guide/pre-commit-usage-guide): 确保你的软件包符合提交规范。

## 📜 软件包构建规范

这些是打包的核心准则，所有软件包应以基于 [openRuyi Packaging Specification](/docs/guide/packaging-guidelines) 为基准，并参考以下细化指南进行构建。

### 元数据

* [命名规则](/docs/guide/packaging-guidelines/Naming) & [版本号](/docs/guide/packaging-guidelines/Versioning): 确立包名与版本的唯一性。

* [许可证](/docs/guide/packaging-guidelines/Licenses) & [SPDX 许可证表达式](/governance/legal/spdx): 详细介绍许可证机制。

* [宏标签](/docs/guide/packaging-guidelines/RPMMacros): 规范 RPM Spec 中的变量定义。

### 文件与构建行为

* [源码包](/docs/guide/packaging-guidelines/SourceURL): 上游源码在 RPM Spec 内的编写策略。

* [补丁](/docs/guide/packaging-guidelines/Patch): 如何管理和应用 Patch。

* [脚本](/docs/guide/packaging-guidelines/Scriptlets): 控制 `%pre`, `%post` 等安装前后脚本的行为。

* [字体打包指南](/docs/guide/packaging-guidelines/FontPackagingGuidelines): 字体包命名、许可证、安装位置与子包拆分指南。

### 包组织与其它特性

* [软件包拆分](/docs/guide/packaging-guidelines/SplitPackage): 合理划分 `-devel` 及运行时库等。

* [语言包](/docs/guide/packaging-guidelines/LangPacks): 多语言支持的放置规范。

## 🧪 质量门禁与审阅

了解软件包在合并前需要通过的自动化检查与人工审计策略。

* [软件包审阅指南](/docs/guide/review/ReviewGuidelines): 详细说明了 CI/CD 门禁的检查项、准入标准及常见打回原因。

* [使用 pkgconfig(xxx)](/docs/guide/packaging-guidelines/PkgConfigBuildRequires): 规范依赖追踪，避免硬编码依赖。

## 📚 语言专项与构建系统

针对特定编程语言和工具链的实践建议。

| 类别 | 详细指南                                                                              | 声明式构建系统                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| C/C++    |                                                                                             | [autotools](/docs/guide/packaging-guidelines/BuildSystems/autotools) / [meson](/docs/guide/packaging-guidelines/BuildSystems/meson) |
| Python   | [Python 打包指南](/docs/guide/packaging-guidelines/languages/Python) |                                                                                                                                                   |
| Perl     | [Perl 打包指南](/docs/guide/packaging-guidelines/languages/Perl)   |                                                                                                                                                   |
| Golang   | [Golang 打包指南](/docs/guide/packaging-guidelines/languages/Golang) | [Golang](/docs/guide/packaging-guidelines/BuildSystems/golang)                                                                            |

## 🤝 参与完善

如果你发现规范中存在遗漏或需要更新，请提交 Issue 告诉我们！
