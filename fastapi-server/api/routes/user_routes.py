from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database import get_db
import schemas
from repository.user_repository import UserRepository
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.post("", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    logger.info(f"Creating new user with email: {user.email}")
    try:
        # Check if user exists
        db_user = UserRepository.get_user_by_email(db, user.email)
        if db_user:
            logger.warning(f"User creation failed: Email {user.email} already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        new_user = UserRepository.create_user(db, user)
        logger.info(f"Successfully created user with ID: {new_user.id}")
        return new_user
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise

@router.get("/me", response_model=schemas.UserProfileResumeResponse)
async def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    """Get current user profile"""
    logger.info(f"Fetching user profile for user_id: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            logger.info(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
            logger.info(f"Created new user with ID: {user.id}")
        return user
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise

@router.put("/profile", response_model=schemas.ProfileResponse)
async def update_user_profile(profile: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Update user profile"""
    logger.info(f"Updating profile for user_id: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            logger.info(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        # Transform the education data to match the schema
        if profile.education:
            for edu in profile.education:
                if isinstance(edu, dict):
                    # Convert field names to match the schema
                    if "school" in edu:
                        edu["institution"] = edu.pop("school")
                    if "fieldOfStudy" in edu:
                        edu["field_of_study"] = edu.pop("fieldOfStudy")
                    if "startYear" in edu:
                        edu["start_date"] = edu.pop("startYear")
                    if "endYear" in edu:
                        edu["end_date"] = edu.pop("endYear")
        
        # Transform the work experience data to match the schema
        if profile.work_experience:
            for exp in profile.work_experience:
                if isinstance(exp, dict):
                    # Convert field names to match the schema
                    if "title" in exp:
                        exp["job_title"] = exp.pop("title")
                    if "employmentType" in exp:
                        exp["employment_type"] = exp.pop("employmentType")
                    if "currentlyWorking" in exp:
                        exp["is_current_job"] = exp.pop("currentlyWorking")
                    if "startMonth" in exp and "startYear" in exp:
                        exp["start_date"] = f"{exp.pop('startMonth')} {exp.pop('startYear')}"
                    if "endMonth" in exp and "endYear" in exp:
                        exp["end_date"] = f"{exp.pop('endMonth')} {exp.pop('endYear')}"
                    if "locationType" in exp:
                        exp["location_type"] = exp.pop("locationType")
        
        updated_profile = UserRepository.create_user_profile(db, profile, user.id)
        logger.info(f"Successfully updated profile for user_id: {user.id}")
        return updated_profile
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise

@router.post("/onboarding/manual", response_model=schemas.UserProfileResumeResponse)
async def manual_onboarding(profile_data: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Complete onboarding with manually entered data"""
    logger.info(f"Processing manual onboarding for user_id: {user_id}")
    try:
        # Get user
        user = UserRepository.get_user(db, user_id)
        if not user:
            logger.info(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        # Update profile
        logger.info("Updating user profile with manual onboarding data")
        UserRepository.create_user_profile(db, profile_data, user.id)
        
        result = UserRepository.get_user_with_profile_and_resume(db, user.id)
        logger.info("Manual onboarding completed successfully")
        return result
    
    except SQLAlchemyError as e:
        logger.error(f"Database error during manual onboarding: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Error during manual onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@router.get("/current", response_model=schemas.UserResponse)
async def get_current_user_status(db: Session = Depends(get_db)):
    """Check if the single user exists and return their status"""
    logger.info("Checking if user exists")
    try:
        # Since this is a single-user project, we always check for user_id = 1
        current_user = UserRepository.get_user(db, user_id=1)
        
        if not current_user:
            logger.info("No user found - redirecting to onboarding")
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "User not found",
                    "redirect": "onboarding"
                }
            )
            
        logger.info(f"Found existing user: {current_user.id}")
        return current_user
        
    except HTTPException as e:
        # Re-raise HTTPException to preserve the status code and detail
        raise e
    except SQLAlchemyError as e:
        logger.error(f"Database error while checking user status: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Error checking user status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check user status")

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    logger.info(f"Fetching user with ID: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            logger.warning(f"User with ID {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user") 