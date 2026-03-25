"""Database connection (MongoDB via Motor async driver)."""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client.get_default_database()


async def close_db():
    global _client
    if _client:
        _client.close()


def get_db():
    return _db
