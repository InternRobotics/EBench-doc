---
title: Assets et données
description: Télécharger les assets du benchmark EBench et le jeu de données d'entraînement.
---

## Assets du benchmark

Téléchargez les assets d'évaluation depuis Hugging Face dans le répertoire `saved/` :

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

Après le téléchargement, vous devriez obtenir l'arborescence suivante :

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← créé lors de l'évaluation
└── ...
```

## Jeu de données d'entraînement (format LeRobot)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

Le jeu de données utilise le format [LeRobot](https://github.com/huggingface/lerobot), directement compatible avec les pipelines d'entraînement VLA courants.

Étape suivante : [lancer votre première évaluation](/EBench-doc/fr/evaluation/run-benchmark/).
