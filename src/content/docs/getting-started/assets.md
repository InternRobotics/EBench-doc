---
title: Asset & Dataset
description: Download EBench benchmark assets and the training dataset.
---

## Benchmark assets

Download evaluation assets from Hugging Face into the `saved/` directory:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

After downloading you should see:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← created during evaluation
└── ...
```

## Training dataset (LeRobot format)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

The dataset uses [LeRobot](https://github.com/huggingface/lerobot) format, directly compatible with common VLA training pipelines.

Next step: [run your first evaluation](/evaluation/run-benchmark/).
