---
title: Assets y dataset
description: Descarga los assets del benchmark EBench y el dataset de entrenamiento.
---

## Assets del benchmark

Descarga los assets de evaluación desde Hugging Face en el directorio `saved/`:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

Después de la descarga deberías ver:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← se crea durante la evaluación
└── ...
```

## Dataset de entrenamiento (formato LeRobot)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

El dataset utiliza el formato [LeRobot](https://github.com/huggingface/lerobot), directamente compatible con los pipelines de entrenamiento VLA más habituales.

Siguiente paso: [ejecutar tu primera evaluación](/EBench-doc/es/evaluation/run-benchmark/).
