---
title: Eigenes Modell einbinden
description: Eigenes VLA- oder Policy-Modell mit der EBench-Evaluation verbinden.
---

Die zentrale Schnittstelle lautet:

```python
model_client.get_action(obs) -> action
```

Implementieren Sie einen `ModelClient`, fuehren Sie in `get_action(obs)` einen Inferenzschritt durch und geben Sie ein Action-Dictionary zurueck.

## Beobachtungsformat

Jede Beobachtung ist nach `worker_id` aufgeschluesselt:

```python
obs["0"]["obs"] = {
    "instruction": str,                        # Sprachanweisung
    "state.joints": np.ndarray,                # (12,) Gelenkpositionen
    "state.gripper": np.ndarray,               # (4,) Greiferzustaende
    "state.base": np.ndarray,                  # (3,) Basisposition
    "state.ee_pose": [[pos, quat], [pos, quat]],  # links/rechts Endeffektor
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # True beim ersten Schritt
}
```

## Aktionsformat

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 6 linke Gelenke + 2 linker Greifer + 6 rechte Gelenke + 2 rechter Greifer
        "base_motion": np.ndarray,  # (3,) Delta x, y, Gierwinkel
        "control_type": "joint_position",
        "is_rel": False,            # True fuer Delta-Armaktionen
        "base_is_rel": True,        # True fuer Delta-Basisbewegung
    }
}
```

Alternativ koennen Sie `ee_pose`-Steuerung verwenden, indem Sie `control_type` auf `"ee_pose"` setzen und `[pos, quat, gripper]`-Paare anstelle von Gelenkpositionen angeben.

## Minimalbeispiel

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Laden Sie hier Ihr Modell

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Ihre Inferenz hier
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
    done = False
    while not done:
        action = model.get_action(obs)
        obs, done = client.step(action)
finally:
    client.close()
```

## Tipps

- Laden Sie Modellgewichte in `__init__`; halten Sie `get_action` auf die Inferenz fokussiert.
- Nutzen Sie `reset=True` in `obs`, um den ersten Schritt zu erkennen und rekurrenten/Chunk-Zustand zurueckzusetzen.
- Bilder sind `uint8` im HWC-Format -- wenden Sie die Normalisierung Ihres Modells vor der Inferenz an.
- Fuer Action-Chunks koennen Sie verbleibende Aktionen clientseitig zwischenspeichern oder `gmp eval --chunk_size <N>` verwenden.
- Bei Multi-Worker-Evaluation geben Sie eine Aktion pro `worker_id` zurueck.
- Den Quellcode von `EvalClient` finden Sie unter `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
