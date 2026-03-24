---
title: GMP CLI
description: 使用 GMP 命令行工具来提交、查看和运行 EBench 评测任务。
---

## 安装

`gmp` 命令由 `genmanip-client` 提供：

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 核心命令

- `gmp submit <config_paths...>`：在本地评测服务上创建或恢复一个 benchmark 任务。
- `gmp status`：查看当前 server 上任务的状态和进度。
- `gmp eval`：运行 legacy 本地评测客户端，并接入指定 worker。

当前文档只覆盖 EBench 的本地流程。在线评测和 leaderboard 相关命令后续再单独补。

## EBench 常用示例

### 提交整个 benchmark

```bash
gmp submit ebench --run_id smoke_test --host 127.0.0.1 --port 8087
```

### 提交一个更小的子集

```bash
gmp submit ebench/simple_pnp --run_id simple_pnp_debug --host 127.0.0.1 --port 8087
```

### 查看服务状态

```bash
gmp status --host 127.0.0.1 --port 8087
```

### 运行 legacy eval client

```bash
gmp eval --worker_ids 0,1 --host 127.0.0.1 --port 8087 --chunk_size 1
```

## 参数说明

- `config_paths` 可以是完整路径，也可以是 benchmark 简写。
- `--run_id` 方便后续恢复、复查或定位结果目录。
- `--host` 和 `--port` 需要和本地 `ray_eval_server.py` 的地址一致。
- `--worker_ids` 决定当前 client 要接入哪些 server 端 worker。

## 下一步

- 完整本地流程见 [运行测试](/zh-cn/evaluation/run-benchmark/)。
- 资产准备见 [资产下载](/zh-cn/getting-started/assets/)。
