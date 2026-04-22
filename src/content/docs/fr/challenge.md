---
title: Challenge
description: Soumettez vos resultats EBench au classement de la challenge en ligne.
---

La challenge EBench prend en charge la soumission en ligne des resultats de benchmark. Suivez les etapes ci-dessous pour preparer une execution valide et la soumettre au service de classement.

## Baseline et prise en main

Avant de soumettre en ligne, assurez-vous de pouvoir executer le benchmark en local :

- Configurez les environnements serveur et client dans [Mise en route](/fr/getting-started/environment/).
- Preparez les assets requis du benchmark dans [Assets et données](/fr/getting-started/assets/).
- Lancez d'abord un benchmark local avec [Lancer l'évaluation](/fr/evaluation/run-benchmark/).
- Si vous utilisez votre propre policy, suivez [Intégrer votre modèle](/fr/evaluation/custom-model/).

Vous devez verifier que votre execution locale se termine correctement et produit un dossier de resultats complet avant de tenter une soumission en ligne.

## Etapes de soumission en ligne

Le flux en ligne comporte trois etapes : creer une tache en ligne, attendre l'endpoint d'evaluation, puis executer les workers d'evaluation sur cet endpoint.

### 1. Recuperer votre token

Ouvrez la page d'accueil de la plateforme :

```text
https://internrobotics-staging.shlab.org.cn/eval/landing-page
```

Ensuite :

1. Connectez-vous a la plateforme.
2. Ouvrez la page de gestion des API keys ou des secrets.
3. Creez une nouvelle API key et copiez la valeur du token.

### 2. Preparer l'environnement client

```bash
git clone https://gitee.pjlab.org.cn/L2/MultimodalVLA/GenManip-Client.git
cd GenManip-Client
conda create -n client python=3.11 -y
conda activate client
pip install -e .
```

### 3. Creer une tache d'evaluation en ligne

Utilisez `gmp online submit` pour demander une tache d'evaluation distante :

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

### Paramètres

| Paramètre | Type | Exemple | Description |
|-----------|------|---------|-------------|
| task_id | string | T2025123100001 | Optionnel, peut inclure le task_id précédent pour ré-exécution de tâche |
| model_name | string | internVLA | Nom du modèle |
| model_type | string | VLA | Type de modèle |
| benchmark_set | string | EBench | Type d'ensemble de benchmark, actuellement seulement EBench est autorisé |
| submitter_name | string | SHlab | Nom d'organisation/développeur |
| submitter_homepage | string | http://example.com | Page d'accueil du soumissionnaire |
| is_public | int | 0 | Si public<br>0 Non<br>1 Oui |

Une fois la tache backend prete, la commande renvoie des champs comme ceux-ci :

```json
{
  "task_id": "9ea5fb6ae980430da626958c4433ea18",
  "endpoint": "https://internrobotics-staging.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master"
}
```

Conservez ces deux valeurs :

- `task_id` : utilisez-le comme `run_id` lors de l'execution de l'evaluation.
- `endpoint` : utilisez-le comme URL d'evaluation distante.

### 4. Demarrer les workers d'evaluation

Executez l'evaluateur sur l'endpoint renvoye. Ceci est une evaluation de test. Suivez la documentation pour creer votre propre evaluation de modele.

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
        # Generer des actions pour le chunk entier
        action_chunk = model.get_action_chunk(obs)
        # Le serveur execute le chunk en interne; retourne obs au prochain point de re-inference
        obs, done = client.step(action_chunk)
finally:
    client.close()
```

Vous pouvez demarrer plusieurs eval clients avec des IDs differents. Par exemple:

```python
client = EvalClient(
    base_url="https://internrobotics.shlab.org.cn/evalserver/9391d9e8/api/predict/embodied_eval.genmanip_eas_1_master",
    token="$EBENCH_SUBMIT_TOKEN"
    run_id="9ea5fb6ae980430da626958c4433ea18",
    worker_ids=["1"]
)
...
```

Le serveur prend en charge jusqu'à 16 travailleurs simultanés par exécution. Les connexions seront terminées après dix minutes d'inactivité. Vous pouvez redémarrer une soumission d'évaluation échouée en utilisant le même task_id.
```bash
# redémarrer la tâche ci-dessus
gmp online submit \
  --base_url https://internrobotics.shlab.org.cn/eval \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --task_id 9ea5fb6ae980430da626958c4433ea18 \
  # ...
```

Si vous rencontrez des délais d'attente de connexion, redémarrez le client pour récupérer.

Une fois la tache en ligne creee, la page de la plateforme affichera la tache correspondante. Les sorties finales de l'evaluation sont ecrites dans le meme enregistrement de tache distante.

Vous pouvez egalement verifier l'etat du serveur et la progression de la tache a partir du terminal.

```bash
gmp status \
  --url "$EBENCH_ONLINE_ENDPOINT" \
  --token "$EBENCH_SUBMIT_TOKEN" \
  --run_id "$EBENCH_TASK_ID"


## URL de soumission en ligne

Creez les taches via l'URL de base officielle de la plateforme :

```text
https://internrobotics-staging.shlab.org.cn/eval
```

Apres `gmp online submit`, utilisez l'endpoint renvoye pour cette tache afin d'effectuer l'evaluation :

```text
https://internrobotics-staging.shlab.org.cn/evalserver/<task-endpoint>
```

## Checklist d'exemple

- Baseline ou modele personnalise execute en local
- Track et split corrects selectionnes
- Token de soumission configure
- URL de soumission en ligne confirmee
- Fichiers de resultats prets pour l'envoi
