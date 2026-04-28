---
title: 资产与数据集
description: EBench 数据集总览，以及如何下载评测资产和训练数据集。
---

## 数据集总览

> **两种数据采集来源——动作特征不同。** 本次发布的数据集来自两条不同的采集流水线，请关注你训练所用的子集：
>
> - **基于规则的生成（GenManip）。** `long_horizon` 和 `simple_pnp` 由 [GenManip](https://github.com/InternRobotics/GenManip) 框架中的脚本化策略生成。轨迹**平滑**，子技能之间有**清晰的行为边界**。
> - **遥操作。** `teleop_tasks` 由人类遥操作员在灵巧任务上采集。轨迹保留了人类风格——动作可能在中途出现**抖动、犹豫或停顿**。
>
> 如果训练时混合使用，模型有可能继承遥操作的犹豫感。若评测对动作平滑性敏感，可加大 GenManip 子集权重，或对 teleop 数据进行过滤。

### 关键信息一览

| 子集 | 来源 | 评测赛道 | Episode 数 | 帧数（约） | 任务 |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | 规则生成（GenManip） | `mobile_manip`、`generalist` | 9 × 200 = **1,800** | 3.6 M | 9 个长程任务族 |
| `simple_pnp`   | 规则生成（GenManip） | `mobile_manip`、`generalist` | 10 × 200 = **2,000** | 0.96 M | 10 个单步 pick-and-place |
| `teleop_tasks` | 人类遥操作         | `table_top_manip`、`generalist` | 7 × 400 = **2,800**  | 5.3 M | 7 个灵巧任务 |

EBench 共三条评测赛道：`mobile_manip`（移动底盘 pick-and-place）和 `table_top_manip`（桌面灵巧操作）覆盖两种专项场景，`generalist` 则是两者的并集——具体提交方式见[运行评测](/EBench-doc/zh-cn/evaluation/run-benchmark/)。

所有子集共享相同的录制配置：**15 fps**，机器人类型 **`lift2`**（双臂 + 移动底盘），四路 480×640 相机视角（`top`、`left`、`right`、`overlook`）。

### 目录结构

每个子集都是一个独立的 LeRobot **v2.1** 数据集，包含各自的任务族、meta 和分块的 parquet/视频文件：

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # 例如 bottle、dishwasher、make_sandwich……
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # 同上结构
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # 同上结构
```

### 每帧模态

| 字段 | 形状 | 说明 |
| --- | --- | --- |
| `state.joints`、`action.joints`、`action.joints_delta` | `(12,)` | 双臂关节位置（6 + 6） |
| `state.gripper`、`action.gripper` | `(4,)` | 左右夹爪，每只夹爪两个手指状态 |
| `state.ee_pose`、`action.ee_pose`、`action.ee_pose_delta` | `(14,)` | 左右末端位置 (xyz) + 四元数 (wxyz) |
| `state.base`、`action.base`、`action.base_delta` | `(3,)` | 底盘 `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | AV1 编码 MP4，15 fps |

`*_delta` 字段是相同物理量的增量形式——按你的策略控制方式选用即可。每个任务的 `meta/modality.json` 列出了暴露给 LeRobot 加载器的标准 state/action/video 键。

### 各子集任务

**`long_horizon`** —— 9 个长程任务族，每族 200 个 episode：
`bottle`、`detergent`、`dish`、`dishwasher`、`fruit`、`make_sandwich`、`microwave`、`pen`、`shop`。

**`simple_pnp`** —— 10 个单步 pick-and-place 任务（`task1`–`task10`），每个 200 个 episode。示例：叉勺 → 餐具架、书签 → 书本、肥皂 → 皂盒、苹果 → 果盘、遥控器 → 遥控架、香水 → 化妆架、盐 → 调料架、从架子上取苹果、茶杯与茶壶、碗叠到盘子。

**`teleop_tasks`** —— 7 个灵巧任务，每个 400 个 episode：
`collect_coffee_beans`、`flip_cup_collect_cookies`、`frame_against_pen_holder`、`install_gear`、`peg_in_hole`、`put_glass_in_glassbox`、`tighten_nut`。

### 语言指令

每个 episode 都配有自然语言指令，并且数据集为**每个任务提供多条同义改写**。标准指令位于各子集的 `meta/tasks.jsonl`；`long_horizon` 还额外提供 `instruction_paraphrases_train_only.json`，用于训练阶段的更多措辞。训练时随机采样改写可以让策略对指令措辞更稳健。

## 评测资产

从 Hugging Face 下载评测资产到 `saved/` 目录：

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

下载完成后应当看到：

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← 评测时自动生成
└── ...
```

## 训练数据集（LeRobot 格式）

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

数据集采用 [LeRobot](https://github.com/huggingface/lerobot) 格式，可直接用于常见的 VLA 训练流水线。数据集内容详见上文的[数据集总览](#数据集总览)。

下一步：[运行第一次评测](/EBench-doc/zh-cn/evaluation/run-benchmark/)。
