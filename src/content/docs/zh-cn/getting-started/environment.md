---
title: 环境配置
description: 部署 Isaac Sim server 环境，并在模型环境中安装轻量 client 包。
---

EBench 采用 client–server 架构，你需要配置**两套环境**：

- **Server 环境** — Isaac Sim、cuRobo 以及来自 [GenManip](https://github.com/InternRobotics/GenManip) 仓库的仿真服务端代码。
- **Client 环境** — **就是你模型本身所在的 Python 环境**。轻量的 [`genmanip-client`](https://github.com/InternRobotics/genmanip-client) 与你的模型依赖一起安装，自身依赖极少，不会和模型环境产生冲突。

## 前置条件

- Linux 工作站 + NVIDIA GPU。
- CUDA 12.1 及兼容驱动。
- Isaac Sim 4.1.0 兼容的 Python 环境（server 侧）。

## Server 环境

### 克隆仿真服务端

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

### 安装 Isaac Sim

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

如果已有本机 Isaac Sim 安装，可直接使用——server 侧命令改用 `/isaac-sim/python.sh` 即可。

### 安装项目依赖

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Client 环境

Client 环境**就是你模型运行所在的 Python 环境**——把它装在你模型代码运行的环境里，与模型依赖共存即可。`genmanip-client` 已经是独立仓库，依赖极少，不会与你的模型环境产生冲突。

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
gmp --help
```

## 验证

确认两套环境都正常：

```bash
# Server 环境
python ray_eval_server.py --help

# Client 环境
gmp --help
```

下一步：[下载评测资产](/EBench-doc/zh-cn/getting-started/assets/)。
