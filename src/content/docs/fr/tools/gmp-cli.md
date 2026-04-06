---
title: GMP CLI
description: Soumettre, surveiller, évaluer et post-traiter les tâches EBench avec gmp.
---

## Installation

Installez le paquet `genmanip-client` dans votre **environnement client** :

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Commandes principales

| Commande | Fonction |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | Soumettre ou reconnecter des tâches de benchmark sur le serveur d'évaluation. |
| [`gmp status`](#gmp-status) | Consulter la progression et les métriques de l'exécution en cours. |
| [`gmp eval`](#gmp-eval) | Lancer des workers client et interagir avec les épisodes du serveur. |
| [`gmp plot`](#gmp-plot) | Post-traiter les sorties d'épisodes en artefacts de visualisation. |
| [`gmp clean`](#gmp-clean) | Supprimer les caches, logs, résultats d'évaluation et fichiers temporaires. |
| [`gmp visualize`](#gmp-visualize) | Parcourir les résultats d'évaluation et rejouer les épisodes dans le visualiseur Rerun. |

## Submit, status et eval

### `gmp submit`

Famille de benchmark + split :

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

Alias de benchmark :

```bash
gmp submit ebench --run_id full_benchmark
```

Chemins de paramètres de tâche pris en charge :

Paramètres de tâche :

- `mobile_manip`
- `table_top_manip`
- `generalist`

Splits :

- `val_train`
- `val_unseen`
- `test`

### `gmp status`

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

### `gmp eval`

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

Pour intégrer un modèle personnalisé, consultez [Intégrer votre modèle](/fr/evaluation/custom-model/).

## Clean, plot et visualize

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

Utilisez `gmp clean` pour supprimer les artefacts générés lors des exécutions locales.

Prévisualiser ce qui sera supprimé :

```bash
gmp clean --dry-run
```

Supprimer le cache de maillages, les résultats d'évaluation, les logs et les fichiers temporaires résiduels :

```bash
gmp clean
```

Supprimer également le cache des paquets de benchmark téléchargés :

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize` lance un visualiseur HTTPS local permettant de parcourir les exécutions, les taux de réussite par tâche et les replays épisode par épisode.

Installer l'extension de visualisation :

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

Utilisation de base :

```bash
gmp visualize
gmp visualize --port 55088
```

Gestion du cache :

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

Notes :

- `gmp visualize` s'attend à trouver les résultats d'évaluation dans `saved/eval_results/`.
- Le visualiseur utilise HTTPS et peut afficher un avertissement de certificat dans le navigateur lors du premier accès.
- Le chemin `rerun-sdk` actuel utilisé par visualize nécessite Python 3.11+.

## Options communes

- `--run_id` : identifie et permet de reprendre une exécution.
- `--host`, `--port` : cible du serveur d'évaluation (par défaut `127.0.0.1:8087` en local).
- `--worker_ids` : allocation des workers dans `gmp eval`.
- `--frame_save_interval` : fréquence d'enregistrement des images côté client.
- `--chunk_size` : longueur du chunk d'actions lorsque votre modèle prédit des actions groupées.
