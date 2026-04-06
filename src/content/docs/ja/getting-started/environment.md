---
title: 環境構築
description: EBench の Isaac Sim サーバー環境と軽量クライアントパッケージをセットアップします。
---

EBench はクライアント・サーバーアーキテクチャを採用しています。**2 つの環境**をセットアップします：

- **サーバー環境** — Isaac Sim、cuRobo、およびベンチマークコード。
- **クライアント環境** — モデルの依存関係と共に `genmanip-client` のみをインストールします。このパッケージは依存関係が極めて少なく、競合を回避できます。

## 前提条件

- NVIDIA GPU を搭載した Linux ワークステーション。
- CUDA 12.1 と互換性のあるドライバー。
- Isaac Sim 4.1.0 互換の Python 環境（サーバー用）。

## リポジトリのクローン

```bash
git clone https://github.com/InternRobotics/GenManip.git
cd GenManip
```

## サーバー環境

### Isaac Sim のインストール

```bash
export CUDA_HOME=/usr/local/cuda-12.1
pip install isaacsim==4.1.0 isaacsim-extscache-kit==4.1.0 isaacsim-extscache-kit-sdk==4.1.0 isaacsim-extscache-physics==4.1.0 --extra-index-url https://pypi.nvidia.com
pip install torch==2.4.0 --extra-index-url https://download.pytorch.org/whl/cu121
```

ローカルに Isaac Sim がインストール済みの場合は、そのまま使用できます。サーバー側のコマンドは `/isaac-sim/python.sh` で実行してください。

### プロジェクト依存関係のインストール

```bash
mkdir -p saved/envs
git clone https://github.com/NVlabs/curobo.git saved/envs/curobo
pip install -e saved/envs/curobo --no-build-isolation
pip install -r requirements.txt
```

## クライアント環境

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## 動作確認

先に進む前に、両方の環境が正しく動作することを確認してください：

```bash
# サーバー環境
python ray_eval_server.py --help

# クライアント環境
gmp --help
```

次のステップ：[ベンチマークアセットのダウンロード](/ja/getting-started/assets/)。
