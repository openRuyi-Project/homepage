---
id: repositoryupdatepolicy
title: Repository Update Policy
description: This document outlines openRuyi's repository update workflow.
slug: /policy/release-policies/repository-update-policy
---

# openRuyi Repository Update Policy

The current document describes the package repository update process for openRuyi.

The freeze schedule dictates the repository update process in openRuyi. Therefore, the guide divides the process into two sections: Transition Period and Freeze Period, in accordance with the [Freeze Period Policy](/governance/policy/release-policies/freeze-period-policy).

## Transition Period

```mermaid
flowchart TB
  github["GitHub openRuyi Project"]
  obs["Open Build Service"]
  backend["Open Build Service<br/>Backend"]

  github -->|"Pull Request merged"| obs
  obs -->|"Build Artifacts"| backend
  backend -->|"Sync<br/>(Daily)"| unstable

  subgraph boat["Repo Server (boat)"]
    direction TB

    unstable["Unstable Repo"]
    spt["Single Package Testing"]
    release["Release Process<br/>1. Archive current Stable Repo<br/>2. Promote tested repo"]
    stable["Stable Repo"]
    archive["Archive Repo"]

    unstable -->|"Perform a Seecret Update"| spt
    spt -->|"Pass"| release
    release -->|"Archive current stable"| archive
    release -->|"Promote tested repo"| stable
  end

  style boat fill:#f7f4ea,stroke:#333,stroke-width:1px
  style obs fill:#657789,color:#fff,stroke:#333,stroke-width:1px
  style spt fill:#b7e3f7,stroke:#333,stroke-width:1px
  style release fill:#fff4cc,stroke:#333,stroke-width:1px

  linkStyle 4 stroke:#65a30d,stroke-width:2px
```

The transition period generally covers the first two weeks of each month. During the transition stage, openRuyi accepts changes as usual. Once maintainers accept the changes in a pull request, automation submits the updates to the openRuyi build system.

After the build system successfully builds a package, a scheduled job synchronizes it with the Unstable repository daily. The Unstable repository serves two purposes: it acts as the synchronization target for build system outputs, and users can also access the Unstable repository directly to get the latest packages, without using the build system itself as a package source.

Every Wednesday, the testing framework runs automated tests at the single-package level against the Unstable repository. If the automated tests pass, the synchronization script first copies the current contents of the Stable repository to the archive repository, then synchronizes the Unstable repository contents to Stable. We call the Wednesday update process as “Seecret Update Wednesday.”

If the automated tests fail, the system halts the update and posts a notification to the GitHub issue tracker. Once developers resolve and maintainers accept all issues, a maintainer may manually perform the same steps that normally follow a successful automated test run.

## Freeze Period

```mermaid
flowchart TB
  github["GitHub openRuyi Project"]
  obs["Open Build Service"]
  backend["Open Build Service<br/>Backend"]

  github -->|"Only let important<br/>Pull Request merged"| obs
  obs -->|"Build Artifacts"| backend
  backend -->|"Sync<br/>(Daily)"| unstable

  subgraph boat["Repo Server (boat)"]
    direction TB

    unstable["Unstable Repo"]
    pre["Pre-release artifacts"]
    it["Integration Testing"]
    release["Release Process<br/>1. Archive current stable<br/>2. Promote tested repo"]
    stable["Stable Repo"]
    archive["Archive Repo"]

    unstable -->|"Make Pre-release artifacts<br/>before Seecret Update"| pre
    pre --> it
    it -->|"Pass"| release
    release -->|"Archive current stable"| archive
    release -->|"Promote tested repo"| stable
  end

  it -->|"Fail:<br/>Fix every issue encountered"| github

  style boat fill:#f7f4ea,stroke:#333,stroke-width:1px
  style obs fill:#657789,color:#fff,stroke:#333,stroke-width:1px
  style it fill:#b7e3f7,stroke:#333,stroke-width:1px
  style release fill:#fff4cc,stroke:#333,stroke-width:1px

  linkStyle 0 stroke:#ea580c,stroke-width:2px
  linkStyle 5 stroke:#65a30d,stroke-width:2px
  linkStyle 8 stroke:#dc2626,stroke-width:2px
```

The freeze period generally covers the last two weeks of each month. During the freeze stage, openRuyi focuses on polishing the month-end images. As a result, maintainers normally do not accept new changes. In general, maintainers merge only targeted fixes for severe bugs. In short, maintainers manually review and control pull requests during the freeze period. As in the transition period, once maintainers accept the changes in a pull request, automation submits the updates to the openRuyi build system.

After the build system successfully builds a package, a scheduled job synchronizes it with the Unstable repository daily.

From the daily synchronization onward, the system no longer pushes updates directly to Stable. Instead, the release process introduces an intermediate step: the build system first creates release artifacts using the packages from the Unstable repository. The newly built release artifacts serve as the pre-release builds for that month’s release.

The testing framework then performs integration tests on the release artifacts. If the tests find any issues, the system immediately posts a notification to the GitHub issue tracker. Only after developers resolve and maintainers accept all issues will a maintainer manually synchronize the Stable repository contents to the archive repository, and subsequently synchronize the Unstable repository contents to Stable.

These steps ensure that the final delivered images are sufficiently stable and reliable.
