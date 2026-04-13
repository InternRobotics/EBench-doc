---
title: Environment Setup
description: Set up the Isaac Sim server environment and the lightweight client package for EBench.
---

EBench uses a client–server architecture. You will set up **two environments**:

- **Server environment** — Isaac Sim, cuRobo, and the simulation server code from the [GenManip](https://github.com/InternRobotics/GenManip) repository.
- **Client environment** — **your model's own Python environment**. The lightweight [`genmanip-client`](https://github.com/InternRobotics/genmanip-client) package is installed alongside your model dependencies and has very few dependencies of its own, so it will not conflict with your model.

## Prerequisites

- Linux workstation with an NVIDIA GPU.
- CUDA 12.1 and a compatible driver.
- An Isaac Sim 4.1.0 compatible Python environment (for the server).

## Server environment

### Clone the simulation server

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

### Install Isaac Sim

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

If you have a local Isaac Sim installation, you can use it directly — run server-side commands with `/isaac-sim/python.sh` instead.

### Install project dependencies

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Client environment

The client lives in **the Python environment where your model runs** — install it there, alongside your model dependencies. `genmanip-client` is a standalone repository with minimal dependencies, so it will not conflict with anything in your model environment.

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
gmp --help
```

## Verify

Make sure both environments are working before proceeding:

```bash
# Server environment
python ray_eval_server.py --help

# Client environment
gmp --help
```

Next step: [download benchmark assets](/EBench-doc/getting-started/assets/).
