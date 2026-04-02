---
title: 接入自定义模型
description: 实现 ModelClient，并将你自己的策略或推理服务接入 EBench 评测。
---

## 概览

如果你想把自己的 VLA、policy 或 planner 接到 EBench，而不是使用内置 baseline，核心接口是：

```python
model_client.get_action(obs) -> action
```

推荐做法是实现一个 `ModelClient`，在 `get_action(obs)` 中完成一步推理，并返回平台要求的动作格式。

## 输入 `obs` 格式

评测环境返回的数据按 `worker_id` 组织，每个 worker 下包含 `obs` 和 `metric`：

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

常见读取方式：

```python
worker_obs = obs["0"]["obs"]
instruction = worker_obs["instruction"]
joints = worker_obs["state.joints"]
gripper = worker_obs["state.gripper"]
base = worker_obs["state.base"]
ee_pose = worker_obs["state.ee_pose"]
metric = obs["0"]["metric"]
```

## 输出 `action` 格式

你的模型需要返回一个按 `worker_id` 对齐的动作字典：

```python
action = {
    "0": {
        "action": np.ndarray,           # (16,), absolute joint position
        # 或：
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

字段说明：

- `joint_position`：长度为 `16` 的绝对关节位置，顺序为 `6 left_joints + 2 left_gripper + 6 right_joints + 2 right_gripper`
- `ee_pose`：左右手的末端位姿与夹爪状态
- `base_motion` 是底盘运动，默认使用相对增量
- `is_rel=True` 时，server 会把机械臂动作从相对量自动转换为绝对量
- `base_is_rel=True` 时，`base_motion` 按相对位移解释；设为 `False` 则表示绝对底盘位置

## 最小 `ModelClient` 示例

下面的例子演示最常见的两种模式：

- 模式 A：在 `__init__` 中直接加载本地模型，在 `get_action` 中直接推理
- 模式 B：把 `get_action` 作为 HTTP client，向远端 Model Server 发送请求

```python
import numpy as np
import requests


class ModelClient:
    def __init__(self, server_url="http://0.0.0.0:8000", timeout=50):
        self.server_url = server_url
        self.timeout = timeout

        # 方式 1：直接在本地初始化模型
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

        # 根据你的环境相机命名替换这里的 key
        image = worker_obs["video.front_view"]

        # 方式 1：本地直接推理
        # pred_action = self.model.predict(
        #     instruction=instruction,
        #     image=image,
        #     proprio=proprio,
        # )

        # 方式 2：请求远端 Model Server
        payload = {
            "language_instruction": instruction,
            "proprio": proprio.tolist(),
            "image": image.tolist(),
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

## 推荐接入流程

1. 在 `__init__` 中加载模型、tokenizer、视觉编码器等重资源，避免每个 step 重复初始化。
2. 在 `get_action(obs)` 中只做当前 step 所需的数据抽取、预处理、推理和后处理。
3. 如果模型需要多视角图像，就从 `video.{camera}_view` 中按你的相机命名读取。
4. 如果模型输出的是 action chunk，可在 client 侧缓存剩余动作，或结合 `gmp eval --chunk_size <N>` 使用。
5. 如果模型部署在独立推理机上，可把 `ModelClient` 做成轻量 HTTP client，仅负责组包和解包。

## 常见注意事项

- `obs` 是按 `worker_id` 组织的，多 worker 评测时需要分别返回每个 worker 的动作。
- 图像通常是 `uint8` 的 `HWC` 格式，送入模型前注意颜色空间、归一化和 batch 维度。
- `joint_position` 和 `ee_pose` 二选一，`control_type` 必须和 `action` 的实际格式一致。
- 如果你输出相对机械臂动作，记得设置 `is_rel=True`；否则默认按绝对量解释。
- 初始 step 通常可通过 `reset=True` 判断，用于清空历史状态、语言缓存或 action chunk buffer。

## `EvalClient` 接口表

下面的 `EvalClient` API 基于 `GenManip-Sim/standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`。

### 构造函数

| 接口 | 说明 |
| :-- | :-- |
| `EvalClient(base_url, worker_ids=["0"], save_result=True, fps=30, cam_order=None, robot_id=None, step_timeout=600, reset_timeout=600, run_id="", verbose=True, token=None, web_view=False, web_view_port=55090, web_view_interval=10, web_view_scale=1.0, frame_save_interval=0, plot_on_episode_end=False)` | 连接评测服务，执行 health check，并按配置启动本地录制或网页预览。 |

构造参数说明：

- `base_url`：评测服务地址，例如 `http://127.0.0.1:8087`
- `worker_ids`：当前 client 负责的 worker ID 列表
- `save_result`：是否把本地视频和 episode 结果保存到 `client_results/`
- `run_id`：通过请求 header / params 传给服务端，用于绑定当前 run
- `token`：认证服务可选的 bearer token
- `step_timeout`、`reset_timeout`：单次请求超时时间，单位秒
- `web_view*`：轻量网页预览相关参数
- `frame_save_interval`：每隔 N 个环境 step 保存一帧本地可视化结果；适合调试时抽样存图，控制磁盘占用
- `plot_on_episode_end`：每个 episode 结束后自动执行一次 `gmp plot`；适合调试失败 case 或查看动作/状态轨迹

调试时推荐：

- 轻量调试可设 `frame_save_interval=10` 或 `20`
- 如果希望每个 episode 自动产出图表，可设 `plot_on_episode_end=True`
- 大规模 benchmark 跑分时，建议使用 `frame_save_interval=0` 且 `plot_on_episode_end=False`，减少本地 I/O 开销

### 公共方法

| 方法 | 返回值 | 说明 |
| :-- | :-- | :-- |
| `reset()` | `dict` | 对当前 `worker_ids` 执行环境重置，并返回初始 observation dict。 |
| `step(action_input)` | `tuple[dict, bool]` | 统一 step 接口。既支持单步 action dict，也支持 chunk 输入。返回 `(obs, done)`。 |
| `step_chunk(action_chunk)` | `tuple[dict, bool]` | 一次发送一个 action chunk，并返回该 chunk 实际执行后的最终 `(obs, done)`。 |
| `close_recorders()` | `None` | 刷新并关闭本地异步存储 worker，但不主动 kill 评测 worker。 |
| `kill_workers()` | `None` | 调用服务端 `/kill` 接口，结束当前 `worker_ids`。 |
| `close()` | `None` | 关闭录制器、停止网页预览、kill workers，并清理 client。 |

### `step()` 支持的输入格式

| 格式 | 示例 | 说明 |
| :-- | :-- | :-- |
| 单步 action dict | `{"0": action}` | 标准逐步调用方式，内部发送到 `/step`。 |
| action dict 列表 | `[{"0": action_t0}, {"0": action_t1}]` | chunk 模式，内部发送到 `/step_chunk`。 |
| worker-major chunk dict | `{"0": [action_t0, action_t1], "1": [action_t0, action_t1]}` | 适合多 worker 的 chunk rollout，内部会先归一化再发送到 `/step_chunk`。 |
| 单 worker action 列表 | `[action_t0, action_t1]` | 仅当 `worker_ids` 只有一个 worker 时支持。 |

### 基于 `EvalClient` 的最小循环

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
