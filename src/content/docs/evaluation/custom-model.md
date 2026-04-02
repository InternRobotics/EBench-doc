---
title: Integrate Your Own Model
description: Implement a ModelClient and connect your own policy or model server to EBench evaluation.
---

## Overview

If you want to connect your own VLA, policy, or planner instead of using a built-in baseline, the core interface is:

```python
model_client.get_action(obs) -> action
```

The standard pattern is to implement a `ModelClient` and do one inference pass inside `get_action(obs)`, then return an action dictionary in the format expected by the platform.

## Input `obs` schema

Observations are grouped by `worker_id`. Each worker entry contains `obs` and `metric`:

```python
obs = {
    "0": {
        "obs": {
            "instruction": str,
            "state.joints": np.ndarray,      # (12,), 6 left + 6 right
            "state.gripper": np.ndarray,     # (4,), 2 left + 2 right
            "state.base": np.ndarray,        # (3,)
            "state.ee_pose": [[p, q], [p, q]],
            "timestep": int,
            "reset": bool,
            "video.{camera}_view": np.ndarray,  # (480, 640, 3)
        },
        "metric": {
            "task": float,  # success rate / progress metric
        },
    }
}
```

## Output `action` schema

Your model should return one action dictionary per `worker_id`:

```python
action = {
    "0": {
        "action": np.ndarray,           # (16,), absolute joint position
        # or:
        # "action": [
        #     ([x, y, z], [w, x, y, z], [grip1, grip2]),   # left ee pose
        #     ([x, y, z], [w, x, y, z], [grip1, grip2]),   # right ee pose
        # ],
        "base_motion": np.ndarray,      # (3,), delta x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,
        "base_is_rel": True,
    }
}
```

Field notes:

- `joint_position`: a length-`16` absolute joint vector ordered as `6 left_joints + 2 left_gripper + 6 right_joints + 2 right_gripper`
- `ee_pose`: left and right end-effector poses plus gripper states
- `base_motion` controls the mobile base and is relative by default
- If `is_rel=True`, the server converts arm actions from delta to absolute
- If `base_is_rel=True`, `base_motion` is interpreted as a relative delta; set it to `False` for absolute base coordinates

### Minimal loop with `EvalClient`

```python
from genmanip_client.eval_client import EvalClient


client = EvalClient(
    base_url="http://127.0.0.1:8087",
    worker_ids=["0"],
    run_id="my_eval_run",
)
model_client = ModelClient()

try:
    obs = client.reset()
    done = False

    while not done:
        action = model_client.get_action(obs)
        obs, done = client.step(action)
finally:
    client.close()
```

## Recommended integration flow

1. Load heavy components such as the model, tokenizer, and vision encoder in `__init__` so they are not recreated every step.
2. Keep `get_action(obs)` focused on per-step data extraction, preprocessing, inference, and postprocessing.
3. If your model uses multiple camera views, read the required `video.{camera}_view` entries by your environment's camera names.
4. If your model predicts action chunks, either cache the remaining chunk on the client side or combine it with `gmp eval --chunk_size <N>`.
5. If inference runs on a dedicated machine, keep `ModelClient` as a thin HTTP client responsible only for payload packing and unpacking.

## Common pitfalls

- The first step can usually be detected with `reset=True`, which is useful for clearing recurrent state, language caches, or chunk buffers.
- `obs` is keyed by `worker_id`, so multi-worker evaluation must return one action per worker.
- Images are usually `uint8` in `HWC` layout; apply the color conversion, normalization, and batch shaping your model expects.
- `joint_position` and `ee_pose` are mutually exclusive; `control_type` must match the actual `action` format.
- If you output relative arm actions, set `is_rel=True`; otherwise they are interpreted as absolute actions.

## `EvalClient` interface

The `EvalClient` API below is based on `GenManip-Sim/standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`.

### Constructor

| Interface | Description |
| :-- | :-- |
| `EvalClient(base_url, worker_ids=["0"], save_result=True, fps=30, cam_order=None, robot_id=None, step_timeout=600, reset_timeout=600, run_id="", verbose=True, token=None, web_view=False, web_view_port=55090, web_view_interval=10, web_view_scale=1.0, frame_save_interval=0, plot_on_episode_end=False)` | Connects to the eval server, runs a health check, and optionally starts local recording / web preview. |

Constructor parameter notes:

- `base_url`: eval server base URL, for example `http://127.0.0.1:8087`
- `worker_ids`: worker IDs owned by this client
- `save_result`: whether to save local videos and episode results under `client_results/`
- `run_id`: forwarded to the server in request headers / params for run scoping
- `token`: optional bearer token for authenticated services
- `step_timeout`, `reset_timeout`: per-request timeout in seconds
- `web_view*`: lightweight browser preview options
- `frame_save_interval`: save one local visualization frame every N environment steps; useful for debugging while keeping disk usage under control
- `plot_on_episode_end`: automatically run `gmp plot` for each finished episode; useful when debugging failed episodes or inspecting action/state traces

Recommended for debug use:

- Set `frame_save_interval=10` or `20` for lightweight periodic snapshots
- Enable `plot_on_episode_end=True` when you want automatic per-episode plots
- For large benchmark runs, prefer `frame_save_interval=0` and `plot_on_episode_end=False` to reduce local I/O overhead

### Public methods

| Method | Return | Description |
| :-- | :-- | :-- |
| `reset()` | `dict` | Resets the environment for `worker_ids` and returns the initial observation dict. |
| `step(action_input)` | `tuple[dict, bool]` | Unified stepping API. Accepts either a single-step action dict or a chunk input. Returns `(obs, done)`. |
| `step_chunk(action_chunk)` | `tuple[dict, bool]` | Sends a chunk of actions in one request and returns the final `(obs, done)` after the executed chunk. |
| `close_recorders()` | `None` | Flushes and closes local async storage workers without killing eval workers. |
| `kill_workers()` | `None` | Calls the server `/kill` endpoint for the current `worker_ids`. |
| `close()` | `None` | Closes recorders, stops the web viewer, kills workers, and shuts down the client cleanly. |

### `step()` accepted input formats

| Format | Example | Notes |
| :-- | :-- | :-- |
| Single-step dict | `{"0": action}` | Standard per-step call. Internally sent to `/step`. |
| List of action dicts | `[{"0": action_t0}, {"0": action_t1}]` | Chunk mode. Internally sent to `/step_chunk`. |
| Worker-major chunk dict | `{"0": [action_t0, action_t1], "1": [action_t0, action_t1]}` | Useful for multi-worker chunk rollout. Internally normalized then sent to `/step_chunk`. |
| Single-worker action list | `[action_t0, action_t1]` | Only supported when `worker_ids` contains a single worker. |


## Minimal `ModelClient` example

The example below shows the two common integration patterns:

- Pattern A: load the model locally in `__init__` and run inference directly in `get_action`
- Pattern B: use `get_action` as an HTTP client that forwards the request to a remote Model Server

```python
import numpy as np
import requests


class ModelClient:
    def __init__(self, server_url="http://0.0.0.0:8000", timeout=50):
        self.server_url = server_url
        self.timeout = timeout

        # Option 1: initialize your model locally
        # self.model = init_your_model()

    def _build_proprio(self, worker_obs):
        joints = np.asarray(worker_obs["state.joints"], dtype=np.float32)
        gripper = np.asarray(worker_obs["state.gripper"], dtype=np.float32)
        base = np.asarray(worker_obs["state.base"], dtype=np.float32)
        return np.concatenate([joints, gripper, base], axis=0)

    def get_action(self, obs):
        worker_id = next(iter(obs.keys()))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        proprio = self._build_proprio(worker_obs)

        # Option 1: local inference
        # pred_action = self.model.predict(
        #     instruction=instruction,
        #     image=image,
        #     proprio=proprio,
        # )

        # Option 2: remote Model Server
        payload = {
            "language_instruction": instruction,
            "proprio": proprio.tolist(),
            "image": worker_obs,
        }
        response = requests.post(
            f"{self.server_url}/act",
            json=payload,
            timeout=self.timeout,
        )
        response.raise_for_status()
        pred_action = response.json()["action"]

        return {
            worker_id: {
                "action": np.asarray(pred_action, dtype=np.float32),
                "base_motion": np.zeros(3, dtype=np.float32),
                "control_type": "joint_position",
                "is_rel": False,
                "base_is_rel": True,
            }
        }
```
