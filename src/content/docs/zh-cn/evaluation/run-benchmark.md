---
title: 运行评测
description: 启动 Isaac Sim server 并完整跑通一次 EBench 评测任务。
---

## 1. 启动 Server

Server 端运行 Isaac Sim 并暴露仿真环境。如果你使用的是本地安装的 Isaac Sim，优先使用它自带的 Python 启动器：

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

如果当前环境已经通过 pip 安装了 Isaac Sim：

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

快速联调（更短 horizon，50 步）：

```bash
/isaac-sim/python.sh ray_eval_server.py -n 50
```

## 2. 提交评测任务

Server 启动后，在 **client 环境**中提交评测任务：

```bash
gmp submit ebench/mobile_manip/test --run_id local_smoke_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

`gmp submit` 支持多种写法：

- 完整配置文件路径
- 简写 benchmark ID，例如 `ebench`
- 更细的路径，例如 `ebench/simple_pnp`

`gmp` 默认连接 `127.0.0.1:8087`，也可以覆盖：

```bash
gmp submit ebench/mobile_manip/val_unseen --host <server_ip> --port 8087
```

## 3. 接入模型

如果只是做联通性检查，可以用内置的 baseline policy：

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --host 127.0.0.1 --port 8087 --frame_save_interval 10
```

正式评测时，在模型代码中直接 import client：

```python
from genmanip_client.eval_client import EvalClient

client = EvalClient(base_url="http://127.0.0.1:8087", worker_ids=["0"], run_id="my_run")
# 通过 client 接收观测、发送动作
```

输入输出格式和最小 `ModelClient` 示例见[接入自定义模型](/zh-cn/evaluation/custom-model/)。

## 4. 查看进度和结果

```bash
gmp status --host 127.0.0.1 --port 8087
```

结果目录：

- Server 侧评测结果：`saved/eval_results/<benchmark_or_task>/<run_id>/`
- Client 侧日志/视频（默认）：`./client_results/<run_id>/`
- 可通过 `GENMANIP_RESULT_DIR` 修改 client 结果目录。

## 5. 断点恢复已有 run

使用相同 run ID 可重新连接并查看历史进度：

```bash
gmp submit ebench --run_id history_id
gmp status
```

## 说明

- 建议加 `--episode_recorder_save_every 0` 以减少 server 侧存图开销。
- 当模型按 chunk 预测动作时，可使用 `gmp eval --chunk_size <N>`。
