---
title: 环境配置
description: 部署 Isaac Sim server 环境，并在模型环境中安装轻量 client 包。
---

EBench 采用 client–server 架构，你需要配置**两套环境**：

- **Server 环境** — Isaac Sim、cuRobo 和评测代码。
- **Client 环境** — 仅需 `genmanip-client` 和模型自身的依赖。该包依赖极少，避免冲突。

## 前置条件

- Linux 工作站 + NVIDIA GPU。
- CUDA 12.1 及兼容驱动。
- Isaac Sim 4.1.0 兼容的 Python 环境（server 侧）。
- `git-lfs`。

## 克隆仓库

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Server 环境

### 安装 Isaac Sim

当前配置使用 Isaac Sim `4.1.0`、CUDA `12.1`、Torch `2.4.0`：

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
sudo apt install git-lfs
```

如果已有本机 Isaac Sim 安装，可直接使用——server 侧命令改用 `/isaac-sim/python.sh` 即可。

### 安装项目依赖

EBench 依赖 `cuRobo` 和仓库 requirements：

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Client 环境

Client 包极轻量，可以和模型依赖共存而不产生冲突。

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

安装完成后，可以在模型代码中直接 `import` 通信 client 与 Server 交互。

## 快速验证

在下载资产或启动评测之前，先确认：

- 仓库根目录下 `saved/` 存在。
- client 环境中 `gmp --help` 正常。
- server 环境中 `python ray_eval_server.py --help` 或 `/isaac-sim/python.sh ray_eval_server.py --help` 正常。

## 网络提醒

当 server 和 client 在不同机器上时，需要确保服务可访问，并在所有 `gmp` 命令中显式传 `--host` 与 `--port`。
