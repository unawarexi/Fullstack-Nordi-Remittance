"""Anomaly detection API endpoints."""

from fastapi import APIRouter
from app.schemas import AnomalyDetectionRequest, AnomalyDetectionResponse
from app.ml_models import anomaly_model

router = APIRouter()


@router.post("/detect", response_model=AnomalyDetectionResponse)
async def detect_anomaly(request: AnomalyDetectionRequest):
    """Detect anomalies in a transaction based on user's historical patterns."""
    result = anomaly_model.detect(request.model_dump())
    return AnomalyDetectionResponse(
        user_id=request.user_id,
        **result,
    )
