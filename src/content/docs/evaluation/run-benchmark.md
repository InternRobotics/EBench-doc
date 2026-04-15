---
title: Run Evaluation
description: Start the Isaac Sim server and run an EBench evaluation.
---

## 1. Start the server

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087 --no_save_process
```

Or with a local Isaac Sim installation:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087 --no_save_process
```

## 2. Submit a task

From the **client environment**, submit a benchmark job:

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

Available task settings:

| Task setting | Description |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | Pick-and-place with mobile base |
| `ebench/table_top_manip/<split>` | Dexterous tabletop tasks |
| `ebench/generalist/<split>` | Mixed tasks across categories |

Splits: `val_train`, `val_unseen`, `test`

Submit all tasks at once with `gmp submit ebench --run_id full_run`.

## 3. Connect your model

Quick connectivity check with the built-in baseline:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

For your own model, see [Integrate Your Own Model](/EBench-doc/evaluation/custom-model/).

## 4. Check results

```bash
gmp status
```

Results are saved to `saved/eval_results/<task>/<run_id>/`.

> When running server and client on different machines, pass `--host <ip> --port <port>` to all `gmp` commands. See the [GMP CLI reference](/EBench-doc/tools/gmp-cli/) for all options.
