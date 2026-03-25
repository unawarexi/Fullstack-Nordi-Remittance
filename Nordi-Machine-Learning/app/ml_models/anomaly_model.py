"""
Anomaly Detection ML Model
Isolation Forest + statistical methods for transaction anomaly detection.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from app.services.model_loader import ModelLoader

MODEL_NAME = "anomaly_detector_v1"
MODEL_VERSION = "1.0.0"


def detect(data: dict) -> dict:
    """
    Detect anomalies in a transaction given user's historical patterns.
    Uses Isolation Forest if trained model exists, otherwise statistical methods.
    """
    current = data.get("current_transaction", {})
    history = data.get("transactions", [])

    model = ModelLoader.get(MODEL_NAME)

    if model is not None and len(history) >= 10:
        return _ml_detect(model, current, history)

    return _statistical_detect(current, history)


def _ml_detect(model, current: dict, history: list[dict]) -> dict:
    """ML-based detection using trained Isolation Forest."""
    features = _extract_features(current)
    score = model.decision_function(features.reshape(1, -1))[0]
    # Isolation Forest: negative = anomalous, positive = normal
    # Normalize to 0-1 where 1 = most anomalous
    anomaly_score = max(0, min(1, 0.5 - score))

    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_anomalous": anomaly_score >= 0.6,
        "anomaly_type": _classify_anomaly(current, history) if anomaly_score >= 0.6 else None,
        "explanation": _explain(current, history, anomaly_score),
        "model_version": MODEL_VERSION,
    }


def _statistical_detect(current: dict, history: list[dict]) -> dict:
    """Statistical fallback when no trained model is available."""
    if len(history) < 3:
        return {
            "anomaly_score": 0.3,
            "is_anomalous": False,
            "anomaly_type": None,
            "explanation": "Insufficient history for anomaly detection",
            "model_version": f"{MODEL_VERSION}-statistical",
        }

    amounts = [t.get("amount", 0) for t in history]
    current_amount = current.get("amount", 0)

    # Modified Z-score (robust to outliers)
    median = float(np.median(amounts))
    mad = float(np.median(np.abs(np.array(amounts) - median)))
    mad = max(mad, 0.01)  # avoid division by zero
    z_score = abs(0.6745 * (current_amount - median) / mad)

    # Normalize z-score to 0-1
    anomaly_score = min(z_score / 5.0, 1.0)

    # Time-based anomaly
    hours = [t.get("hour_of_day", 12) for t in history]
    current_hour = current.get("hour_of_day", 12)
    avg_hour = np.mean(hours)
    hour_deviation = abs(current_hour - avg_hour)
    if hour_deviation > 8:
        anomaly_score = min(anomaly_score + 0.2, 1.0)

    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_anomalous": anomaly_score >= 0.6,
        "anomaly_type": _classify_anomaly(current, history) if anomaly_score >= 0.6 else None,
        "explanation": _explain(current, history, anomaly_score),
        "model_version": f"{MODEL_VERSION}-statistical",
    }


def _extract_features(tx: dict) -> np.ndarray:
    """Extract feature vector from a transaction."""
    return np.array([
        tx.get("amount", 0),
        tx.get("hour_of_day", 12),
        tx.get("day_of_week", 3),
        1 if tx.get("is_international", False) else 0,
        {"web": 0, "mobile": 1, "api": 2, "branch": 3, "atm": 4}.get(tx.get("channel", "web"), 0),
    ])


def _classify_anomaly(current: dict, history: list[dict]) -> str:
    """Classify the type of anomaly."""
    amounts = [t.get("amount", 0) for t in history]
    avg_amount = np.mean(amounts) if amounts else 0

    if current.get("amount", 0) > avg_amount * 5:
        return "amount_spike"
    if current.get("hour_of_day", 12) in range(0, 6):
        return "unusual_time"
    if current.get("is_international", False) and not any(t.get("is_international") for t in history[-10:]):
        return "new_international"
    return "behavioral_deviation"


def _explain(current: dict, history: list[dict], score: float) -> str:
    """Generate human-readable explanation."""
    if score < 0.3:
        return "Transaction appears consistent with user's normal patterns."
    if score < 0.6:
        return "Minor deviation from normal patterns detected. Monitoring recommended."

    parts = []
    amounts = [t.get("amount", 0) for t in history] if history else [0]
    avg = np.mean(amounts)
    if current.get("amount", 0) > avg * 3:
        parts.append(f"Amount ({current.get('amount')}) is {current.get('amount', 0) / max(avg, 1):.1f}x the user average")
    if current.get("hour_of_day", 12) in range(0, 6):
        parts.append("Transaction at unusual hour (midnight-6AM)")

    return "Anomaly detected: " + "; ".join(parts) if parts else "Significant deviation from established patterns."


def build_training_pipeline() -> Pipeline:
    """Training pipeline for Isolation Forest anomaly detector."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("detector", IsolationForest(
            n_estimators=200,
            contamination=0.05,
            random_state=42,
        )),
    ])
