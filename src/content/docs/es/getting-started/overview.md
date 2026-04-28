---
title: Visión general del benchmark
description: Orientación rápida sobre la configuración de evaluación, las pistas y las métricas de EBench.
---

Una orientación breve sobre qué evalúa EBench y cómo se calculan las puntuaciones. Usa esta página como mapa — sigue los enlaces para los detalles de configuración o de implementación.

## Configuración de evaluación

- **Simulador.** Construido sobre NVIDIA Isaac Sim. El framework [GenManip](https://github.com/InternRobotics/GenManip) proporciona el servidor de simulación, las escenas y el empaquetado de assets.
- **Arquitectura.** Cliente–servidor: el servidor ejecuta la simulación como caja negra; tu modelo se comunica con él mediante un paquete cliente ligero. Ver [Configuración del entorno](/EBench-doc/es/getting-started/environment/).
- **Robot.** Todas las tareas usan la encarnación `lift2` — doble brazo con base móvil y cuatro cámaras 480×640. Las claves de state/action por frame están en [Assets y dataset → Modalidades por frame](/EBench-doc/es/getting-started/assets/#modalidades-por-frame).
- **Tareas.** 26 tareas de evaluación que cubren tareas de horizonte largo, manipulación dextera y manipulación móvil. Lista completa en [Tareas](/EBench-doc/es/evaluation/task-showcase/).

## Pistas de evaluación

EBench organiza las tareas en tres pistas de envío:

| Pista | Foco | Subset(s) de entrenamiento asociados |
| --- | --- | --- |
| `mobile_manip` | Pick-and-place con base móvil | `long_horizon`, `simple_pnp` |
| `table_top_manip` | Tareas dexteras de mesa | `teleop_tasks` |
| `generalist` | Mixto entre categorías (unión de las dos) | todos los anteriores |

Cada pista se evalúa en tres splits: `val_train`, `val_unseen`, `test`.

> **Semántica de los splits — WIP.** Aquí se documentará la asignación precisa de tareas/seeds a cada split.

Para saber cómo enviar cada pista, consulta [Ejecutar evaluación](/EBench-doc/es/evaluation/run-benchmark/) y la [guía del Challenge](/EBench-doc/es/challenge/).

## Métricas

- **Puntuación por episodio.** Un valor en `[0.0, 1.0]`. Un episodio recibe la puntuación completa cuando se cumple la condición objetivo de la tarea dentro del episodio; de lo contrario `0.0`. La semántica de éxito por tarea aparece en [Tareas](/EBench-doc/es/evaluation/task-showcase/) bajo el campo `Score` de cada tarea.
- **Puntuación de pista.** Promedio de las puntuaciones por episodio sobre todos los episodios evaluados en la pista/split enviada.
- **Tabla de clasificación.** Las puntuaciones por pista se agregan en la [tabla del Challenge](/EBench-doc/es/challenge/).

> **Conteo de episodios y presupuesto de tiempo — WIP.** El número de episodios por pista/split y los límites de pasos por episodio se documentarán aquí.

## Lectura recomendada

- [Configuración del entorno](/EBench-doc/es/getting-started/environment/) — instala el servidor y el cliente.
- [Assets y dataset](/EBench-doc/es/getting-started/assets/) — descarga los assets del benchmark y el dataset de entrenamiento.
- [Ejecutar evaluación](/EBench-doc/es/evaluation/run-benchmark/) — envía tu primera evaluación de extremo a extremo.
