---
title: GMP CLI
description: Submit, monitor, evaluate, and post-process EBench tasks with gmp.
---

## Install

Install the `genmanip-client` package in your **client environment**:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Core commands

| Command | Purpose |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | Submit or reconnect benchmark tasks on the eval server. |
| [`gmp status`](#gmp-status) | Inspect progress and metrics for the current run. |
| [`gmp eval`](#gmp-eval) | Run client workers and interact with server episodes. |
| [`gmp plot`](#gmp-plot) | Post-process episode outputs into visualization artifacts. |
| [`gmp clean`](#gmp-clean) | Remove generated caches, logs, eval outputs, and temporary leftovers. |
| [`gmp visualize`](#gmp-visualize) | Browse eval results and replay episodes in the Rerun viewer. |

## Submit, status, and eval

### `gmp submit`

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

Supported task-setting paths:

Task settings:

- `mobile_manip`
- `table_top_manip`
- `generalist`

Splits:

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

For custom model integration, see [Integrate Your Own Model](/EBench-doc/evaluation/custom-model/).

## Clean, plot, and visualize

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

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

### `gmp visualize`

`gmp visualize` starts a local HTTPS viewer for browsing runs, task success rates, and per-episode replays.

Install the visualize extra:

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

Basic usage:

```bash
gmp visualize
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

## Common options

- `--run_id`: identifies and resumes a run.
- `--host`, `--port`: eval server target (default is local `127.0.0.1:8087`).
- `--worker_ids`: worker allocation in `gmp eval`.
- `--frame_save_interval`: client-side frame saving frequency.
- `--chunk_size`: action chunk length when your model predicts chunked actions.
