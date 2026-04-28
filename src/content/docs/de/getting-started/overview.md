---
title: Benchmark-Uebersicht
description: Schnellueberblick ueber die Evaluations-Einstellung, Tracks und Metriken von EBench.
---

Eine kurze Orientierung dazu, was EBench evaluiert und wie Scores berechnet werden. Nutzen Sie diese Seite als Karte — Setup- und Implementierungsdetails finden Sie ueber die Links auf den jeweiligen Seiten.

## Evaluations-Einstellung

- **Simulator.** Auf Basis von NVIDIA Isaac Sim. Das Framework [GenManip](https://github.com/InternRobotics/GenManip) liefert den Simulationsserver, Szenen und das Asset-Packaging.
- **Architektur.** Client–Server: Der Server fuehrt die Simulation als Black Box aus, Ihr Modell kommuniziert ueber ein schlankes Client-Paket. Siehe [Umgebung einrichten](/EBench-doc/de/getting-started/environment/).
- **Roboter.** Alle Aufgaben verwenden die `lift2`-Embodiment — Dual-Arm mit mobiler Basis und vier 480×640-Kameras. Die Frame-Modalitaeten finden Sie unter [Assets und Datensatz → Modalitaeten pro Frame](/EBench-doc/de/getting-started/assets/#modalitaeten-pro-frame).
- **Aufgaben.** 26 Evaluations-Aufgaben aus Long-Horizon-, dexterous- und mobiler Manipulation. Komplette Liste in der [Aufgabenuebersicht](/EBench-doc/de/evaluation/task-showcase/).

## Evaluations-Tracks

EBench organisiert die Aufgaben in drei Submission-Tracks:

| Track | Schwerpunkt | Zugehoerige Trainings-Subsets |
| --- | --- | --- |
| `mobile_manip` | Pick-and-Place mit mobiler Basis | `long_horizon`, `simple_pnp` |
| `table_top_manip` | Dexterous Tabletop-Aufgaben | `teleop_tasks` |
| `generalist` | Gemischt ueber Kategorien (Vereinigung der beiden) | alle obigen |

Jeder Track wird auf drei Splits evaluiert: `val_train`, `val_unseen`, `test`.

> **Split-Semantik — WIP.** Eine genaue Aufteilung, welche Aufgaben/Seeds in welchen Split gehen, wird hier dokumentiert.

Wie Sie jeden Track einreichen, steht unter [Evaluation starten](/EBench-doc/de/evaluation/run-benchmark/) und im [Challenge-Guide](/EBench-doc/de/challenge/).

## Metriken

- **Score pro Episode** — ein Wert in `[0,0; 1,0]`. Eine Episode erhaelt den vollen Score, wenn die Zielbedingung der Aufgabe innerhalb der Episode erfuellt wird, sonst `0,0`. Aufgaben-spezifische Erfolgssemantik finden Sie in der [Aufgabenuebersicht](/EBench-doc/de/evaluation/task-showcase/) unter dem Feld `Score` der jeweiligen Aufgabe.
- **Track-Score** — Durchschnitt der Episodenscores ueber alle ausgewerteten Episoden im eingereichten Track/Split.
- **Leaderboard** — Track-Scores werden im [Challenge-Leaderboard](/EBench-doc/de/challenge/) aggregiert.

> **Episodenzahlen und Zeitbudgets — WIP.** Anzahl der Episoden pro Track/Split und Schritt-Limits pro Episode werden hier dokumentiert.

## Weiterlesen

- [Umgebung einrichten](/EBench-doc/de/getting-started/environment/) — Server und Client installieren.
- [Assets und Datensatz](/EBench-doc/de/getting-started/assets/) — Benchmark-Assets und LeRobot-Trainingsset herunterladen.
- [Evaluation starten](/EBench-doc/de/evaluation/run-benchmark/) — die erste End-to-End-Auswertung einreichen.
