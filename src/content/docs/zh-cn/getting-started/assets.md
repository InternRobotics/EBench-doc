---
title: 资产与数据集
description: 下载 EBench 评测资产和训练数据集。
---

## 评测资产

从 Hugging Face 下载评测资产到 `saved/` 目录：

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

下载完成后应当看到：

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← 评测时自动生成
└── ...
```

## 训练数据集（LeRobot 格式）

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

数据集采用 [LeRobot](https://github.com/huggingface/lerobot) 格式，可直接用于常见的 VLA 训练流水线。

下一步：[运行第一次评测](/zh-cn/evaluation/run-benchmark/)。
