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
https://internrobotics.shlab.org.cn/eval/landing-page
```

Then:

1. Sign in to the platform.
2. Open the API key or secret management page from the top-right corner.
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
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --benchmark_set ebench_generalist \
  --model_name internVLA \
  --model_type VLA \
  --submitter_name test \
  --submitter_homepage test \
  --is_public 0
```

### Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| task_id | string | T2025123100001 | Optional, can include previous task_id for task re-execution |
| model_name | string | internVLA | Model name |
| model_type | string | VLA | Model type |
| benchmark_set | string | ebench_generalist | Benchmark set type, currently only ebench_generalist is allowed |
| submitter_name | string | SHlab | Organization/developer name |
| submitter_homepage | string | http://example.com | Submitter homepage |
| is_public | int | 0 | Whether to make public<br>0 No<br>1 Yes |

After the backend task is ready, the command returns fields like:

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

Record both values:

- `task_id`: use this as the `run_id` when running evaluation.
- `endpoint`: use this as the remote evaluation URL.

### 4. Start evaluation workers

Run the evaluator against the returned endpoint. This is a test evaluation. Follow the doc to reate your own model evaluation.

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["0"]
)
model = ModelClient(...)

try:
    obs = client.reset()
    done = False
    while not done:
        # Generate actions for entire chunk
        action_chunk = model.get_action_chunk(obs)
        # Server executes chunk internally; returns obs at next re-inference point
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

You can start several eval client with different ids. i.e.

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["1"]
)
...
```

The server supports up to 16 concurrent workers per run. Connections will be terminated after ten minutes of inactivity. You can restart a failed evaluation submission by using the same task_id.
```bash
# restart above task
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

If you encounter connection timeouts, restart the client to recover.

### 5. Monitor the task

After the online task is created, the platform page will show the corresponding task. The final evaluation outputs are written to the same remote task record.

You can check the server status and task progress from terminal as well.

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" 
```

## Online Submit URL

Create tasks through the official platform base URL:

```text
https://internrobotics.shlab.org.cn/eval
```

After `gmp online submit`, use the returned per-task endpoint for evaluation:

```text
https://internrobotics.shlab.org.cn/evalserver/<task-endpoint>
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
