---
title: アセットとデータセット
description: EBench ベンチマークアセットとトレーニングデータセットをダウンロードします。
---

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

データセットは [LeRobot](https://github.com/huggingface/lerobot) 形式で、一般的な VLA トレーニングパイプラインとそのまま互換性があります。

次のステップ：[最初の評価を実行する](/EBench-doc/ja/evaluation/run-benchmark/)。
