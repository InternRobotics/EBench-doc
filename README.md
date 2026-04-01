# EBench Docs

Documentation site for EBench, an embodied manipulation benchmark built on Isaac Sim and the GenManip evaluation stack.

This repository contains the Starlight site for setup, assets, evaluation workflow, and `gmp` CLI usage. It is the documentation layer, not the benchmark package itself.

## Related repositories

- `EBench`: benchmark data, trajectories, and packaged assets.
- `GenManip-Sim`: evaluation server, task configs, and the `genmanip-client` source package.
- `genmanip-client`: installed from `GenManip-Sim/standalone_tools/packages/genmanip_client/` and provides the `gmp` CLI plus the `EvalClient` API.

## Local development

Install dependencies:

```bash
npm install
```

Start the docs site:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Where to start

- Docs homepage: `src/content/docs/index.mdx`
- English docs: `src/content/docs/`
- Simplified Chinese docs: `src/content/docs/zh-cn/`
- Site navigation/config: `astro.config.mjs`

## Scope

This repo documents:

- environment setup for the GenManip server and client environments
- how EBench assets map into `saved/`
- how to run `ray_eval_server.py`, `gmp submit`, `gmp eval`, and `gmp status`
- how benchmark families and splits map to submit targets

It does not contain the benchmark assets or the GenManip runtime itself.
