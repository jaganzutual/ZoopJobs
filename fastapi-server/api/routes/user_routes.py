from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database import get_db
import schemas
from repository.user_repository import UserRepository

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.post("", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    print(f"Creating new user with email: {user.email}")
    try:
        # Check if user exists
        db_user = UserRepository.get_user_by_email(db, user.email)
        if db_user:
            print(f"User creation failed: Email {user.email} already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        new_user = UserRepository.create_user(db, user)
        print(f"Successfully created user with ID: {new_user.id}")
        return new_user
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        raise

@router.get("/me", response_model=schemas.UserProfileResumeResponse)
async def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    """Get current user profile"""
    print(f"Fetching user profile for user_id: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            print(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
            print(f"Created new user with ID: {user.id}")
        return user
    except Exception as e:
        print(f"Error fetching user profile: {str(e)}")
        raise

@router.put("/profile", response_model=schemas.ProfileResponse)
async def update_user_profile(profile: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Update user profile"""
    print(f"Updating profile for user_id: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            print(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        updated_profile = UserRepository.create_user_profile(db, profile, user.id)
        print(f"Successfully updated profile for user_id: {user.id}")
        return updated_profile
    except Exception as e:
        print(f"Error updating user profile: {str(e)}")
        raise

@router.post("/onboarding/manual", response_model=schemas.UserProfileResumeResponse)
async def manual_onboarding(profile_data: schemas.ProfileCreate, user_id: int = 1, db: Session = Depends(get_db)):
    """Complete onboarding with manually entered data"""
    print(f"Processing manual onboarding for user_id: {user_id}")
    try:
        # Get user
        user = UserRepository.get_user(db, user_id)
        if not user:
            print(f"User {user_id} not found, creating new user")
            user = UserRepository.create_user(db, schemas.UserCreate(email=None))
        
        # Update profile
        print("Updating user profile with manual onboarding data")
        UserRepository.create_user_profile(db, profile_data, user.id)
        
        result = UserRepository.get_user_with_profile_and_resume(db, user.id)
        print("Manual onboarding completed successfully")
        return result
    
    except SQLAlchemyError as e:
        print(f"Database error during manual onboarding: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error during manual onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    print(f"Fetching user with ID: {user_id}")
    try:
        user = UserRepository.get_user(db, user_id)
        if not user:
            print(f"User with ID {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except SQLAlchemyError as e:
        print(f"Database error while fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user")

@router.get("/current", response_model=schemas.UserResponse)
async def get_current_user_status(db: Session = Depends(get_db)):
    """Get current authenticated user and their status"""
    print("Fetching current user status")
    try:
        # TODO: Replace this with actual authentication logic to get current user
        # This should use proper authentication middleware/dependency
        current_user = UserRepository.get_user(db, user_id=1)  # Temporary hardcoded user
        if not current_user:
            print("Current user not found")
            raise HTTPException(status_code=404, detail="User not found")
            
        # You can add additional status information here
        return current_user
    except SQLAlchemyError as e:
        print(f"Database error while fetching current user: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        print(f"Error fetching current user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch current user") 