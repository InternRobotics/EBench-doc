---
title: 에셋 및 데이터셋
description: EBench 벤치마크 에셋과 학습 데이터셋을 다운로드합니다.
---

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

데이터셋은 [LeRobot](https://github.com/huggingface/lerobot) 형식을 사용하며, 일반적인 VLA 학습 파이프라인과 바로 호환됩니다.

다음 단계: [첫 번째 평가 실행](/ko/evaluation/run-benchmark/).
