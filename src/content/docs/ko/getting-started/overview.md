---
title: 벤치마크 개요
description: EBench의 평가 설정, 트랙, 지표를 빠르게 파악하기 위한 페이지.
---

EBench가 무엇을 평가하고 점수를 어떻게 계산하는지 빠르게 살펴보는 페이지입니다. 이 페이지를 지도처럼 사용하고, 자세한 설정/구현 정보는 각 링크를 따라가세요.

## 평가 설정

- **시뮬레이터.** NVIDIA Isaac Sim 위에 구축되었습니다. [GenManip](https://github.com/InternRobotics/GenManip) 프레임워크가 시뮬레이션 서버, 장면, 에셋 패키징을 제공합니다.
- **아키텍처.** 클라이언트–서버 구조: 서버가 시뮬레이션을 블랙박스로 실행하고, 모델은 가벼운 클라이언트 패키지를 통해 통신합니다. [환경 설정](/EBench-doc/ko/getting-started/environment/)을 참고하세요.
- **로봇.** 모든 태스크는 `lift2` 임바디먼트를 사용합니다 — 양팔 + 이동 베이스 + 4개의 480×640 카메라. 프레임 단위 state/action 키는 [에셋 및 데이터셋 → 프레임별 모달리티](/EBench-doc/ko/getting-started/assets/#프레임별-모달리티)에 정리되어 있습니다.
- **태스크.** 장기 태스크, 정교한 조작, 이동 조작을 아우르는 총 26개의 평가 태스크. 전체 목록은 [태스크 쇼케이스](/EBench-doc/ko/evaluation/task-showcase/)에서 확인하세요.

## 평가 트랙

EBench는 태스크를 세 개의 제출 트랙으로 구성합니다:

| 트랙 | 초점 | 대응 학습 서브셋 |
| --- | --- | --- |
| `mobile_manip` | 이동 베이스 pick-and-place | `long_horizon`, `simple_pnp` |
| `table_top_manip` | 테이블탑 정교한 조작 | `teleop_tasks` |
| `generalist` | 카테고리를 가로지르는 혼합(앞 두 가지의 합집합) | 위의 모든 것 |

각 트랙은 세 개의 split에서 평가됩니다: `val_train`, `val_unseen`, `test`.

> **Split 세부 사항 — WIP.** 각 split에 포함되는 태스크/시드의 정확한 구성은 추후 이곳에 정리됩니다.

각 트랙의 제출 방법은 [평가 실행](/EBench-doc/ko/evaluation/run-benchmark/)과 [Challenge 가이드](/EBench-doc/ko/challenge/)를 참고하세요.

## 지표

- **에피소드 단위 태스크 점수** — `[0.0, 1.0]` 범위의 값. 에피소드 안에서 태스크의 목표 조건이 충족되면 만점, 그렇지 않으면 `0.0`. 태스크별 성공 판정은 [태스크 쇼케이스](/EBench-doc/ko/evaluation/task-showcase/)의 각 태스크 `Score` 항목을 확인하세요.
- **트랙 점수** — 제출한 트랙/split의 모든 평가 에피소드 점수 평균.
- **리더보드** — 트랙 점수는 [Challenge 리더보드](/EBench-doc/ko/challenge/)에 집계됩니다.

> **에피소드 수와 시간 예산 — WIP.** 트랙/split별 에피소드 수와 에피소드당 스텝 제한은 추후 이곳에 정리됩니다.

## 다음으로 읽기

- [환경 설정](/EBench-doc/ko/getting-started/environment/) — 서버와 클라이언트 설치.
- [에셋 및 데이터셋](/EBench-doc/ko/getting-started/assets/) — 벤치마크 에셋과 LeRobot 학습셋 다운로드.
- [평가 실행](/EBench-doc/ko/evaluation/run-benchmark/) — 첫 평가를 처음부터 끝까지 실행.
