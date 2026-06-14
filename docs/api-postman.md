# Tests API avec Postman

## Endpoint de verification

```http
GET http://127.0.0.1:8000/api/health
```

Reponse attendue :

```json
{
  "status": "ok"
}
```

## Endpoint de prediction

```http
POST http://127.0.0.1:8000/api/predict
Content-Type: application/json
Accept: application/json
```

Body :

```json
{
  "surface": 120,
  "chambres": 3,
  "localisation": "Casablanca",
  "type_bien": "Appartement",
  "etat": "Bon",
  "facades": 2,
  "etage": 3,
  "ascenseur": true
}
```

Reponse attendue :

```json
{
  "prix_estime": 950000,
  "message": "Prédiction effectuée avec succès",
  "prediction_id": 1
}
```

## Consulter les predictions enregistrees

```http
GET http://127.0.0.1:8000/api/predictions
```
