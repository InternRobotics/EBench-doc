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

## 块模式（推荐）

**推荐做法：** 不要每步都用单个动作调用 `client.step()`，而是提交动作块以获得更好的性能：

```python
# 以块的形式提交动作列表
actions = [action_dict_1, action_dict_2, action_dict_3]
obs, done = client.step(actions)
```

**优点：** 服务器会在内部执行块中的所有动作，仅在重新推理点返回最终观测，从而减少网络开销并便于性能调优。

**多 worker 评测：** 对于多个 worker，只需以不同的 `worker_ids` 运行多个独立进程：
```bash
# 终端 1：worker "0"
python model_client.py --worker_id 0

# 终端 2：worker "1"
python model_client.py --worker_id 1
```

## 示例：单步模式

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # 在这里加载模型

    def get_action_chunk(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # 你的推理逻辑，即动作包含6个左臂关节 + 2个左夹爪 + 6个右臂关节 + 2个右夹爪，3个底盘运动状态
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
        # 根据你的模型，清理历史记录并重置到新episode
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
        # 当obs["reset"]为True时重置模型，因为后台任务已切换episode。
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        action = model.get_action(obs)
        obs, eval_finished = client.step(action)
finally:
    client.close()
```

## 示例：块模式（推荐）

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # 在这里加载模型

    def get_action_chunk(self, obs):
        """生成动作块。"""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # 你的推理逻辑，即长度为chunk_size的块，包含6个左臂关节 + 2个左夹爪 + 6个右臂关节 + 2个右夹爪，3个底盘运动状态
        pred_action_chunk = np.zeros((self.chunk_size, 16+3), dtype=np.float32)

        # 转换为动作块格式
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
        # 根据你的模型，清理历史记录并重置到新episode
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
        # 当obs["reset"]为True时重置模型，因为后台任务已切换episode。
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        # 为整个块生成动作
        action_chunk = model.get_action_chunk(obs)
        # 服务器在内部执行块；在下一个重新推理点返回obs
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## 提示

- **使用块模式以获得更好的性能**：通过 `client.step()` 提交动作列表，而不是单个动作。服务器会在内部执行这些动作，仅在重新推理点返回最终观测。仅适用于带 --no_save_process 标志的服务器。
- 模型权重在 `__init__` 中加载，`get_action` 只做推理。
- 用 `obs` 中的 `reset=True` 判断第一步，当后台任务切换到新 episode 时清空历史状态或 chunk 缓冲。
- 图像是 `uint8` HWC 格式——送入模型前做好归一化。
- 输出 action chunk 时，可在 client 侧缓存剩余动作，或用 `gmp eval --chunk_size <N>`。
- 多 worker 评测时，每个 `worker_id` 返回一个动作。
- `EvalClient` 源码在 `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`。
