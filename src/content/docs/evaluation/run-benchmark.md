---
title: Run Evaluation
description: Run EBench end to end with GenManip server/client workflow.
---

## 1. Start the evaluation server

Use Isaac Sim Python if you run from a local Isaac Sim installation:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

Or run directly in an environment where Isaac Sim packages are already installed:

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

Quick smoke-test option (shorter horizon):

```bash
/isaac-sim/python.sh ray_eval_server.py -n 50
```

## 2. Submit benchmark tasks

`gmp submit` accepts single task, multiple tasks, benchmark aliases, and task-setting paths.

```bash
gmp submit ebench/mobile_manip/test --run_id local_smoke_test
gmp submit ebench/simple_pnp/task1 ebench/simple_pnp/task2 --run_id compare_two_tasks
gmp submit ebench --run_id full_ebench
```

By default, `gmp` connects to `127.0.0.1:8087`. Override target if needed:

```bash
gmp submit ebench/mobile_manip/val_unseen --host 10.150.129.227 --port 8086
```

## 3. Start client workers

For quick validation with a random/fake policy:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --host 127.0.0.1 --port 8087 --frame_save_interval 10
```

For custom model integration, use EvalClient in your own loop (`reset -> step -> done`) and call your model in `get_action(obs)`.

## 4. Check progress and outputs

```bash
gmp status --host 127.0.0.1 --port 8087
```

Result directories:

- Server-side benchmark results: `saved/eval_results/<benchmark_or_task>/<run_id>/`
- Client-side logs/videos (default): `./client_results/<run_id>/`
- Change client result directory with `GENMANIP_RESULT_DIR`.

## 5. Resume an existing run

Use the same run ID to reconnect and inspect historical progress:

```bash
gmp submit ebench --run_id history_id
gmp status
```

## Notes

- Use `--episode_recorder_save_every 0` to reduce server image dump overhead.
- `gmp eval --chunk_size <N>` can be used when your model outputs action chunks.
- Online leaderboard submission is optional and is documented in the CLI page.
