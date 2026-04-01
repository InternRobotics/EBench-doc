---
title: GMP CLI
description: Submit, monitor, evaluate, and post-process EBench tasks with gmp.
---

## Install

Install from the `GenManip-Sim` source tree:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Core commands

| Command | Purpose |
| :-- | :-- |
| [`gmp submit`](#submit-status-and-eval) | Submit or reconnect benchmark tasks on the eval server. |
| [`gmp status`](#submit-status-and-eval) | Inspect progress and metrics for the current run. |
| [`gmp eval`](#submit-status-and-eval) | Run client workers and interact with server episodes. |
| [`gmp plot`](#clean-plot-and-visualize) | Post-process episode outputs into visualization artifacts. |
| [`gmp clean`](#clean-plot-and-visualize) | Remove generated caches, logs, eval outputs, and temporary leftovers. |
| [`gmp visualize`](#clean-plot-and-visualize) | Browse eval results and replay episodes in the Rerun viewer. |
| [`gmp online`](#online-and-leaderboard) | Connect a local policy to a remote online evaluation service. |

## Submit, status, and eval

### Submit patterns

Benchmark family + split:

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

Benchmark alias:

```bash
gmp submit ebench --run_id full_benchmark
```

### Split and task-setting reference

Task settings:

- `mobile_manip`
- `table_top_manip`
- `generalist`

Splits:

- `val_train`
- `val_unseen`
- `test`

### Status and resume

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

### Eval examples

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

## Clean, plot, and visualize

### Plot episode outputs

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### Clean generated files

Use `gmp clean` to remove generated artifacts from local runs.

Preview what would be removed:

```bash
gmp clean --dry-run
```

Remove generated mesh cache, eval results, logs, and leftover lock/tmp files:

```bash
gmp clean
```

Also remove downloaded benchmark package cache:

```bash
gmp clean --all
```

### Visualize results

`gmp visualize` starts a local HTTPS viewer for browsing runs, task success rates, and per-episode replays.

Install the visualize extra first:

```bash
pip install -e ".[visualize]"
```

Basic usage:

```bash
gmp visualize
gmp visualize --project_root /path/to/GenManip-Sim
gmp visualize --port 55088
```

Cache management:

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

Notes:

- `gmp visualize` expects evaluation outputs under `saved/eval_results/`.
- The viewer uses HTTPS and may show a one-time browser certificate warning.
- The current `rerun-sdk` path used by visualize requires Python 3.11+.

## Online and leaderboard

### Online evaluation

Use the `online` subcommands when your model runs locally but evaluation resources are allocated by a remote GenManip service.

Create a task and wait for a ready endpoint:

```bash
gmp online submit \
  --base_url https://example.com \
  --token YOUR_TOKEN \
  --task_id T2025123100001 \
  --model_name internVLA \
  --model_type VLA \
  --benchmark_set EBench
```

Machine-readable workflow:

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

Notes:

- `gmp online submit` waits for the endpoint by default.
- `gmp online ready` can be used to poll an existing task.
- `task_id` is typically reused as the local `run_id`.

### Leaderboard (optional)

If you are using the internal online evaluation service, `gmp` also exposes leaderboard-related commands. Keep these examples in a private/internal workflow guide if they are not meant for public users.

List local runs:

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
