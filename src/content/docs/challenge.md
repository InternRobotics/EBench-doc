---
title: Challenge
description: Submit your EBench results to the online challenge leaderboard.
---

The EBench Challenge supports online submission for benchmark results. Follow the steps below to prepare a valid run and submit it to the leaderboard service.

## Baseline and Getting Started

Before submitting online, make sure you can run the benchmark locally:

- Set up the server and client environments in [Environment Setup](/getting-started/environment/).
- Prepare the required benchmark assets from [Asset & Dataset](/getting-started/assets/).
- Run a local benchmark first with [Run Evaluation](/evaluation/run-benchmark/).
- If you use your own policy, follow [Integrate Your Own Model](/evaluation/custom-model/).

You should verify that your local run finishes normally and produces a complete result directory before attempting online submission.

## Online Submit Steps

The online workflow has three stages: create an online task, wait for the evaluation endpoint, and run evaluation workers against that endpoint.

### 1. Get your token

Open the platform landing page:

```text
https://internrobotics-staging.shlab.org.cn/eval/landing-page
```

Then:

1. Sign in to the platform.
2. Open the API key or secret management page.
3. Create a new API key and copy the token value.

### 2. Prepare the client environment

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. Create an online evaluation task

Use `gmp online submit` to request a remote evaluation job:

```bash
gmp online submit \
  --base_url https://internrobotics-staging.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --benchmark_set EBench \
  --model_name internVLA \
  --model_type VLA
```

After the backend task is ready, the command returns fields like:

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics-staging.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

Record both values:

- `task_id`: use this as the `run_id` when running evaluation.
- `endpoint`: use this as the remote evaluation URL.

### 4. Start evaluation workers

Run the evaluator against the returned endpoint.

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  -chunk_size 40 \
  --worker_id 0
```

If you want to use the second backend worker, open another terminal and start:

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  -chunk_size 40 \
  --worker_id 1
```

### 5. Monitor the task

After the online task is created, the platform page will show the corresponding task. The final evaluation outputs are written to the same remote task record.


## Online Submit URL

Create tasks through the official platform base URL:

```text
https://internrobotics-staging.shlab.org.cn/eval
```

After `gmp online submit`, use the returned per-task endpoint for evaluation:

```text
https://internrobotics-staging.shlab.org.cn/evalserver/<task-endpoint>
```

## Scoring Rules

- Each evaluated episode produces a task score between `0.0` and `1.0`.
- A task receives full score when the required goal condition is completed within the episode; otherwise it receives `0.0`.
- The leaderboard score is the average task score across the evaluated episodes in the submitted benchmark set.
- For task-specific success semantics, see [Task Showcase](/evaluation/task-showcase/), where each task includes its `Location`, `Instruction`, and `Score` description.

## Example Checklist

- Baseline or custom model runs locally
- Correct benchmark track and split selected
- Submission token configured
- Online submit URL confirmed
- Result files ready for upload
