---
title: 評価の実行
description: Isaac Sim サーバーを起動し、EBench 評価を実行します。
---

## 1. サーバーの起動

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

ローカルの Isaac Sim を使用する場合：

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. タスクの送信

**クライアント環境**からベンチマークジョブを送信します：

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

利用可能なタスク設定：

| タスク設定 | 説明 |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | モバイルベースによるピックアンドプレース |
| `ebench/table_top_manip/<split>` | テーブルトップでの精密タスク |
| `ebench/generalist/<split>` | カテゴリ横断の混合タスク |

スプリット：`val_train`、`val_unseen`、`test`

`gmp submit ebench --run_id full_run` で全タスクを一括送信できます。

## 3. モデルの接続

組み込みベースラインによる接続テスト：

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

独自のモデルを使用する場合は、[モデルの統合](/EBench-doc/ja/evaluation/custom-model/) を参照してください。

## 4. 結果の確認

```bash
gmp status
```

結果は `saved/eval_results/<task>/<run_id>/` に保存されます。

> サーバーとクライアントを別々のマシンで実行する場合は、すべての `gmp` コマンドに `--host <ip> --port <port>` を指定してください。すべてのオプションについては [GMP CLI リファレンス](/EBench-doc/ja/tools/gmp-cli/) を参照してください。
