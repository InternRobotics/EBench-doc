---
title: Installation de l'environnement
description: Configurer l'environnement serveur Isaac Sim et le paquet client léger pour EBench.
---

EBench repose sur une architecture client-serveur. Vous devez configurer **deux environnements** :

- **Environnement serveur** -- Isaac Sim, cuRobo et le code du benchmark.
- **Environnement client** -- uniquement `genmanip-client`, installé aux côtés des dépendances de votre modèle. Ce paquet a très peu de dépendances afin d'éviter les conflits.

## Prérequis

- Station de travail Linux avec GPU NVIDIA.
- CUDA 12.1 et un pilote compatible.
- Un environnement Python compatible Isaac Sim 4.1.0 (pour le serveur).

## Cloner le dépôt

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Environnement serveur

### Installer Isaac Sim

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

Si vous disposez d'une installation locale d'Isaac Sim, vous pouvez l'utiliser directement en lançant les commandes côté serveur avec `/isaac-sim/python.sh`.

### Installer les dépendances du projet

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Environnement client

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Vérification

Assurez-vous que les deux environnements fonctionnent correctement avant de continuer :

```bash
# Environnement serveur
python ray_eval_server.py --help

# Environnement client
gmp --help
```

Étape suivante : [télécharger les assets du benchmark](/fr/getting-started/assets/).
