from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017/contractsense"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379"

    # Core API
    core_api_callback_url: str = "http://localhost:4000/api/core/contracts"
    internal_callback_secret: str = "change_me_internal_secret"

    # MinIO / S3
    s3_endpoint: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "contracts"

    # CORS
    cors_origins: List[str] = ["http://localhost", "http://localhost:3000"]

    # LLM
    openai_model: str = "gpt-4o"
    openai_temperature: float = 0.2

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()  # type: ignore[call-arg]
