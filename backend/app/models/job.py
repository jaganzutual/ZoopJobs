from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from .base import Base
import enum

class ApplicationStatus(enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"

class Job(Base):
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    description = Column(String)
    url = Column(String)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SAVED)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 