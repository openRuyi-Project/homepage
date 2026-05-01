---
id: new-contributor-guide
title: New Contributor Guide
description: This document guides contributors on how to contribute to openRuyi, including finding tasks, submitting code, testing changes, reporting issues, and communicating with the community.
slug: /guide/new-contributor-guide
---

# openRuyi New Contributor Guide

Welcome to the openRuyi community! We gladly accept contributions from every user. Whether you are an experienced developer or an enthusiast who has never written code before, you can find a place to contribute here. You do not need programming skills to become a contributor. Documentation, testing, translation, and helping other users all count as valuable contributions.

## How to Find Tasks You Can Contribute To

Finding a suitable task marks the first step toward contributing. Contributors with different backgrounds can choose task sources based on their interests and skills:

**Bug fixes:** You can look for issues labeled `bug` in our repository's issue tracker. Start with unresolved bugs, analyze them, and try to fix them. Before submitting a fix, check whether someone else has already claimed or fixed the issue to avoid duplicate work. Before you start, read the related bug report details and reproduction steps.

**Feature requests:** In addition to bug fixes, you can also implement new features requested by the community. Look for issues labeled `Enhancement` in our repository's issue tracker. If no one has started working on a feature request and you want to implement it, you can begin working on it. Before implementation, discuss your design ideas with the requester or maintainers in the issue.

**Package updates and maintenance:** Package maintenance represents an important area of contribution for a distribution. You can check which packages have fallen behind upstream releases or currently lack maintainers.

**Documentation:** You can contribute documentation, tutorials, or localization translations. We encourage users to improve documentation so that more newcomers can get started with openRuyi.

**Testing:** You can also contribute by testing the distribution and its packages.

## Code Contribution Workflow

After you choose a specific task, such as fixing a bug or adding a new feature, you can start the actual code contribution process. openRuyi uses Git for source code management, and the code contribution workflow resembles the common workflows used by open source projects on platforms such as GitHub.

1. **Fork the repository:** Click the **Fork** button on the GitHub project page. After you fork the repository, your own account will have a copy that you can modify.

2. **Clone the repository and create a branch:** Use `git clone` on the command line to clone your fork to your local machine. Then create a new development branch for your work. Do not work directly on the `main` or `master` branch. For example, run `git checkout -b fix-login-bug` to create and switch to a new branch named `fix-login-bug`. Choose a meaningful branch name so that others can understand the purpose of your branch.

3. **Write code:** Make code changes on the new branch to address your chosen task. For example, modify the relevant code logic to fix a bug, or add the necessary code and files to implement a new feature. If your changes cover a large scope, split them into smaller commits so reviewers can understand them more easily.

4. **Write commit messages and commit changes:** After you complete a stage of code changes, use `git add` to add the changed files, and then use `git commit` to commit them. For the commit message format, refer to the Package Style Guide.

5. **Push the branch to your repository:** Using the previous example, run `git push origin fix-login-bug` to push your local development branch to your remote fork. After the push, GitHub will show the code under the corresponding branch in your repository.

6. **Create a Pull Request:** On GitHub, create a Pull Request, or PR, from the branch you just pushed, and request that upstream merge your changes into the official repository’s main branch. In the PR description, clearly explain the purpose of your changes, the problem they solve, and any possible impact. After you submit the PR, project maintainers will receive a notification and begin reviewing your code.

7. **Code review:** After you submit a PR, wait patiently for feedback from maintainers or other community developers. Code review plays an important role in open source projects. Review helps ensure code quality and alignment with the project. Reviewers may leave comments under the PR to point out required changes, suggest better implementations, or ask for more information. openRuyi reviewers also follow community standards during the review process. For example, reviewers will review PRs in the openRuyi source repository according to the Package Review Guidelines.

8. **Merge:** During review, the continuous integration (CI) system may automatically build and test your PR. When your PR receives reviewer approval (`Review Approved`) and passes the required tests, project maintainers will merge your branch into the main branch and complete the contribution workflow.

## How to Test Changes

openRuyi provides a build platform based on Open Build Service, which allows you to test your contributions after making changes. After you finish your changes, we recommend setting up a local environment and running build tests locally. After your local build passes, you can push the changes to your personal project on OBS.

## Workflow for Reporting Bugs and Submitting Feature Requests

When you find a vulnerability, crash, performance issue, or another problem while using openRuyi, you can submit a bug report.

Before creating an issue, search the existing issue list to check whether someone has already reported the same problem. If a report already exists, add the details you encountered under the existing issue instead of submitting a duplicate. If you confirm the problem is new, fill out the bug report using the issue template.

If you have an idea for improving openRuyi or want to request a new feature, you can submit a feature request in the same way.

## How to Communicate with the Community

Active communication plays a vital role in open source projects. openRuyi will provide multiple community communication channels so contributors and maintainers can contact each other, discuss issues, and share experiences. When you start contributing or have questions, feel free to contact the community through the following channels:

* **Instant messaging:** Real-time chat channels help you receive quick responses and become part of the community. When asking questions in instant messaging channels, describe the problem clearly and concisely, and wait patiently for replies. Follow good communication etiquette: stay friendly, remain polite, and respect others. Because of time zones and volunteer availability, real-time chat may not always provide immediate answers. If no one responds, ask again later.

  * Join the [openRuyi Discord server](https://discord.gg/psSpvTSzTg).

* **Forum:** Online forums provide a common place for community users to communicate and ask for help. We plan to use GitHub Discussions for RFC publication, user support, tutorial sharing, and general discussion.

  * openRuyi uses [GitHub Discussions](https://github.com/openRuyi-Project/openRuyi/discussions) as its forum.

* **Meetings and offline events:** As the community grows, we may hold online seminars, developer meetings, and even offline meetups. These events can help contributors communicate directly, brainstorm ideas, and inspire more collaboration.
