---
title: Run Evaluation
description: Start the local Ray evaluation server and run an EBench job end to end.
---

## 1. Start the local evaluation server

If you are using the official Isaac Sim installation, prefer the bundled Python launcher:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

If your current environment already has the Isaac Sim Python packages installed, the plain Python entry point also works:

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087 --episode_recorder_save_every 0
```

`8087` is the current default server port in the repository.

## 2. Submit an EBench job

With the server running, submit a benchmark job from the client environment:

```bash
gmp submit ebench/simple_pnp --run_id local_smoke_test --host 127.0.0.1 --port 8087
```

The submit flow accepts:

- full config file paths
- shorthand benchmark IDs such as `ebench`
- narrower paths such as `ebench/simple_pnp`

## 3. Start local workers

For a quick local smoke test, the bundled client can run with fake actions:

```bash
python standalone_tools/client.py --host 127.0.0.1 --port 8087 --worker_ids 0 -a franka -g panda_hand
```

For more parallelism, pass multiple worker IDs:

```bash
python standalone_tools/client.py --host 127.0.0.1 --port 8087 --worker_ids 0,1,2,3
```

## 4. Inspect status and outputs

Check the current job status:

```bash
gmp status --host 127.0.0.1 --port 8087
```

Local outputs are written under:

```text
saved/eval_results/<benchmark_id>/<run_id>/
```

## Notes

- The example client in `standalone_tools/client.py` is useful for connectivity and smoke tests.
- For real policy evaluation, replace the fake-action loop with your own policy client or use `gmp eval`.
- Setting `--episode_recorder_save_every 0` on the server reduces overhead when you do not need image dumps.
