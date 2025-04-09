from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import os
import models
import schemas
from database import engine, get_db
from repository.user_repository import UserRepository
from services.resume_parser import ResumeParser
from typing import Dict, Any, Optional
import json
from pydantic import EmailStr

# Create tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZoopJobs API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3028"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to ZoopJobs API"}

# User API endpoints
@app.post("/api/users", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    # Check if user exists
    db_user = UserRepository.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    return UserRepository.create_user(db, user)

@app.get("/api/users/me", response_model=schemas.UserProfileResumeResponse)
async def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    """Get current user profile (using default user_id=1 for now)"""
    user = UserRepository.get_user(db, user_id)
    if not user:
        # For the open source single-user version, create the user if not exists
        user = UserRepository.create_user(db, schemas.UserCreate(email=None))
    
    return user

@app.put("/api/users/profile", response_model=schemas.ProfileResponse)
async def update_user_profile(profile: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Update user profile (using default user_id=1 for now)"""
    user = UserRepository.get_user(db, user_id)
    if not user:
        # For the open source single-user version, create the user if not exists
        user = UserRepository.create_user(db, schemas.UserCreate(email=None))
    
    return UserRepository.create_user_profile(db, profile, user.id)

# Resume API endpoints
@app.post("/api/resume/parse", response_model=schemas.ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    """Parse resume and extract information"""
    try:
        # Check if file is a valid resume file - this validation happens first
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file format. Please upload a PDF, DOCX, or TXT file."
            )
        
        # Parse resume
        try:
            resume_parser = ResumeParser()
            parsed_data = await resume_parser.parse_uploaded_resume(file)
            return parsed_data
        except ValueError as e:
            # Handle validation errors from the parser
            raise HTTPException(status_code=400, detail=str(e))
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle all other exceptions
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@app.post("/api/resume/save", response_model=schemas.ResumeResponse)
async def save_parsed_resume(
    file_name: str = Form(...),
    personal_info: str = Form(...),
    education: str = Form("[]"),
    work_experience: str = Form("[]"),
    skills: str = Form("[]"),
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Save parsed resume data"""
    try:
        # Get user
        user = UserRepository.get_user(db, user_id)
        if not user:
            # For the open source single-user version, create the user if not exists
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        # Parse JSON data
        parsed_data = {
            "personal_info": json.loads(personal_info),
            "education": json.loads(education),
            "work_experience": json.loads(work_experience),
            "skills": json.loads(skills)
        }
        
        # Save resume data
        resume = UserRepository.save_resume(db, user.id, file_name, parsed_data)
        
        # Update user profile with personal info
        if parsed_data["personal_info"]:
            personal_info_dict = parsed_data["personal_info"]
            profile_data = {
                "first_name": personal_info_dict.get("name", "").split(" ")[0] if " " in personal_info_dict.get("name", "") else personal_info_dict.get("name", ""),
                "last_name": " ".join(personal_info_dict.get("name", "").split(" ")[1:]) if " " in personal_info_dict.get("name", "") else "",
                "location": personal_info_dict.get("location", ""),
                "linkedin": personal_info_dict.get("linkedin", ""),
                "website": personal_info_dict.get("website", "")
            }
            
            # Add work experience info
            if parsed_data["work_experience"] and len(parsed_data["work_experience"]) > 0:
                latest_job = parsed_data["work_experience"][0]
                profile_data["job_title"] = latest_job.get("job_title", "")
                profile_data["company"] = latest_job.get("company", "")
                profile_data["is_employed"] = not latest_job.get("end_date", "")  # If end date is empty, they're still employed
            
            UserRepository.create_user_profile(db, schemas.ProfileCreate(**profile_data), user.id)
        
        return resume
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

@app.post("/api/onboarding/manual", response_model=schemas.UserProfileResumeResponse)
async def manual_onboarding(profile_data: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Complete onboarding with manually entered data"""
    try:
        # Get user
        user = UserRepository.get_user(db, user_id)
        if not user:
            # For the open source single-user version, create the user if not exists
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        # Update profile
        UserRepository.create_user_profile(db, profile_data, user.id)
        
        return UserRepository.get_user_with_profile_and_resume(db, user.id)
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}") 