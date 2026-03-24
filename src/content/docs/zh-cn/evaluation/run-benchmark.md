---
title: 运行测试
description: 启动本地 Ray 评测服务，并完整跑通一次 EBench 任务。
---

## 1. 启动本地评测服务

如果你使用的是官方 Isaac Sim 安装，优先使用它自带的 Python 启动器：

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

如果当前环境已经通过 pip 安装了 Isaac Sim 相关 Python 包，也可以直接运行：

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

当前仓库里的默认端口是 `8087`。

## 2. 提交 EBench 任务

服务启动后，在 client 环境里提交一个评测任务：

```bash
gmp submit ebench/simple_pnp --run_id local_smoke_test --host 127.0.0.1 --port 8087
```

`gmp submit` 支持三种常见写法：

- 完整配置文件路径
- 简写 benchmark ID，例如 `ebench`
- 更细一点的路径，例如 `ebench/simple_pnp`

## 3. 启动本地 worker

如果只是做本地联通性检查，可以直接使用仓库内置的 fake action client：

```bash
python standalone_tools/client.py --host 127.0.0.1 --port 8087 --worker_ids 0 -a franka -g panda_hand
```

如果要并行起多个 worker，可以传多个 ID：

```bash
python standalone_tools/client.py --host 127.0.0.1 --port 8087 --worker_ids 0,1,2,3
```

## 4. 查看状态和输出

查看当前任务状态：

```bash
gmp status --host 127.0.0.1 --port 8087
```

本地结果会写到：

```text
saved/eval_results/<benchmark_id>/<run_id>/
```

## 说明

- `standalone_tools/client.py` 更适合联通性检查和 smoke test。
- 真正接入策略时，可以把 fake action loop 替换成你的模型推理逻辑，或者直接使用 `gmp eval`。
- 如果你不需要保存回放图像，server 侧加上 `--episode_recorder_save_every 0` 会更轻。
