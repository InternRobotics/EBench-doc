---
title: Umgebung einrichten
description: Isaac-Sim-Server-Umgebung und das leichtgewichtige Client-Paket fuer EBench einrichten.
---

EBench verwendet eine Client-Server-Architektur. Sie muessen **zwei Umgebungen** einrichten:

- **Server-Umgebung** -- Isaac Sim, cuRobo und der Simulations-Server-Code aus dem [GenManip](https://github.com/InternRobotics/GenManip)-Repository.
- **Client-Umgebung** -- **die Python-Umgebung Ihres eigenen Modells**. Das leichtgewichtige Paket [`genmanip-client`](https://github.com/InternRobotics/genmanip-client) wird zusammen mit Ihren Modellabhaengigkeiten installiert. Es hat selbst sehr wenige Abhaengigkeiten und kollidiert daher nicht mit Ihrer Modellumgebung.

## Voraussetzungen

- Linux-Workstation mit NVIDIA-GPU.
- CUDA 12.1 und ein kompatibler Treiber.
- Eine mit Isaac Sim 4.1.0 kompatible Python-Umgebung (fuer den Server).

## Server-Umgebung

### Simulations-Server klonen

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

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

Der Client lebt in **der Python-Umgebung, in der Ihr Modell laeuft** -- installieren Sie ihn dort, zusammen mit Ihren Modellabhaengigkeiten. `genmanip-client` ist inzwischen ein eigenstaendiges Repository mit sehr wenigen Abhaengigkeiten und kollidiert mit nichts in Ihrer Modellumgebung.

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
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

Naechster Schritt: [Benchmark-Assets herunterladen](/EBench-doc/de/getting-started/assets/).
