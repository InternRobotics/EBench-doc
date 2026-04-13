---
title: 运行评测
description: 启动 Isaac Sim server 并运行 EBench 评测。
---

## 1. 启动 Server

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

或使用本机 Isaac Sim 安装：

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. 提交任务

在 **client 环境**中提交评测任务：

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

可用的任务设置：

| 任务设置 | 说明 |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | 带移动底盘的抓取放置 |
| `ebench/table_top_manip/<split>` | 桌面灵巧操作 |
| `ebench/generalist/<split>` | 跨类别混合任务 |

Split：`val_train`、`val_unseen`、`test`

一次性提交所有任务：`gmp submit ebench --run_id full_run`。

## 3. 接入模型

用内置 baseline 做快速联通性检查：

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

接入自己的模型见[接入自定义模型](/EBench-doc/zh-cn/evaluation/custom-model/)。

## 4. 查看结果

```bash
gmp status
```

结果保存在 `saved/eval_results/<task>/<run_id>/` 下。

> 当 server 和 client 在不同机器上时，所有 `gmp` 命令需要加 `--host <ip> --port <port>`。完整选项见 [GMP CLI 参考](/EBench-doc/zh-cn/tools/gmp-cli/)。
