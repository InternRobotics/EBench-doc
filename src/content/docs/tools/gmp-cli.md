---
title: GMP CLI
description: Submit, monitor, evaluate, and post-process EBench tasks with gmp.
---

## Install

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Core commands

- `gmp submit <config_paths...>`: submit or reconnect benchmark tasks on eval server.
- `gmp status`: inspect progress and metrics for current run.
- `gmp eval`: run client workers and interact with server episodes.
- `gmp plot <episode_path>`: post-process episode outputs into visualization artifacts.

## Submit patterns

Single task:

```bash
gmp submit ebench/simple_pnp/task1 --run_id task1_debug
```

Multiple tasks in one run:

```bash
gmp submit ebench/simple_pnp/task1 ebench/simple_pnp/task2 --run_id multi_task_debug
```

Task setting + split:

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

Benchmark alias:

```bash
gmp submit ebench --run_id full_benchmark
```

## Split and task-setting reference

- Task settings:
- `mobile_manip`
- `table_top_manip`
- `generalist`
- Splits:
- `val_train`
- `val_unseen`
- `test`

## Status and resume

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

## Eval examples

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

## Leaderboard (optional)

List local runs (internal mode):

```bash
export GENMANIP_ENABLE_INTERNAL=1
gmp leaderboard list --project_root /path/to/GenManip-Sim
```

Submit one run:

```bash
export LEADERBOARD_HOST="10.150.136.13"
export LEADERBOARD_PORT="55041"
export USER_TOKEN="user_token_here"
gmp leaderboard submit --run_id "testtest" -n "My Best Model" -l "EBench" --project_root /path/to/GenManip-Sim
```

## Common options

- `--run_id`: identifies and resumes a run.
- `--host`, `--port`: eval server target (default is local `127.0.0.1:8087`).
- `--worker_ids`: worker allocation in `gmp eval`.
- `--frame_save_interval`: client-side frame saving frequency.
- `--chunk_size`: action chunk length when your model predicts chunked actions.
