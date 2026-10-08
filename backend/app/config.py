import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Sanjivani Commission Backend"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sanjivani_super_secret_jwt_key_2026_finance_portal")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: Supports SQLite locally or PostgreSQL on cloud/server
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sanjivani_bc.db")

settings = Settings()
