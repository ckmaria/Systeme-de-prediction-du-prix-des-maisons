# IA - Prediction du prix des maisons

Ce dossier contient un petit modele Scikit-learn utilise par Laravel.

## Installation

```bash
pip install pandas numpy scikit-learn joblib
```

ou :

```bash
pip install -r requirements.txt
```

## Entrainer le modele

```bash
python train_model.py
```

Le modele est enregistre dans `models/house_price_model.joblib`.

## Tester une prediction

```bash
echo {"surface":120,"chambres":3,"localisation":"Casablanca","type_bien":"Appartement","etat":"Bon","facades":2,"etage":3,"ascenseur":true} | python predict.py
```
