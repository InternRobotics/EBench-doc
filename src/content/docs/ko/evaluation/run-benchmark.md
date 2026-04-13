---
title: 평가 실행
description: Isaac Sim 서버를 시작하고 EBench 평가를 실행합니다.
---

## 1. 서버 시작

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

또는 로컬 Isaac Sim 설치를 사용하는 경우:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. 태스크 제출

**클라이언트 환경**에서 벤치마크 작업을 제출합니다.

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

사용 가능한 태스크 설정:

| 태스크 설정 | 설명 |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | 이동 베이스를 활용한 픽 앤 플레이스 |
| `ebench/table_top_manip/<split>` | 테이블탑 정밀 조작 |
| `ebench/generalist/<split>` | 카테고리 혼합 태스크 |

Split: `val_train`, `val_unseen`, `test`

모든 태스크를 한 번에 제출하려면 `gmp submit ebench --run_id full_run`을 사용하세요.

## 3. 모델 연결

내장 베이스라인으로 연결 상태를 빠르게 확인합니다.

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

직접 만든 모델을 연동하려면 [모델 연동](/EBench-doc/ko/evaluation/custom-model/)을 참고하세요.

## 4. 결과 확인

```bash
gmp status
```

결과는 `saved/eval_results/<task>/<run_id>/`에 저장됩니다.

> 서버와 클라이언트가 서로 다른 머신에 있을 경우, 모든 `gmp` 명령에 `--host <ip> --port <port>`를 추가하세요. 전체 옵션은 [GMP CLI 레퍼런스](/EBench-doc/ko/tools/gmp-cli/)를 참고하세요.
