---
title: Assets und Datensatz
description: Uebersicht ueber den EBench-Datensatz sowie Anleitungen zum Herunterladen der Benchmark-Assets und des Trainingsdatensatzes.
---

## Datensatz-Uebersicht

> **Zwei Datenquellen — unterschiedliche Bewegungsmerkmale.** Die Episoden in diesem Release stammen aus zwei verschiedenen Pipelines. Achten Sie darauf, welche Subsets Sie verwenden:
>
> - **Regelbasierte Generierung (GenManip).** `long_horizon` und `simple_pnp` werden von skriptbasierten Policies im [GenManip](https://github.com/InternRobotics/GenManip)-Framework erzeugt. Die Trajektorien sind **glatt** und haben **klare Verhaltensgrenzen** zwischen den Teilfertigkeiten.
> - **Teleoperation.** `teleop_tasks` wird von menschlichen Teleoperatoren bei dexterous Aufgaben aufgenommen. Die Trajektorien tragen menschlichen Stil — Aktionen koennen **vibrieren, zoegern oder mitten in der Bewegung pausieren**.
>
> Wenn Sie auf der Vereinigung trainieren, kann die Policy gelegentlich das Zoegern aus den Teleoperationsdaten uebernehmen. Wenn Bewegungsglaette fuer Ihre Evaluation wichtig ist, gewichten Sie die GenManip-Subsets staerker oder filtern Sie Teleop-Episoden entsprechend.

### Auf einen Blick

| Subset | Quelle | Eval-Tracks | Episoden | Frames (ca.) | Aufgaben |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | Regelbasiert (GenManip) | `mobile_manip`, `generalist` | 9 × 200 = **1.800** | 3,6 M | 9 Long-Horizon-Familien |
| `simple_pnp`   | Regelbasiert (GenManip) | `mobile_manip`, `generalist` | 10 × 200 = **2.000** | 0,96 M | 10 Pick-and-Place (einstufig) |
| `teleop_tasks` | Teleoperation         | `table_top_manip`, `generalist` | 7 × 400 = **2.800**  | 5,3 M | 7 dexterous Aufgaben |

EBench hat drei Evaluations-Tracks: `mobile_manip` (Pick-and-Place mit mobiler Basis) und `table_top_manip` (dexterous Tabletop) decken die beiden spezialisierten Regimes ab, `generalist` ist die Vereinigung — Details zum Einreichen siehe [Evaluation starten](/EBench-doc/de/evaluation/run-benchmark/).

Alle Subsets teilen sich dieselbe Aufnahmekonfiguration: **15 fps**, Robotertyp **`lift2`** (Dual-Arm + mobile Basis), vier 480×640-Kameras (`top`, `left`, `right`, `overlook`).

### Verzeichnisstruktur

Jedes Subset ist ein eigenstaendiger LeRobot-**v2.1**-Datensatz mit eigenen Aufgabenfamilien, Meta-Dateien und chunked parquet/video-Dateien:

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # z. B. bottle, dishwasher, make_sandwich, ...
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # gleiches Layout
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # gleiches Layout
```

### Modalitaeten pro Frame

| Schluessel | Shape | Hinweise |
| --- | --- | --- |
| `state.joints`, `action.joints`, `action.joints_delta` | `(12,)` | Gelenkpositionen Dual-Arm (6 + 6) |
| `state.gripper`, `action.gripper` | `(4,)` | linker/rechter Greifer, je zwei Finger-States |
| `state.ee_pose`, `action.ee_pose`, `action.ee_pose_delta` | `(14,)` | links/rechts EE-Position (xyz) + Quaternion (wxyz) |
| `state.base`, `action.base`, `action.base_delta` | `(3,)` | Basis `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | AV1-codiertes MP4, 15 fps |

Die `*_delta`-Kanaele enthalten dieselben Groessen als Differenzen — waehlen Sie die Variante, die zu Ihrem Control-Mode passt. `meta/modality.json` jedes Tasks listet die kanonischen state/action/video-Keys, die fuer LeRobot-Loader sichtbar sind.

### Aufgaben pro Subset

**`long_horizon`** — 9 Long-Horizon-Familien, je 200 Episoden:
`bottle`, `detergent`, `dish`, `dishwasher`, `fruit`, `make_sandwich`, `microwave`, `pen`, `shop`.

**`simple_pnp`** — 10 einstufige Pick-and-Place-Aufgaben (`task1`–`task10`), je 200 Episoden. Beispiele: Gabel & Loeffel → Besteckhalter, Lesezeichen → Buch, Seife → Seifenschale, Apfel → Obstschale, Fernbedienung → Halter, Parfum → Kosmetikregal, Salz → Gewuerzregal, Apfel vom Regal, Teetasse & Teekanne, Schuessel auf Teller stapeln.

**`teleop_tasks`** — 7 dexterous Aufgaben, je 400 Episoden:
`collect_coffee_beans`, `flip_cup_collect_cookies`, `frame_against_pen_holder`, `install_gear`, `peg_in_hole`, `put_glass_in_glassbox`, `tighten_nut`.

### Sprachanweisungen

Jede Episode ist mit einer Anweisung in natuerlicher Sprache verknuepft, und der Datensatz liefert **mehrere Paraphrasen pro Aufgabe**. Die kanonischen Anweisungen liegen in `meta/tasks.jsonl` jedes Subsets; `long_horizon` enthaelt zusaetzlich `instruction_paraphrases_train_only.json` mit weiteren Trainingsformulierungen. Beim Training Paraphrasen zu sampeln macht die Policy robuster gegenueber Formulierungen.

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

Der Datensatz verwendet das [LeRobot](https://github.com/huggingface/lerobot)-Format und ist direkt mit gaengigen VLA-Trainingspipelines kompatibel. Eine Beschreibung des Inhalts finden Sie oben in der [Datensatz-Uebersicht](#datensatz-uebersicht).

Naechster Schritt: [Erste Evaluation starten](/EBench-doc/de/evaluation/run-benchmark/).
