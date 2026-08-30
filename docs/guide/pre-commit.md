---
id: pre-commit-usage-guide
title: Pre-commit Usage Guide
description: This document guides developers for how to use Pre-commit.
slug: /guide/pre-commit-usage-guide
---

# Pre-commit Usage Guide

Pre-commit is a powerful tool for improving code quality and maintaining a consistent coding style across a team. Once you configure it, it acts like a tireless gatekeeper, automatically detecting and fixing trivial issues before code enters the repository. openRuyi has introduced a pre-commit configuration in the Spec source repository to help standardize RPM Spec file submissions.

## Installation

### Linux

On Linux, you can install pre-commit using your distribution’s package manager:

**Debian/Ubuntu:** `sudo apt install pre-commit`

**Fedora:** `sudo dnf install pre-commit`

**Arch Linux:** `sudo pacman -S pre-commit`

### macOS

On macOS, you can install it with Homebrew:

```bash
brew install pre-commit
```

### Windows

On Windows, you must first install Python, and then install pre-commit using `pip`.

```bash
winget install python
```

Before proceeding, make sure you add the Python `Scripts` directory to your `PATH` environment variable.

For example, with Python 3.13, verify that your `PATH` includes the following directory:

`%LOCALAPPDATA%\Programs\Python\Python313\Scripts`

Once you confirm this, install pre-commit:

```bash
pip install pre-commit
```

### Verifying the Installation

Run the following command to verify you installed pre-commit successfully:

```bash
pre-commit --version
```

If the terminal outputs a version number, your installation succeeded.

## Configuration

The openRuyi Spec source repository already includes a pre-commit configuration file. However, the configuration file alone is not enough — you must also install it into Git’s hook directory:

```bash
pre-commit install
```

If the terminal prints `pre-commit installed at .git/hooks/pre-commit`, you have successfully installed the hook.

## Usage

Once you complete the setup, pre-commit runs automatically, so you can continue using `git commit` as usual.

When you make a commit, pre-commit checks all staged files in sequence according to the rules defined in `.pre-commit-config.yaml`. If all hooks show either `Passed` or `Skipped`, Git completes the commit automatically. For example:

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

If pre-commit detects an issue, such as trailing whitespace in a `.spec` file, the corresponding hook will show `Failed`, and pre-commit will block the commit. In that case, Git will not generate a commit ID. After reviewing and confirming the changes, add the modified files back to the staging area and run the commit command again.
