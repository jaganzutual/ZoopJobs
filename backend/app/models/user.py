from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # LLM API key storage (encrypted)
    llm_api_key = Column(String)
    llm_provider = Column(String)  # e.g., "openai", "together" 