"""Configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    ML_SERVICE_PORT: int = 8000
    ML_SERVICE_HOST: str = "0.0.0.0"
    MONGODB_URI: str = "mongodb://localhost:27017/nordi_remittance"
    REDIS_URL: str = "redis://localhost:6379/1"
    BACKEND_API_URL: str = "http://localhost:3000/api/v1"
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    MODEL_DIR: str = "./models/saved"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
