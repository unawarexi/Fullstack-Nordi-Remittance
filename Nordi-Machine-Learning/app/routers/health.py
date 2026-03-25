"""Health check endpoint."""

from fastapi import APIRouter
from app.services.model_loader import ModelLoader

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "nordi-ml",
        "models_loaded": list(ModelLoader._models.keys()),
    }
