---
title: Ejecutar evaluación
description: Inicia el servidor Isaac Sim y ejecuta una evaluación de EBench.
---

## 1. Iniciar el servidor

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

O con una instalación local de Isaac Sim:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. Enviar una tarea

Desde el **entorno del cliente**, envía un trabajo de evaluación:

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

Configuraciones de tareas disponibles:

| Configuración de tarea | Descripción |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | Pick-and-place con base móvil |
| `ebench/table_top_manip/<split>` | Tareas de manipulación precisa en mesa |
| `ebench/generalist/<split>` | Tareas mixtas de distintas categorías |

Splits: `val_train`, `val_unseen`, `test`

Envía todas las tareas a la vez con `gmp submit ebench --run_id full_run`.

## 3. Conectar tu modelo

Comprobación rápida de conectividad con el baseline integrado:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

Para usar tu propio modelo, consulta [Integrar tu modelo](/es/evaluation/custom-model/).

## 4. Ver resultados

```bash
gmp status
```

Los resultados se guardan en `saved/eval_results/<task>/<run_id>/`.

> Cuando el servidor y el cliente se ejecutan en máquinas distintas, pasa `--host <ip> --port <port>` a todos los comandos `gmp`. Consulta la [referencia de GMP CLI](/es/tools/gmp-cli/) para ver todas las opciones.
