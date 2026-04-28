---
title: Benchmark Overview
description: Quick orientation to EBench's evaluation setting, tracks, and metrics.
---

A quick orientation to what EBench evaluates and how scores are computed. Use this page as a map — follow the links into other pages for setup or implementation details.

## Evaluation setting

- **Simulator.** Built on NVIDIA Isaac Sim. The [GenManip](https://github.com/InternRobotics/GenManip) framework provides the simulation server, scenes, and asset packaging.
- **Architecture.** Client–server: the server runs the simulation as a black box; your model talks to it through a lightweight client package. See [Environment Setup](/EBench-doc/getting-started/environment/).
- **Robot.** All tasks use the `lift2` embodiment — dual-arm with a mobile base and four 480×640 cameras. Per-frame state/action keys are listed in [Asset & Dataset → Modalities per frame](/EBench-doc/getting-started/assets/#modalities-per-frame).
- **Tasks.** 26 evaluation tasks covering long-horizon, dexterous, and mobile manipulation. Browse them in [Task Showcase](/EBench-doc/evaluation/task-showcase/).

## Evaluation tracks

EBench organizes tasks into three submission tracks:

| Track | Focus | Backed by training subset(s) |
| --- | --- | --- |
| `mobile_manip` | Pick-and-place with a mobile base | `long_horizon`, `simple_pnp` |
| `table_top_manip` | Dexterous tabletop tasks | `teleop_tasks` |
| `generalist` | Mixed across categories (union of the two) | all of the above |

Each track is evaluated on three splits: `val_train`, `val_unseen`, `test`.

> **Split semantics — WIP.** A precise breakdown of which tasks/seeds land in each split will be documented here.

For how to submit each track, see [Run Evaluation](/EBench-doc/evaluation/run-benchmark/) and the [Challenge guide](/EBench-doc/challenge/).

## Metrics

- **Per-episode task score** — a value in `[0.0, 1.0]`. An episode receives the full score when the task's goal condition is met within the episode, otherwise `0.0`. Per-task success semantics live in [Task Showcase](/EBench-doc/evaluation/task-showcase/) under each task's `Score` description.
- **Track score** — the average of per-episode scores across all evaluated episodes in the submitted track/split.
- **Leaderboard** — track scores are aggregated on the [Challenge leaderboard](/EBench-doc/challenge/).

> **Episode counts and time budgets — WIP.** Number of episodes per track/split and per-episode step limits will be documented here.

## What to read next

- [Environment Setup](/EBench-doc/getting-started/environment/) — install the server and client.
- [Asset & Dataset](/EBench-doc/getting-started/assets/) — download benchmark assets and the LeRobot training set.
- [Run Evaluation](/EBench-doc/evaluation/run-benchmark/) — submit your first job end-to-end.
