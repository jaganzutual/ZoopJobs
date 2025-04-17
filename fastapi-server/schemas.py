from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

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
    
    class Config:
        orm_mode = True

# Resume schemas
class EducationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class WorkExperienceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    company: Optional[str] = None
    job_title: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class SkillBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str] = None
    category: Optional[str] = None

class ResumeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    file_name: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(ResumeBase):
    education: Optional[List[EducationBase]] = []
    work_experience: Optional[List[WorkExperienceBase]] = []
    skills: Optional[List[SkillBase]] = []

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    education: List[EducationBase] = []
    work_experience: List[WorkExperienceBase] = []
    skills: List[SkillBase] = []
    
    class Config:
        orm_mode = True

# Combined schemas for API responses
class UserProfileResponse(UserResponse):
    profile: Optional[ProfileResponse] = None
    
    class Config:
        orm_mode = True

class UserProfileResumeResponse(UserProfileResponse):
    resume: Optional[ResumeResponse] = None
    
    class Config:
        orm_mode = True

# Resume parsing response
class ResumeParseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    personal_info: Dict[str, Any]
    education: List[Dict[str, Any]] = []
    work_experience: List[Dict[str, Any]] = []
    skills: List[Dict[str, Any]] = [] 