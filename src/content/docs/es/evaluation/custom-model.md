---
title: Integrar tu modelo
description: Conecta tu propio VLA o política al sistema de evaluación de EBench.
---

La interfaz principal es:

```python
model_client.get_action(obs) -> action
```

Implementa un `ModelClient`, realiza una pasada de inferencia en `get_action(obs)` y devuelve un diccionario de acción.

## Formato de observación

Cada observación está indexada por `worker_id`:

```python
obs["0"]["obs"] = {
    "instruction": str,                        # instrucción en lenguaje natural
    "state.joints": np.ndarray,                # (12,) posiciones articulares
    "state.gripper": np.ndarray,               # (4,) estados del gripper
    "state.base": np.ndarray,                  # (3,) posición de la base
    "state.ee_pose": [[pos, quat], [pos, quat]],  # EE izquierdo/derecho
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # True en el primer paso
}
```

## Formato de acción

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 6 articulaciones izq + 2 grip izq + 6 articulaciones der + 2 grip der
        "base_motion": np.ndarray,  # (3,) delta x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,            # True para acciones de brazo en delta
        "base_is_rel": True,        # True para movimiento de base en delta
    }
}
```

Alternativamente, puedes usar el control por `ee_pose` estableciendo `control_type` a `"ee_pose"` y proporcionando pares `[pos, quat, gripper]` en lugar de posiciones articulares.

## Ejemplo mínimo

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Carga tu modelo aquí

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Tu inferencia aquí
        pred_action = np.zeros(16, dtype=np.float32)

        return {
            worker_id: {
                "action": pred_action,
                "base_motion": np.zeros(3, dtype=np.float32),
                "control_type": "joint_position",
                "is_rel": False,
                "base_is_rel": True,
            }
        }


client = EvalClient(
    base_url="http://127.0.0.1:8087",
    worker_ids=["0"],
    run_id="my_eval",
)
model = ModelClient()

try:
    obs = client.reset()
    eval_finished = False
    while not eval_finished:
        # Reset the model when obs["reset"] is True, since the background task has switched episodes.
        if obs["reset"]:
            model.reset()
        # Generate actions for entire chunk
        action_chunk = model.get_action_chunk(obs)
        # Server executes chunk internally; returns obs at next re-inference point
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## Consejos

- Carga los pesos del modelo en `__init__` y mantén `get_action` centrado en la inferencia.
- Usa `reset=True` en `obs` para detectar el primer paso y, cuando la tarea en segundo plano cambie de episodio, limpiar el estado recurrente o el buffer de chunk.
- Las imágenes son `uint8` en formato HWC: aplica la normalización de tu modelo antes de la inferencia.
- Para action chunks, almacena las acciones restantes en el cliente o usa `gmp eval --chunk_size <N>`.
- Para evaluación multi-worker, devuelve una acción por cada `worker_id`.
- El código fuente de `EvalClient` se encuentra en `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
