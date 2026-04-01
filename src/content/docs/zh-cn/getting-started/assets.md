---
title: 资产下载
description: 将 EBench 数据放到 GenManip-Sim/saved/ 下，让评测配置、资产和结果路径保持一致。
---

## 目录约定

在 GenManip 工作流中，benchmark 数据需要能从 `GenManip-Sim` 仓库根目录下的 `saved/` 访问到。

常见目录包括：

- `saved/assets/`：场景 USD、机器人、纹理和打包资产。
- `saved/tasks/`：如果使用 package 形式分发，会同步到这里的任务包。
- `saved/eval_results/`：本地评测输出结果。

常见做法是把 `GenManip-Sim/saved` 软链接到检出的 `EBench/` 仓库。

## 推荐做法

使用和当前 task 配置匹配的 benchmark 版本。在 `GenManip-Sim` 中，EBench task 目录已经记录了版本化 benchmark checkout 和对应的数据集 commit。

如果团队通过 package 或压缩包分发资产，也要保证最终目录结构与 `saved/` 兼容。

## 手动解压

如果资产以 zip 或 tar 包形式发放，解压后也要保证最终目录仍然从 `saved/` 开始。

例如：

```text
EBench/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/
└── ...
```

## 下载脚本会做什么

`GenManip-Sim/standalone_tools/download_assets.py` 可用于将 package 形式的资产写入项目目录。

当你传入自定义数据集 ID 时：

- 资产会解压到 `saved/assets/collected_packages/<repo_name>/`
- 任务配置会复制到 `saved/tasks/`
- 如果包里带有 cameras，也会同步复制到 `configs/`

## 说明

- 资产版本最好和你正在使用的 benchmark 版本保持一致。
- 如果要切换到新版本资产，先清理或归档旧文件，避免不同版本混用。
- 这里不再保留公开分发地址的占位符；等正式发布路径稳定后，再补充精确下载命令。
