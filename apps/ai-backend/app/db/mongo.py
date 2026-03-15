import motor.motor_asyncio
from app.config import settings

_client: motor.motor_asyncio.AsyncIOMotorClient | None = None
_db: motor.motor_asyncio.AsyncIOMotorDatabase | None = None


async def connect_mongo() -> None:
    global _client, _db
    _client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client.get_default_database()
    print("[mongo] Connected")


async def disconnect_mongo() -> None:
    global _client
    if _client:
        _client.close()
        print("[mongo] Disconnected")


def get_db() -> motor.motor_asyncio.AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB not connected. Call connect_mongo() first.")
    return _db
