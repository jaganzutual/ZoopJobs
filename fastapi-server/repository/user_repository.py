from sqlalchemy.orm import Session
import sys
import os



# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import User, Profile, Resume, Education, WorkExperience, Skill
from schemas.user_schemas import UserCreate, ProfileCreate, OnboardingStatus
from typing import Optional, List, Dict, Any

class UserRepository:
    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user"""
        db_user = User(
            email=user.email,
            onboarding_status=OnboardingStatus.NOT_STARTED.value
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_user_profile(db: Session, profile: ProfileCreate, user_id: int) -> Profile:
        """Create or update user profile"""
        # Check if profile exists
        db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        
        if db_profile:
            # Update existing profile
            profile_data = profile.model_dump(exclude_unset=True)
            for field, value in profile_data.items():
                setattr(db_profile, field, value)
        else:
            # Create new profile
            profile_data = profile.model_dump(exclude_unset=True)
            db_profile = Profile(
                user_id=user_id,
                **profile_data
            )
            db.add(db_profile)
        
        db.commit()
        db.refresh(db_profile)
        return db_profile
    
    @staticmethod
    def save_resume(db: Session, user_id: int, file_name: str, parsed_data: Dict[str, Any]) -> Resume:
        """Save or update resume data"""
        # Check if resume exists
        db_resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        
        if db_resume:
            # Update existing resume
            db_resume.file_name = file_name
            db_resume.parsed_data = parsed_data
            
            # Clean up old relations
            db.query(Education).filter(Education.resume_id == db_resume.id).delete()
            db.query(WorkExperience).filter(WorkExperience.resume_id == db_resume.id).delete()
            db.query(Skill).filter(Skill.resume_id == db_resume.id).delete()
        else:
            # Create new resume
            db_resume = Resume(
                user_id=user_id,
                file_name=file_name,
                parsed_data=parsed_data
            )
            db.add(db_resume)
            db.commit()
            db.refresh(db_resume)
        
        # Add education entries
        if "education" in parsed_data and parsed_data["education"]:
            for edu in parsed_data["education"]:
                db_edu = Education(
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
                db_exp = WorkExperience(
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
                db_skill = Skill(
                    resume_id=db_resume.id,
                    name=skill.get("name", ""),
                    category=skill.get("category", "")
                )
                db.add(db_skill)
        
        db.commit()
        db.refresh(db_resume)
        return db_resume
    
    @staticmethod
    def get_user_with_profile_and_resume(db: Session, user_id: int) -> Optional[User]:
        """Get user with profile and resume data"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_onboarding_status(db: Session, user_id: int, status: OnboardingStatus) -> User:
        """Update user's onboarding status"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db_user.onboarding_status = status.value
            db.commit()
            db.refresh(db_user)
        return db_user 