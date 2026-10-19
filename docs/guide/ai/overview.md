---
id: ai-overview
title: openRuyi AI Stack Overview
description: This article gives an overview of the AI software stack shipped by openRuyi.
slug: /guide/ai/overview
sidebar_position: 1
---

# openRuyi AI Stack Overview

openRuyi ships an AI software stack for large language model (LLM) inference that works out of the box. It includes llama.cpp, PyTorch, Triton, and vLLM, together with ROCm, AMD's GPU compute platform.

For usage examples, see [llama.cpp Quick Start](/docs/guide/ai/quick-start).

## Components

Some of the software is available in a CPU build and a ROCm build. The CPU build works on any openRuyi riscv64 machine. The ROCm build requires a [supported AMD graphics card](#supported-gpus).

| Software | CPU build | ROCm build | Description |
|---|---|---|---|
| llama.cpp | `llama-cpp` | `llama-cpp-rocm` | Inference engine for GGUF models |
| PyTorch | `python-torch` | `python-torch-rocm` | Deep learning framework |
| Triton | | `python-triton` | GPU kernel compiler |
| vLLM | `python-vllm` | `python-vllm-rocm` | High-performance inference engine |
| ROCm | | `rocr-runtime`, `rocm-hip`, `rocblas`, `rocminfo`, `rocm-smi`, and more | AMD GPU runtime, math libraries, and tools |

When you install a ROCm build, the ROCm runtime and math libraries it needs are installed as dependencies.

The CPU and ROCm builds of the same software cannot be installed at the same time. To switch from one build to the other, add `--allowerasing` when installing, for example:

```bash
sudo dnf install --allowerasing llama-cpp-rocm
```

## Supported GPUs {#supported-gpus}

The openRuyi ROCm packages are built for the following GPU architectures:

| GPU architecture | Graphics cards |
|---|---|
| `gfx1100` `gfx1101` | RDNA3 graphics cards, such as the Radeon RX 7900 XTX |
| `gfx1200` `gfx1201` | RDNA4 graphics cards, such as the Radeon RX 9070 XT |

AMD Instinct accelerators are not supported yet.
