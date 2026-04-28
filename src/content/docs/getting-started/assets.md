---
title: Asset & Dataset
description: Overview of the EBench dataset, plus how to download benchmark assets and the training set.
---

## Dataset overview

> **Two data collection sources — different action characteristics.** Episodes in this release come from two distinct pipelines. Be aware of which subsets you are training on:
>
> - **Rule-based generation (GenManip).** `long_horizon` and `simple_pnp` are produced by scripted policies inside the [GenManip](https://github.com/InternRobotics/GenManip) framework. Trajectories are **smooth** and have **clear behavior boundaries** between sub-skills.
> - **Teleoperation.** `teleop_tasks` is collected from human teleoperators on dexterous tasks. Trajectories carry human style — actions can **vibrate, hesitate, or pause** mid-motion.
>
> If you train on the union, expect the policy to occasionally inherit teleop hesitation. If action smoothness matters for your evaluation, weight the GenManip subsets higher or filter teleop episodes accordingly.

### At a glance

| Subset | Source | Eval tracks | Episodes | Frames (≈) | Tasks |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | Rule-based (GenManip) | `mobile_manip`, `generalist` | 9 × 200 = **1,800** | 3.6 M | 9 long-horizon families |
| `simple_pnp`   | Rule-based (GenManip) | `mobile_manip`, `generalist` | 10 × 200 = **2,000** | 0.96 M | 10 single-step pick-and-place |
| `teleop_tasks` | Human teleoperation   | `table_top_manip`, `generalist` | 7 × 400 = **2,800**  | 5.3 M | 7 dexterous tasks |

EBench has three evaluation tracks: `mobile_manip` (pick-and-place with a mobile base) and `table_top_manip` (dexterous tabletop) cover the two specialized regimes, while `generalist` is the union — see [Run Evaluation](/EBench-doc/evaluation/run-benchmark/) for how to submit each.

All subsets share the same recording config: **15 fps**, robot type **`lift2`** (dual-arm + mobile base), four 480×640 camera views (`top`, `left`, `right`, `overlook`).

### Layout

Each subset is an independent LeRobot **v2.1** dataset with its own task families, meta, and chunked parquet/video files:

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # e.g. bottle, dishwasher, make_sandwich, ...
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # same layout as above
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # same layout as above
```

### Modalities per frame

| Key | Shape | Notes |
| --- | --- | --- |
| `state.joints`, `action.joints`, `action.joints_delta` | `(12,)` | dual-arm joint positions (6 + 6) |
| `state.gripper`, `action.gripper` | `(4,)` | left/right grippers, two finger states each |
| `state.ee_pose`, `action.ee_pose`, `action.ee_pose_delta` | `(14,)` | left/right EE position (xyz) + quaternion (wxyz) |
| `state.base`, `action.base`, `action.base_delta` | `(3,)` | base `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | AV1-encoded MP4, 15 fps |

The `*_delta` channels carry the same quantities expressed as deltas — pick whichever matches your policy's control mode. The `meta/modality.json` of each task lists the canonical state/action/video keys exposed to LeRobot loaders.

### Tasks per subset

**`long_horizon`** — 9 long-horizon task families, each with 200 episodes:
`bottle`, `detergent`, `dish`, `dishwasher`, `fruit`, `make_sandwich`, `microwave`, `pen`, `shop`.

**`simple_pnp`** — 10 single-step pick-and-place tasks (`task1`–`task10`), each with 200 episodes. Examples: fork & spoon → utensil holder, bookmark → book, soap → soap dish, apple → fruit bowl, remote → remote holder, perfume → cosmetics rack, salt → spice rack, apple from shelf, teacup & teapot, bowl → plate stack.

**`teleop_tasks`** — 7 dexterous tasks, each with 400 episodes:
`collect_coffee_beans`, `flip_cup_collect_cookies`, `frame_against_pen_holder`, `install_gear`, `peg_in_hole`, `put_glass_in_glassbox`, `tighten_nut`.

### Language instructions

Every episode is paired with a natural-language instruction, and the dataset ships **multiple paraphrases per task**. The canonical instructions live in each subset's `meta/tasks.jsonl`; `long_horizon` additionally provides `instruction_paraphrases_train_only.json` with extra training-time wordings. Sampling paraphrases during training makes the policy robust to instruction phrasing.

## Benchmark assets

Download evaluation assets from Hugging Face into the `saved/` directory:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

After downloading you should see:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← created during evaluation
└── ...
```

## Training dataset (LeRobot format)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

The dataset uses [LeRobot](https://github.com/huggingface/lerobot) format, directly compatible with common VLA training pipelines. See the [Dataset overview](#dataset-overview) above for what's inside.

Next step: [run your first evaluation](/EBench-doc/evaluation/run-benchmark/).
