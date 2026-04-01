---
title: GMP CLI
description: 使用 gmp 提交、跟踪、运行和后处理 EBench 评测任务。
---

## 安装

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 核心命令

- `gmp submit <config_paths...>`：向评测服务提交任务或重新连接已有任务。
- `gmp status`：查看当前 run 的进度和指标。
- `gmp eval`：运行 client worker，与 server episode 交互。
- `gmp plot <episode_path>`：对 episode 输出做后处理可视化。

## 提交模式

单任务：

```bash
gmp submit ebench/simple_pnp/task1 --run_id task1_debug
```

同一 run 提交多个任务：

```bash
gmp submit ebench/simple_pnp/task1 ebench/simple_pnp/task2 --run_id multi_task_debug
```

按 task-setting + split 提交：

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

benchmark 别名：

```bash
gmp submit ebench --run_id full_benchmark
```

## split 与 task-setting 对照

- Task setting：
- `mobile_manip`
- `table_top_manip`
- `generalist`
- Split：
- `val_train`
- `val_unseen`
- `test`

## 查看状态与恢复

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

## 评测示例

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

## Leaderboard（可选）

列出本地 run（内部模式）：

```bash
export GENMANIP_ENABLE_INTERNAL=1
gmp leaderboard list --project_root /path/to/GenManip-Sim
```

提交一个 run：

```bash
export LEADERBOARD_HOST="10.150.136.13"
export LEADERBOARD_PORT="55041"
export USER_TOKEN="user_token_here"
gmp leaderboard submit --run_id "testtest" -n "My Best Model" -l "EBench" --project_root /path/to/GenManip-Sim
```

## 常用参数

- `--run_id`：run 的唯一标识，也用于断点恢复。
- `--host`、`--port`：评测服务地址（默认本地 `127.0.0.1:8087`）。
- `--worker_ids`：`gmp eval` 要接入的 worker。
- `--frame_save_interval`：client 侧存帧频率。
- `--chunk_size`：模型按 chunk 输出动作时的 chunk 长度。
