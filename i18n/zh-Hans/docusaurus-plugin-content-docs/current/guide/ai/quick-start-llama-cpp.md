---
id: ai-quick-start
title: llama.cpp 快速入门
description: 本文给出 openRuyi AI 软件栈的使用示例，涵盖在 CPU 和 AMD GPU 上运行 llama.cpp，以及 PyTorch 和 vLLM 的安装方式。
slug: /guide/ai/quick-start
sidebar_position: 2
---

# llama.cpp 快速入门

本文通过一组简短的示例介绍如何在 openRuyi 上使用 llama.cpp。本文将使用一个约 500 MiB 的小模型，CPU 上的示例可以在任意 openRuyi riscv64 物理机或虚拟机上运行，AMD GPU 上的示例需要[支持的显卡](/docs/guide/ai/overview#supported-gpus)。

## 下载模型 {#download-a-model}

llama.cpp 使用 GGUF 格式的模型文件。本文使用 [ModelScope](https://modelscope.cn/) 上由 unsloth 提供的 Qwen3.5-0.8B 量化模型:

```bash
mkdir -p ~/models
curl -L -o ~/models/Qwen3.5-0.8B-Q4_K_M.gguf \
    https://modelscope.cn/models/unsloth/Qwen3.5-0.8B-GGUF/resolve/master/Qwen3.5-0.8B-Q4_K_M.gguf
```

## 在 AMD GPU 上运行 llama.cpp

### 检查 GPU

安装 `rocminfo` 和 `rocm-smi`:

```bash
sudo dnf install rocminfo rocm-smi
```

`rocminfo` 应列出一个名称以 `gfx` 开头的 GPU agent，`rocm-smi` 显示显卡的温度、功耗和显存占用:

```bash
rocminfo
rocm-smi
```

### 安装 llama.cpp

安装 ROCm 版本的 llama.cpp。如果已经安装了 CPU 版本，`--allowerasing` 会将其替换:

```bash
sudo dnf install --allowerasing llama-cpp-rocm
```

列出可用设备，输出中应出现 `ROCm0`:

```bash
llama-cli --list-devices
```

### 命令行对话 {#command-line-chat}

`llama-cli` 启动一个交互式对话，输入 `/exit` 或按 `Ctrl+C` 退出。模型层默认会尽可能放到显存中:

```bash
llama-cli -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf
```

运行时可以在另一个终端中用 `rocm-smi` 观察 GPU 占用。

加上 `-p` 指定提示词、`-st` 只进行一轮对话，即可用于脚本或快速测试:

```bash
llama-cli -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf -p "用一句话介绍 RISC-V。" -n 64 -rea off -st
```

`-n` 限制生成的 token 数量。Qwen3.5 默认会先输出思考过程，`-rea off` 关闭思考，直接给出回答。回答结束后会打印提示词处理和生成的速度。

### 兼容 OpenAI API 的服务端 {#openai-compatible-server}

`llama-server` 可以提供一个兼容 OpenAI API 的 HTTP 服务。

在终端中输入以下命令来启动服务:

```bash
llama-server -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf -rea off --host 127.0.0.1 --port 8080
```

在另一个终端中检查服务状态，并发送一个对话请求:

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "你好，请介绍一下你自己。"}], "max_tokens": 64}'
```

对于本机支持 OpenAI API 的客户端和应用，将 API 地址设为 `http://127.0.0.1:8080/v1` 即可使用该服务。

:::note

openRuyi 的 `llama-server` 不包含 Web 界面，请通过 API 访问。

:::

## 在 CPU 上运行 llama.cpp

没有显卡时，也可以使用 CPU 版本的 llama.cpp。如果已经安装了 ROCm 版本，请添加 `--allowerasing` 选项:

```bash
sudo dnf install --allowerasing llama-cpp
```

CPU 版本的用法与 ROCm 版本相同，请参阅上文。

## PyTorch 与 vLLM

安装 CPU 版本:

```bash
sudo dnf install python-torch python-vllm
```

安装 ROCm 版本时，Triton 会作为依赖一并安装:

```bash
sudo dnf install --allowerasing python-torch-rocm python-vllm-rocm
```

PyTorch 和 vLLM 的具体用法请参阅各自的上游文档。
