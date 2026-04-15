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
https://internrobotics-staging.shlab.org.cn/eval/landing-page
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
  --benchmark_set EBench \
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
| benchmark_set | string | EBench | Benchmark-Set-Typ, derzeit nur EBench erlaubt |
| submitter_name | string | SHlab | Organisations-/Entwicklername |
| submitter_homepage | string | http://example.com | Homepage des Einreichers |
| is_public | int | 0 | Ob öffentlich<br>0 Nein<br>1 Ja |

Sobald die Backend-Aufgabe bereit ist, gibt der Befehl Felder wie diese zurueck:

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics-staging.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

Notieren Sie beide Werte:

- `task_id`: Verwenden Sie diesen Wert beim Ausfuehren der Bewertung als `run_id`.
- `endpoint`: Verwenden Sie diesen Wert als entfernte Bewertungs-URL.

### 4. Bewertungs-Worker starten

Fuehren Sie den Evaluator gegen den zurueckgegebenen Endpoint aus.

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  --chunk_size 40 \
  --worker_id 0
```

Wenn Sie den zweiten Backend-Worker verwenden moechten, oeffnen Sie ein weiteres Terminal und starten Sie:

```bash
gmp eval \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID" \
  -a r5a \
  -g lift2 \
  --chunk_size 40 \
  --worker_id 1
```

Der Server unterstuetzt bis zu 32 gleichzeitige Worker pro Lauf. Verbindungen werden nach einer Stunde Inaktivitaet beendet.

### 5. Aufgabe ueberwachen

Nachdem die Online-Aufgabe erstellt wurde, zeigt die Plattformseite die entsprechende Aufgabe an. Die finalen Bewertungsausgaben werden in denselben entfernten Aufgabeneintrag geschrieben.


## URL fuer die Online-Einreichung

Erstellen Sie Aufgaben ueber die offizielle Plattform-Base-URL:

```text
https://internrobotics-staging.shlab.org.cn/eval
```

Verwenden Sie nach `gmp online submit` den zurueckgegebenen aufgabenspezifischen Endpoint fuer die Bewertung:

```text
https://internrobotics-staging.shlab.org.cn/evalserver/<task-endpoint>
```

## Beispiel-Checkliste

- Baseline oder benutzerdefiniertes Modell laeuft lokal
- Korrekte Benchmark-Strecke und Split ausgewaehlt
- Submission-Token konfiguriert
- Online-Submit-URL bestaetigt
- Ergebnisdateien bereit zum Hochladen
