---
title: 环境配置
description: 准备 EBench 评测所需的 GenManip server/client 环境。
---

## 组件关系

- `GenManip-Sim` 提供评测服务端入口 `ray_eval_server.py` 和 benchmark task 配置。
- `genmanip-client` 提供 `gmp` CLI 和 `EvalClient` API。
- `EBench` 提供需要挂载到 `GenManip-Sim/saved/` 下的 benchmark 数据与资产。

## 前置条件

- Linux 工作站或集群节点 + NVIDIA GPU。
- CUDA 12.1 兼容环境。
- Isaac Sim 运行时（`/isaac-sim/python.sh` 或 pip 安装的 Isaac Sim 包）。
- Git 和（用于拉数据）DVC。

## 1. 克隆 benchmark 与 infra 仓库

```bash
git clone --recursive -b feature/pioneer https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Sim.git
git clone https://gitee.pjlab.org.cn/L2/SimPlatform/EBench.git
```

## 2. 安装 server 侧依赖

在将要运行 `ray_eval_server.py` 的环境里安装依赖：

```bash
/isaac-sim/python.sh -m pip install -r GenManip-Sim/requirements.txt
```

如果你使用的是纯 Python 环境 + Isaac Sim wheels，可改为 `python -m pip`。

## 3. 在模型环境安装 client 包

从 `GenManip-Sim` 的源码目录安装 `gmp`：

```bash
pip install -e GenManip-Sim/standalone_tools/packages/genmanip_client/
gmp --help
```

推荐拆分：

- Server 环境：Isaac Sim + GenManip-Sim 运行依赖。
- Client 环境：`genmanip-client` + 模型推理依赖。

## 4. 拉取 EBench 数据

```bash
cd EBench
pip install "dvc[oss,s3]"
dvc pull
cd ..
ln -s EBench GenManip-Sim/saved
```

完成后，`GenManip-Sim/saved/` 应该能直接看到 benchmark 资产，并作为默认评测输出目录，例如 `saved/eval_results/`。

## 5. 验证环境

终端 1（server）：

```bash
cd GenManip-Sim
/isaac-sim/python.sh ray_eval_server.py -n 50
```

终端 2（client）：

```bash
cd /path/to/your/client-env
gmp submit ebench/mobile_manip/test
```

提交成功后，启动一个 worker：

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

## 网络提醒

当 server 和 client 在不同机器上时，需要确保服务可访问，并在所有 `gmp` 命令中显式传 `--host` 与 `--port`。
