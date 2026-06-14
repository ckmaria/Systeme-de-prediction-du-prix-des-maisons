import json
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
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


def parse_bool(value) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value > 0)
    return int(str(value).strip().lower() in {"true", "1", "oui", "yes"})


def normalize(payload: dict) -> dict:
    return {
        "surface": float(payload.get("surface", 0)),
        "chambres": int(payload.get("chambres", 0)),
        "localisation": str(payload.get("localisation", "Autre")),
        "type_bien": str(payload.get("type_bien", "Appartement")),
        "etat": str(payload.get("etat", "Bon")),
        "facades": int(payload.get("facades", 0)),
        "etage": int(payload.get("etage", 0) or 0),
        "ascenseur": parse_bool(payload.get("ascenseur", False)),
    }


def fallback_price(data: dict) -> float:
    city_factor = {
        "Casablanca": 6500,
        "Rabat": 6200,
        "Marrakech": 5800,
        "Tanger": 5600,
        "Agadir": 5300,
        "Fes": 4300,
        "Autre": 4000,
    }
    type_bonus = {
        "Appartement": 0,
        "Maison": 120000,
        "Villa": 360000,
        "Studio": -90000,
    }
    state_factor = {
        "Neuf": 1.16,
        "Bon": 1.0,
        "A renover": 0.82,
    }

    base_meter_price = city_factor.get(data["localisation"], city_factor["Autre"])
    price = data["surface"] * base_meter_price
    price += data["chambres"] * 30000
    price += data["facades"] * 25000
    price += data["ascenseur"] * 30000
    price -= max(data["etage"] - 4, 0) * 12000
    price += type_bonus.get(data["type_bien"], 0)
    price *= state_factor.get(data["etat"], 1.0)
    return max(price, 150000)


def read_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw and len(sys.argv) > 1:
        raw = sys.argv[1]
    if not raw:
        raise ValueError("Aucune donnee JSON recue par le script IA.")
    return json.loads(raw)


def main() -> None:
    payload = normalize(read_payload())

    if MODEL_PATH.exists():
        import pandas as pd
        from joblib import load

        bundle = load(MODEL_PATH)
        pipeline = bundle["pipeline"]
        frame = pd.DataFrame([payload], columns=FEATURES)
        price = float(pipeline.predict(frame)[0])
        source = "modele_scikit_learn"
    else:
        price = fallback_price(payload)
        source = "formule_secours"

    print(
        json.dumps(
            {
                "prix_estime": int(round(price)),
                "source": source,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
