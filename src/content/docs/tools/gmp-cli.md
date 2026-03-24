---
title: GMP CLI
description: Use the GMP command line tools to submit, inspect, and run EBench evaluations.
---

## Install

The `gmp` command is provided by `genmanip-client`:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Core commands

- `gmp submit <config_paths...>`: create or resume a benchmark job on the local eval server.
- `gmp status`: inspect the current server job and progress.
- `gmp eval`: run the legacy local evaluation client against assigned worker IDs.

This documentation only covers the local workflow for EBench. Online and leaderboard commands can be documented later when the public service is ready.

## Common EBench examples

### Submit a benchmark

```bash
gmp submit ebench --run_id smoke_test --host 127.0.0.1 --port 8087
```

### Submit a narrower subset

```bash
gmp submit ebench/simple_pnp --run_id simple_pnp_debug --host 127.0.0.1 --port 8087
```

### Check server status

```bash
gmp status --host 127.0.0.1 --port 8087
```

### Run the legacy eval client

```bash
gmp eval --worker_ids 0,1 --host 127.0.0.1 --port 8087 --chunk_size 1
```

## Argument notes

- `config_paths` can be full file paths or shorthand benchmark identifiers.
- `--run_id` lets you resume or inspect a previous run later.
- `--host` and `--port` should match the local `ray_eval_server.py` instance.
- `--worker_ids` controls which server-side workers your client attaches to.

## Where to look next

- Use [Run Evaluation](/evaluation/run-benchmark/) for the full local workflow.
- Use [Asset Download](/getting-started/assets/) to prepare the required benchmark data under `saved/`.
