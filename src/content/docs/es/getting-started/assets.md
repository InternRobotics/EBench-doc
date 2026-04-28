---
title: Assets y dataset
description: Visión general del dataset de EBench y cómo descargar los assets del benchmark y el dataset de entrenamiento.
---

## Visión general del dataset

> **Dos fuentes de recolección de datos — características de acción distintas.** Los episodios de esta versión provienen de dos pipelines diferentes. Ten en cuenta qué subsets estás usando para entrenar:
>
> - **Generación basada en reglas (GenManip).** `long_horizon` y `simple_pnp` se generan con políticas guionadas dentro del framework [GenManip](https://github.com/InternRobotics/GenManip). Las trayectorias son **suaves** y tienen **límites de comportamiento claros** entre subhabilidades.
> - **Teleoperación.** `teleop_tasks` se recoge mediante teleoperadores humanos en tareas dexteras. Las trayectorias conservan el estilo humano — las acciones pueden **vibrar, dudar o pausar** a mitad de movimiento.
>
> Si entrenas sobre la unión, espera que la política herede ocasionalmente las dudas del teleop. Si la suavidad de la acción importa para tu evaluación, dale más peso a los subsets de GenManip o filtra episodios de teleop.

### De un vistazo

| Subset | Origen | Pistas de evaluación | Episodios | Frames (≈) | Tareas |
| --- | --- | --- | --- | --- | --- |
| `long_horizon` | Basado en reglas (GenManip) | `mobile_manip`, `generalist` | 9 × 200 = **1.800** | 3,6 M | 9 familias de horizonte largo |
| `simple_pnp`   | Basado en reglas (GenManip) | `mobile_manip`, `generalist` | 10 × 200 = **2.000** | 0,96 M | 10 pick-and-place de un paso |
| `teleop_tasks` | Teleoperación humana       | `table_top_manip`, `generalist` | 7 × 400 = **2.800**  | 5,3 M | 7 tareas dexteras |

EBench tiene tres pistas de evaluación: `mobile_manip` (pick-and-place con base móvil) y `table_top_manip` (tareas dexteras de mesa) cubren los dos regímenes especializados, mientras que `generalist` es la unión — consulta [Ejecutar evaluación](/EBench-doc/es/evaluation/run-benchmark/) para ver cómo enviar cada una.

Todos los subsets comparten la misma configuración de grabación: **15 fps**, tipo de robot **`lift2`** (doble brazo + base móvil), cuatro vistas de cámara 480×640 (`top`, `left`, `right`, `overlook`).

### Estructura

Cada subset es un dataset LeRobot **v2.1** independiente con sus propias familias de tareas, meta y archivos parquet/vídeo divididos en chunks:

```text
saved/dataset/
├── long_horizon/
│   ├── <task_family>/                 # p. ej. bottle, dishwasher, make_sandwich, ...
│   │   ├── data/chunk-000/episode_*.parquet
│   │   ├── videos/chunk-000/<camera>/episode_*.mp4
│   │   └── meta/{info,episodes,episodes_stats,modality,stats,tasks}.json(l)
│   └── instruction_paraphrases_train_only.json
├── simple_pnp/
│   └── task1/ … task10/               # mismo layout
└── teleop_tasks/
    └── peg_in_hole/ install_gear/ …   # mismo layout
```

### Modalidades por frame

| Clave | Forma | Notas |
| --- | --- | --- |
| `state.joints`, `action.joints`, `action.joints_delta` | `(12,)` | articulaciones de doble brazo (6 + 6) |
| `state.gripper`, `action.gripper` | `(4,)` | pinzas izquierda/derecha, dos estados de dedo cada una |
| `state.ee_pose`, `action.ee_pose`, `action.ee_pose_delta` | `(14,)` | posición EE izquierda/derecha (xyz) + cuaternión (wxyz) |
| `state.base`, `action.base`, `action.base_delta` | `(3,)` | base `x, y, theta` |
| `video.{top,left,right,overlook}_camera_view` | `(3, 480, 640)` | MP4 codificado en AV1, 15 fps |

Los canales `*_delta` contienen las mismas magnitudes expresadas como deltas — elige el que coincida con el modo de control de tu política. El `meta/modality.json` de cada tarea lista las claves canónicas state/action/video expuestas a los loaders de LeRobot.

### Tareas por subset

**`long_horizon`** — 9 familias de horizonte largo, cada una con 200 episodios:
`bottle`, `detergent`, `dish`, `dishwasher`, `fruit`, `make_sandwich`, `microwave`, `pen`, `shop`.

**`simple_pnp`** — 10 tareas pick-and-place de un paso (`task1`–`task10`), cada una con 200 episodios. Ejemplos: tenedor y cuchara → portacubiertos, marcapáginas → libro, jabón → jabonera, manzana → frutero, mando → soporte, perfume → estante, sal → especiero, manzana de la estantería, taza y tetera, cuenco apilado en plato.

**`teleop_tasks`** — 7 tareas dexteras, cada una con 400 episodios:
`collect_coffee_beans`, `flip_cup_collect_cookies`, `frame_against_pen_holder`, `install_gear`, `peg_in_hole`, `put_glass_in_glassbox`, `tighten_nut`.

### Instrucciones en lenguaje natural

Cada episodio va acompañado de una instrucción en lenguaje natural y el dataset incluye **varias paráfrasis por tarea**. Las instrucciones canónicas se encuentran en `meta/tasks.jsonl` de cada subset; `long_horizon` proporciona además `instruction_paraphrases_train_only.json` con formulaciones extra para entrenamiento. Muestrear paráfrasis durante el entrenamiento hace la política más robusta a la redacción de las instrucciones.

## Assets del benchmark

Descarga los assets de evaluación desde Hugging Face en el directorio `saved/`:

```bash
huggingface-cli download InternRobotics/EBench-Assets --local-dir saved --repo-type dataset
```

Después de la descarga deberías ver:

```text
GenManip/
├── saved/
│   ├── assets/
│   ├── tasks/
│   └── eval_results/   ← se crea durante la evaluación
└── ...
```

## Dataset de entrenamiento (formato LeRobot)

```bash
huggingface-cli download InternRobotics/EBench-Dataset --local-dir saved/dataset --repo-type dataset
```

El dataset utiliza el formato [LeRobot](https://github.com/huggingface/lerobot), directamente compatible con los pipelines de entrenamiento VLA más habituales. Consulta la [Visión general del dataset](#visión-general-del-dataset) más arriba para ver su contenido.

Siguiente paso: [ejecutar tu primera evaluación](/EBench-doc/es/evaluation/run-benchmark/).
