---
title: Environment Setup
description: Set up the Isaac Sim server environment and the lightweight client package for EBench.
---

EBench uses a client–server architecture. You will set up **two environments**:

- **Server environment** — Isaac Sim, cuRobo, and the benchmark code.
- **Client environment** — just `genmanip-client` alongside your model dependencies. This package has very few dependencies to avoid conflicts.

## Prerequisites

- Linux workstation with an NVIDIA GPU.
- CUDA 12.1 and a compatible driver.
- An Isaac Sim 4.1.0 compatible Python environment (for the server).
- `git-lfs` for large asset tracking.

## Clone the repository

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Server environment

### Install Isaac Sim

The current setup uses Isaac Sim `4.1.0`, CUDA `12.1`, and Torch `2.4.0`:

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
sudo apt install git-lfs
```

If you have a local Isaac Sim installation, you can use it directly — just run server-side commands with `/isaac-sim/python.sh` instead.

### Install project dependencies

EBench depends on `cuRobo` and the repository requirements:

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Client environment

The client package is intentionally minimal so it can coexist with your model's dependencies without conflicts.

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

Once installed, you can `import` the communication client directly in your model code to interact with the server.

## Quick sanity check

Before downloading assets or starting an evaluation, verify:

- `saved/` exists in the repository root.
- `gmp --help` works in the client environment.
- `python ray_eval_server.py --help` or `/isaac-sim/python.sh ray_eval_server.py --help` works in the server environment.

## Network reminder

When running server and client on different machines, expose the server host/port and pass them explicitly with `--host` and `--port` in all `gmp` commands.
