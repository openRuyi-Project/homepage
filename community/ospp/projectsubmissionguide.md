---
id: project-submission-guide
title: Project Submission Guide for Mentors
description: Guidance for openRuyi mentors on submitting OSPP project proposals
slug: /ospp/project-submission-guide
---

# Project Submission Guide for Mentors

Contributors can submit all project details through a GitHub Issue and do not need to log in to the OSPP system. Once the Issue is submitted, a designated reviewer will check the information and enter the project into OSPP for publication.

This guide does not supersede the official OSPP rules. Before participating, please read the official OSPP [Mentor Guide](https://docs2026-en.summer.ospp.ac.cn/archives/mentor-guide).

## Classic Track and Pioneer Program

| Aspect                  | Classic Track                                               | Pioneer Program                                              |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Project definition      | The community or mentor defines a specific task in advance. | The community first sets a broad direction; students then define a specific problem and design a solution. |
| Student participation   | Students choose a published project and apply.              | Students submit a proposal based on that direction and take part in a pitch. |
| Project refinement      | Mostly finalized before publication.                        | Refined jointly by the student and mentor after a successful pitch. |
| Difficulty              | Basic or Advanced                                           | Basic, Advanced, or Challenge                                |
| Supported architectures | RISC-V64                                                    | x86_64, AArch64, RISC-V64, or other architectures            |

The Classic Track is the default for openRuyi projects. Before submitting a Pioneer Program project, discuss it with the community and obtain approval. Do not select Pioneer Program without prior approval.

## 1. Go to the Submission Page

Step 1. Go to [openRuyi OSPP Issues](https://github.com/openRuyi-Project/ospp/issues).

Step 2. Click **New issue** in the upper-right corner.

Step 3. Choose a template based on whether student applications will be accepted in Chinese, English, or both:

- If applications are accepted in Chinese only, select **OSPP 2026 Project Submission (Chinese Only)**.
- If applications are accepted in both Chinese and English, select **OSPP 2026 Project Submission (Chinese and English / English)**.
- If applications are accepted in English only, use the **Chinese and English / English** template and set the application language to **English only**.

Do not select **Blank issue**, as it may prevent staff from collecting all required project information.

## 2. Language Requirements

### i. Chinese-Only Projects

Use the **Chinese-only** template and complete all fields in Chinese.

### ii. Bilingual Projects

Select **Chinese and English**. Complete all required fields in both languages; do not submit only one language version.

Recommended Issue title format:

```text
Chinese Project Name / English Project Name
```

### iii. English-Only Projects

Select **English only**. Complete all English fields as usual and enter the following in every field that requires Chinese content:

```text
N/A
```

## 3. Complete the Project Details

### i. Issue Title

Replace the pre-filled title at the top of the Issue with the actual project name.

For a Chinese-only project, use the Chinese name. For a bilingual project, use the recommended format "Chinese Name / English Name."

The title should clearly state the technology used and the project goal. Avoid vague names such as "Project Development" or "System Optimization," and do not combine multiple sentences with commas.

Recommended formats:

```text
Implement <Goal> with <Technology or Technology Stack>
Develop <Feature> for <Platform or Use Case>
Complete <Task> with <Tool or Software>
```

### ii. Project Type

For the Classic Track, select:

```text
Classic Track
```

If the community has discussed and approved the use of the Pioneer Program, select:

```text
Pioneer Program
```

In OSPP, the supported architecture for Classic Track projects is fixed at `RISC-V64`.

### iii. Project Name

Enter the official project name. For a bilingual project, provide both the Chinese and English names and make sure they match the Issue title.

Example:

```text
Project Name (Chinese): <Equivalent Chinese title>
Project Name (English): Automated Package Build and Testing Tool for RISC-V64
```

### iv. Project Mentor

Complete the following fields:

```text
Mentor Name:
Mentor Email:
openRuyi Contribution Repository URL:
```

Notes:

- Use the same email address the mentor uses for contributions to the openRuyi organization.
- The repository URL must show the mentor's actual contributions to openRuyi.

Mentor registration instructions:

- A mentor may supervise no more than two projects. If multiple mentors are listed, confirm that each mentor does not exceed this limit.
- First-time OSPP mentors will receive an invitation email after the organization contact adds their information. They should use the link in the email to log in and complete identity verification. Enter openRuyi for Organization Name and the openRuyi repository to which the mentor has contributed for Contribution Repository.
- Mentors who have previously registered with OSPP should log in with their existing accounts and complete identity verification. They should also check **Organization Name** and **Contribution Repository**: the organization should be openRuyi, and the contribution repository should be an openRuyi repository to which they have contributed. Any incorrect information should be updated promptly.
- Mentors may not also participate as students in the current edition of OSPP.

### v. Project Description

The project description must cover all five points below:

```markdown
## Background

Describe the project's technical field and use cases, and explain why the work is needed.

## Existing Work

Describe what the current repository, software, or community already supports.

## Current Limitations

Describe any missing features, performance issues, or usage limitations.

## Planned Improvements

Describe the specific issues the project will address.

## Final Objectives

State what the completed project should deliver and how success will be measured.
```

Write one coherent project description that covers all five points rather than treating them as disconnected sections.

For projects that accept applications in English, provide a complete English description; translating only the headings is not sufficient.

### vi. Project Notes

This field is required in the GitHub Issue template:

- If there is nothing to add, enter the equivalent of `None` in each language.
- To simplify entry into OSPP, keep the Chinese entry under 5,000 characters and the English entry under 10,000 characters.

### vii. Difficulty

For Classic Track projects, choose either:

- **Basic**
- **Advanced**

The **Challenge** level is available only for Pioneer Program projects that the community has discussed and approved.

### viii. Development Cycle

Choose a duration based on the estimated workload:

- **2 months**
- **3 months**
- **4 months**

### ix. Technical Domain Tags

Select one or more:

- **Open-source Chips**
- **Application Development**
- **Big Data and Artificial Intelligence**
- **Development and Operations**
- **Distributed Systems**
- **Operating Systems and Infrastructure Software**
- **Networking and Security**
- **Programming Languages**

Choose only the domains directly related to the project's core work. Do not select every option simply to increase visibility.

### x. Programming Language Tags

List the programming languages actually used in the project, separated by commas:

```text
C, C++, Rust
```

Do not include frameworks, operating systems, or databases.

### xi. Project Deliverables

List the required work and expected outcomes as numbered items:

```text
1. Implement an automated build module for RISC-V64.
2. Restore upstream tests for core components.
3. Produce functional and performance test reports.
4. Write installation, usage, and maintenance documentation.
```

Requirements:

- Each item must describe one verifiable outcome.
- Keep each Chinese item to 30 characters or fewer where possible.
- Avoid items that cannot be evaluated, such as "become familiar with the project" or "learn the relevant concepts."

### xii. Technical Requirements

Describe the requirements in three areas: programming languages, technology stack, and development experience:

```text
1. Familiarity with C/C++ and the ability to read the existing codebase.
2. Familiarity with Linux development environments and Git workflows.
3. Basic knowledge of the RISC-V architecture and cross-compilation.
4. Experience with QEMU or Buildroot is preferred.
```

Use clear phrases such as "proficient in," "familiar with," "knowledge of," and "experience with ... is preferred." Keep each Chinese item to 30 characters or fewer where possible.

### xiii. Output Repository (PR Target)

Enter the root URL of an existing repository in the organization where students will submit their deliverables and PRs:

```text
https://github.com/openRuyi-Project/<repository-name>
```

Requirements:

- Use an existing repository, not a newly created empty one.
- Enter the complete HTTPS URL of the repository root.
- Do not link to an organization homepage, a branch, a subdirectory, an Issue, or an SSH URL.
- Do not add explanatory text or a `.git` suffix.
- Separate multiple repository URLs with commas.

### xiv. Repository License

Enter the SPDX license identifier used by the output repository. For example:

```text
Apache-2.0
MIT
GPL-2.0-only
```

If you list multiple repositories, provide the corresponding license identifiers in the same order, separated by commas. Every repository must have a matching identifier; repeat an identifier when more than one repository uses the same license.

## 4. Pre-Submission Checklist

Before submitting, make sure that:

- The correct project type is selected. If the Pioneer Program is used, the community has discussed and approved it in advance.
- The project name clearly states the technology and goal.
- The mentor's name, email address, and contribution repository are complete.
- The project description covers all five required points.
- Every deliverable can be evaluated separately.
- The technical requirements match the project difficulty.
- The output repository is a valid repository root URL.
- The repository license is correct.
- The Chinese and English versions of a bilingual project match.

Select the following confirmation checkbox:

```text
I confirm that the information is complete and accurate and matches the selected application language.
```

Then click **Create** to submit the Issue.

## 5. Post-Submission Process

1. The contributor submits a GitHub Issue.
2. Staff check that all required information is included.
3. If changes are needed, staff will post the requested revisions in a comment on the Issue.
4. The contributor edits the original Issue to make the requested changes instead of opening a new Issue.
5. Once all information has been confirmed, designated staff will enter the project into OSPP for publication.
6. Do not close the Issue until staff confirm that the project has been entered successfully.
