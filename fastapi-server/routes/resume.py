from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from services.resume_parser import ResumeParser
from models.resume import Resume
from schemas.resume_schemas import ResumeResponse

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/parse", response_model=ResumeResponse)
async def parse_resume(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Parse an uploaded resume file and store the results in the database.
    """
    try:
        # Initialize resume parser
        parser = ResumeParser()
        
        # Parse the resume
        result = await parser.parse_uploaded_resume(file)
        
        # Store the result in the database
        db_resume = Resume(
            user_id=user_id,
            file_name=file.filename,
            parsed_data=result.data.model_dump() if result.data else None,
            status=result.status,
            error=result.error
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a parsed resume by ID.
    """
    db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    return ResumeResponse(
        status=db_resume.status,
        message="Resume retrieved successfully",
        data=db_resume.parsed_data if db_resume.parsed_data else None,
        error=db_resume.error
    )

@router.get("/user/{user_id}", response_model=list[ResumeResponse])
def get_user_resumes(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all parsed resumes for a user.
    """
    db_resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    
    return [
        ResumeResponse(
            status=resume.status,
            message="Resume retrieved successfully",
            data=resume.parsed_data if resume.parsed_data else None,
            error=resume.error
        )
        for resume in db_resumes
    ] 