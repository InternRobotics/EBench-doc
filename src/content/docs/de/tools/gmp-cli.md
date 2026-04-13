---
title: GMP CLI
description: EBench-Aufgaben mit gmp einreichen, ueberwachen, evaluieren und nachbearbeiten.
---

## Installation

Installieren Sie das Paket `genmanip-client` in Ihrer **Client-Umgebung**:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Kernbefehle

| Befehl | Zweck |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | Benchmark-Aufgaben auf dem Eval-Server einreichen oder wiederaufnehmen. |
| [`gmp status`](#gmp-status) | Fortschritt und Metriken des aktuellen Laufs anzeigen. |
| [`gmp eval`](#gmp-eval) | Client-Worker starten und mit Server-Episoden interagieren. |
| [`gmp plot`](#gmp-plot) | Episodenausgaben zu Visualisierungsartefakten nachbearbeiten. |
| [`gmp clean`](#gmp-clean) | Generierte Caches, Logs, Eval-Ausgaben und temporaere Reste entfernen. |
| [`gmp visualize`](#gmp-visualize) | Eval-Ergebnisse durchsuchen und Episoden im Rerun-Viewer abspielen. |

## Submit, Status und Eval

### `gmp submit`

Benchmark-Familie + Split:

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

Benchmark-Alias:

```bash
gmp submit ebench --run_id full_benchmark
```

Unterstuetzte Aufgabenpfade:

Aufgabeneinstellungen:

- `mobile_manip`
- `table_top_manip`
- `generalist`

Splits:

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

Fuer die Integration eigener Modelle siehe [Eigenes Modell einbinden](/EBench-doc/de/evaluation/custom-model/).

## Clean, Plot und Visualize

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

Verwenden Sie `gmp clean`, um generierte Artefakte aus lokalen Laeufen zu entfernen.

Vorschau der zu entfernenden Dateien:

```bash
gmp clean --dry-run
```

Generierten Mesh-Cache, Eval-Ergebnisse, Logs und uebrig gebliebene Lock-/Tmp-Dateien entfernen:

```bash
gmp clean
```

Zusaetzlich den heruntergeladenen Benchmark-Paket-Cache entfernen:

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize` startet einen lokalen HTTPS-Viewer zum Durchsuchen von Laeufen, Aufgaben-Erfolgsraten und Episoden-Wiederholungen.

Visualize-Erweiterung installieren:

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

Grundlegende Verwendung:

```bash
gmp visualize
gmp visualize --port 55088
```

Cache-Verwaltung:

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

Hinweise:

- `gmp visualize` erwartet Evaluationsausgaben unter `saved/eval_results/`.
- Der Viewer verwendet HTTPS und zeigt moeglicherweise eine einmalige Browser-Zertifikatswarnung an.
- Der aktuelle `rerun-sdk`-Pfad, den Visualize verwendet, erfordert Python 3.11+.

## Allgemeine Optionen

- `--run_id`: Identifiziert und setzt einen Lauf fort.
- `--host`, `--port`: Ziel des Eval-Servers (Standard: lokal `127.0.0.1:8087`).
- `--worker_ids`: Worker-Zuweisung in `gmp eval`.
- `--frame_save_interval`: Clientseitige Frame-Speicherfrequenz.
- `--chunk_size`: Action-Chunk-Laenge, wenn Ihr Modell geblockte Aktionen vorhersagt.
