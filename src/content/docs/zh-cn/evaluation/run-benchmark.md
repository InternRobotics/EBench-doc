---
title: 运行测试
description: 使用 GenManip 的 server/client 工作流端到端运行 EBench。
---

## 1. 启动评测服务

如果你用的是本机 Isaac Sim 安装，使用 Isaac Sim Python：

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

如果当前环境已经装好了 Isaac Sim 的 Python 包，也可以直接运行：

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

快速联调（更短 horizon）可用：

```bash
/isaac-sim/python.sh ray_eval_server.py -n 50
```

## 2. 提交评测任务

`gmp submit` 支持单任务、多任务、benchmark 别名和 task-setting 路径。

```bash
gmp submit ebench/mobile_manip/test --run_id local_smoke_test
gmp submit ebench/simple_pnp/task1 ebench/simple_pnp/task2 --run_id compare_two_tasks
gmp submit ebench --run_id full_ebench
```

`gmp` 默认连接 `127.0.0.1:8087`，也可以覆盖：

```bash
gmp submit ebench/mobile_manip/val_unseen --host 10.150.129.227 --port 8086
```

## 3. 启动 client worker

使用随机/假动作策略做快速验证：

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --host 127.0.0.1 --port 8087 --frame_save_interval 10
```

接入自定义模型时，建议在自己的循环中使用 EvalClient（`reset -> step -> done`），并在 `get_action(obs)` 中调用模型推理。

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
- 在线 leaderboard 提交是可选流程，见 CLI 页面。
