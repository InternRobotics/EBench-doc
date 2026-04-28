---
title: 基准总览
description: 快速了解 EBench 的评测设定、赛道与指标。
---

本页是 EBench 的快速导览：评测的对象与计分方式。把它当作一张地图，详细信息请按链接进入对应章节。

## 评测设定

- **仿真器。** 基于 NVIDIA Isaac Sim 构建，由 [GenManip](https://github.com/InternRobotics/GenManip) 框架提供仿真服务端、场景与资产打包。
- **架构。** 客户端–服务端：服务端将仿真作为黑盒运行，模型通过一个轻量客户端包与之通信。详见[环境配置](/EBench-doc/zh-cn/getting-started/environment/)。
- **机器人。** 所有任务统一使用 `lift2` 机器人——双臂 + 移动底盘 + 四路 480×640 相机。每帧 state/action 字段见[资产与数据集 → 每帧模态](/EBench-doc/zh-cn/getting-started/assets/#每帧模态)。
- **任务。** 共 26 个评测任务，覆盖长程任务、灵巧操作与移动操作。完整清单见[任务展示](/EBench-doc/zh-cn/evaluation/task-showcase/)。

## 评测赛道

EBench 将任务组织为三条提交赛道：

| 赛道 | 关注点 | 对应训练子集 |
| --- | --- | --- |
| `mobile_manip` | 移动底盘 pick-and-place | `long_horizon`、`simple_pnp` |
| `table_top_manip` | 桌面灵巧操作 | `teleop_tasks` |
| `generalist` | 跨类别混合（前两者并集） | 上述全部 |

每条赛道在三个 split 上评测：`val_train`、`val_unseen`、`test`。

> **Split 划分细节 — WIP。** 每个 split 包含哪些任务/种子的精确划分将在此处补充。

各赛道的提交方式见[运行评测](/EBench-doc/zh-cn/evaluation/run-benchmark/)和[挑战赛指南](/EBench-doc/zh-cn/challenge/)。

## 指标

- **单 episode 任务分。** 取值范围 `[0.0, 1.0]`。当任务的目标条件在该 episode 内被满足时给满分，否则为 `0.0`。各任务的成功判定语义见[任务展示](/EBench-doc/zh-cn/evaluation/task-showcase/)中各任务的 `Score` 描述。
- **赛道分。** 在所提交的赛道/split 上，对所有评测 episode 取单 episode 分的平均。
- **排行榜。** 各赛道分汇总至[挑战赛排行榜](/EBench-doc/zh-cn/challenge/)。

> **Episode 数量与时间预算 — WIP。** 各赛道/split 的 episode 数量、单 episode 步数上限将在此处补充。

## 推荐阅读

- [环境配置](/EBench-doc/zh-cn/getting-started/environment/) —— 安装服务端与客户端。
- [资产与数据集](/EBench-doc/zh-cn/getting-started/assets/) —— 下载评测资产与 LeRobot 训练集。
- [运行评测](/EBench-doc/zh-cn/evaluation/run-benchmark/) —— 端到端跑通第一次评测。
