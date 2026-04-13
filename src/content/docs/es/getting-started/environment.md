---
title: Configuración del entorno
description: Configura el entorno del servidor Isaac Sim y el paquete cliente ligero para EBench.
---

EBench emplea una arquitectura cliente-servidor. Necesitarás configurar **dos entornos**:

- **Entorno del servidor** — Isaac Sim, cuRobo y el código del servidor de simulación del repositorio [GenManip](https://github.com/InternRobotics/GenManip).
- **Entorno del cliente** — **el propio entorno Python de tu modelo**. El paquete ligero [`genmanip-client`](https://github.com/InternRobotics/genmanip-client) se instala junto a las dependencias de tu modelo y tiene muy pocas dependencias propias, así que no entrará en conflicto con tu modelo.

## Requisitos previos

- Estación de trabajo Linux con GPU NVIDIA.
- CUDA 12.1 y un driver compatible.
- Un entorno Python compatible con Isaac Sim 4.1.0 (para el servidor).

## Entorno del servidor

### Clonar el servidor de simulación

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

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

El cliente vive en **el entorno Python en el que se ejecuta tu modelo** — instálalo allí, junto a las dependencias de tu modelo. `genmanip-client` ya es un repositorio independiente con muy pocas dependencias, así que no entrará en conflicto con nada de tu entorno de modelo.

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
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

Siguiente paso: [descargar los assets del benchmark](/EBench-doc/es/getting-started/assets/).
