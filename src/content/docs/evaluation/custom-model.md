---
title: Integrate Your Own Model
description: Connect your own VLA or policy to EBench evaluation.
---

The core interface is:

```python
model_client.get_action(obs) -> action
```

Implement a `ModelClient`, do one inference pass in `get_action(obs)`, and return an action dictionary.

## Observation format

Each observation is keyed by `worker_id`:

```python
obs["0"]["obs"] = {
    "instruction": str,                        # language instruction
    "state.joints": np.ndarray,                # (12,) joint positions
    "state.gripper": np.ndarray,               # (4,) gripper states
    "state.base": np.ndarray,                  # (3,) base position
    "state.ee_pose": [[pos, quat], [pos, quat]],  # left/right EE
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # True on first step
}
```

## Action format

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 6 left joints + 2 left grip + 6 right joints + 2 right grip
        "base_motion": np.ndarray,  # (3,) delta x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,            # True for delta arm actions
        "base_is_rel": True,        # True for delta base motion
    }
}
```

Alternatively, use `ee_pose` control by setting `control_type` to `"ee_pose"` and providing `[pos, quat, gripper]` pairs instead of joint positions.

## Minimal example

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # Load your model here

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Your inference here
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

## Tips

- Load model weights in `__init__`, keep `get_action` focused on inference.
- Use `reset=True` in `obs` to detect the first step and clear recurrent/chunk state.
- Images are `uint8` HWC — apply your model's normalization before inference.
- For action chunks, cache remaining actions client-side or use `gmp eval --chunk_size <N>`.
- For multi-worker evaluation, return one action per `worker_id`.
- `EvalClient` source is at `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
