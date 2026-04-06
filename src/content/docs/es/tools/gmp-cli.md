---
title: GMP CLI
description: Envía, monitoriza, evalúa y postprocesa tareas de EBench con gmp.
---

## Instalación

Instala el paquete `genmanip-client` en tu **entorno del cliente**:

```bash
pip install -e standalone_tools/packages/genmanip_client/
gmp --help
```

## Comandos principales

| Comando | Función |
| :-- | :-- |
| [`gmp submit`](#gmp-submit) | Enviar o reconectar tareas del benchmark en el servidor de evaluación. |
| [`gmp status`](#gmp-status) | Consultar el progreso y las métricas de la ejecución actual. |
| [`gmp eval`](#gmp-eval) | Ejecutar workers del cliente e interactuar con los episodios del servidor. |
| [`gmp plot`](#gmp-plot) | Postprocesar las salidas de los episodios en artefactos de visualización. |
| [`gmp clean`](#gmp-clean) | Eliminar cachés, logs, resultados de evaluación y archivos temporales generados. |
| [`gmp visualize`](#gmp-visualize) | Explorar resultados de evaluación y reproducir episodios en el visor Rerun. |

## Submit, status y eval

### `gmp submit`

Familia de benchmark + split:

```bash
gmp submit ebench/mobile_manip/test --run_id mobile_test
gmp submit ebench/table_top_manip/val_unseen --run_id tabletop_val_unseen
gmp submit ebench/generalist/val_train --run_id generalist_val_train
```

Alias de benchmark:

```bash
gmp submit ebench --run_id full_benchmark
```

Rutas de configuración de tareas admitidas:

Configuraciones de tareas:

- `mobile_manip`
- `table_top_manip`
- `generalist`

Splits:

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

Para la integración de modelos personalizados, consulta [Integrar tu modelo](/es/evaluation/custom-model/).

## Clean, plot y visualize

### `gmp plot`

```bash
gmp plot client_results/<benchmark>/<run_id>/<task>/<seed>
```

### `gmp clean`

Usa `gmp clean` para eliminar artefactos generados en ejecuciones locales.

Vista previa de lo que se eliminaría:

```bash
gmp clean --dry-run
```

Eliminar caché de mallas generada, resultados de evaluación, logs y archivos temporales sobrantes:

```bash
gmp clean
```

Eliminar también la caché de paquetes del benchmark descargados:

```bash
gmp clean --all
```

### `gmp visualize`

`gmp visualize` inicia un visor HTTPS local para explorar ejecuciones, tasas de éxito por tarea y reproducciones de episodios individuales.

Instalar el extra de visualización:

```bash
pip install -e "standalone_tools/packages/genmanip_client/[visualize]"
```

Uso básico:

```bash
gmp visualize
gmp visualize --port 55088
```

Gestión de caché:

```bash
gmp visualize --flush-cache --dry-run
gmp visualize --flush-cache
```

Notas:

- `gmp visualize` espera encontrar los resultados de evaluación en `saved/eval_results/`.
- El visor utiliza HTTPS y puede mostrar una advertencia de certificado en el navegador la primera vez.
- La versión actual de `rerun-sdk` utilizada por visualize requiere Python 3.11+.

## Opciones comunes

- `--run_id`: identifica y reanuda una ejecución.
- `--host`, `--port`: servidor de evaluación destino (por defecto `127.0.0.1:8087`).
- `--worker_ids`: asignación de workers en `gmp eval`.
- `--frame_save_interval`: frecuencia de guardado de frames en el cliente.
- `--chunk_size`: longitud de chunk de acciones cuando tu modelo predice acciones agrupadas.
