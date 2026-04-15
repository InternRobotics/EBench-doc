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
https://internrobotics-staging.shlab.org.cn/eval/landing-page
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
  --benchmark_set EBench \
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
| benchmark_set | string | EBench | ベンチマークセットタイプ、現在EBenchのみ許可されています |
| submitter_name | string | SHlab | 組織/開発者名 |
| submitter_homepage | string | http://example.com | 提出者ホームページ |
| is_public | int | 0 | 公開かどうか<br>0 いいえ<br>1 はい |

バックエンドタスクの準備が完了すると、コマンドは次のようなフィールドを返します。

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics-staging.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

次の 2 つの値を記録してください。

- `task_id`: 評価実行時に `run_id` として使用します。
- `endpoint`: リモート評価 URL として使用します。

### 4. 評価 worker を開始する

返された endpoint に対して evaluator を実行します。

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  --chunk_size 40 \
  --worker_id 0
```

2 台目の backend worker を使いたい場合は、別のターミナルを開いて次を実行します。

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  --chunk_size 40 \
  --worker_id 1
```

サーバーは実行ごとに最大32の同時ワーカーをサポートします。接続は1時間の非アクティブ状態後に終了されます。

### 5. タスクを監視する

オンラインタスクが作成されると、プラットフォームのページに対応するタスクが表示されます。最終的な評価結果は同じリモートタスク記録に書き込まれます。


## オンライン提出 URL

公式プラットフォームの base URL を使ってタスクを作成します。

```text
https://internrobotics-staging.shlab.org.cn/eval
```

`gmp online submit` の後は、返されたタスク専用 endpoint を評価に使用します。

```text
https://internrobotics-staging.shlab.org.cn/evalserver/<task-endpoint>
```

## チェックリスト例

- Baseline または独自モデルがローカルで動作する
- 正しい benchmark track と split を選択している
- 提出 token を設定済み
- オンライン提出 URL を確認済み
- 結果ファイルの準備が完了している
