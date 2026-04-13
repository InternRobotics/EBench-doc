---
title: Evaluation starten
description: Den Isaac-Sim-Server starten und eine EBench-Evaluation durchfuehren.
---

## 1. Server starten

```bash
python ray_eval_server.py --host 0.0.0.0 --port 8087
```

Oder mit einer lokalen Isaac-Sim-Installation:

```bash
/isaac-sim/python.sh ray_eval_server.py --host 0.0.0.0 --port 8087
```

## 2. Aufgabe einreichen

Reichen Sie aus der **Client-Umgebung** einen Benchmark-Auftrag ein:

```bash
gmp submit ebench/mobile_manip/test --run_id my_first_run
```

Verfuegbare Aufgabeneinstellungen:

| Aufgabeneinstellung | Beschreibung |
| :-- | :-- |
| `ebench/mobile_manip/<split>` | Pick-and-Place mit mobiler Basis |
| `ebench/table_top_manip/<split>` | Geschickte Tischaufgaben |
| `ebench/generalist/<split>` | Gemischte Aufgaben ueber Kategorien hinweg |

Splits: `val_train`, `val_unseen`, `test`

Alle Aufgaben auf einmal einreichen: `gmp submit ebench --run_id full_run`.

## 3. Modell verbinden

Schneller Konnektivitaetstest mit der integrierten Baseline:

```bash
gmp eval -a r5a -g lift2 --worker_ids 0
```

Fuer Ihr eigenes Modell siehe [Eigenes Modell einbinden](/EBench-doc/de/evaluation/custom-model/).

## 4. Ergebnisse pruefen

```bash
gmp status
```

Ergebnisse werden unter `saved/eval_results/<task>/<run_id>/` gespeichert.

> Wenn Server und Client auf verschiedenen Maschinen laufen, uebergeben Sie `--host <ip> --port <port>` an alle `gmp`-Befehle. Siehe die [GMP-CLI-Referenz](/EBench-doc/de/tools/gmp-cli/) fuer alle Optionen.
