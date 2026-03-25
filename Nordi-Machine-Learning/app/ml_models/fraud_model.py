"""
Fraud Detection ML Model
Uses a trained Random Forest classifier + feature engineering pipeline.
Falls back to rule-based scoring if no trained model is available.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from app.services.model_loader import ModelLoader

# FATF high-risk jurisdictions
HIGH_RISK_COUNTRIES = {"IR", "KP", "MM", "SY", "YE", "AF", "LY", "SO", "SD"}
MEDIUM_RISK_COUNTRIES = {"PK", "NG", "VN", "BD", "KH", "LA", "ML", "SN", "TZ"}

MODEL_NAME = "fraud_detector_v1"
MODEL_VERSION = "1.0.0"


def extract_features(data: dict) -> np.ndarray:
    """Convert raw transaction data into a feature vector."""
    features = [
        data.get("amount", 0),
        data.get("hour_of_day", 12),
        data.get("day_of_week", 3),
        1 if data.get("is_international", False) else 0,
        data.get("user_account_age_days", 0),
        data.get("user_transaction_count_30d", 0),
        data.get("user_avg_transaction_amount", 0),
        # Amount deviation from user average
        (data.get("amount", 0) / max(data.get("user_avg_transaction_amount", 1), 1)),
        # Country risk score
        2 if data.get("recipient_country", "") in HIGH_RISK_COUNTRIES else
        1 if data.get("recipient_country", "") in MEDIUM_RISK_COUNTRIES else 0,
        # Channel encoding
        {"web": 0, "mobile": 1, "api": 2, "branch": 3, "atm": 4}.get(data.get("channel", "web"), 0),
        # Transaction type encoding
        {"deposit": 0, "withdrawal": 1, "transfer": 2, "payment": 3, "exchange": 4}.get(
            data.get("transaction_type", "transfer"), 2
        ),
    ]
    return np.array(features).reshape(1, -1)


def predict(data: dict) -> dict:
    """
    Predict fraud probability for a transaction.
    Uses trained model if available, otherwise falls back to rule-based scoring.
    """
    features = extract_features(data)
    model = ModelLoader.get(MODEL_NAME)

    if model is not None:
        proba = model.predict_proba(features)[0]
        fraud_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
    else:
        # Rule-based fallback scoring
        fraud_prob = _rule_based_score(data)

    risk_factors = _identify_risk_factors(data, fraud_prob)

    return {
        "fraud_probability": round(fraud_prob, 4),
        "is_fraudulent": fraud_prob >= 0.7,
        "risk_factors": risk_factors,
        "model_version": MODEL_VERSION,
        "confidence": 0.85 if model else 0.6,
    }


def _rule_based_score(data: dict) -> float:
    """Fallback scoring when no trained model is available."""
    score = 0.0

    # High amount relative to user average
    avg = max(data.get("user_avg_transaction_amount", 1), 1)
    deviation = data.get("amount", 0) / avg
    if deviation > 5:
        score += 0.3
    elif deviation > 3:
        score += 0.15

    # New account with high-value transaction
    if data.get("user_account_age_days", 0) < 30 and data.get("amount", 0) > 1000:
        score += 0.2

    # International to high-risk country
    if data.get("recipient_country", "") in HIGH_RISK_COUNTRIES:
        score += 0.25
    elif data.get("recipient_country", "") in MEDIUM_RISK_COUNTRIES:
        score += 0.1

    # Unusual hour (midnight to 5 AM)
    hour = data.get("hour_of_day", 12)
    if 0 <= hour <= 5:
        score += 0.1

    # Low transaction count (behavioral anomaly harder to establish)
    if data.get("user_transaction_count_30d", 0) < 3:
        score += 0.05

    return min(score, 1.0)


def _identify_risk_factors(data: dict, score: float) -> list[str]:
    """Identify human-readable risk factors."""
    factors = []

    avg = max(data.get("user_avg_transaction_amount", 1), 1)
    if data.get("amount", 0) / avg > 3:
        factors.append("Amount significantly above user average")

    if data.get("user_account_age_days", 0) < 30:
        factors.append("New account (< 30 days)")

    if data.get("recipient_country", "") in HIGH_RISK_COUNTRIES:
        factors.append(f"High-risk destination country: {data.get('recipient_country')}")

    hour = data.get("hour_of_day", 12)
    if 0 <= hour <= 5:
        factors.append("Unusual transaction hour (midnight–5AM)")

    if data.get("is_international", False):
        factors.append("International transaction")

    return factors


def build_training_pipeline() -> Pipeline:
    """Create a training pipeline for the fraud detection model."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", GradientBoostingClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
        )),
    ])
