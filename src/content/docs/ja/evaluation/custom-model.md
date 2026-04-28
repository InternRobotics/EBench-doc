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

## チャンクモード (推奨)

**推奨アプローチ:** ステップごとに単一のアクションで `client.step()` を呼び出すのではなく、より高いパフォーマンスを得るためにアクションチャンクを送信してください。

```python
# アクションのリストをチャンクとして送信
actions = [action_dict_1, action_dict_2, action_dict_3]
obs, done = client.step(actions)
```

**利点:** サーバーはチャンク内のすべてのアクションを内部で実行し、再推論ポイントでの最終的な観測のみを返します。これによりネットワークオーバーヘッドが削減され、より良いパフォーマンスチューニングが可能になります。

**マルチワーカー評価:** 複数のワーカーを使用する場合は、異なる `worker_ids` で別々のプロセスを起動するだけです。
```bash
# ターミナル 1: worker "0"
python model_client.py --worker_id 0

# ターミナル 2: worker "1"
python model_client.py --worker_id 1
```

## 例: シングルステップモード

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self):
        pass  # ここでモデルを読み込む

    def get_action_chunk(self, obs):
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # ここで推論を実行、つまり左6関節 + 左グリッパー2 + 右6関節 + 右グリッパー2、3つのベース動作状態のアクション
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
        # モデルに基づいて、履歴をクリアし、新しいエピソードにリセット
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
        # obs["reset"] が True の場合、バックグラウンドタスクがエピソードを切り替えたためモデルをリセット
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        action = model.get_action(obs)
        obs, eval_finished = client.step(action)
finally:
    client.close()
```

## 例: チャンクモード (推奨)

```python
import numpy as np
from genmanip_client.eval_client import EvalClient


class ModelClient:
    def __init__(self, chunk_size: int = 4):
        self.chunk_size = chunk_size
        pass  # ここでモデルを読み込む

    def get_action_chunk(self, obs):
        """アクションのチャンクを生成。"""
        worker_id = next(iter(obs))
        worker_obs = obs[worker_id]["obs"]

        instruction = worker_obs["instruction"]
        image = worker_obs["video.front_view"]
        joints = worker_obs["state.joints"]
        gripper = worker_obs["state.gripper"]
        base = worker_obs["state.base"]

        # ここで推論を実行、つまりchunk_size長のチャンクで左6関節 + 左グリッパー2 + 右6関節 + 右グリッパー2、3つのベース動作状態
        pred_action_chunk = np.zeros((self.chunk_size, 16+3), dtype=np.float32)

        # アクションチャンク形式に変換
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
        # モデルに基づいて、履歴をクリアし、新しいエピソードにリセット
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
        # obs["reset"] が True の場合、バックグラウンドタスクがエピソードを切り替えたためモデルをリセット
        if obs[list(obs.keys())[0]]["obs"]["reset"]:
            model.reset()
        # チャンク全体のアクションを生成
        action_chunk = model.get_action_chunk(obs)
        # サーバーがチャンクを内部で実行；次の再推論ポイントでobsを返す
        obs, eval_finished = client.step(action_chunk)
finally:
    client.close()
```

## ヒント

- **より高いパフォーマンスのためにチャンクモードを使用してください**: 単一のアクションではなく、`client.step()` を介してアクションのリストを送信してください。サーバーが内部で実行し、再推論ポイントでの最終的な観測のみを返します。`--no_save_process` フラグ付きのサーバーでのみ動作します。
- モデルの重みは `__init__` で読み込み、`get_action` は推論に専念させてください。
- `obs` 内の `reset=True` を使って最初のステップを検知し、バックグラウンドタスクがエピソードを切り替えた際にリカレント状態やチャンク状態をクリアしてください。
- 画像は `uint8` の HWC 形式です。推論前にモデル固有の正規化を適用してください。
- アクションチャンクを使用する場合は、残りのアクションをクライアント側でキャッシュするか、`gmp eval --chunk_size <N>` を使用してください。
- マルチワーカー評価では、`worker_id` ごとに 1 つのアクションを返してください。
- `EvalClient` のソースコードは `standalone_tools/packages/genmanip_client/src/genmanip_client/eval_client.py` にあります。
