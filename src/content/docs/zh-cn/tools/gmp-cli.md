---
title: GMP CLI
description: 使用 gmp 提交、跟踪、运行和后处理 EBench 评测任务。
---

## 安装

从 `GenManip-Sim` 的源码目录安装：

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 核心命令

| 命令 | 作用 |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | 向评测服务提交任务或重新连接已有任务。 |
| [`gmp status`](#gmp-status) | 查看当前 run 的进度和指标。 |
| [`gmp eval`](#gmp-eval) | 运行 client worker，与 server episode 交互。 |
| [`gmp plot`](#gmp-plot) | 对 episode 输出做后处理可视化。 |
| [`gmp clean`](#gmp-clean) | 清理生成的缓存、日志、评测输出和临时残留文件。 |
| [`gmp visualize`](#gmp-visualize) | 浏览评测结果，并在 Rerun viewer 中回放 episode。 |
| [`gmp online`](#gmp-online) | 把本地模型接到远端在线评测服务。 |
| [`gmp leaderboard`](#gmp-leaderboard-optional) | 列出或提交内部排行榜使用的 run。 |

## 提交、查看与评测

### `gmp submit`

按 benchmark family + split 提交：

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

benchmark 别名：

```bash
gmp submit ebench --run_id full_benchmark
```

支持的 task-setting 路径：

Task setting：

- `mobile_manip`
- `table_top_manip`
- `generalist`

Split：

- `val_train`
- `val_unseen`
- `test`

### `gmp status`

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

### `gmp eval`

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

## 清理、绘图与可视化

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

使用 `gmp clean` 清理本地运行产生的各类生成文件。

先预览将要删除的内容：

```bash
gmp clean --dry-run
```

清理生成的 mesh cache、评测结果、日志，以及遗留的 lock/tmp 文件：

```bash
gmp clean
```

如果还要删除下载下来的 benchmark package cache：

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize` 会启动一个本地 HTTPS viewer，用来浏览 run、查看 task 成功率，并回放单个 episode。

先进入 `genmanip_client` 包目录，再安装 visualize 额外依赖：

```bash
cd GenManip-Sim/standalone_tools/packages/genmanip_client/
pip install -e ".[visualize]"
```

基本用法：

```bash
gmp visualize
gmp visualize --project_root /path/to/GenManip-Sim
gmp visualize --port 55088
```

缓存管理：

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

说明：

- `gmp visualize` 默认读取 `saved/eval_results/` 下的结果。
- 由于 viewer 使用 HTTPS，浏览器第一次打开时可能会出现一次证书提示。
- 当前 visualize 依赖的 `rerun-sdk` 路径要求 Python 3.11+。

## 在线服务与排行榜

### `gmp online`

当模型在本地运行、而评测资源由远端 GenManip 服务分配时，使用 `online` 子命令。

仅创建在线任务、不等待资源就绪：

```bash
gmp online create \
  --base_url https://example.com \
  --token YOUR_TOKEN \
  --task_id T2025123100001 \
  --model_name internVLA \
  --model_type VLA \
  --benchmark_set EBench
```

检查已有任务是否就绪：

```bash
gmp online ready \
  --base_url https://example.com \
  --token YOUR_TOKEN \
  --task_id T2025123100001
```

创建任务并等待 endpoint 就绪：

```bash
gmp online submit \
  --base_url https://example.com \
  --token YOUR_TOKEN \
  --task_id T2025123100001 \
  --model_name internVLA \
  --model_type VLA \
  --benchmark_set EBench
```

适合脚本接入的工作流：

```bash
resp=$(gmp online submit \
  --base_url https://example.com \
  --token YOUR_TOKEN \
  --task_id T2025123100001 \
  --model_name internVLA \
  --model_type VLA \
  --benchmark_set EBench \
  --print_endpoint)

GMP_ONLINE_URL=$(printf '%s' "$resp" | jq -r '.endpoint')
TASK_ID=$(printf '%s' "$resp" | jq -r '.task_id')

gmp eval --url "$GMP_ONLINE_URL" --run_id "$TASK_ID" --token YOUR_TOKEN
```

说明：

- `gmp online create` 只负责创建任务记录。
- `gmp online submit` 默认会持续轮询直到 endpoint 就绪。
- `gmp online ready` 可用于轮询已有任务。
- `task_id` 通常也作为本地 `run_id` 使用。

### `gmp leaderboard`（可选）

如果你使用的是内部在线评测服务，`gmp` 还提供 leaderboard 相关命令。若这部分不面向公开用户，建议转移到内部文档。

列出本地 run：

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
