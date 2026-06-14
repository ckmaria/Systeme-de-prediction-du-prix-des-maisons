from pathlib import Path

import pandas as pd
from joblib import dump
from sklearn.compose import ColumnTransformer
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "maisons.csv"
MODEL_PATH = BASE_DIR / "models" / "house_price_model.joblib"

FEATURES = [
    "surface",
    "chambres",
    "localisation",
    "type_bien",
    "etat",
    "facades",
    "etage",
    "ascenseur",
]

NUMERIC_FEATURES = ["surface", "chambres", "facades", "etage", "ascenseur"]
CATEGORICAL_FEATURES = ["localisation", "type_bien", "etat"]


def build_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset introuvable: {DATA_PATH}")

    data = pd.read_csv(DATA_PATH)
    missing_columns = set(FEATURES + ["prix"]) - set(data.columns)

    if missing_columns:
        raise ValueError(f"Colonnes manquantes dans le dataset: {sorted(missing_columns)}")

    x = data[FEATURES]
    y = data["prix"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", build_encoder(), CATEGORICAL_FEATURES),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )

    model = DecisionTreeRegressor(
        random_state=42,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    metrics = {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 2),
        "r2": round(float(r2_score(y_test, predictions)), 4),
        "rows": int(len(data)),
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    pipeline.fit(x, y)

    dump(
        {
            "pipeline": pipeline,
            "features": FEATURES,
            "metrics": metrics,
        },
        MODEL_PATH,
    )

    print(f"Modele entraine et enregistre: {MODEL_PATH}")
    print(f"MAE: {metrics['mae']} MAD")
    print(f"R2: {metrics['r2']}")


if __name__ == "__main__":
    main()
