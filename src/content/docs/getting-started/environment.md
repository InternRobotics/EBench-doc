---
title: Environment Setup
description: Prepare a local EBench workspace with Isaac Sim, project dependencies, and the GMP client.
---

## Prerequisites

- Linux workstation with an NVIDIA GPU.
- CUDA 12.1 and a compatible driver.
- An Isaac Sim 4.1.0 compatible Python environment.
- `git-lfs` for large asset tracking.

## Clone the repository

The public docs assume the benchmark will live at `InternRobotics/EBench`:

```bash
git clone https://github.com/InternRobotics/EBench.git
cd EBench
```

If you are working from the current monorepo layout, replace the repository root with your local `GenManip-Sim` checkout.

## Install simulator-side dependencies

The current install script uses Isaac Sim `4.1.0`, CUDA `12.1`, and Torch `2.4.0`:

```bash
export CUDA_HOME=/usr/local/cuda-12.1
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH

pip install isaacsim==4.1.0 isaacsim-extscache-physics==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
sudo apt install git-lfs
```

If you rely on a local Isaac Sim installation instead of the pip wheels above, keep using that setup and run simulator-side commands with `/isaac-sim/python.sh`.

## Install project dependencies

EBench currently depends on `cuRobo` and the repository requirements:

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Install the GMP client

The `gmp` CLI lives in `standalone_tools/packages/genmanip_client/`:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Recommended environment split

- Server environment: Isaac Sim, benchmark code, `cuRobo`, and repository dependencies.
- Client environment: `genmanip-client` plus your policy/model dependencies.

This split is useful when the local evaluation server runs in a heavy Isaac Sim environment, but policy inference runs from a separate lighter environment.

## Quick sanity check

Before downloading assets or starting an evaluation, verify:

- `saved/` exists in the repository root.
- `gmp --help` works in the client environment.
- `python ray_eval_server.py --help` or `/isaac-sim/python.sh ray_eval_server.py --help` works in the simulator environment.
