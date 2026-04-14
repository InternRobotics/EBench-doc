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

## Chunk mode (recommended)

**Preferred approach:** Instead of calling `client.step()` with a single action per step, submit action chunks for better performance:

```python
# Submit a list of actions as a chunk
actions = [action_dict_1, action_dict_2, action_dict_3]
obs, done = client.step(actions)
```

**Benefits:** The server executes all actions in the chunk internally and returns only the final observation at the re-inference point, reducing network overhead and enabling better performance tuning.

**Multi-worker evaluation:** For multiple workers, simply run separate processes with different `worker_ids`:
```bash
# Terminal 1: worker "0"
python model_client.py --worker_id 0

# Terminal 2: worker "1"
python model_client.py --worker_id 1
```

## Example: Single-step mode

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

## Example: Chunk mode (recommended)

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # Load your model here

    def get_action_chunk(self, obs):
        """Generate a chunk of actions."""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # Your inference here: generate chunk_size actions at once
        action_chunk = []
        for _ in range(self.chunk_size):
            pred_action = np.zeros(16, dtype=np.float32)
            action_chunk.append({
                "action": pred_action,
                "base_motion": np.zeros(3, dtype=np.float32),
                "control_type": "joint_position",
                "is_rel": False,
                "base_is_rel": True,
            })
        
        return action_chunk


client = EvalClient(
    base_url="http://127.0.0.1:8087",
    worker_ids=["0"],
    run_id="my_eval",
)
model = ModelClient(chunk_size=4)

try:
    obs = client.reset()
    done = False
    while not done:
        # Generate actions for entire chunk
        action_chunk = model.get_action_chunk(obs)
        # Server executes chunk internally; returns obs at next re-inference point
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

## Tips

- **Use chunk mode for better performance**: Submit action lists via `client.step()` rather than single actions. The server executes them internally and returns only the final observation at the re-inference point.
- Load model weights in `__init__`, keep inference methods focused on prediction.
- Use `reset=True` in `obs` to detect the first step and clear recurrent/buffer state.
- Tune `chunk_size` to balance latency and throughput (e.g., `gmp eval --chunk_size 4`).
- Images are `uint8` HWC — apply your model's normalization before inference.
- **For multi-worker evaluation:** Run separate model client processes, each with a different `worker_id` (e.g., `worker_id="0"`, `worker_id="1"`).
- `EvalClient` source is at `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.
