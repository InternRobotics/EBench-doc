---
title: 환경 설정
description: Isaac Sim 서버 환경과 경량 클라이언트 패키지를 설정합니다.
---

EBench는 클라이언트-서버 아키텍처를 사용하며, **두 가지 환경**을 설정해야 합니다.

- **서버 환경** — Isaac Sim, cuRobo, 그리고 [GenManip](https://github.com/InternRobotics/GenManip) 저장소의 시뮬레이션 서버 코드.
- **클라이언트 환경** — **여러분 모델이 실행되는 Python 환경 그 자체**입니다. 경량 패키지 [`genmanip-client`](https://github.com/InternRobotics/genmanip-client)를 모델 의존성과 함께 설치합니다. 이 패키지는 자체 의존성이 매우 적어 모델 환경과 충돌하지 않습니다.

## 사전 요구 사항

- NVIDIA GPU가 장착된 Linux 워크스테이션.
- CUDA 12.1 및 호환 드라이버.
- Isaac Sim 4.1.0과 호환되는 Python 환경 (서버용).

## 서버 환경

### 시뮬레이션 서버 클론

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

### Isaac Sim 설치

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

로컬에 Isaac Sim이 이미 설치되어 있다면 그대로 사용할 수 있습니다. 서버 측 명령을 `/isaac-sim/python.sh`로 실행하면 됩니다.

### 프로젝트 의존성 설치

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## 클라이언트 환경

클라이언트는 **여러분의 모델이 실행되는 Python 환경**에 설치합니다. 모델 의존성과 같은 환경에 설치하면 됩니다. `genmanip-client`는 이제 독립된 저장소이며 의존성이 매우 적어 모델 환경의 어떤 것과도 충돌하지 않습니다.

```bash
git clone https://github.com/InternRobotics/genmanip-client.git
cd genmanip-client
pip install -e .
gmp --help
```

## 검증

진행하기 전에 두 환경이 모두 정상적으로 동작하는지 확인하세요.

```bash
# 서버 환경
python ray_eval_server.py --help

# 클라이언트 환경
gmp --help
```

다음 단계: [벤치마크 에셋 다운로드](/EBench-doc/ko/getting-started/assets/).
