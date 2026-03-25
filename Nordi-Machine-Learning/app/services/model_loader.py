"""Model loader — loads trained ML models from disk at startup."""

import os
import joblib
import structlog
from app.config import settings

logger = structlog.get_logger()


class ModelLoader:
    _models: dict = {}

    @classmethod
    def load_all(cls):
        """Load all saved models from MODEL_DIR."""
        model_dir = settings.MODEL_DIR
        if not os.path.exists(model_dir):
            os.makedirs(model_dir, exist_ok=True)
            logger.warning("model_dir_empty", path=model_dir)
            return

        for filename in os.listdir(model_dir):
            if filename.endswith(".joblib"):
                name = filename.replace(".joblib", "")
                try:
                    cls._models[name] = joblib.load(os.path.join(model_dir, filename))
                    logger.info("model_loaded", name=name)
                except Exception as e:
                    logger.error("model_load_failed", name=name, error=str(e))

    @classmethod
    def get(cls, name: str):
        return cls._models.get(name)

    @classmethod
    def has(cls, name: str) -> bool:
        return name in cls._models

    @classmethod
    def save(cls, name: str, model):
        """Save a model to disk and register it."""
        model_dir = settings.MODEL_DIR
        os.makedirs(model_dir, exist_ok=True)
        path = os.path.join(model_dir, f"{name}.joblib")
        joblib.dump(model, path)
        cls._models[name] = model
        logger.info("model_saved", name=name, path=path)
