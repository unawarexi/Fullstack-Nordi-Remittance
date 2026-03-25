"""Fraud detection API endpoints."""

from fastapi import APIRouter
from app.schemas import FraudPredictionRequest, FraudPredictionResponse
from app.ml_models import fraud_model

router = APIRouter()


@router.post("/predict", response_model=FraudPredictionResponse)
async def predict_fraud(request: FraudPredictionRequest):
    """Run fraud prediction on a transaction."""
    result = fraud_model.predict(request.model_dump())
    return FraudPredictionResponse(
        transaction_id=request.transaction_id,
        **result,
    )


@router.post("/batch-predict")
async def batch_predict(transactions: list[FraudPredictionRequest]):
    """Batch fraud prediction for multiple transactions."""
    results = []
    for tx in transactions:
        result = fraud_model.predict(tx.model_dump())
        results.append({"transaction_id": tx.transaction_id, **result})
    return {"predictions": results, "count": len(results)}
