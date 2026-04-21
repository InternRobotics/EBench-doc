---
title: 모델 연동
description: 직접 만든 VLA 또는 정책을 EBench 평가에 연결합니다.
---

핵심 인터페이스는 다음과 같습니다.

```python
model_client.get_action(obs) -> action
```

`ModelClient`를 구현하고, `get_action(obs)`에서 한 스텝의 추론을 수행한 뒤 액션 딕셔너리를 반환하면 됩니다.

## 관측 형식

각 관측은 `worker_id`를 키로 구성됩니다.

```python
obs["0"]["obs"] = {
    "instruction": str,                        # 언어 지시
    "state.joints": np.ndarray,                # (12,) 관절 위치
    "state.gripper": np.ndarray,               # (4,) 그리퍼 상태
    "state.base": np.ndarray,                  # (3,) 베이스 위치
    "state.ee_pose": [[pos, quat], [pos, quat]],  # 좌/우 엔드이펙터 포즈
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # 첫 스텝에서 True
}
```

## 액션 형식

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 왼팔 관절 6 + 왼쪽 그리퍼 2 + 오른팔 관절 6 + 오른쪽 그리퍼 2
        "base_motion": np.ndarray,  # (3,) delta x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,            # True이면 상대 액션
        "base_is_rel": True,        # True이면 상대 베이스 모션
    }
}
```

`ee_pose` 제어를 사용할 수도 있습니다. `control_type`을 `"ee_pose"`로 설정하고, 관절 위치 대신 `[pos, quat, gripper]` 쌍을 제공하면 됩니다.

## 최소 예제

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # 여기에서 모델을 로드하세요

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # 여기에 추론 로직을 작성하세요
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

## 팁

- 모델 가중치는 `__init__`에서 로드하고, `get_action`은 추론에만 집중하세요.
- `obs`의 `reset=True`를 확인하여 첫 스텝을 감지하고, 백그라운드 작업이 에피소드를 전환할 때 순환 상태 또는 청크 버퍼를 초기화하세요.
- 이미지는 `uint8` HWC 형식입니다. 추론 전에 모델에 맞는 정규화를 적용하세요.
- 액션 청크를 출력하는 경우, 나머지 액션을 클라이언트 측에서 캐시하거나 `gmp eval --chunk_size <N>`을 사용하세요.
- 다중 워커 평가 시, 각 `worker_id`에 대해 하나의 액션을 반환하세요.
- `EvalClient` 소스 코드는 `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py`에 있습니다.
