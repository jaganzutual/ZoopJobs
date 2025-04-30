from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OnboardingStatus(str, Enum):
    NOT_STARTED = "not_started"
    PARTIAL = "partial" 
    COMPLETED = "completed"

class WorkExperience(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str = Field(..., description="Job title")
    employment_type: str = Field(..., description="Type of employment (Full-time, Part-time, etc.)")
    company: str = Field(..., description="Company name")
    currently_working: bool = Field(default=False, description="Whether this is the current job")
    start_month: str = Field(..., description="Start month")
    start_year: str = Field(..., description="Start year")
    end_month: Optional[str] = Field(None, description="End month")
    end_year: Optional[str] = Field(None, description="End year")
    location: Optional[str] = Field(None, description="Job location")
    location_type: Optional[str] = Field(None, description="Type of work location (Remote, Hybrid, On-site)")
    description: Optional[str] = Field(None, description="Job description")

class Education(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    institution: str = Field(..., description="Name of the educational institution")
    degree: str = Field(..., description="Degree obtained")
    field_of_study: str = Field(..., description="Field of study/major")
    start_month: str = Field(..., description="Start month")
    start_year: str = Field(..., description="Start year")
    end_month: Optional[str] = Field(None, description="End month")
    end_year: Optional[str] = Field(None, description="End year")
    description: Optional[str] = Field(None, description="Description of education")

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
    is_student: Optional[bool] = False
    linkedin: Optional[str] = None
    website: Optional[str] = None
    is_employed: Optional[bool] = True
    work_experience: List[WorkExperience] = Field(default_factory=list, description="List of work experience entries")
    education: List[Education] = Field(default_factory=list, description="List of education entries")

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