---
id: styleguide
title: Style Guide
description: This document lists all style rules in the openRuyi project
slug: /guide/styleguide
---

# Style guide

This is the centralized list of all style rules in the openRuyi project.
The rules listed here supplement and do not replace the guidelines in other documents, and may duplicate rules written elsewhere.

This is a living document.
Contribution of rules for frequently occurring issues are welcome.

## General

### Git commit

#### Use Signed-off-by {#rule-git-signed-off-by}

Git commits MUST contain a `Signed-off-by` trailer signifying authorship and responsibility.

```
Signed-off-by: Example Author <author@example.com>
```

#### Keep related package changes in one commit {#rule-git-package-related-changes}

Related small changes to the same package SHOULD use one commit.

A version bump, minor fixes to the same RPM spec file, and small package metadata updates MAY stay in one commit when they support the same package update.

Changes SHOULD use separate commits when they affect different packages, address unrelated problems, or need independent review or rollback.

### Review

#### Prefer links to a style rule {#rule-review-prefer-links}

Code review SHOULD prefer linking to style rules in this style guide, if possible.

```markdown
https://openruyi.cn/docs/guide/styleguide#rule-review-prefer-links
```

## Documentation

### Translations

#### Synchronize translations {#rule-translation-synchronize}

Documentation MUST be written in both English and Chinese, and kept in sync.

### Style rules

#### Use standardized format {#rule-style-guide-format}

A style rule MUST contain these elements:

- Heading at the appropriate level (required)
- Rule unique identifier starting with `rule-` (required)
- Rule text (required)
- Example (optional)
- Additional comments (optional)

``````markdown
#### Follow example rule {#rule-example}

This rule MUST be followed.

```
This is an example.
```
``````

#### Put in appropriate section {#rule-style-guide-section}

Style rules SHOULD be placed in an appropriate section depending on what it applies to.

#### Use imperative mood in heading {#rule-style-guide-imperative}

The heading of a style rule SHOULD be an imperative sentence.
In English, the heading SHOULD start with a verb or "do not" and a verb.
In Chinese, the heading MAY be phrased some other way if it is more readable.

```markdown
# Do good things {#rule-good}
```

```markdown
# Do not do bad things {#rule-no-bad}
```

#### Use positive expressions {#rule-style-guide-positive}

Style rules SHOULD be written using positive expressions.
In other words, if possible, specify only the correct thing to do.

#### Write rule texts so they stand alone {#rule-style-guide-standalone}

Style rule text SHOULD be written so that each can be understood on its own.
However, links to other documentation for details MAY be provided.

#### Use generic information {#rule-style-guide-generic-information}

Style rules examples pertaining to personal information MUST use generic example information.

```
Example Author <author@example.com>
```

Names can be substituted with phrases containing "example".
Email addresses and links can be substituted with those using example domains such as `example.com`, per [IETF RFC 6761].

[IETF RFC 6761]: https://datatracker.ietf.org/doc/html/rfc6761

## Packaging

### Remote assets

#### Specify a checksum {#rule-remoteasset-checksum}

RPM spec sources requiring remote download MUST be specified with a SHA-256 hash ("checksum") if the protocol is HTTP or HTTPS.

```spec
#!RemoteAsset:  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Source0:        https://example.org/example-%{version}.tar.gz
```

See also:

- [Source Packages](/docs/guide/packaging-guidelines/SourceURL)
- [openRuyi Packaging Specification, Section Source](/docs/guide/packaging-guidelines#source)
