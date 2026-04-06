---
title: Run Evaluation
description: Start the Isaac Sim server and run an EBench evaluation end to end.
---

## 1. Start the server

The server runs Isaac Sim and exposes the simulation environment. Use the bundled Python launcher if you have a local Isaac Sim installation:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

If your current environment already has Isaac Sim installed via pip:

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

Quick smoke-test option (shorter horizon, 50 steps per episode):

```bash
/isaac-sim/python.sh ray_eval_server.py -n 50
```

## 2. Submit benchmark tasks

With the server running, submit a benchmark job from the **client environment**:

```bash
gmp submit ebench/mobile_manip/test --run_id local_smoke_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

`gmp submit` accepts benchmark aliases and benchmark-family split paths:

- shorthand benchmark IDs such as `ebench`
- narrower paths such as `ebench/simple_pnp`

By default, `gmp` connects to `127.0.0.1:8087`. Override if needed:

```bash
gmp submit ebench/mobile_manip/val_unseen --host <server_ip> --port 8087
```

## 3. Connect your model

For a quick connectivity check, use the built-in baseline policy:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --host 127.0.0.1 --port 8087 --frame_save_interval 10
```

For real evaluation, import the client in your model code:

```python
from genmanip_client.eval_client import EvalClient

client = EvalClient(base_url="http://127.0.0.1:8087", worker_ids=["0"], run_id="my_run")
# Use client to receive observations and send actions
```

See [Integrate Your Own Model](/evaluation/custom-model/) for the full input/output schema and a minimal `ModelClient` example.

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
- Setting `--episode_recorder_save_every 0` on the server reduces overhead when you do not need image dumps.
