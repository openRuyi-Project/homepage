---
id: ai-quick-start
title: llama.cpp Quick Start
description: This article gives usage examples for the openRuyi AI software stack, covering llama.cpp on CPUs and AMD GPUs, and how to install PyTorch and vLLM.
slug: /guide/ai/quick-start
sidebar_position: 2
---

# llama.cpp Quick Start

This article walks through a set of short examples that show how to use llama.cpp on openRuyi. It uses a small model of about 500 MiB. The CPU examples run on any openRuyi riscv64 physical or virtual machine, and the AMD GPU examples need a [supported graphics card](/docs/guide/ai/overview#supported-gpus).

## Download a model {#download-a-model}

llama.cpp uses model files in the GGUF format. This article uses a quantized Qwen3.5-0.8B model provided by unsloth on [ModelScope](https://modelscope.cn/):

```bash
mkdir -p ~/models
curl -L -o ~/models/Qwen3.5-0.8B-Q4_K_M.gguf \
    https://modelscope.cn/models/unsloth/Qwen3.5-0.8B-GGUF/resolve/master/Qwen3.5-0.8B-Q4_K_M.gguf
```

## Run llama.cpp on an AMD GPU

### Check the GPU

Install `rocminfo` and `rocm-smi`:

```bash
sudo dnf install rocminfo rocm-smi
```

`rocminfo` should list a GPU agent whose name starts with `gfx`, and `rocm-smi` shows the temperature, power, and VRAM usage of the card:

```bash
rocminfo
rocm-smi
```

### Install llama.cpp

Install the ROCm build of llama.cpp. If the CPU build is installed, `--allowerasing` replaces it:

```bash
sudo dnf install --allowerasing llama-cpp-rocm
```

List the available devices. `ROCm0` should appear in the output:

```bash
llama-cli --list-devices
```

### Chat on the command line {#command-line-chat}

`llama-cli` starts an interactive chat. Type `/exit` or press `Ctrl+C` to quit. By default, as many model layers as possible are placed in VRAM:

```bash
llama-cli -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf
```

While the model is running, you can watch the GPU usage with `rocm-smi` in another terminal.

Pass a prompt with `-p` and add `-st` to run a single turn only, which is useful in scripts or for a quick test:

```bash
llama-cli -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf -p "Describe RISC-V in one sentence." -n 64 -rea off -st
```

`-n` limits the number of generated tokens. By default, Qwen3.5 outputs its thinking process first. `-rea off` turns thinking off so that the model answers directly. After the answer, the prompt processing and generation speeds are printed.

### OpenAI-compatible server {#openai-compatible-server}

`llama-server` provides an OpenAI API compatible HTTP server.

Run the following command in a terminal to start the server:

```bash
llama-server -m ~/models/Qwen3.5-0.8B-Q4_K_M.gguf -rea off --host 127.0.0.1 --port 8080
```

In another terminal, check the server status and send a chat request:

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Hello, please introduce yourself."}], "max_tokens": 64}'
```

Clients and applications on the same machine that support the OpenAI API can use the server by setting the API base URL to `http://127.0.0.1:8080/v1`.

:::note

The `llama-server` shipped by openRuyi does not include the web UI. Access it through the API.

:::

## Run llama.cpp on the CPU

Without a graphics card, you can also use the CPU build of llama.cpp. If the ROCm build is installed, add the `--allowerasing` option:

```bash
sudo dnf install --allowerasing llama-cpp
```

The CPU build is used in the same way as the ROCm build. See the sections above.

## PyTorch and vLLM

Install the CPU builds:

```bash
sudo dnf install python-torch python-vllm
```

When you install the ROCm builds, Triton is installed as a dependency:

```bash
sudo dnf install --allowerasing python-torch-rocm python-vllm-rocm
```

For how to use PyTorch and vLLM, see their upstream documentation.
