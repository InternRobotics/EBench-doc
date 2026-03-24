---
title: 环境配置
description: 准备 EBench 的本地 Isaac Sim 环境、项目依赖以及 GMP 客户端。
---

## 前置条件

- Linux 工作站和 NVIDIA GPU。
- CUDA 12.1 以及兼容驱动。
- 一个可运行 Isaac Sim 4.1.0 的 Python 环境。
- `git-lfs`。

## 克隆仓库

这套公开文档默认最终仓库位置为 `InternRobotics/EBench`：

```bash
git clone https://github.com/InternRobotics/EBench.git
cd EBench
```

如果你当前仍然从 `GenManip-Sim` 工作区运行，把这里的仓库根目录替换成你本地的实际路径即可。

## 安装模拟器侧依赖

当前安装脚本使用 Isaac Sim `4.1.0`、CUDA `12.1` 和 Torch `2.4.0`：

```bash
export CUDA_HOME=/usr/local/cuda-12.1
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH

pip install isaacsim==4.1.0 isaacsim-extscache-physics==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
sudo apt install git-lfs
```

如果你不是用上面的 pip wheel，而是本机已有 Isaac Sim 安装，也可以继续沿用原有方式，只是在后续运行 server 时改用 `/isaac-sim/python.sh`。

## 安装项目依赖

当前 EBench 依赖 `cuRobo` 以及仓库本身的 requirements：

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## 安装 GMP 客户端

`gmp` CLI 位于 `standalone_tools/packages/genmanip_client/`：

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 推荐的环境拆分

- Server 环境：Isaac Sim、评测代码、`cuRobo` 和仓库依赖。
- Client 环境：`genmanip-client` 以及你的策略/模型依赖。

这样做的好处是：本地评测服务跑在较重的 Isaac Sim 环境里，而策略推理可以留在更轻的 client 环境中。

## 快速检查

开始下载资产和跑测试之前，至少确认：

- 仓库根目录下已经有 `saved/`。
- client 环境中 `gmp --help` 可以正常工作。
- simulator 环境中 `python ray_eval_server.py --help` 或 `/isaac-sim/python.sh ray_eval_server.py --help` 可以正常运行。
