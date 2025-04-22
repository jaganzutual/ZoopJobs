from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any
import json

from database import get_db
import schemas
from repository.resume_repository import ResumeRepository
from services.resume_parser import ResumeParser

router = APIRouter(
    prefix="/api/resume",
    tags=["resume"]
)

@router.post("/parse")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Upload and parse a resume file"""
    print("Processing resume upload...")
    try:
        
        # Parse the resume
        resume_parser = ResumeParser(db)
        print("Parsing resume...")
        parsed_data = await resume_parser.parse_uploaded_resume(file, user_id)
        print("Resume parsed successfully",parsed_data)
        
        # Convert Pydantic model to dict and return as JSON
        return {
            "status": parsed_data.status,
            "message": parsed_data.message,
            "data": parsed_data.data.dict() if parsed_data.data else None,
            "error": parsed_data.error
        }
    
    except Exception as e:
        print(f"Failed to process resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.post("/save", response_model=schemas.ResumeResponse)
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
        # Parse JSON data
        parsed_data = {
            "personal_info": json.loads(personal_info),
            "education": json.loads(education),
            "work_experience": json.loads(work_experience),
            "skills": json.loads(skills)
        }
        
        # Save resume data
        resume = ResumeRepository.save_parsed_resume(db, user_id, file_name, parsed_data)
        print(f"Resume data saved for user {user_id}")
        
        return resume
    
    except SQLAlchemyError as e:
        print(f"Database error while saving resume: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error saving resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

@router.get("/{user_id}", response_model=schemas.ResumeResponse)
async def get_resume(user_id: int, db: Session = Depends(get_db)):
    """Get resume by user ID"""
    resume = ResumeRepository.get_resume(db, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{user_id}")
async def delete_resume(user_id: int, db: Session = Depends(get_db)):
    """Delete resume"""
    if ResumeRepository.delete_resume(db, user_id):
        return {"message": "Resume deleted successfully"}
    raise HTTPException(status_code=404, detail="Resume not found") 