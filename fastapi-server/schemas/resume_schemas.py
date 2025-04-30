from pydantic import BaseModel, Field, field_validator, ConfigDict, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class PersonalInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str] = Field(None, description="Full name of the person")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="Location/address")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL")
    website: Optional[str] = Field(None, description="Personal website URL")
    summary: Optional[str] = Field(None, description="Professional summary")

class Education(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    institution: Optional[str] = Field(None, description="Name of the educational institution")
    degree: Optional[str] = Field(None, description="Degree obtained")
    field_of_study: Optional[str] = Field(None, description="Field of study/major")
    start_date: Optional[str] = Field(None, description="Start date of education")
    end_date: Optional[str] = Field(None, description="End date of education")
    description: Optional[str] = Field(None, description="Description of education")

class WorkExperience(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    company: Optional[str] = Field(None, description="Company name")
    job_title: Optional[str] = Field(None, description="Job title/position")
    start_date: Optional[datetime] = Field(None, description="Start date of work")
    end_date: Optional[datetime] = Field(None, description="End date of work")
    is_current_job: bool = Field(default=False, description="Whether this is the current job")
    description: Optional[str] = Field(None, description="Job description and responsibilities")

    @validator('end_date', pre=True, always=True)
    def validate_end_date(cls, v, values):
        if values.get('is_current_job'):
            return None
        return v

    @validator('start_date', 'end_date')
    def parse_dates(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d")
            except ValueError:
                try:
                    return datetime.strptime(v, "%Y-%m")
                except ValueError:
                    try:
                        return datetime.strptime(v, "%Y")
                    except ValueError:
                        raise ValueError("Date must be in YYYY-MM-DD, YYYY-MM, or YYYY format")
        return v

    @validator('end_date')
    def validate_date_order(cls, v, values):
        if v and values.get('start_date') and v < values['start_date']:
            raise ValueError("End date must be after start date")
        return v

class Skill(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(..., description="Name of the skill")
    category: Optional[str] = Field(None, description="Category of the skill")

class ResumeData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    personal_info: PersonalInfo = Field(..., description="Personal information")
    education: List[Education] = Field(default_factory=list, description="List of education entries", min_items=1)
    work_experience: List[WorkExperience] = Field(default_factory=list, description="List of work experience entries", min_items=1)
    skills: List[Skill] = Field(default_factory=list, description="List of skills", min_items=1)

    @field_validator('education')
    def validate_education(cls, v):
        if not isinstance(v, list):
            v = [v] if v is not None else []
        if len(v) < 1:
            raise ValueError("education must contain at least one entry")
        return v

    @field_validator('work_experience')
    def validate_work_experience(cls, v):
        if not isinstance(v, list):
            v = [v] if v is not None else []
        if len(v) < 1:
            raise ValueError("work_experience must contain at least one entry")
        return v

    @field_validator('skills')
    def validate_skills(cls, v):
        if not isinstance(v, list):
            v = [v] if v is not None else []
        if len(v) < 1:
            raise ValueError("skills must contain at least one entry")
        return v

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str = Field(..., description="Status of the parsing operation")
    message: str = Field(..., description="Message describing the operation result")
    data: Optional[ResumeData] = Field(None, description="Parsed resume data")
    error: Optional[str] = Field(None, description="Error message if any")

class ResumeParseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    personal_info: Optional[PersonalInfo] = Field(default_factory=PersonalInfo, description="Parsed personal information")
    education: List[Education] = Field(default_factory=list, description="Parsed education entries")
    work_experience: List[WorkExperience] = Field(default_factory=list, description="Parsed work experience entries")
    skills: List[Skill] = Field(default_factory=list, description="Parsed skills") 