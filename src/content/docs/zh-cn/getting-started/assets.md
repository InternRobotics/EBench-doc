---
title: 资产下载
description: 下载 EBench 的评测资产，并放到仓库根目录下的 saved/ 中。
---

## 目录约定

EBench 约定所有下载得到的评测数据都放在仓库根目录下的 `saved/` 中。

常见目录包括：

- `saved/assets/`：场景 USD、机器人、纹理和打包资产。
- `saved/tasks/`：从资产包中同步出来的任务包。
- `saved/eval_results/`：本地评测输出结果。

## Hugging Face 资产包

最终的 Hugging Face repo ID 还没有定下来，当前文档先保留一个占位命令：

```bash
python standalone_tools/download_assets.py --dataset <HF_REPO_ID>
```

等正式发布后，把 `<HF_REPO_ID>` 替换成真实的仓库 ID 即可。

## 手动解压

如果最终发放方式是 zip 或 tar 包，而不是 GenManip Package 形式，那么解压时也要保证最终目录仍然从 `saved/` 开始。

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

当前下载脚本既支持内置别名，也支持自定义 Hugging Face repo ID。

当你传入自定义 repo ID 时：

- 资产会解压到 `saved/assets/collected_packages/<repo_name>/`
- 任务配置会复制到 `saved/tasks/`
- 如果包里带有 cameras，也会同步复制到 `configs/`

## 说明

- 资产版本最好和你正在使用的 benchmark 版本保持一致。
- 如果要切换到新版本资产，先清理或归档旧文件，避免不同版本混用。
- 这里故意把公开 HF 链接留成占位，等 EBench 的正式资产包确定之后再替换。
