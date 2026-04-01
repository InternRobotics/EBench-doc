---
title: Dataset and Assets
description: Place EBench benchmark data under GenManip-Sim/saved/ so evaluation can resolve configs, assets, and outputs.
---

## Expected directory layout

For the GenManip workflow, benchmark data must be visible under `saved/` in the `GenManip-Sim` project root.

Typical directories include:

- `saved/assets/`: scene USDs, robots, textures, and packaged assets.
- `saved/tasks/`: task packages copied from downloaded bundles when package-based delivery is used.
- `saved/eval_results/`: local evaluation outputs.

In a common local setup, `GenManip-Sim/saved` is a symlink to the checked-out `EBench/` repository.

## Recommended source of truth

Use the benchmark release that matches the task configs you plan to submit. In `GenManip-Sim`, the EBench task readme currently documents a versioned benchmark checkout and pinned dataset commit.

If your team distributes assets through a package or archive instead of a direct repo checkout, keep the extracted layout compatible with `saved/`.

## Manual extraction

If the benchmark assets are distributed as a zip or tarball, extract them so the final structure still starts with `saved/`.

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

`GenManip-Sim/standalone_tools/download_assets.py` can populate package-style assets into the project layout.

When a custom dataset ID is used:

- assets are unpacked into `saved/assets/collected_packages/<repo_name>/`
- task configs are copied into `saved/tasks/`
- cameras are copied into `configs/` when they are present in the package

## Notes

- Keep asset versions aligned with the benchmark release you are evaluating.
- If you switch to a new package version, clean or archive old assets first to avoid mixing files from different releases.
- This page intentionally avoids publishing placeholder distribution IDs. Add the exact download command here only when the public package path is finalized.
