---
title: 챌린지
description: EBench 결과를 온라인 챌린지 리더보드에 제출합니다.
---

EBench Challenge 는 benchmark 결과의 온라인 제출을 지원합니다. 아래 단계에 따라 유효한 실행을 준비하고 리더보드 서비스에 제출하세요.

## Baseline 및 시작하기

온라인으로 제출하기 전에 benchmark 를 로컬에서 실행할 수 있는지 먼저 확인하세요.

- [환경 설정](/ko/getting-started/environment/)에서 서버 및 클라이언트 환경을 구성합니다.
- [에셋 및 데이터셋](/ko/getting-started/assets/)에서 필요한 benchmark assets 를 준비합니다.
- 먼저 [평가 실행](/ko/evaluation/run-benchmark/)으로 로컬 benchmark 를 실행합니다.
- 자체 policy 를 사용하는 경우 [모델 연동](/ko/evaluation/custom-model/)을 따르세요.

온라인 제출을 시도하기 전에 로컬 실행이 정상적으로 끝나고 완전한 결과 디렉터리를 생성하는지 확인해야 합니다.

## 온라인 제출 단계

온라인 워크플로는 세 단계로 구성됩니다. 온라인 작업 생성, 평가 endpoint 준비 대기, 그리고 해당 endpoint 에 대해 평가 worker 실행입니다.

### 1. token 받기

플랫폼 랜딩 페이지를 엽니다.

```text
https://internrobotics.shlab.org.cn/eval/landing-page
```

그다음:

1. 플랫폼에 로그인합니다.
2. API key 또는 secret 관리 페이지를 엽니다.
3. 새 API key 를 생성하고 token 값을 복사합니다.

### 2. 클라이언트 환경 준비

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. 온라인 평가 작업 생성

`gmp online submit` 을 사용해 원격 평가 작업을 요청합니다.

```bash
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id "$PREVIOUS_TASK" \  # 선택 사항: 이전 작업 이어서 진행
  --benchmark_set ebench_generalist \
  --model_name internVLA \
  --model_type VLA \
  --submitter_name test \
  --submitter_homepage test \
  --is_public 0
```

#### 매개변수

| 매개변수 | 타입 | 예시 | 설명 |
|-----------|------|---------|-------------|
| task_id | string | T2025123100001 | 선택사항, 작업 재실행 시 이전 task_id를 포함할 수 있습니다 |
| model_name | string | internVLA | 모델 이름 |
| model_type | string | VLA | 모델 타입 |
| benchmark_set | string | EBench | 벤치마크 세트 타입, 현재 ebench_generalist만 허용됩니다 |
| submitter_name | string | SHlab | 조직/개발자 이름 |
| submitter_homepage | string | http://example.com | 제출자 홈페이지 |
| is_public | int | 0 | 공개 여부<br>0 아니오<br>1 예 |

백엔드 작업이 준비되면 명령은 다음과 같은 필드를 반환합니다.

```json
Waiting for available server (task_id=b5dddc6de60c4aec8236500b8e3dc0e1)...
Still waiting... elapsed 0.1s. Next check in 5.0s.
Still waiting... elapsed 5.3s. Next check in 5.0s.
Ready after 10.4s. endpoint=https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod
{
  "task_id": "b5dddc6de60c4aec8236500b8e3dc0e1",
  "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod",
  "response": {
    "code": 0,
    "msg": "success",
    "trace_id": "4a4136c66bdc80922ccc6485c44fa9e5",
    "data": {
      "ready": true,
      "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod"
    }
  }
}
```

다음 두 값을 기록하세요.

- `task_id`: 평가 실행 시 `run_id` 로 사용합니다.
- `endpoint`: 원격 평가 URL 로 사용합니다.

#### Demo: `endpoint` 와 `task_id` 자동 추출

다음 예시는 간단한 Python 스크립트로 `gmp online submit` 을 실행하고, 반환된 출력에서 `endpoint` 와 `task_id` 를 추출합니다.

```python
import os
import json
import subprocess

def submit_online_task() -> tuple[str, str]:
    cmd = [
        'gmp', 'online', 'submit',
        '--base_url', 'https://internrobotics.shlab.org.cn/eval',
        '--token', os.environ['EBENCH_SUBMIT_TOKEN'],
        '--benchmark_set', 'ebench_generalist',
        '--model_name', 'internVLA',
        '--model_type', 'VLA',
        '--submitter_name', 'test',
        '--submitter_homepage', 'test',
        '--is_public', '0',
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    output = result.stdout
    json_start = output.find('{')
    payload = json.loads(output[json_start:])
    endpoint = payload['endpoint']
    task_id = payload['task_id']
    print('endpoint=' + endpoint)
    print('task_id=' + task_id)
    return endpoint, task_id
```

스크립트를 실행하면 `endpoint` 와 `task_id` 가 바로 출력되며, 이후 평가 worker 호출에서 그대로 사용할 수 있습니다.

### 4. 평가 worker 시작

반환된 endpoint 에 대해 evaluator 를 실행합니다. 이것은 테스트 평가입니다. 자신의 모델 평가를 만들려면 문서를 따르세요.

```python
endpoint, task_id = submit_online_task()

client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["0"]
)
model = ModelClient(...)

try:
    obs = client.reset()
    done = False
    while not done:
        # 전체 청크에 대한 액션 생성
        action_chunk = model.get_action_chunk(obs)
        # 서버가 청크를 내부적으로 실행; 다음 재추론 지점에서 obs 반환
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

다양한 ID 로 여러 평가 클라이언트를 시작할 수 있습니다. 예:

```python
client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["1"]
)
...
```

서버는 실행당 최대 16개의 동시 워커를 지원합니다. 연결은 10분 비활성 상태 후에 종료됩니다. 동일한 task_id를 사용하여 실패한 평가 제출을 다시 시작할 수 있습니다.
```bash
# 위 작업 다시 시작
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

연결 타임아웃이 발생하면 클라이언트를 다시 시작하여 연결을 복구하세요. 진행 상황은 서버에 저장됩니다.

### 5. 작업 상태 확인

온라인 작업이 생성되면 플랫폼 페이지에 해당 작업이 표시됩니다. 최종 평가 출력은 동일한 원격 작업 기록에 저장됩니다.

터미널에서 서버 상태 및 작업 진행 상황을 확인할 수도 있습니다.

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"
```

### 6. 작업 중지

평가 세션을 중지하려면:

```
gmp online stop \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  --user_id "$USER_ID"    # 웹사이트에서 가져오기, 계정 페이지
```

## 온라인 제출 URL

공식 플랫폼 base URL 을 통해 작업을 생성합니다.

```text
https://internrobotics.shlab.org.cn/eval
```

`gmp online submit` 후, 해당 작업에 대해 반환된 endpoint 를 평가에 사용합니다.

```text
https://internverse.shlab.org.cn/evalserver/<task-endpoint>
```

## 채점 규칙

- 각 평가 episode 는 `0.0` 에서 `1.0` 사이의 task 점수를 생성합니다.
- episode 안에서 요구된 목표 조건을 완료하면 해당 task 는 만점을 받고, 그렇지 않으면 `0.0` 을 받습니다.
- 리더보드 점수는 제출된 benchmark 세트에서 평가된 모든 episode 의 task 점수 평균입니다.
- task 별 성공 기준은 [작업 소개](/ko/evaluation/task-showcase/)를 참고하세요. 각 task 에 `Location`, `Instruction`, `Score` 설명이 포함되어 있습니다.

## 예시 체크리스트

- Baseline 또는 사용자 정의 모델이 로컬에서 실행됨
- 올바른 benchmark track 및 split 선택됨
- 제출 token 설정 완료
- 온라인 제출 URL 확인 완료
- 결과 파일 업로드 준비 완료
