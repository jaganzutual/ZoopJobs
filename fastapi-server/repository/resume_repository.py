from sqlalchemy.orm import Session
import models
import schemas
from typing import Optional, Dict, Any
import os
from fastapi import UploadFile
import shutil
from datetime import datetime

class ResumeRepository:
    @staticmethod
    def save_parsed_resume(db: Session, user_id: int, file_name: str, parsed_data: Dict[str, Any]) -> models.Resume:
        """Save or update parsed resume data"""
        # Check if resume exists
        db_resume = db.query(models.Resume).filter(models.Resume.user_id == user_id).first()
        
        if db_resume:
            # Update existing resume
            db_resume.file_name = file_name
            db_resume.parsed_data = parsed_data
            db_resume.updated_at = datetime.utcnow()
        else:
            # Create new resume
            db_resume = models.Resume(
                user_id=user_id,
                file_name=file_name,
                parsed_data=parsed_data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(db_resume)
        
        # Add education entries
        if "education" in parsed_data and parsed_data["education"]:
            for edu in parsed_data["education"]:
                db_edu = models.Education(
                    resume_id=db_resume.id,
                    institution=edu.get("institution", ""),
                    degree=edu.get("degree", ""),
                    field_of_study=edu.get("field_of_study", ""),
                    start_date=edu.get("start_date", ""),
                    end_date=edu.get("end_date", ""),
                    description=edu.get("description", "")
                )
                db.add(db_edu)
        
        # Add work experience entries
        if "work_experience" in parsed_data and parsed_data["work_experience"]:
            for exp in parsed_data["work_experience"]:
                db_exp = models.WorkExperience(
                    resume_id=db_resume.id,
                    company=exp.get("company", ""),
                    job_title=exp.get("job_title", ""),
                    start_date=exp.get("start_date", ""),
                    end_date=exp.get("end_date", ""),
                    description=exp.get("description", "")
                )
                db.add(db_exp)
        
        # Add skills
        if "skills" in parsed_data and parsed_data["skills"]:
            for skill in parsed_data["skills"]:
                db_skill = models.Skill(
                    resume_id=db_resume.id,
                    name=skill.get("name", ""),
                    category=skill.get("category", "")
                )
                db.add(db_skill)
        
        db.commit()
        db.refresh(db_resume)
        return db_resume

    @staticmethod
    def get_resume(db: Session, user_id: int) -> Optional[models.Resume]:
        """Get resume by user ID"""
        return db.query(models.Resume).filter(models.Resume.user_id == user_id).first()

    @staticmethod
    def delete_resume(db: Session, user_id: int) -> bool:
        """Delete resume"""
        db_resume = ResumeRepository.get_resume(db, user_id)
        if db_resume:
            # Delete from database
            db.delete(db_resume)
            db.commit()
            return True
        return False 