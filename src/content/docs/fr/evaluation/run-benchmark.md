---
title: Lancer l'évaluation
description: Démarrer le serveur Isaac Sim et lancer une évaluation EBench.
---

## 1. Démarrer le serveur

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

Ou avec une installation locale d'Isaac Sim :

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. Soumettre une tâche

Depuis l'**environnement client**, soumettez une tâche de benchmark :

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

Paramètres de tâche disponibles :

| Paramètre de tâche | Description |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | Pick-and-place avec base mobile |
| `ebench/table_top_manip/<split>` | Tâches de manipulation fine sur table |
| `ebench/generalist/<split>` | Tâches mixtes toutes catégories |

Splits : `val_train`, `val_unseen`, `test`

Soumettez toutes les tâches en une seule fois avec `gmp submit ebench --run_id full_run`.

## 3. Connecter votre modèle

Vérification rapide de la connectivité avec le modèle de référence intégré :

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

Pour intégrer votre propre modèle, consultez [Intégrer votre modèle](/fr/evaluation/custom-model/).

## 4. Consulter les résultats

```bash
gmp status
```

Les résultats sont enregistrés dans `saved/eval_results/<task>/<run_id>/`.

> Lorsque le serveur et le client s'exécutent sur des machines différentes, ajoutez `--host <ip> --port <port>` à toutes les commandes `gmp`. Consultez la [référence GMP CLI](/fr/tools/gmp-cli/) pour la liste complète des options.
