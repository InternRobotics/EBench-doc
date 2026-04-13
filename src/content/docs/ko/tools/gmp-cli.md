---
title: GMP CLI
description: gmp를 사용하여 EBench 태스크를 제출, 모니터링, 실행 및 후처리합니다.
---

## 설치

**클라이언트 환경**에 `genmanip-client` 패키지를 설치합니다.

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 핵심 명령어

| 명령어 | 용도 |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | 평가 서버에 태스크를 제출하거나 기존 태스크에 재연결합니다. |
| [`gmp status`](#gmp-status) | 현재 실행의 진행 상황과 지표를 확인합니다. |
| [`gmp eval`](#gmp-eval) | 클라이언트 워커를 실행하여 서버 에피소드와 상호작용합니다. |
| [`gmp plot`](#gmp-plot) | 에피소드 출력을 시각화 산출물로 후처리합니다. |
| [`gmp clean`](#gmp-clean) | 생성된 캐시, 로그, 평가 결과 및 임시 파일을 삭제합니다. |
| [`gmp visualize`](#gmp-visualize) | 평가 결과를 탐색하고 Rerun 뷰어에서 에피소드를 재생합니다. |

## 제출, 상태 확인 및 평가

### `gmp submit`

벤치마크 패밀리 + split으로 제출:

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

벤치마크 별칭:

```bash
gmp submit ebench --run_id full_benchmark
```

지원하는 task-setting 경로:

Task setting:

- `mobile_manip`
- `table_top_manip`
- `generalist`

Split:

- `val_train`
- `val_unseen`
- `test`

### `gmp status`

```bash
gmp status --host 127.0.0.1 --port 8087
gmp submit ebench --run_id history_id
gmp status
```

### `gmp eval`

```bash
gmp eval -a r5a -g lift2 --worker_ids 0 --frame_save_interval 10
gmp eval --worker_ids 0,1 --chunk_size 8 --host 127.0.0.1 --port 8087
```

커스텀 모델 연동은 [모델 연동](/EBench-doc/ko/evaluation/custom-model/)을 참고하세요.

## 정리, 플롯 및 시각화

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

`gmp clean`을 사용하여 로컬 실행에서 생성된 산출물을 삭제합니다.

삭제될 항목을 미리 확인:

```bash
gmp clean --dry-run
```

생성된 메시 캐시, 평가 결과, 로그, 잔여 lock/tmp 파일 삭제:

```bash
gmp clean
```

다운로드한 벤치마크 패키지 캐시까지 삭제:

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize`는 로컬 HTTPS 뷰어를 실행하여 실행 내역을 탐색하고, 태스크 성공률을 확인하고, 개별 에피소드를 재생할 수 있습니다.

visualize 추가 의존성 설치:

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

기본 사용법:

```bash
gmp visualize
gmp visualize --port 55088
```

캐시 관리:

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

참고 사항:

- `gmp visualize`는 `saved/eval_results/` 하위의 결과를 읽습니다.
- 뷰어는 HTTPS를 사용하므로 브라우저에서 처음 열 때 인증서 경고가 표시될 수 있습니다.
- 현재 visualize에서 사용하는 `rerun-sdk` 경로는 Python 3.11 이상이 필요합니다.

## 공통 옵션

- `--run_id`: 실행을 식별하고 재개할 때 사용합니다.
- `--host`, `--port`: 평가 서버 주소 (기본값: 로컬 `127.0.0.1:8087`).
- `--worker_ids`: `gmp eval`에서 할당할 워커.
- `--frame_save_interval`: 클라이언트 측 프레임 저장 빈도.
- `--chunk_size`: 모델이 청크 단위로 액션을 예측할 때의 청크 길이.
