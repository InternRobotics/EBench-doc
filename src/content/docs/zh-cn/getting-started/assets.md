---
title: 资产与数据集
description: 下载 EBench 评测资产和训练数据集。
---

## 评测资产

EBench 评测资产托管在 Hugging Face 上：[InternRobotics/EBench-Assets](https://huggingface.co/datasets/InternRobotics/EBench-Assets)。直接下载到仓库根目录下的 `saved/` 中：

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

下载完成后，目录结构如下：

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← 评测时自动生成
└── ...
```

## 训练数据集

训练数据集位于 [InternRobotics/EBench-Dataset](https://huggingface.co/datasets/InternRobotics/EBench-Dataset)，采用 **LeRobot 格式**：

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

LeRobot 格式可直接用于常见的 VLA 训练流水线。

## 目录约定

- `saved/assets/`：场景 USD、机器人、纹理和打包资产。
- `saved/tasks/`：从资产包中同步出来的任务包。
- `saved/eval_results/`：本地评测输出结果（评测时自动创建）。
- `saved/dataset/`：LeRobot 格式的训练数据集（如下载）。

## 说明

- 资产版本最好和你正在使用的 benchmark 版本保持一致。
- 如果要切换到新版本资产，先清理或归档旧文件，避免不同版本混用。
