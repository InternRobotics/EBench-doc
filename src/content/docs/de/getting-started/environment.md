---
title: Umgebung einrichten
description: Isaac-Sim-Server-Umgebung und das leichtgewichtige Client-Paket fuer EBench einrichten.
---

EBench verwendet eine Client-Server-Architektur. Sie muessen **zwei Umgebungen** einrichten:

- **Server-Umgebung** -- Isaac Sim, cuRobo und der Benchmark-Code.
- **Client-Umgebung** -- nur `genmanip-client` zusammen mit Ihren Modellabhaengigkeiten. Dieses Paket hat sehr wenige Abhaengigkeiten, um Konflikte zu vermeiden.

## Voraussetzungen

- Linux-Workstation mit NVIDIA-GPU.
- CUDA 12.1 und ein kompatibler Treiber.
- Eine mit Isaac Sim 4.1.0 kompatible Python-Umgebung (fuer den Server).

## Repository klonen

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Server-Umgebung

### Isaac Sim installieren

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

Falls Sie eine lokale Isaac-Sim-Installation haben, koennen Sie diese direkt verwenden -- fuehren Sie serverseitige Befehle stattdessen mit `/isaac-sim/python.sh` aus.

### Projektabhaengigkeiten installieren

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Client-Umgebung

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Ueberpruefen

Stellen Sie sicher, dass beide Umgebungen funktionieren, bevor Sie fortfahren:

```bash
# Server-Umgebung
python ray_eval_server.py --help

# Client-Umgebung
gmp --help
```

Naechster Schritt: [Benchmark-Assets herunterladen](/de/getting-started/assets/).
