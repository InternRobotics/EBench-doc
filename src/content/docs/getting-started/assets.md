---
title: Asset & Dataset
description: Download EBench benchmark assets and the training dataset.
---

## Benchmark assets

EBench benchmark assets are hosted on Hugging Face at [InternRobotics/EBench-Assets](https://huggingface.co/datasets/InternRobotics/EBench-Assets). Download them directly into the `saved/` directory in the repository root:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

After downloading, the directory layout should look like:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← created during evaluation
└── ...
```

## Training dataset

The training dataset is available at [InternRobotics/EBench-Dataset](https://huggingface.co/datasets/InternRobotics/EBench-Dataset) in **LeRobot format**:

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

The LeRobot format is directly compatible with common VLA training pipelines.

## Directory layout

- `saved/assets/`: scene USDs, robots, textures, and packaged assets.
- `saved/tasks/`: task packages from downloaded bundles.
- `saved/eval_results/`: local evaluation outputs (created when you run evaluations).
- `saved/dataset/`: training dataset in LeRobot format (if downloaded).

## Notes

- Keep asset versions aligned with the benchmark release you are evaluating.
- If you switch to a new asset version, clean or archive old files first to avoid mixing releases.
