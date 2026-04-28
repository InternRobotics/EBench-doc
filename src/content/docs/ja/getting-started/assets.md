---
title: アセットとデータセット
description: EBench データセットの概要と、ベンチマークアセットおよびトレーニングデータセットのダウンロード手順。
---

## データセット概要

> **2 種類のデータ収集方法 — アクション特性が異なります。** 本リリースのエピソードは 2 つの異なるパイプラインから収集されています。学習に使用するサブセットに注意してください：
>
> - **ルールベース生成（GenManip）。** `long_horizon` と `simple_pnp` は [GenManip](https://github.com/InternRobotics/GenManip) フレームワーク内のスクリプト化されたポリシーで生成されます。軌跡は**滑らか**で、サブスキル間に**明確な動作境界**があります。
> - **テレオペレーション。** `teleop_tasks` は人間のテレオペレーターが器用な操作タスクで収集したものです。軌跡には人間特有のスタイルが残り、動作の途中で**振動・ためらい・停止**が発生することがあります。
>
> 両者を統合して学習する場合、ポリシーがテレオペのためらいを引き継ぐことがあります。動作の滑らかさが評価で重要なら、GenManip サブセットに重み付けを多くするか、テレオペのエピソードをフィルタリングしてください。

### ひと目でわかる主要情報

| サブセット | ソース | 評価トラック | エピソード数 | フレーム数（約） | タスク |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | ルールベース（GenManip） | `mobile_manip`、`generalist` | 9 × 200 = **1,800** | 3.6 M | 長期タスク 9 ファミリー |
| `simple_pnp`   | ルールベース（GenManip） | `mobile_manip`、`generalist` | 10 × 200 = **2,000** | 0.96 M | 単一ステップ pick-and-place 10 種 |
| `teleop_tasks` | 人間によるテレオペ     | `table_top_manip`、`generalist` | 7 × 400 = **2,800**  | 5.3 M | 器用な操作タスク 7 種 |

EBench には 3 つの評価トラックがあります。`mobile_manip`（移動ベースでの pick-and-place）と `table_top_manip`（卓上の器用な操作）が 2 つの特化型レジームを、`generalist` がその和集合をカバーします — 提出方法は[評価の実行](/EBench-doc/ja/evaluation/run-benchmark/)を参照してください。

すべてのサブセットは同じ収録設定を共有：**15 fps**、ロボットタイプ **`lift2`**（双腕 + 移動ベース）、4 つの 480×640 カメラ視点（`top`、`left`、`right`、`overlook`）。

### ディレクトリ構成

各サブセットは独立した LeRobot **v2.1** データセットで、それぞれ独自のタスクファミリー、メタ、チャンク化された parquet/動画ファイルを持ちます：

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # 例: bottle、dishwasher、make_sandwich…
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # 同様の構造
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # 同様の構造
```

### フレームごとのモダリティ

| キー | 形状 | 備考 |
| --- | --- | --- |
| `state.joints`、`action.joints`、`action.joints_delta` | `(12,)` | 双腕の関節位置（6 + 6） |
| `state.gripper`、`action.gripper` | `(4,)` | 左右グリッパー、各 2 本の指の状態 |
| `state.ee_pose`、`action.ee_pose`、`action.ee_pose_delta` | `(14,)` | 左右 EE 位置 (xyz) + クォータニオン (wxyz) |
| `state.base`、`action.base`、`action.base_delta` | `(3,)` | ベース `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | AV1 エンコード MP4、15 fps |

`*_delta` チャネルは同じ量を差分形式で表現しています — ポリシーの制御モードに合わせて選んでください。各タスクの `meta/modality.json` に LeRobot ローダー向けの正規 state/action/video キーが記載されています。

### サブセットごとのタスク

**`long_horizon`** — 長期タスク 9 ファミリー、各 200 エピソード：
`bottle`、`detergent`、`dish`、`dishwasher`、`fruit`、`make_sandwich`、`microwave`、`pen`、`shop`。

**`simple_pnp`** — 単一ステップ pick-and-place 10 タスク（`task1`〜`task10`）、各 200 エピソード。例：フォークとスプーン → 食器ホルダー、しおり → 本、石鹸 → 石鹸皿、リンゴ → フルーツボウル、リモコン → ホルダー、香水 → 化粧棚、塩 → スパイスラック、棚からリンゴを取る、ティーカップとティーポット、ボウルを皿に積む。

**`teleop_tasks`** — 器用な操作タスク 7 種、各 400 エピソード：
`collect_coffee_beans`、`flip_cup_collect_cookies`、`frame_against_pen_holder`、`install_gear`、`peg_in_hole`、`put_glass_in_glassbox`、`tighten_nut`。

### 自然言語の指示

各エピソードには自然言語の指示が付与されており、データセットには**タスクごとに複数の言い換え**が含まれています。標準的な指示は各サブセットの `meta/tasks.jsonl` にあり、`long_horizon` には学習用の追加表現を収めた `instruction_paraphrases_train_only.json` も付属しています。学習時に言い換えをサンプリングすることで、ポリシーは指示の表現に対してロバストになります。

## ベンチマークアセット

Hugging Face から評価用アセットを `saved/` ディレクトリにダウンロードします：

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

ダウンロード後、以下のようなディレクトリ構成になります：

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← 評価時に作成されます
└── ...
```

## トレーニングデータセット（LeRobot 形式）

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

データセットは [LeRobot](https://github.com/huggingface/lerobot) 形式で、一般的な VLA トレーニングパイプラインとそのまま互換性があります。データセットの内容は上記の[データセット概要](#データセット概要)を参照してください。

次のステップ：[最初の評価を実行する](/EBench-doc/ja/evaluation/run-benchmark/)。
