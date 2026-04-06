---
title: Configuración del entorno
description: Configura el entorno del servidor Isaac Sim y el paquete cliente ligero para EBench.
---

EBench emplea una arquitectura cliente-servidor. Necesitarás configurar **dos entornos**:

- **Entorno del servidor** — Isaac Sim, cuRobo y el código del benchmark.
- **Entorno del cliente** — solo `genmanip-client` junto con las dependencias de tu modelo. Este paquete tiene muy pocas dependencias para evitar conflictos.

## Requisitos previos

- Estación de trabajo Linux con GPU NVIDIA.
- CUDA 12.1 y un driver compatible.
- Un entorno Python compatible con Isaac Sim 4.1.0 (para el servidor).

## Clonar el repositorio

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## Entorno del servidor

### Instalar Isaac Sim

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

Si dispones de una instalación local de Isaac Sim, puedes usarla directamente: ejecuta los comandos del servidor con `/isaac-sim/python.sh` en su lugar.

### Instalar dependencias del proyecto

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## Entorno del cliente

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Verificación

Asegúrate de que ambos entornos funcionan correctamente antes de continuar:

```bash
# Entorno del servidor
python ray_eval_server.py --help

# Entorno del cliente
gmp --help
```

Siguiente paso: [descargar los assets del benchmark](/es/getting-started/assets/).
