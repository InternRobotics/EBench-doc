---
title: チャレンジ
description: EBench の結果をオンラインチャレンジのリーダーボードに送信します。
---

EBench Challenge では benchmark 結果のオンライン提出をサポートしています。以下の手順に従って有効な実行を準備し、リーダーボードサービスに提出してください。

## Baseline と導入

オンライン提出の前に、まず benchmark をローカルで実行できることを確認してください。

- [環境構築](/ja/getting-started/environment/) に従ってサーバー環境とクライアント環境を準備します。
- [アセットとデータセット](/ja/getting-started/assets/) に従って必要な benchmark assets を準備します。
- まず [評価の実行](/ja/evaluation/run-benchmark/) でローカル benchmark を実行します。
- 独自の policy を使う場合は [モデルの統合](/ja/evaluation/custom-model/) を参照してください。

オンライン提出を行う前に、ローカル実行が正常に終了し、完全な結果ディレクトリが生成されることを確認してください。

## オンライン提出の手順

オンラインのワークフローは 3 段階です。オンラインタスクを作成し、評価 endpoint の準備完了を待ち、その endpoint に対して評価 worker を実行します。

### 1. token を取得する

プラットフォームのランディングページを開きます。

```text
https://internrobotics.shlab.org.cn/eval/landing-page
```

その後：

1. プラットフォームにサインインします。
2. API key または secret 管理ページを開きます。
3. 新しい API key を作成し、token の値をコピーします。

### 2. クライアント環境を準備する

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. オンライン評価タスクを作成する

`gmp online submit` を使ってリモート評価ジョブをリクエストします。

```bash
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id "$PREVIOUS_TASK" \  # optional: continue with a previous task
  --benchmark_set ebench_generalist \
  --model_name internVLA \
  --model_type VLA \
  --submitter_name test \
  --submitter_homepage test \
  --is_public 0
```

### パラメータ

| パラメータ | タイプ | 例 | 説明 |
|-----------|------|---------|-------------|
| task_id | string | T2025123100001 | オプション、前回のタスク再実行時に前のtask_idを含めることができます |
| model_name | string | internVLA | モデル名 |
| model_type | string | VLA | モデルタイプ |
| benchmark_set | string | EBench | ベンチマークセットタイプ、現在ebench_generalistのみ許可されています |
| submitter_name | string | SHlab | 組織/開発者名 |
| submitter_homepage | string | http://example.com | 提出者ホームページ |
| is_public | int | 0 | 公開かどうか<br>0 いいえ<br>1 はい |

バックエンドタスクの準備が完了すると、コマンドは次のようなフィールドを返します。

```json
Waiting for available server (task_id=b5dddc6de60c4aec8236500b8e3dc0e1)...
Still waiting... elapsed 0.1s. Next check in 5.0s.
Still waiting... elapsed 5.3s. Next check in 5.0s.
Ready after 10.4s. endpoint=https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod
{
  "task_id": "b5dddc6de60c4aec8236500b8e3dc0e1",
  "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod",
  "response": {
    "code": 0,
    "msg": "success",
    "trace_id": "4a4136c66bdc80922ccc6485c44fa9e5",
    "data": {
      "ready": true,
      "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod"
    }
  }
}
```

次の 2 つの値を記録してください。

- `task_id`: 評価実行時に `run_id` として使用します。
- `endpoint`: リモート評価 URL として使用します。

#### Demo: `endpoint` と `task_id` を自動抽出する

次の例では、簡略化した Python スクリプトで `gmp online submit` を実行し、返された出力から `endpoint` と `task_id` を抽出します。

```python
import os
import json
import subprocess

def submit_online_task() -> tuple[str, str]:
    cmd = [
        'gmp', 'online', 'submit',
        '--base_url', 'https://internrobotics.shlab.org.cn/eval',
        '--token', os.environ['EBENCH_SUBMIT_TOKEN'],
        '--benchmark_set', 'ebench_generalist',
        '--model_name', 'internVLA',
        '--model_type', 'VLA',
        '--submitter_name', 'test',
        '--submitter_homepage', 'test',
        '--is_public', '0',
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    output = result.stdout
    json_start = output.find('{')
    payload = json.loads(output[json_start:])
    endpoint = payload['endpoint']
    task_id = payload['task_id']
    print('endpoint=' + endpoint)
    print('task_id=' + task_id)
    return endpoint, task_id
```

スクリプトを実行すると、`endpoint` と `task_id` がそのまま出力され、後続の評価 worker 呼び出しに利用できます。

### 4. 評価 worker を開始する

返された endpoint に対して evaluator を実行します。これはテスト評価です。ドキュメントに従ってあなた自身のモデル評価を作成してください。

```python
endpoint, task_id = submit_online_task()

client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["0"]
)
model = ModelClient(...)

try:
    obs = client.reset()
    done = False
    while not done:
        # チャンク全体のアクションを生成
        action_chunk = model.get_action_chunk(obs)
        # サーバーがチャンクを内部的に実行; 次の再推論ポイントでobsを返す
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

異なるIDで複数の評価クライアントを起動できます。例えば：

```python
client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["1"]
)
...
```

サーバーは実行ごとに最大16の同時ワーカーをサポートします。接続は10分の非アクティブ状態後に終了されます。同じtask_idを使用して失敗した評価提出を再開できます。
```bash
# 上記のタスクを再開
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

接続タイムアウトが発生した場合は、クライアントを再起動して接続を復旧してください。進捗はサーバーに保存されます。

### 5. タスクを監視する

オンラインタスクが作成されると、プラットフォームのページに対応するタスクが表示されます。最終的な評価結果は同じリモートタスク記録に書き込まれます。

ターミナルからサーバーの状態とタスクの進捗を確認することもできます。

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"
```

### 6. タスクを停止する

評価セッションを停止するには：

```
gmp online stop \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  --user_id "$USER_ID"    # ウェブサイトから取得、アカウントページ
```

## オンライン提出 URL

公式プラットフォームの base URL を使ってタスクを作成します。

```text
https://internrobotics.shlab.org.cn/eval
```

`gmp online submit` の後、そのタスクに対して返された endpoint を評価に使用します。

```text
https://internverse.shlab.org.cn/evalserver/<task-endpoint>
```

## スコアリングルール

- 評価される各 episode は `0.0` から `1.0` の範囲のタスクスコアを生成します。
- 該当の episode 内で要求された目標条件を達成した場合、タスクは満点となります。それ以外の場合は `0.0` となります。
- リーダーボードのスコアは、提出された benchmark セット内の評価された episode のタスクスコアの平均値です。
- タスクごとの成功条件の詳細については [タスクショーケース](/ja/evaluation/task-showcase/) を参照してください。各タスクには `Location`、`Instruction`、`Score` の説明が記載されています。

## チェックリスト例

- Baseline または独自モデルがローカルで動作する
- 正しい benchmark track と split を選択している
- 提出 token を設定済み
- オンライン提出 URL を確認済み
- 結果ファイルの準備が完了している
