---
title: Assets et données
description: Aperçu du jeu de données EBench, et téléchargement des assets du benchmark et du jeu d'entraînement.
---

## Aperçu du jeu de données

> **Deux sources de collecte — caractéristiques d'action différentes.** Les épisodes de cette version proviennent de deux pipelines distincts. Faites attention au sous-ensemble que vous utilisez pour l'entraînement :
>
> - **Génération à base de règles (GenManip).** `long_horizon` et `simple_pnp` sont produits par des politiques scriptées dans le framework [GenManip](https://github.com/InternRobotics/GenManip). Les trajectoires sont **lisses** et présentent des **frontières de comportement claires** entre les sous-compétences.
> - **Téléopération.** `teleop_tasks` est collecté par des téléopérateurs humains sur des tâches dextres. Les trajectoires conservent le style humain — les actions peuvent **vibrer, hésiter ou marquer une pause** en plein mouvement.
>
> Si vous entraînez sur l'union, attendez-vous à ce que la politique hérite parfois de cette hésitation. Si la fluidité des actions est importante pour votre évaluation, donnez plus de poids aux sous-ensembles GenManip ou filtrez les épisodes téléopérés.

### En un coup d'œil

| Sous-ensemble | Source | Pistes d'évaluation | Épisodes | Frames (≈) | Tâches |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | Règles (GenManip) | `mobile_manip`, `generalist` | 9 × 200 = **1 800** | 3,6 M | 9 familles long-horizon |
| `simple_pnp`   | Règles (GenManip) | `mobile_manip`, `generalist` | 10 × 200 = **2 000** | 0,96 M | 10 pick-and-place mono-étape |
| `teleop_tasks` | Téléopération humaine | `table_top_manip`, `generalist` | 7 × 400 = **2 800** | 5,3 M | 7 tâches dextres |

EBench propose trois pistes d'évaluation : `mobile_manip` (pick-and-place avec base mobile) et `table_top_manip` (tâches dextres sur table) couvrent les deux régimes spécialisés, tandis que `generalist` est leur union — voir [Lancer l'évaluation](/EBench-doc/fr/evaluation/run-benchmark/) pour la procédure de soumission.

Tous les sous-ensembles partagent la même configuration d'enregistrement : **15 fps**, type de robot **`lift2`** (bi-bras + base mobile), quatre vues caméra 480×640 (`top`, `left`, `right`, `overlook`).

### Arborescence

Chaque sous-ensemble est un dataset LeRobot **v2.1** indépendant avec ses propres familles de tâches, métadonnées et fichiers parquet/vidéo en chunks :

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # ex. bottle, dishwasher, make_sandwich, ...
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # même structure
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # même structure
```

### Modalités par frame

| Clé | Forme | Notes |
| --- | --- | --- |
| `state.joints`, `action.joints`, `action.joints_delta` | `(12,)` | articulations bi-bras (6 + 6) |
| `state.gripper`, `action.gripper` | `(4,)` | pinces gauche/droite, deux états de doigt chacune |
| `state.ee_pose`, `action.ee_pose`, `action.ee_pose_delta` | `(14,)` | position EE gauche/droite (xyz) + quaternion (wxyz) |
| `state.base`, `action.base`, `action.base_delta` | `(3,)` | base `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | MP4 encodé en AV1, 15 fps |

Les canaux `*_delta` portent les mêmes grandeurs exprimées en deltas — choisissez celui qui correspond au mode de contrôle de votre politique. Le `meta/modality.json` de chaque tâche liste les clés canoniques state/action/video exposées aux loaders LeRobot.

### Tâches par sous-ensemble

**`long_horizon`** — 9 familles long-horizon, 200 épisodes chacune :
`bottle`, `detergent`, `dish`, `dishwasher`, `fruit`, `make_sandwich`, `microwave`, `pen`, `shop`.

**`simple_pnp`** — 10 tâches pick-and-place mono-étape (`task1`–`task10`), 200 épisodes chacune. Exemples : fourchette et cuillère → porte-ustensiles, marque-page → livre, savon → porte-savon, pomme → corbeille de fruits, télécommande → support, parfum → étagère cosmétique, sel → étagère à épices, pomme depuis l'étagère, tasse et théière, bol empilé sur l'assiette.

**`teleop_tasks`** — 7 tâches dextres, 400 épisodes chacune :
`collect_coffee_beans`, `flip_cup_collect_cookies`, `frame_against_pen_holder`, `install_gear`, `peg_in_hole`, `put_glass_in_glassbox`, `tighten_nut`.

### Instructions en langage naturel

Chaque épisode est associé à une instruction en langage naturel, et le jeu de données fournit **plusieurs paraphrases par tâche**. Les instructions canoniques se trouvent dans `meta/tasks.jsonl` de chaque sous-ensemble ; `long_horizon` fournit en plus `instruction_paraphrases_train_only.json` avec des formulations supplémentaires pour l'entraînement. Échantillonner les paraphrases pendant l'entraînement rend la politique plus robuste à la formulation des instructions.

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

Le jeu de données utilise le format [LeRobot](https://github.com/huggingface/lerobot), directement compatible avec les pipelines d'entraînement VLA courants. Pour le contenu, voir l'[Aperçu du jeu de données](#aperçu-du-jeu-de-données) ci-dessus.

Étape suivante : [lancer votre première évaluation](/EBench-doc/fr/evaluation/run-benchmark/).
