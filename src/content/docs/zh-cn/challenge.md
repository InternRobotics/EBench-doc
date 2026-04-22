---
title: 挑战赛
description: 将 EBench 评测结果提交到线上挑战榜单。
---

EBench Challenge 支持在线提交 benchmark 结果。请按照以下步骤准备有效运行，并提交到排行榜服务。

## Baseline 与快速开始

在进行在线提交前，请先确保你可以在本地跑通 benchmark：

- Set up the server and client environments in [环境配置](/zh-cn/getting-started/environment/).
- Prepare the required benchmark assets from [资产与数据集](/zh-cn/getting-started/assets/).
- Run a local benchmark first with [运行评测](/zh-cn/evaluation/run-benchmark/).
- If you use your own policy, follow [接入自定义模型](/zh-cn/evaluation/custom-model/).

建议先确认本地运行能够正常结束，并生成完整的结果目录，再进行在线提交。

## 在线提交步骤

在线提交流程分为三个阶段：创建在线任务、等待评测 endpoint 就绪，以及让评测 worker 连接该 endpoint 运行。

### 1. 获取 token

打开平台首页：

```text
https://internrobotics.shlab.org.cn/eval/landing-page
```

然后：

1. 登录平台。
2. 打开 API key 或密钥管理页面。
3. 创建新的 API key，并复制 token。

### 2. 准备客户端环境

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. 创建在线评测任务

使用 `gmp online submit` 请求一个远端评测任务：

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

### 参数

| 参数 | 类型 | 示例 | 说明 |
|------|------|------|------|
| task_id | string | T2025123100001 | 选填，任务重新执行可带入上一次task_id |
| model_name | string | internVLA | 模型名称 |
| model_type | string | VLA | 模型类型 |
| benchmark_set | string | ebench_generalist | 评测集类型,目前只允许填 ebench_generalist |
| submitter_name | string | SHlab | 机构/开发者名称 |
| submitter_homepage | string | http://example.com | 提交者主页 |
| is_public | int | 0 | 是否公开<br>0 否<br>1 是 |

后端任务准备完成后，命令会返回如下字段：

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

请记录这两个值：

- `task_id`：在运行评测时作为 `run_id` 使用。
- `endpoint`：作为远端评测 URL 使用。

### 4. 启动评测 worker

让评测器连接返回的 endpoint 运行。这是一个测试评测。按照文档说明来创建你自己的模型评测。

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
        # 生成整个chunk的动作
        action_chunk = model.get_action_chunk(obs)
        # 服务器在内部执行chunk; 在下一个重新推理点返回obs
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

你可以启动多个不同 ID 的评测客户端。例如：

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["1"]
)
...
```

服务器每个运行最多支持16个并发worker。连接在闲置十分钟后将被断开。您可以使用相同的task_id重新启动失败的评估提交。
```bash
# 重新启动上述任务
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

如果遇到连接超时问题，请重启客户端以恢复连接。

### 5. 监控任务状态

在线任务创建完成后，平台页面会显示对应任务。最终评测输出会写入同一个远端任务记录。

你也可以从终端检查服务器状态和任务进度。

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"


## 在线提交 URL

通过官方平台 base URL 创建任务：

```text
https://internrobotics.shlab.org.cn/eval
```

执行 `gmp online submit` 后，使用返回的任务专属 endpoint 进行评测：

```text
https://internrobotics.shlab.org.cn/evalserver/<task-endpoint>
```

## 得分规则

- 每个评测 episode 都会产生一个 `0.0` 到 `1.0` 之间的任务得分。
- 若该 episode 在规定时间内完成了要求的目标条件，则该任务记为满分；否则记为 `0.0`。
- 榜单分数是所提交 benchmark 集合中所有评测 episode 任务得分的平均值。
- 更具体的任务成功定义可参考 [任务展示](/zh-cn/evaluation/task-showcase/)，其中为每个任务补充了 `Location`、`Instruction` 和 `Score` 说明。

## 示例检查清单

- Baseline 或自定义模型已在本地跑通
- 已选择正确的 benchmark 赛道和 split
- 已配置提交 token
- 已确认在线提交 URL
- 结果文件已准备完成
