---
title: Installation de l'environnement
description: Configurer l'environnement serveur Isaac Sim et le paquet client léger pour EBench.
---

EBench repose sur une architecture client-serveur. Vous devez configurer **deux environnements** :

- **Environnement serveur** -- Isaac Sim, cuRobo et le code du serveur de simulation issu du dépôt [GenManip](https://github.com/InternRobotics/GenManip).
- **Environnement client** -- **l'environnement Python de votre propre modèle**. Le paquet léger [`genmanip-client`](https://github.com/InternRobotics/genmanip-client) s'installe aux côtés des dépendances de votre modèle ; il a lui-même très peu de dépendances et n'entrera donc pas en conflit avec votre modèle.

## Prérequis

- Station de travail Linux avec GPU NVIDIA.
- CUDA 12.1 et un pilote compatible.
- Un environnement Python compatible Isaac Sim 4.1.0 (pour le serveur).

## Environnement serveur

### Cloner le serveur de simulation

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

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

Le client vit dans **l'environnement Python où s'exécute votre modèle** -- installez-le là, aux côtés des dépendances de votre modèle. `genmanip-client` est désormais un dépôt indépendant avec très peu de dépendances ; il n'entrera en conflit avec rien dans votre environnement de modèle.

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
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

Étape suivante : [télécharger les assets du benchmark](/EBench-doc/fr/getting-started/assets/).
