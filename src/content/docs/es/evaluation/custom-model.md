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

## Modo chunk (recomendado)

**Enfoque preferido:** En lugar de llamar a `client.step()` con una sola acción por paso, envía chunks de acciones para obtener mejor rendimiento:

```python
# Envía una lista de acciones como un chunk
actions = [action_dict_1, action_dict_2, action_dict_3]
obs, done = client.step(actions)
```

**Beneficios:** El servidor ejecuta todas las acciones del chunk internamente y devuelve solo la observación final en el punto de re-inferencia, reduciendo la sobrecarga de red y permitiendo un mejor ajuste del rendimiento.

**Evaluación multi-worker:** Para múltiples workers, simplemente ejecuta procesos separados con diferentes `worker_ids`:
```bash
# Terminal 1: worker "0"
python model_client.py --worker_id 0

# Terminal 2: worker "1"
python model_client.py --worker_id 1
```

## Ejemplo: Modo de paso único

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Carga tu modelo aquí

    def get_action_chunk(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Tu inferencia aquí, es decir, acción con 6 articulaciones izquierdas + 2 grip izquierdo + 6 articulaciones derechas + 2 grip derecho, 3 estados de movimiento base
        pred_action_chunk = np.zeros(16+3, dtype=np.float32)

        return {
            worker_id: {
                "action": pred_action[:16],
                "base_motion": pred_action[16:],
                "control_type": "joint_position",
                "is_rel": False,
                "base_is_rel": True,
            }
        }

    def reset(self):
        # basado en tu modelo, limpia el historial y reinicia a nuevo episodio
        pass

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
        # Reinicia el modelo cuando obs["reset"] es True, ya que la tarea en segundo plano cambió de episodios.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        action = model.get_action(obs)
        obs, eval_finished = client.step(action)
finally:
    client.close()
```

## Ejemplo: Modo chunk (recomendado)

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # Carga tu modelo aquí

    def get_action_chunk(self, obs):
        """Genera un chunk de acciones."""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Tu inferencia aquí, es decir, un chunk de longitud chunk_size con 6 articulaciones izquierdas + 2 grip izquierdo + 6 articulaciones derechas + 2 grip derecho, 3 estados de movimiento base
        pred_action_chunk = np.zeros((self.chunk_size, 16+3), dtype=np.float32)

        # convertir a formato de chunk de acción
        action_chunk = []
        for i in range(self.chunk_size):
            action_chunk.append({
                worker_id: {
                    "action": pred_action_chunk[i][:16],
                    "base_motion": pred_action_chunk[i][16:],
                    "control_type": "joint_position",
                    }
                }
            )

        return action_chunk

    def reset(self):
        # basado en tu modelo, limpia el historial y reinicia a nuevo episodio
        pass

client = EvalClient(
    base_url="http://127.0.0.1:8087",
    worker_ids=["0"],
    run_id="my_eval",
)
model = ModelClient(chunk_size=4)

try:
    obs = client.reset()
    eval_finished = False
    while not eval_finished:
        # Reinicia el modelo cuando obs["reset"] es True, ya que la tarea en segundo plano cambió de episodios.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        # Genera acciones para todo el chunk
        action_chunk = model.get_action_chunk(obs)
        # El servidor ejecuta el chunk internamente; devuelve obs en el siguiente punto de re-inferencia
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## Consejos

- **Usa el modo chunk para mejor rendimiento**: Envía listas de acciones mediante `client.step()` en lugar de acciones individuales. El servidor las ejecuta internamente y devuelve solo la observación final en el punto de re-inferencia. Solo funciona con servidores que tengan la flag --no_save_process.
- Carga los pesos del modelo en `__init__` y mantén `get_action` centrado en la inferencia.
- Usa `reset=True` en `obs` para detectar el primer paso y, cuando la tarea en segundo plano cambie de episodio, limpiar el estado recurrente o el buffer de chunk.
- Las imágenes son `uint8` en formato HWC: aplica la normalización de tu modelo antes de la inferencia.
- Para action chunks, almacena las acciones restantes en el cliente o usa `gmp eval --chunk_size <N>`.
- Para evaluación multi-worker, devuelve una acción por cada `worker_id`.
- El código fuente de `EvalClient` se encuentra en `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
