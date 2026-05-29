---
id: styleguide
title: 风格指南
description: 本文档列出了 openRuyi 项目的所有风格规则
slug: /guide/styleguide
---

# 风格指南

本文是 openRuyi 项目的所有风格规则的中心化列表。
这里列出的规则对其它文档中的指导是补充而不是替代作用。
这里的部分规则可能和其它地方写的规则有重复。

本文档活动更新。
欢迎大家对常出现的问题贡献规则。

## 一般规则

### Git commit

#### 使用 Signed-off-by {#rule-git-signed-off-by}

Git commit 必须包含 `Signed-off-by` 尾注，以示作者和责任信息。

```
Signed-off-by: Example Author <author@example.com>
```

#### 将同一软件包的相关小修改合并到一个 commit {#rule-git-package-related-small-changes}

同一软件包的相关小修改应当合并到一个 commit 中提交。

例如，版本号更新、同一 RPM spec 文件的小修正，以及相关软件包元数据的小调整，如果服务于同一个目的，可以放在同一个 commit 中。

如果修改涉及多个无关软件包、解决多个无关问题，或者需要分别审阅和回滚，则应拆分为多个 commit。

### 审阅

#### 优先使用文档链接 {#rule-review-prefer-links}

代码审阅中，如果可能，应当在评论中优先使用到本文档中的风格规则的链接。

```markdown
https://openruyi.cn/docs/guide/styleguide#rule-review-prefer-links
```

## 文档

### 翻译

#### 同步翻译版 {#rule-translation-synchronize}

文档必须使用中英双语编写，并两者保持同步。

### 风格规则

#### 使用标准格式 {#rule-style-guide-format}

风格规则必须包含如下元素：

- 正确级别的小节标题（必须）
- 规则唯一标识符，以 `rule-` 开头（必须）
- 规则正文（必须）
- 示例（可选）
- 其它注解（可选）

``````markdown
#### 遵守规则示例 {#rule-example}

必须遵守本规则。

```
This is an example.
```
``````

#### 放在合适的小节中 {#rule-style-guide-section}

风格规则应当根据其适用范围放在一个合适的小节中。

#### 使用祈使句 {#rule-style-guide-imperative}

风格规则的标题应当是祈使句。
英文版的标题应当以一个动词开头或 "do not" 后跟一个动词开头。
中文版的标题可以为可读性考虑写为其它形式。

```markdown
# 做正确的事情 {#rule-good}
```

```markdown
# 不要做错误的事情 {#rule-no-bad}
```

#### 使用正面表达 {#rule-style-guide-positive}

风格规则应当用正面表达编写。
也就是说，如果可能，风格规则应当只写出正确做法。

#### 规则文本应独立成文 {#rule-style-guide-standalone}

风格规则文本应当写成可以只阅读文本本身，便可理解其含义的形式。
可以提供指向其它文档的链接。

#### 使用通用的示例信息 {#rule-style-guide-generic-information}

风格规则中涉及个人信息的示例必须使用通用的示例信息。

```
Example Author <author@example.com>
```

人名可以替换为包含 "example" 的短语。
电子邮件地址和链接可以替换为使用 [IETF RFC 6761] 示例域名的地址，如 `example.com`。

[IETF RFC 6761]: https://datatracker.ietf.org/doc/html/rfc6761

## 打包

### Remote assets

#### 指定校验和 {#rule-remoteasset-checksum}

RPM spec 中需要从远程服务器下载的源码，如果协议是 HTTP 或 HTTPS，必须提供 SHA-256 哈希（“校验和”）。

```spec
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source0:        https://example.org/example-%{version}.tar.gz
```

参考：

- [源码包](/docs/guide/packaging-guidelines/SourceURL)
- [openRuyi Packaging Specification 中的小节 Source](/docs/guide/packaging-guidelines#source)
