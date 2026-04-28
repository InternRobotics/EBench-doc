---
title: Aperçu du benchmark
description: Vue d'ensemble rapide de la configuration d'évaluation, des pistes et des métriques d'EBench.
---

Une orientation rapide sur ce qu'EBench évalue et comment les scores sont calculés. Utilisez cette page comme une carte — suivez les liens pour les détails de configuration ou d'implémentation.

## Configuration d'évaluation

- **Simulateur.** Construit sur NVIDIA Isaac Sim. Le framework [GenManip](https://github.com/InternRobotics/GenManip) fournit le serveur de simulation, les scènes et l'empaquetage des assets.
- **Architecture.** Client–serveur : le serveur exécute la simulation en boîte noire ; votre modèle communique avec lui via un paquet client léger. Voir [Installation de l'environnement](/EBench-doc/fr/getting-started/environment/).
- **Robot.** Toutes les tâches utilisent l'incarnation `lift2` — bi-bras avec base mobile et quatre caméras 480×640. Les clés state/action par frame sont listées dans [Assets et données → Modalités par frame](/EBench-doc/fr/getting-started/assets/#modalités-par-frame).
- **Tâches.** 26 tâches d'évaluation couvrant le long-horizon, la manipulation dextre et la manipulation mobile. Liste complète dans [Démonstrations](/EBench-doc/fr/evaluation/task-showcase/).

## Pistes d'évaluation

EBench organise les tâches en trois pistes de soumission :

| Piste | Focus | Sous-ensemble(s) d'entraînement associés |
| --- | --- | --- |
| `mobile_manip` | Pick-and-place avec base mobile | `long_horizon`, `simple_pnp` |
| `table_top_manip` | Tâches dextres sur table | `teleop_tasks` |
| `generalist` | Mixte multi-catégories (union des deux) | tous les précédents |

Chaque piste est évaluée sur trois splits : `val_train`, `val_unseen`, `test`.

> **Sémantique des splits — WIP.** La répartition précise des tâches/seeds entre les splits sera documentée ici.

Pour soumettre chaque piste, voir [Lancer l'évaluation](/EBench-doc/fr/evaluation/run-benchmark/) et le [guide du Challenge](/EBench-doc/fr/challenge/).

## Métriques

- **Score par épisode** — une valeur dans `[0.0, 1.0]`. Un épisode obtient le score plein lorsque la condition objectif de la tâche est satisfaite pendant l'épisode, sinon `0.0`. La sémantique de réussite par tâche est dans [Démonstrations](/EBench-doc/fr/evaluation/task-showcase/) sous le champ `Score` de chaque tâche.
- **Score de piste** — moyenne des scores par épisode sur tous les épisodes évalués dans la piste/split soumise.
- **Classement** — les scores de piste sont agrégés sur le [classement du Challenge](/EBench-doc/fr/challenge/).

> **Nombre d'épisodes et budgets temps — WIP.** Le nombre d'épisodes par piste/split et les limites de pas par épisode seront documentés ici.

## Pour aller plus loin

- [Installation de l'environnement](/EBench-doc/fr/getting-started/environment/) — installer le serveur et le client.
- [Assets et données](/EBench-doc/fr/getting-started/assets/) — télécharger les assets du benchmark et le jeu d'entraînement LeRobot.
- [Lancer l'évaluation](/EBench-doc/fr/evaluation/run-benchmark/) — soumettre votre premier run de bout en bout.
