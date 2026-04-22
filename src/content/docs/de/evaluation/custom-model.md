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

## Beispiel: Einzel-Schritt-Modus

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Laden Sie hier Ihr Modell

    def get_action_chunk(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Ihre Inferenz hier, d.h. Aktion mit 6 linken Gelenken + 2 linker Greifer + 6 rechten Gelenken + 2 rechter Greifer, 3 Basisbewegungsstaaten
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
        # basierend auf Ihrem Modell, bereinigen Sie den Verlauf und setzen Sie auf neue Episode zurück
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
        # Setzen Sie das Modell zurück, wenn obs["reset"] True ist, da die Hintergrundaufgabe Episoden gewechselt hat.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        action = model.get_action(obs)
        obs, eval_finished = client.step(action)
finally:
    client.close()
```

## Beispiel: Chunk-Modus (empfohlen)

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # Laden Sie hier Ihr Modell

    def get_action_chunk(self, obs):
        """Generieren Sie einen Chunk von Aktionen."""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Ihre Inferenz hier, d.h. ein Chunk der Länge chunk_size mit 6 linken Gelenken + 2 linker Greifer + 6 rechten Gelenken + 2 rechter Greifer, 3 Basisbewegungsstaaten
        pred_action_chunk = np.zeros((self.chunk_size, 16+3), dtype=np.float32)

        # in Aktions-Chunk-Format konvertieren
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
        # basierend auf Ihrem Modell, bereinigen Sie den Verlauf und setzen Sie auf neue Episode zurück
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
        # Setzen Sie das Modell zurück, wenn obs["reset"] True ist, da die Hintergrundaufgabe Episoden gewechselt hat.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        # Generieren Sie Aktionen für den gesamten Chunk
        action_chunk = model.get_action_chunk(obs)
        # Server führt Chunk intern aus; gibt obs am nächsten Re-Inferenzpunkt zurück
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## Tipps

- Laden Sie Modellgewichte in `__init__`; halten Sie `get_action` auf die Inferenz fokussiert.
- Nutzen Sie `reset=True` in `obs`, um den ersten Schritt zu erkennen und beim Wechsel der Hintergrundepisode rekurrenten/Chunk-Zustand zurückzusetzen.
- Bilder sind `uint8` im HWC-Format -- wenden Sie die Normalisierung Ihres Modells vor der Inferenz an.
- Fuer Action-Chunks koennen Sie verbleibende Aktionen clientseitig zwischenspeichern oder `gmp eval --chunk_size <N>` verwenden.
- Bei Multi-Worker-Evaluation geben Sie eine Aktion pro `worker_id` zurueck.
- Den Quellcode von `EvalClient` finden Sie unter `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
