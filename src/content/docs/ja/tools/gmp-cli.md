---
title: GMP CLI
description: gmp を使って EBench タスクの送信、監視、評価、後処理を行います。
---

## インストール

**クライアント環境**に `genmanip-client` パッケージをインストールします：

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 主要コマンド

| コマンド | 用途 |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | 評価サーバーにベンチマークタスクを送信・再接続します。 |
| [`gmp status`](#gmp-status) | 現在の実行の進捗とメトリクスを確認します。 |
| [`gmp eval`](#gmp-eval) | クライアントワーカーを起動し、サーバーエピソードと対話します。 |
| [`gmp plot`](#gmp-plot) | エピソード出力を可視化アーティファクトに後処理します。 |
| [`gmp clean`](#gmp-clean) | 生成されたキャッシュ、ログ、評価出力、一時ファイルを削除します。 |
| [`gmp visualize`](#gmp-visualize) | 評価結果の閲覧とエピソードの Rerun ビューアーでの再生を行います。 |

## Submit、Status、Eval

### `gmp submit`

ベンチマークファミリー + スプリット：

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

ベンチマークエイリアス：

```bash
gmp submit ebench --run_id full_benchmark
```

対応するタスク設定パス：

タスク設定：

- `mobile_manip`
- `table_top_manip`
- `generalist`

スプリット：

- `val_train`
- `val_unseen`
- `test`

### `gmp status`

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

### `gmp eval`

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

カスタムモデルの統合については、[モデルの統合](/ja/evaluation/custom-model/) を参照してください。

## Clean、Plot、Visualize

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

`gmp clean` でローカル実行の生成アーティファクトを削除します。

削除対象のプレビュー：

```bash
gmp clean --dry-run
```

生成されたメッシュキャッシュ、評価結果、ログ、残存する一時ファイルを削除：

```bash
gmp clean
```

ダウンロード済みのベンチマークパッケージキャッシュも削除：

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize` は、実行結果の閲覧、タスク成功率の確認、エピソードごとの再生が可能なローカル HTTPS ビューアーを起動します。

visualize エクストラのインストール：

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

基本的な使い方：

```bash
gmp visualize
gmp visualize --port 55088
```

キャッシュ管理：

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

注意事項：

- `gmp visualize` は `saved/eval_results/` 配下の評価出力を参照します。
- ビューアーは HTTPS を使用するため、初回はブラウザの証明書警告が表示される場合があります。
- visualize が使用する現在の `rerun-sdk` パスは Python 3.11 以上が必要です。

## 共通オプション

- `--run_id`：実行の識別と再開に使用します。
- `--host`、`--port`：評価サーバーの接続先（デフォルトはローカルの `127.0.0.1:8087`）。
- `--worker_ids`：`gmp eval` でのワーカー割り当て。
- `--frame_save_interval`：クライアント側のフレーム保存頻度。
- `--chunk_size`：モデルがチャンクアクションを予測する場合のアクションチャンク長。
