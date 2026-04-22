---
title: Intégrer votre modèle
description: Connecter votre propre VLA ou politique au système d'évaluation EBench.
---

L'interface principale est la suivante :

```python
model_client.get_action(obs) -> action
```

Implémentez un `ModelClient`, effectuez une passe d'inférence dans `get_action(obs)` et renvoyez un dictionnaire d'action.

## Format des observations

Chaque observation est indexée par `worker_id` :

```python
obs["0"]["obs"] = {
    "instruction": str,                        # instruction en langage naturel
    "state.joints": np.ndarray,                # (12,) positions articulaires
    "state.gripper": np.ndarray,               # (4,) états de la pince
    "state.base": np.ndarray,                  # (3,) position de la base
    "state.ee_pose": [[pos, quat], [pos, quat]],  # effecteur gauche/droit
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # True au premier pas
}
```

## Format des actions

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 6 articulations gauche + 2 pince gauche + 6 articulations droite + 2 pince droite
        "base_motion": np.ndarray,  # (3,) delta x, y, lacet
        "control_type": "joint_position",
        "is_rel": False,            # True pour des actions bras en delta
        "base_is_rel": True,        # True pour un déplacement de base en delta
    }
}
```

Vous pouvez également utiliser le contrôle `ee_pose` en définissant `control_type` sur `"ee_pose"` et en fournissant des paires `[pos, quat, gripper]` au lieu de positions articulaires.

## Exemple : Mode pas unique

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Chargez votre modèle ici

    def get_action_chunk(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Votre inférence ici, c'est-à-dire action avec 6 articulations gauche + 2 pince gauche + 6 articulations droite + 2 pince droite, 3 états de mouvement base
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
        # basé sur votre modèle, nettoyez l'historique et réinitialisez à un nouvel épisode
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
        # Réinitialisez le modèle lorsque obs["reset"] est True, car la tâche en arrière-plan a changé d'épisodes.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        action = model.get_action(obs)
        obs, eval_finished = client.step(action)
finally:
    client.close()
```

## Exemple : Mode chunk (recommandé)

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # Chargez votre modèle ici

    def get_action_chunk(self, obs):
        """Générez un chunk d'actions."""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Votre inférence ici, c'est-à-dire un chunk de longueur chunk_size avec 6 articulations gauche + 2 pince gauche + 6 articulations droite + 2 pince droite, 3 états de mouvement base
        pred_action_chunk = np.zeros((self.chunk_size, 16+3), dtype=np.float32)

        # convertir au format chunk d'action
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
        # basé sur votre modèle, nettoyez l'historique et réinitialisez à un nouvel épisode
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
        # Réinitialisez le modèle lorsque obs["reset"] est True, car la tâche en arrière-plan a changé d'épisodes.
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        # Générez des actions pour tout le chunk
        action_chunk = model.get_action_chunk(obs)
        # Le serveur exécute le chunk en interne ; retourne obs au prochain point de ré-inférence
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## Conseils

- Chargez les poids du modèle dans `__init__` et gardez `get_action` centré sur l'inférence.
- Utilisez `reset=True` dans `obs` pour détecter le premier pas et, lorsque la tâche en arrière-plan change d'épisode, réinitialiser l'état récurrent ou le buffer de chunk.
- Les images sont en `uint8` HWC -- appliquez la normalisation de votre modèle avant l'inférence.
- Pour les chunks d'actions, conservez les actions restantes côté client ou utilisez `gmp eval --chunk_size <N>`.
- Pour l'évaluation multi-worker, renvoyez une action par `worker_id`.
- Le code source de `EvalClient` se trouve dans `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
