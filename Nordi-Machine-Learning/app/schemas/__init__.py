"""Pydantic schemas for API request/response."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ============================================================================
# FRAUD DETECTION
# ============================================================================

class FraudPredictionRequest(BaseModel):
    transaction_id: str
    user_id: str
    amount: float = Field(gt=0)
    currency: str
    transaction_type: str
    recipient_country: Optional[str] = None
    channel: str = "web"
    is_international: bool = False
    hour_of_day: int = Field(ge=0, le=23, default=12)
    day_of_week: int = Field(ge=0, le=6, default=3)
    user_account_age_days: int = Field(ge=0, default=0)
    user_transaction_count_30d: int = Field(ge=0, default=0)
    user_avg_transaction_amount: float = Field(ge=0, default=0.0)
    device_fingerprint: Optional[str] = None
    ip_country: Optional[str] = None


class FraudPredictionResponse(BaseModel):
    transaction_id: str
    fraud_probability: float = Field(ge=0, le=1)
    is_fraudulent: bool
    risk_factors: list[str]
    model_version: str
    confidence: float


# ============================================================================
# RISK SCORING
# ============================================================================

class RiskScoreRequest(BaseModel):
    user_id: str
    amount: float = Field(gt=0)
    currency: str
    recipient_country: Optional[str] = None
    transaction_type: str
    kyc_level: str = "pending"
    account_age_days: int = Field(ge=0, default=0)
    historical_fraud_signals: int = Field(ge=0, default=0)
    velocity_score: float = Field(ge=0, le=1, default=0.0)


class RiskTier(str, Enum):
    minimal = "minimal"
    low = "low"
    elevated = "elevated"
    high = "high"
    severe = "severe"


class RiskScoreResponse(BaseModel):
    user_id: str
    risk_score: float = Field(ge=0, le=100)
    risk_tier: RiskTier
    recommended_action: str
    factor_breakdown: dict[str, float]
    model_version: str


# ============================================================================
# ANOMALY DETECTION
# ============================================================================

class AnomalyDetectionRequest(BaseModel):
    user_id: str
    transactions: list[dict]  # recent transaction feature vectors
    current_transaction: dict


class AnomalyDetectionResponse(BaseModel):
    user_id: str
    anomaly_score: float = Field(ge=0, le=1)
    is_anomalous: bool
    anomaly_type: Optional[str] = None
    explanation: str
    model_version: str
