---
title: Challenge
description: Reichen Sie Ihre EBench-Ergebnisse beim Online-Challenge-Leaderboard ein.
---

Die EBench Challenge unterstuetzt die Online-Einreichung von Benchmark-Ergebnissen. Folgen Sie den untenstehenden Schritten, um einen gueltigen Lauf vorzubereiten und an den Leaderboard-Dienst zu uebermitteln.

## Baseline und Erste Schritte

Bevor Sie online einreichen, stellen Sie sicher, dass Sie den Benchmark lokal ausfuehren koennen:

- Richten Sie die Server- und Client-Umgebungen unter [Umgebung einrichten](/de/getting-started/environment/) ein.
- Bereiten Sie die benoetigten Benchmark-Assets unter [Assets und Datensatz](/de/getting-started/assets/) vor.
- Fuehren Sie zuerst einen lokalen Benchmark mit [Evaluation starten](/de/evaluation/run-benchmark/) aus.
- Wenn Sie eine eigene Policy verwenden, folgen Sie [Eigenes Modell einbinden](/de/evaluation/custom-model/).

Sie sollten pruefen, dass Ihr lokaler Lauf erfolgreich beendet wird und ein vollstaendiges Ergebnisverzeichnis erzeugt, bevor Sie online einreichen.

## Schritte fuer die Online-Einreichung

Der Online-Ablauf hat drei Phasen: eine Online-Aufgabe erstellen, auf den Bewertungs-Endpoint warten und Bewertungs-Worker gegen diesen Endpoint ausfuehren.

### 1. Token abrufen

Oeffnen Sie die Startseite der Plattform:

```text
https://internrobotics.shlab.org.cn/eval/landing-page
```

Dann:

1. Melden Sie sich an der Plattform an.
2. Oeffnen Sie die API-Key- oder Geheimnisverwaltungsseite.
3. Erstellen Sie einen neuen API-Key und kopieren Sie den Token-Wert.

### 2. Client-Umgebung vorbereiten

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. Online-Bewertungsaufgabe erstellen

Verwenden Sie `gmp online submit`, um einen entfernten Bewertungsjob anzufordern:

```bash
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id "$PREVIOUS_TASK" \  # optional: continue with a previous task
  --benchmark_set ebench_generalist \
  --model_name internVLA \
  --model_type VLA \
  --submitter_name test \
  --submitter_homepage test \
  --is_public 0
```

### Parameter

| Parameter | Typ | Beispiel | Beschreibung |
|-----------|-----|----------|--------------|
| task_id | string | T2025123100001 | Optional, vorherige task_id für Aufgabenwiederholung verwenden |
| model_name | string | internVLA | Modellname |
| model_type | string | VLA | Modelltyp |
| benchmark_set | string | EBench | Benchmark-Set-Typ, derzeit nur ebench_generalist erlaubt |
| submitter_name | string | SHlab | Organisations-/Entwicklername |
| submitter_homepage | string | http://example.com | Homepage des Einreichers |
| is_public | int | 0 | Ob öffentlich<br>0 Nein<br>1 Ja |

Sobald die Backend-Aufgabe bereit ist, gibt der Befehl Felder wie diese zurueck:

```json
Waiting for available server (task_id=b5dddc6de60c4aec8236500b8e3dc0e1)...
Still waiting... elapsed 0.1s. Next check in 5.0s.
Still waiting... elapsed 5.3s. Next check in 5.0s.
Ready after 10.4s. endpoint=https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod
{
  "task_id": "b5dddc6de60c4aec8236500b8e3dc0e1",
  "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod",
  "response": {
    "code": 0,
    "msg": "success",
    "trace_id": "4a4136c66bdc80922ccc6485c44fa9e5",
    "data": {
      "ready": true,
      "endpoint": "https://internverse.shlab.org.cn/eval-server/2813aea1/api/predict/embodied_eval.genmanip_eas_1_master_prod"
    }
  }
}
```

Notieren Sie beide Werte:

- `task_id`: Verwenden Sie diesen Wert beim Ausfuehren der Bewertung als `run_id`.
- `endpoint`: Verwenden Sie diesen Wert als entfernte Bewertungs-URL.

#### Demo: `endpoint` und `task_id` automatisch extrahieren

Das folgende Beispiel verwendet ein vereinfachtes Python-Skript, um `gmp online submit` auszufuehren und `endpoint` sowie `task_id` aus der Rueckgabe zu extrahieren:

```python
import os
import json
import subprocess

def submit_online_task() -> tuple[str, str]:
    cmd = [
        'gmp', 'online', 'submit',
        '--base_url', 'https://internrobotics.shlab.org.cn/eval',
        '--token', os.environ['EBENCH_SUBMIT_TOKEN'],
        '--benchmark_set', 'ebench_generalist',
        '--model_name', 'internVLA',
        '--model_type', 'VLA',
        '--submitter_name', 'test',
        '--submitter_homepage', 'test',
        '--is_public', '0',
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    output = result.stdout
    json_start = output.find('{')
    payload = json.loads(output[json_start:])
    endpoint = payload['endpoint']
    task_id = payload['task_id']
    print('endpoint=' + endpoint)
    print('task_id=' + task_id)
    return endpoint, task_id
```

Nach dem Ausfuehren des Skripts werden `endpoint` und `task_id` direkt ausgegeben. Diese Werte koennen Sie anschliessend im Aufruf des Bewertungs-Workers verwenden.

### 4. Bewertungs-Worker starten

Fuehren Sie den Evaluator gegen den zurueckgegebenen Endpoint aus. Dies ist eine Test-Bewertung. Folgen Sie der Dokumentation, um Ihre eigene Modell-Bewertung zu erstellen.

```python
endpoint, task_id = submit_online_task()

client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["0"]
)
model = ModelClient(...)

try:
    obs = client.reset()
    done = False
    while not done:
        # Aktionen fuer den gesamten Chunk generieren
        action_chunk = model.get_action_chunk(obs)
        # Server fuehrt Chunk intern aus; gibt obs bei naechster Re-Infer-Punkt zurueck
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

Sie koennen mehrere Eval-Clients mit verschiedenen IDs starten. Z. B.

```python
client = EvalClient(
    base_url=endpoint,
    token=os.environ['EBENCH_SUBMIT_TOKEN'],
    run_id=task_id,
    worker_ids=["1"]
)
...
```

Der Server unterstützt bis zu 16 gleichzeitige Worker pro Lauf. Verbindungen werden nach zehn Minuten Inaktivität beendet. Sie können eine fehlgeschlagene Evaluierungseinreichung neu starten, indem Sie die gleiche task_id verwenden.
```bash
# Aufgabe oben neu starten
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

Wenn Sie Verbindungs-Timeouts feststellen, starten Sie den Client neu, um die Verbindung wiederherzustellen. Der Fortschritt wird auf dem Server gespeichert.

### 5. Aufgabe ueberwachen

Nachdem die Online-Aufgabe erstellt wurde, zeigt die Plattformseite die entsprechende Aufgabe an. Die finalen Bewertungsausgaben werden in denselben entfernten Aufgabeneintrag geschrieben.

Sie koennen den Server-Status und Aufgabenfortschritt auch im Terminal ueberpruefen.

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"
```

### 6. Aufgabe stoppen

Stoppen Sie eine Evaluierungssitzung mit:

```
gmp online stop \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  --user_id "$USER_ID"    # von der Website erhalten, Ihre Kontoseite
```

## URL fuer die Online-Einreichung

Erstellen Sie Aufgaben ueber die offizielle Plattform-Base-URL:

```text
https://internrobotics.shlab.org.cn/eval
```

Verwenden Sie nach `gmp online submit` den zurueckgegebenen aufgabenspezifischen Endpoint fuer die Bewertung:

```text
https://internverse.shlab.org.cn/evalserver/<task-endpoint>
```

## Bewertungsregeln

- Jede bewertete Episode erzeugt eine Aufgabenpunktzahl zwischen `0.0` und `1.0`.
- Eine Aufgabe erhaelt die volle Punktzahl, wenn die geforderte Zielbedingung innerhalb der Episode erfuellt wird; andernfalls erhaelt sie `0.0`.
- Die Leaderboard-Punktzahl ist der Durchschnitt der Aufgabenpunktzahlen ueber alle bewerteten Episoden im eingereichten Benchmark-Set.
- Fuer aufgabenspezifische Erfolgsdefinitionen siehe [Aufgabenuebersicht](/de/evaluation/task-showcase/), wo jede Aufgabe ihre Beschreibungen zu `Location`, `Instruction` und `Score` enthaelt.

## Beispiel-Checkliste

- Baseline oder benutzerdefiniertes Modell laeuft lokal
- Korrekte Benchmark-Strecke und Split ausgewaehlt
- Submission-Token konfiguriert
- Online-Submit-URL bestaetigt
- Ergebnisdateien bereit zum Hochladen
