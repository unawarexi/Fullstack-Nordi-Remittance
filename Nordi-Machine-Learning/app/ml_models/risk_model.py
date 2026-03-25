"""
Risk Scoring ML Model
Multi-factor weighted risk assessment with ML-enhanced factor scoring.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from app.services.model_loader import ModelLoader

MODEL_NAME = "risk_scorer_v1"
MODEL_VERSION = "1.0.0"

# Factor weights (must sum to 1.0)
WEIGHTS = {
    "account_maturity": 0.10,
    "kyc_level": 0.12,
    "amount_deviation": 0.18,
    "recipient_risk": 0.15,
    "channel_risk": 0.10,
    "velocity_risk": 0.12,
    "fraud_history": 0.13,
    "temporal_risk": 0.05,
    "international_risk": 0.05,
}

FATF_HIGH_RISK = {"IR", "KP", "MM", "SY", "YE", "AF", "LY", "SO", "SD"}


def score(data: dict) -> dict:
    """Calculate multi-factor risk score (0-100)."""
    factors = {}

    # 1. Account maturity (newer = higher risk)
    age = data.get("account_age_days", 0)
    if age < 7:
        factors["account_maturity"] = 95
    elif age < 30:
        factors["account_maturity"] = 70
    elif age < 90:
        factors["account_maturity"] = 40
    elif age < 365:
        factors["account_maturity"] = 15
    else:
        factors["account_maturity"] = 5

    # 2. KYC level
    kyc = data.get("kyc_level", "pending")
    kyc_scores = {"approved": 5, "in_review": 40, "pending": 80, "rejected": 100}
    factors["kyc_level"] = kyc_scores.get(kyc, 60)

    # 3. Amount deviation
    amount = data.get("amount", 0)
    avg = max(data.get("user_avg_transaction_amount", amount), 1)
    deviation = amount / avg
    factors["amount_deviation"] = min(deviation * 20, 100)

    # 4. Recipient risk
    country = data.get("recipient_country", "")
    if country in FATF_HIGH_RISK:
        factors["recipient_risk"] = 95
    elif country:
        factors["recipient_risk"] = 30
    else:
        factors["recipient_risk"] = 10

    # 5. Channel risk
    channel_scores = {"branch": 5, "web": 25, "mobile": 30, "api": 50, "atm": 40}
    factors["channel_risk"] = channel_scores.get(data.get("channel", "web"), 30)

    # 6. Velocity
    factors["velocity_risk"] = min(data.get("velocity_score", 0) * 100, 100)

    # 7. Fraud history
    signals = data.get("historical_fraud_signals", 0)
    factors["fraud_history"] = min(signals * 25, 100)

    # 8. Temporal (unusual hours)
    hour = data.get("hour_of_day", 12)
    factors["temporal_risk"] = 60 if 0 <= hour <= 5 else 10

    # 9. International
    factors["international_risk"] = 50 if data.get("is_international", False) else 5

    # Calculate weighted score
    total = sum(factors[k] * WEIGHTS[k] for k in factors if k in WEIGHTS)
    total = round(min(max(total, 0), 100), 2)

    # Determine tier
    if total < 15:
        tier = "minimal"
        action = "approve"
    elif total < 35:
        tier = "low"
        action = "approve"
    elif total < 60:
        tier = "elevated"
        action = "enhanced_monitoring"
    elif total < 80:
        tier = "high"
        action = "manual_review"
    else:
        tier = "severe"
        action = "block"

    return {
        "risk_score": total,
        "risk_tier": tier,
        "recommended_action": action,
        "factor_breakdown": {k: round(v, 2) for k, v in factors.items()},
        "model_version": MODEL_VERSION,
    }


def build_training_pipeline() -> Pipeline:
    """Training pipeline for ML-enhanced risk scoring."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", GradientBoostingRegressor(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
        )),
    ])
