---
title: モデルの統合
description: 独自の VLA やポリシーを EBench 評価に接続します。
---

コアインターフェースは以下の通りです：

```python
model_client.get_action(obs) -> action
```

`ModelClient` を実装し、`get_action(obs)` 内で推論を 1 回実行してアクション辞書を返します。

## 観測形式

各観測は `worker_id` をキーとしています：

```python
obs["0"]["obs"] = {
    "instruction": str,                        # 言語指示
    "state.joints": np.ndarray,                # (12,) 関節位置
    "state.gripper": np.ndarray,               # (4,) グリッパー状態
    "state.base": np.ndarray,                  # (3,) ベース位置
    "state.ee_pose": [[pos, quat], [pos, quat]],  # 左右エンドエフェクタ
    "video.{camera}_view": np.ndarray,         # (480, 640, 3) uint8
    "timestep": int,
    "reset": bool,                             # 最初のステップでは True
}
```

## アクション形式

```python
action = {
    "0": {
        "action": np.ndarray,       # (16,) = 左6関節 + 左グリッパー2 + 右6関節 + 右グリッパー2
        "base_motion": np.ndarray,  # (3,) デルタ x, y, yaw
        "control_type": "joint_position",
        "is_rel": False,            # デルタアーム動作の場合は True
        "base_is_rel": True,        # デルタベース動作の場合は True
    }
}
```

`control_type` を `"ee_pose"` に設定し、関節位置の代わりに `[pos, quat, gripper]` のペアを指定することで、エンドエフェクタ姿勢制御も利用できます。

## 最小サンプル

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # ここでモデルを読み込む

    def get_action(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # ここで推論を実行
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

## ヒント

- モデルの重みは `__init__` で読み込み、`get_action` は推論に専念させてください。
- `obs` 内の `reset=True` を使って最初のステップを検知し、バックグラウンドタスクがエピソードを切り替えた際にリカレント状態やチャンク状態をクリアしてください。
- 画像は `uint8` の HWC 形式です。推論前にモデル固有の正規化を適用してください。
- アクションチャンクを使用する場合は、残りのアクションをクライアント側でキャッシュするか、`gmp eval --chunk_size <N>` を使用してください。
- マルチワーカー評価では、`worker_id` ごとに 1 つのアクションを返してください。
- `EvalClient` のソースコードは `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py` にあります。
