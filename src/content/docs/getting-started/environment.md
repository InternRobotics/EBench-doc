---
title: Environment Setup
description: Prepare GenManip server/client environments for EBench evaluation.
---

## Component overview

- `GenManip-Sim` provides the eval server entrypoint `ray_eval_server.py` and benchmark task configs.
- `genmanip-client` provides the `gmp` CLI and `EvalClient` API.
- `EBench` provides benchmark data and assets that are expected under `GenManip-Sim/saved/`.

## Prerequisites

- Linux workstation or cluster node with NVIDIA GPU.
- CUDA 12.1 compatible environment.
- Isaac Sim 4.1 runtime (`/isaac-sim/python.sh` or pip-based Isaac Sim packages).
- Git and (for dataset pull) DVC.

## 1. Clone benchmark and infra repositories

```bash
git clone --recursive -b feature/pioneer https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Sim.git
git clone https://gitee.pjlab.org.cn/L2/SimPlatform/EBench.git
```

## 2. Install server-side dependencies

Run this in the environment that will launch `ray_eval_server.py`:

```bash
/isaac-sim/python.sh -m pip install -r GenManip-Sim/requirements.txt
```

If you are using a pure Python environment with Isaac Sim wheels, use `python -m pip` instead.

## 3. Install client package in model environment

Install `gmp` from the package source inside `GenManip-Sim`:

```bash
pip install -e GenManip-Sim/standalone_tools/packages/genmanip_client/
gmp --help
```

Recommended split:

- Server env: Isaac Sim + GenManip-Sim runtime dependencies.
- Client env: `genmanip-client` + model inference dependencies.

## 4. Pull EBench dataset

```bash
cd EBench
pip install "dvc[oss,s3]"
dvc pull
cd ..
ln -s EBench GenManip-Sim/saved
```

After this step, `GenManip-Sim/saved/` should expose the benchmark assets and become the default location for evaluation outputs such as `saved/eval_results/`.

## 5. Verify environment

Terminal 1 (server):

```bash
cd GenManip-Sim
/isaac-sim/python.sh ray_eval_server.py 
```

Terminal 2 (client):

```bash
cd /path/to/your/client-env
gmp submit ebench/mobile_manip/test
```

If submit succeeds, start one worker:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

## Network reminder

When running server and client on different machines, expose the server host/port and pass them explicitly with `--host` and `--port` in all `gmp` commands.
