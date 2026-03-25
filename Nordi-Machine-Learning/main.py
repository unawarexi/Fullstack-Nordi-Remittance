"""
Nordi Machine Learning Service — FastAPI Application
Fraud detection, credit scoring, anomaly detection, and transaction classification
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import fraud, risk, anomaly, health
from app.services.database import connect_db, close_db
from app.services.model_loader import ModelLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    ModelLoader.load_all()
    yield
    await close_db()


app = FastAPI(
    title="Nordi ML Service",
    description="Machine learning microservice for fraud detection, risk scoring, and anomaly detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow backend and development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.BACKEND_API_URL.rstrip("/").rsplit("/api", 1)[0],  # extract origin from full URL
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(fraud.router, prefix="/api/v1/ml/fraud", tags=["Fraud Detection"])
app.include_router(risk.router, prefix="/api/v1/ml/risk", tags=["Risk Scoring"])
app.include_router(anomaly.router, prefix="/api/v1/ml/anomaly", tags=["Anomaly Detection"])
