---
title: ベンチマーク概要
description: EBench の評価設定、トラック、指標の早見ガイド。
---

EBench が何を評価し、スコアをどのように算出するかを素早く把握するためのページです。地図として使ってください — 詳細はリンク先の各ページを参照します。

## 評価設定

- **シミュレータ。** NVIDIA Isaac Sim をベースに構築。シミュレーションサーバー、シーン、アセットパッケージングは [GenManip](https://github.com/InternRobotics/GenManip) フレームワークが提供します。
- **アーキテクチャ。** クライアント–サーバー：サーバーがシミュレーションをブラックボックスとして実行し、モデルは軽量クライアントパッケージ経由で通信します。詳しくは[環境構築](/EBench-doc/ja/getting-started/environment/)。
- **ロボット。** 全タスクで `lift2` エンボディメントを使用 — 双腕 + 移動ベース + 4 つの 480×640 カメラ。フレームごとの state/action キーは[アセットとデータセット → フレームごとのモダリティ](/EBench-doc/ja/getting-started/assets/#フレームごとのモダリティ)に記載されています。
- **タスク。** 評価タスクは合計 26 種類で、長期タスク、器用な操作、モバイル操作をカバーします。一覧は[タスク一覧](/EBench-doc/ja/evaluation/task-showcase/)を参照。

## 評価トラック

EBench はタスクを 3 つの提出トラックに分けています：

| トラック | フォーカス | 対応する学習サブセット |
| --- | --- | --- |
| `mobile_manip` | 移動ベースでの pick-and-place | `long_horizon`、`simple_pnp` |
| `table_top_manip` | 卓上の器用な操作タスク | `teleop_tasks` |
| `generalist` | カテゴリ横断の混合（上記二つの和集合） | 上記すべて |

各トラックは 3 つの split で評価されます：`val_train`、`val_unseen`、`test`。

> **Split の詳細 — WIP。** 各 split に含まれるタスク/シードの正確な内訳は今後ここに記載されます。

各トラックの提出方法は[評価の実行](/EBench-doc/ja/evaluation/run-benchmark/)と [Challenge ガイド](/EBench-doc/ja/challenge/)を参照してください。

## 指標

- **エピソード単位のタスクスコア** — 範囲 `[0.0, 1.0]`。エピソード内でタスクのゴール条件が達成されれば満点、そうでなければ `0.0`。タスクごとの成功判定は[タスク一覧](/EBench-doc/ja/evaluation/task-showcase/)の各タスクの `Score` 欄を参照。
- **トラックスコア** — 提出したトラック/split における全評価エピソードのスコア平均。
- **リーダーボード** — トラックスコアは [Challenge リーダーボード](/EBench-doc/ja/challenge/)で集計されます。

> **エピソード数と時間予算 — WIP。** 各トラック/split のエピソード数、エピソードあたりのステップ上限は今後ここに記載されます。

## 次に読むべきページ

- [環境構築](/EBench-doc/ja/getting-started/environment/) — サーバーとクライアントをインストール。
- [アセットとデータセット](/EBench-doc/ja/getting-started/assets/) — ベンチマークアセットと LeRobot 学習セットをダウンロード。
- [評価の実行](/EBench-doc/ja/evaluation/run-benchmark/) — 最初の評価を一通り実行。
