---
title: Asset Download
description: Download benchmark assets for EBench and place them under saved/.
---

## Expected directory layout

EBench expects downloaded benchmark data to live under `saved/` in the repository root.

Typical directories include:

- `saved/assets/`: scene USDs, robots, textures, and packaged assets.
- `saved/tasks/`: task packages copied from downloaded bundles.
- `saved/eval_results/`: local evaluation outputs.

## Hugging Face package

The final Hugging Face repo ID is still pending. Keep a placeholder in your local setup until the package is published:

```bash
python standalone_tools/download_assets.py --dataset <HF_REPO_ID>
```

Replace `<HF_REPO_ID>` with the final published repo ID later.

## Manual extraction

If the benchmark assets are distributed as a zip or tarball instead of a package repo, extract them directly under the repository root so the final structure still starts with `saved/`.

For example:

```text
EBench/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/
└── ...
```

## What the downloader does

The current downloader supports both built-in aliases and custom Hugging Face repo IDs.

When a custom repo ID is used:

- assets are unpacked into `saved/assets/collected_packages/<repo_name>/`
- task configs are copied into `saved/tasks/`
- cameras are copied into `configs/` when they are present in the package

## Notes

- Keep asset versions aligned with the benchmark release you are evaluating.
- If you switch to a new package version, clean or archive old assets first to avoid mixing files from different releases.
- This page intentionally keeps the public HF link as a placeholder until the EBench asset package is finalized.
