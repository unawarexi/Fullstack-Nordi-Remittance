"""Risk scoring API endpoints."""

from fastapi import APIRouter
from app.schemas import RiskScoreRequest, RiskScoreResponse
from app.ml_models import risk_model

router = APIRouter()


@router.post("/score", response_model=RiskScoreResponse)
async def score_risk(request: RiskScoreRequest):
    """Calculate risk score for a transaction/user."""
    result = risk_model.score(request.model_dump())
    return RiskScoreResponse(
        user_id=request.user_id,
        **result,
    )
