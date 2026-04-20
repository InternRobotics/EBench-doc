---
title: Desafio
description: Envia tus resultados de EBench al leaderboard del desafio en linea.
---

EBench Challenge admite el envio en linea de resultados del benchmark. Sigue los pasos siguientes para preparar una ejecucion valida y enviarla al servicio del leaderboard.

## Baseline y primeros pasos

Antes de enviar en linea, asegurate de poder ejecutar el benchmark localmente:

- Configura los entornos del servidor y del cliente en [Configuración del entorno](/es/getting-started/environment/).
- Prepara los assets requeridos del benchmark en [Assets y dataset](/es/getting-started/assets/).
- Ejecuta primero un benchmark local con [Ejecutar evaluación](/es/evaluation/run-benchmark/).
- Si usas tu propia policy, sigue [Integrar tu modelo](/es/evaluation/custom-model/).

Debes comprobar que tu ejecucion local termina correctamente y genera un directorio de resultados completo antes de intentar el envio en linea.

## Pasos para el envio en linea

El flujo en linea tiene tres etapas: crear una tarea en linea, esperar el endpoint de evaluacion y ejecutar los workers de evaluacion contra ese endpoint.

### 1. Obtener el token

Abre la pagina principal de la plataforma:

```text
https://internrobotics-staging.shlab.org.cn/eval/landing-page
```

Luego:

1. Inicia sesion en la plataforma.
2. Abre la pagina de gestion de API keys o secretos.
3. Crea una nueva API key y copia el valor del token.

### 2. Preparar el entorno del cliente

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. Crear una tarea de evaluacion en linea

Usa `gmp online submit` para solicitar un trabajo de evaluacion remoto:

```bash
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --benchmark_set ebench_generalist \
  --model_name internVLA \
  --model_type VLA \
  --submitter_name test \
  --submitter_homepage test \
  --is_public 0
```

### Parámetros

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| task_id | string | T2025123100001 | Opcional, puede incluir task_id anterior para re-ejecución de tarea |
| model_name | string | internVLA | Nombre del modelo |
| model_type | string | VLA | Tipo de modelo |
| benchmark_set | string | EBench | Tipo de conjunto de benchmark, actualmente solo se permite ebench_generalist |
| submitter_name | string | SHlab | Nombre de organización/desarrollador |
| submitter_homepage | string | http://example.com | Página web del remitente |
| is_public | int | 0 | Si es público<br>0 No<br>1 Sí |

Cuando la tarea del backend este lista, el comando devuelve campos como estos:

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics-staging.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

Guarda ambos valores:

- `task_id`: usalo como `run_id` al ejecutar la evaluacion.
- `endpoint`: usalo como la URL remota de evaluacion.

### 4. Iniciar los workers de evaluacion

Ejecuta el evaluador contra el endpoint devuelto. Esta es una evaluación de prueba. Sigue la documentación para crear tu propia evaluación de modelo.

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["0"]
)
model = ModelClient(...)

try:
    obs = client.reset()
    done = False
    while not done:
        # Generar acciones para todo el chunk
        action_chunk = model.get_action_chunk(obs)
        # El servidor ejecuta el chunk internamente; devuelve obs en el siguiente punto de re-inferencia
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

Puedes iniciar varios eval clients con diferentes IDs. Por ejemplo:

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["1"]
)
...
```

El servidor soporta hasta 32 workers concurrentes por ejecución. Las conexiones se terminarán después de una hora de inactividad.

### 5. Supervisar la tarea

Despues de crear la tarea en linea, la pagina de la plataforma mostrara la tarea correspondiente. Los resultados finales de la evaluacion se escriben en el mismo registro remoto de la tarea.

Tambien puedes verificar el estado del servidor y el progreso de la tarea desde la terminal.

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"


## URL de envio en linea

Crea tareas mediante la URL base oficial de la plataforma:

```text
https://internrobotics-staging.shlab.org.cn/eval
```

Despues de `gmp online submit`, usa el endpoint devuelto para esa tarea en la evaluacion:

```text
https://internrobotics-staging.shlab.org.cn/evalserver/<task-endpoint>
```

## Lista de verificacion de ejemplo

- Baseline o modelo personalizado ejecutado localmente
- Track y split correctos seleccionados
- Token de envio configurado
- URL de envio en linea confirmada
- Archivos de resultados listos para subir
