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

## 克隆仓库

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Server 环境

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

```bash
pip install -e standalone_tools/packages/genmanip_client/
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

下一步：[下载评测资产](/zh-cn/getting-started/assets/)。
