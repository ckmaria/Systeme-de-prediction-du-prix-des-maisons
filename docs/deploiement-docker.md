# Deploiement Docker

## Prerequis

- Installer Docker Desktop.
- Ouvrir Docker Desktop avant de lancer le projet.
- Se placer dans le dossier racine `ChikerMaria_JabriRomaissae`.

## Lancer tout le projet

```bash
docker compose up --build
```

Puis ouvrir :

```text
http://127.0.0.1:5173
```

## Services Docker

- `frontend` : React compile puis servi avec Nginx sur le port `5173`.
- `backend` : Laravel avec Python et le modele IA sur le port `8000`.
- `mysql` : base MySQL sur le port local `3307`.

La base interne utilise :

```text
DB_DATABASE=house_price_db
DB_USERNAME=laravel
DB_PASSWORD=laravel
```

## Tester l API

```bash
curl -X POST http://127.0.0.1:8000/api/predict ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"surface\":120,\"chambres\":3,\"localisation\":\"Casablanca\",\"type_bien\":\"Appartement\",\"etat\":\"Bon\",\"facades\":2,\"etage\":3,\"ascenseur\":true}"
```

Reponse attendue :

```json
{
  "prix_estime": 950000,
  "message": "Prédiction effectuée avec succès"
}
```

## Arreter le projet

```bash
docker compose down
```

## Supprimer aussi la base Docker

Attention : cette commande supprime les donnees MySQL du conteneur.

```bash
docker compose down -v
```
