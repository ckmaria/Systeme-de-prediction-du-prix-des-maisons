# Systeme de prediction du prix des maisons

Projet academique realise avec Laravel, React/Vite, MySQL et Python Scikit-learn.

## Analyse du ZIP initial

L'archive fournie contenait les documents du projet et `IA.txt`, mais ne contenait pas les dossiers annonces (`backend-laravel`, `frontend-react`, `ia`, `database`, `docs`, `scripts`). La structure fonctionnelle a donc ete creee et completee dans ce dossier.

## Structure

```text
backend-laravel/   API Laravel, migration MySQL, modele Prediction
frontend-react/    Interface React/Vite et appels Axios
ia/                Dataset, entrainement Scikit-learn, script predict.py
database/          Script SQL MySQL
docs/              Repartition des taches, Postman, captures a ajouter
scripts/           Scripts Windows pour lancer rapidement le projet
```

## Prerequis

- PHP 8.2 ou plus
- Composer
- Node.js 18 ou plus
- Python 3.10 ou plus
- MySQL

## 1. Creer la base MySQL

Dans MySQL :

```sql
CREATE DATABASE house_price_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ou importez :

```bash
mysql -u root -p < database/schema.sql
```

## 2. Entrainer le modele IA

```bash
cd ia
pip install pandas numpy scikit-learn joblib
python train_model.py
```

Sur Windows, si `python` n'est pas reconnu, utilisez :

```powershell
py train_model.py
```

## 3. Lancer le backend Laravel

```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Sur Windows PowerShell, si `cp` ne fonctionne pas :

```powershell
Copy-Item .env.example .env
```

Verifiez dans `.env` :

```env
DB_DATABASE=house_price_db
DB_USERNAME=root
DB_PASSWORD=
IA_PYTHON_BIN=python
IA_PREDICT_SCRIPT=../ia/predict.py
```

Sur Windows, si l'appel IA echoue avec `python`, mettez `IA_PYTHON_BIN=py` ou le chemin complet retourne par :

```powershell
py -c "import sys; print(sys.executable)"
```

## 4. Lancer le frontend React

```bash
cd frontend-react
npm install
npm run dev
```

Si besoin, creez le fichier `.env` :

```bash
cp .env.example .env
```

L'application React utilise :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## API principale

```http
POST http://127.0.0.1:8000/api/predict
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

Reponse :

```json
{
  "prix_estime": 950000,
  "message": "Prédiction effectuée avec succès",
  "prediction_id": 1
}
```

Les predictions sont sauvegardees dans la table MySQL `predictions`.

## Consulter les predictions

```http
GET http://127.0.0.1:8000/api/predictions
```

## Tests Postman

Importez le fichier :

```text
docs/postman_collection.json
```

## Deploiement avec Docker

Prerequis : installer et ouvrir Docker Desktop.

Depuis le dossier racine du projet :

```bash
docker compose up --build
```

Puis ouvrir :

```text
http://127.0.0.1:5173
```

Services lances :

- React + Nginx : `http://127.0.0.1:5173`
- Laravel API : `http://127.0.0.1:8000`
- MySQL Docker : port local `3307`, port interne `3306`

Pour arreter :

```bash
docker compose down
```

Pour supprimer aussi les donnees MySQL Docker :

```bash
docker compose down -v
```

Un script Windows est disponible :

```text
scripts/Lancer_Docker.bat
```

Documentation detaillee : `docs/deploiement-docker.md`.

## Repartition des taches

Voir `docs/repartition_taches.md`.
