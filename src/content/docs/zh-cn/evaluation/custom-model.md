---
title: 接入自定义模型
description: 将你自己的 VLA 或策略接入 EBench 评测。
---

核心接口：

```python
model_client.get_action(obs) -> action
```

实现一个 `ModelClient`，在 `get_action(obs)` 中完成一步推理，返回动作字典。

## 观测格式

每个观测按 `worker_id` 组织：

```python
obs["0"]["obs"] = {
    "instruction": str,                        # 语言指令
    "state.joints": np.ndarray,                # (12,) 关节位置
    "state.gripper": np.ndarray,               # (4,) 夹爪状态
    "state.base": np.ndarray,                  # (3,) 底盘位置
    "state.ee_pose": [[pos, quat], [pos, quat]],  # 左/右末端位姿
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # 第一步为 True
}
```

## 动作格式

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 6 左臂关节 + 2 左夹爪 + 6 右臂关节 + 2 右夹爪
        "base_motion": np.ndarray,  # (3,) delta x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,            # True 表示相对动作
        "base_is_rel": True,        # True 表示相对底盘运动
    }
}
```

也可以使用 `ee_pose` 控制：将 `control_type` 设为 `"ee_pose"`，`action` 改为 `[pos, quat, gripper]` 对。

## 最小示例

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # 在这里加载模型

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # 你的推理逻辑
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

## 提示

- 模型权重在 `__init__` 中加载，`get_action` 只做推理。
- 用 `obs` 中的 `reset=True` 判断第一步，当后台任务切换到新 episode 时清空历史状态或 chunk 缓冲。
- 图像是 `uint8` HWC 格式——送入模型前做好归一化。
- 输出 action chunk 时，可在 client 侧缓存剩余动作，或用 `gmp eval --chunk_size <N>`。
- 多 worker 评测时，每个 `worker_id` 返回一个动作。
- `EvalClient` 源码在 `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`。
