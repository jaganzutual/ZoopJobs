from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OnboardingStatus(str, Enum):
    NOT_STARTED = "not_started"
    PARTIAL = "partial" 
    COMPLETED = "completed"

# User schemas
class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    email: Optional[EmailStr] = None
    onboarding_status: Optional[OnboardingStatus] = OnboardingStatus.NOT_STARTED

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

# Profile schemas
class ProfileBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    experience: Optional[str] = None
    is_student: Optional[bool] = False
    job_title: Optional[str] = None
    company: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    is_employed: Optional[bool] = True

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

# Combined response schemas
class UserProfileResumeResponse(UserResponse):
    profile: Optional[ProfileResponse] = None
    resume: Optional[dict] = None 