---
title: 에셋 및 데이터셋
description: EBench 데이터셋의 개요와 벤치마크 에셋, 학습 데이터셋 다운로드 방법.
---

## 데이터셋 개요

> **두 가지 데이터 수집 방식 — 액션 특성이 다릅니다.** 이번 릴리스의 에피소드는 두 개의 서로 다른 파이프라인에서 수집되었습니다. 학습에 사용하는 서브셋이 무엇인지 유의하세요.
>
> - **규칙 기반 생성 (GenManip).** `long_horizon`과 `simple_pnp`는 [GenManip](https://github.com/InternRobotics/GenManip) 프레임워크의 스크립트 정책으로 생성됩니다. 궤적은 **부드럽고**, 서브 스킬 사이에 **명확한 행동 경계**가 있습니다.
> - **원격 조작.** `teleop_tasks`는 사람이 원격 조작으로 수행한 정교한 조작 데이터입니다. 궤적에는 사람의 스타일이 남아 있어, 동작 도중 **진동·망설임·일시 정지**가 발생할 수 있습니다.
>
> 두 종류를 합쳐 학습하면 정책이 가끔 원격 조작의 망설임을 그대로 학습할 수 있습니다. 동작의 부드러움이 평가에서 중요하다면 GenManip 서브셋의 비중을 높이거나 teleop 에피소드를 필터링하세요.

### 한눈에 보기

| 서브셋 | 출처 | 평가 트랙 | 에피소드 | 프레임(약) | 태스크 |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | 규칙 기반 (GenManip) | `mobile_manip`, `generalist` | 9 × 200 = **1,800** | 3.6 M | 장기 태스크 9개 패밀리 |
| `simple_pnp`   | 규칙 기반 (GenManip) | `mobile_manip`, `generalist` | 10 × 200 = **2,000** | 0.96 M | 단일 스텝 pick-and-place 10개 |
| `teleop_tasks` | 사람 원격 조작     | `table_top_manip`, `generalist` | 7 × 400 = **2,800**  | 5.3 M | 정교한 조작 태스크 7개 |

EBench에는 세 가지 평가 트랙이 있습니다. `mobile_manip`(이동 베이스 pick-and-place)과 `table_top_manip`(테이블탑 정교한 조작)이 두 가지 특화 영역을 다루고, `generalist`는 둘의 합집합입니다 — 제출 방법은 [평가 실행](/EBench-doc/ko/evaluation/run-benchmark/)을 참고하세요.

모든 서브셋은 동일한 녹화 설정을 공유합니다: **15 fps**, 로봇 타입 **`lift2`** (양팔 + 이동 베이스), 4개의 480×640 카메라 뷰 (`top`, `left`, `right`, `overlook`).

### 디렉터리 구조

각 서브셋은 독립적인 LeRobot **v2.1** 데이터셋이며, 자체 태스크 패밀리, 메타, 청크 단위의 parquet/비디오 파일을 가집니다.

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # 예: bottle, dishwasher, make_sandwich, ...
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # 동일한 레이아웃
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # 동일한 레이아웃
```

### 프레임별 모달리티

| 키 | 형상 | 비고 |
| --- | --- | --- |
| `state.joints`, `action.joints`, `action.joints_delta` | `(12,)` | 양팔 관절 위치 (6 + 6) |
| `state.gripper`, `action.gripper` | `(4,)` | 좌우 그리퍼, 각각 손가락 두 개 상태 |
| `state.ee_pose`, `action.ee_pose`, `action.ee_pose_delta` | `(14,)` | 좌우 EE 위치 (xyz) + 쿼터니언 (wxyz) |
| `state.base`, `action.base`, `action.base_delta` | `(3,)` | 베이스 `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | AV1 인코딩 MP4, 15 fps |

`*_delta` 채널은 같은 값을 변화량 형태로 표현한 것입니다 — 정책의 제어 방식에 맞춰 선택하세요. 각 태스크의 `meta/modality.json`에는 LeRobot 로더에 노출되는 표준 state/action/video 키가 정의되어 있습니다.

### 서브셋별 태스크

**`long_horizon`** — 9개의 장기 태스크 패밀리, 각 200 에피소드:
`bottle`, `detergent`, `dish`, `dishwasher`, `fruit`, `make_sandwich`, `microwave`, `pen`, `shop`.

**`simple_pnp`** — 단일 스텝 pick-and-place 10개 태스크 (`task1`–`task10`), 각 200 에피소드. 예시: 포크와 스푼 → 식기 홀더, 책갈피 → 책, 비누 → 비누 받침, 사과 → 과일 그릇, 리모컨 → 거치대, 향수 → 화장대 선반, 소금 → 양념 선반, 선반에서 사과 꺼내기, 찻잔과 찻주전자, 그릇을 접시에 쌓기.

**`teleop_tasks`** — 정교한 조작 태스크 7개, 각 400 에피소드:
`collect_coffee_beans`, `flip_cup_collect_cookies`, `frame_against_pen_holder`, `install_gear`, `peg_in_hole`, `put_glass_in_glassbox`, `tighten_nut`.

### 자연어 명령

모든 에피소드는 자연어 명령과 함께 제공되며, 데이터셋에는 **태스크당 여러 개의 패러프레이즈**가 포함되어 있습니다. 표준 명령은 각 서브셋의 `meta/tasks.jsonl`에 들어 있고, `long_horizon`에는 학습용 추가 표현이 담긴 `instruction_paraphrases_train_only.json`이 함께 제공됩니다. 학습 중 패러프레이즈를 샘플링하면 정책이 명령 표현 변화에 더 강건해집니다.

## 벤치마크 에셋

Hugging Face에서 평가 에셋을 `saved/` 디렉터리로 다운로드합니다.

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

다운로드가 완료되면 다음과 같은 구조를 확인할 수 있습니다.

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← 평가 시 자동 생성
└── ...
```

## 학습 데이터셋 (LeRobot 형식)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

데이터셋은 [LeRobot](https://github.com/huggingface/lerobot) 형식을 사용하며, 일반적인 VLA 학습 파이프라인과 바로 호환됩니다. 데이터셋 구성은 위의 [데이터셋 개요](#데이터셋-개요)를 참고하세요.

다음 단계: [첫 번째 평가 실행](/EBench-doc/ko/evaluation/run-benchmark/).
