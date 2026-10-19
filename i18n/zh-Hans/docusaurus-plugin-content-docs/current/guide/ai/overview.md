---
id: ai-overview
title: openRuyi AI 栈概览
description: 本文介绍 openRuyi 提供的 AI 软件栈的基本情况。
slug: /guide/ai/overview
sidebar_position: 1
---

# openRuyi AI 栈概览

openRuyi 提供了一套用于大模型推理的 AI 软件栈，包括 llama.cpp、PyTorch、Triton 和 vLLM，以及 AMD GPU 计算平台 ROCm，开箱即用。

具体使用示例请参阅[llama.cpp 快速入门](/docs/guide/ai/quick-start)。

## 组件

部分软件提供 CPU 和 ROCm 两个版本。CPU 版本可以在任意 openRuyi riscv64 机器上使用，ROCm 版本需要[支持的 AMD 显卡](#supported-gpus)。

| 软件 | CPU 版本 | ROCm 版本 | 说明 |
|---|---|---|---|
| llama.cpp | `llama-cpp` | `llama-cpp-rocm` | GGUF 格式推理引擎 |
| PyTorch | `python-torch` | `python-torch-rocm` | 深度学习框架 |
| Triton | | `python-triton` | GPU 算子编译器 |
| vLLM | `python-vllm` | `python-vllm-rocm` | 高性能推理引擎 |
| ROCm | | `rocr-runtime`、`rocm-hip`、`rocblas`、`rocminfo`、`rocm-smi` 等 | AMD GPU 运行时、数学库与工具 |

安装 ROCm 版本的软件包时，所需的 ROCm 运行时和数学库会作为依赖一并安装。

同一软件的 CPU 版本和 ROCm 版本不能同时安装。如需从一个版本切换到另一个版本，请在安装时加上 `--allowerasing`，例如:

```bash
sudo dnf install --allowerasing llama-cpp-rocm
```

## 支持的显卡 {#supported-gpus}

openRuyi 的 ROCm 软件包为以下 GPU 架构构建:

| GPU 架构 | 显卡 |
|---|---|
| `gfx1100` `gfx1101` | RDNA3 系列显卡，例如 Radeon RX 7900 XTX |
| `gfx1200` `gfx1201` | RDNA4 系列显卡，例如 Radeon RX 9070 XT |

AMD Instinct 计算卡暂未支持。
