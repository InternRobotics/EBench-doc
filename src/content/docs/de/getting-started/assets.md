---
title: Assets und Datensatz
description: EBench-Benchmark-Assets und den Trainingsdatensatz herunterladen.
---

## Benchmark-Assets

Laden Sie die Evaluations-Assets von Hugging Face in das Verzeichnis `saved/` herunter:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

Nach dem Download sollte die Verzeichnisstruktur so aussehen:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← wird bei der Evaluation erstellt
└── ...
```

## Trainingsdatensatz (LeRobot-Format)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

Der Datensatz verwendet das [LeRobot](https://github.com/huggingface/lerobot)-Format und ist direkt mit gaengigen VLA-Trainingspipelines kompatibel.

Naechster Schritt: [Erste Evaluation starten](/EBench-doc/de/evaluation/run-benchmark/).
