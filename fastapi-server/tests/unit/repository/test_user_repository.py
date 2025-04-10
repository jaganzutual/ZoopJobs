import pytest
from sqlalchemy.orm import Session
from repository.user_repository import UserRepository
import models
import schemas
from tests.conftest import MOCK_RESUME_DATA


def test_create_user(db: Session):
    """Test creating a new user"""
    # Create a new user
    user_data = schemas.UserCreate(email="unit_test@example.com")
    user = UserRepository.create_user(db, user_data)
    
    # Verify the user was created correctly
    assert user.id is not None
    assert user.email == "unit_test@example.com"
    assert user.created_at is not None
    assert user.updated_at is not None


def test_get_user(db: Session):
    """Test getting a user by ID"""
    # Create a user to get
    user_data = schemas.UserCreate(email="get_user@example.com")
    created_user = UserRepository.create_user(db, user_data)
    
    # Get the user by ID
    user = UserRepository.get_user(db, created_user.id)
    
    # Verify the user was retrieved correctly
    assert user is not None
    assert user.id == created_user.id
    assert user.email == "get_user@example.com"


def test_get_user_by_email(db: Session):
    """Test getting a user by email"""
    # Create a user to get
    email = "get_by_email@example.com"
    user_data = schemas.UserCreate(email=email)
    UserRepository.create_user(db, user_data)
    
    # Get the user by email
    user = UserRepository.get_user_by_email(db, email)
    
    # Verify the user was retrieved correctly
    assert user is not None
    assert user.email == email
    
    # Test with a non-existent email
    non_existent = UserRepository.get_user_by_email(db, "nonexistent@example.com")
    assert non_existent is None


def test_create_user_profile(db: Session):
    """Test creating a user profile"""
    # Create a user first
    user_data = schemas.UserCreate(email="profile_test@example.com")
    user = UserRepository.create_user(db, user_data)
    
    # Create profile data
    profile_data = schemas.ProfileCreate(
        first_name="John",
        last_name="Doe",
        location="New York",
        role="Software Engineer",
        experience="5",
        is_student=False,
        job_title="Senior Developer",
        company="Tech Corp",
        linkedin="https://linkedin.com/in/johndoe",
        website="https://johndoe.com",
        is_employed=True
    )
    
    # Create the profile
    profile = UserRepository.create_user_profile(db, profile_data, user.id)
    
    # Verify profile was created correctly
    assert profile.id is not None
    assert profile.user_id == user.id
    assert profile.first_name == "John"
    assert profile.last_name == "Doe"
    assert profile.location == "New York"
    assert profile.role == "Software Engineer"
    assert profile.experience == "5"
    assert profile.is_student is False
    assert profile.job_title == "Senior Developer"
    assert profile.company == "Tech Corp"
    assert profile.linkedin == "https://linkedin.com/in/johndoe"
    assert profile.website == "https://johndoe.com"
    assert profile.is_employed is True
    
    # Test updating the profile
    updated_profile_data = schemas.ProfileUpdate(
        first_name="Johnny",
        last_name="Doe",
        experience="6"
    )
    
    updated_profile = UserRepository.create_user_profile(db, updated_profile_data, user.id)
    
    # Verify profile was updated correctly
    assert updated_profile.id == profile.id
    assert updated_profile.first_name == "Johnny"  # Updated
    assert updated_profile.last_name == "Doe"
    assert updated_profile.experience == "6"  # Updated
    # Other fields should remain the same
    assert updated_profile.location == "New York"
    assert updated_profile.role == "Software Engineer"


def test_save_resume(db: Session):
    """Test saving resume data"""
    # Create a user first
    user_data = schemas.UserCreate(email="resume_test@example.com")
    user = UserRepository.create_user(db, user_data)
    
    # Save resume data
    resume = UserRepository.save_resume(
        db, 
        user.id, 
        "test_resume.pdf", 
        MOCK_RESUME_DATA
    )
    
    # Verify resume was saved correctly
    assert resume.id is not None
    assert resume.user_id == user.id
    assert resume.file_name == "test_resume.pdf"
    assert resume.parsed_data == MOCK_RESUME_DATA
    
    # Check that related data was saved
    education_entries = db.query(models.Education).filter(models.Education.resume_id == resume.id).all()
    assert len(education_entries) == len(MOCK_RESUME_DATA["education"])
    
    work_entries = db.query(models.WorkExperience).filter(models.WorkExperience.resume_id == resume.id).all()
    assert len(work_entries) == len(MOCK_RESUME_DATA["work_experience"])
    
    skill_entries = db.query(models.Skill).filter(models.Skill.resume_id == resume.id).all()
    assert len(skill_entries) == len(MOCK_RESUME_DATA["skills"])
    
    # Test updating resume
    updated_resume = UserRepository.save_resume(
        db, 
        user.id, 
        "updated_resume.pdf", 
        MOCK_RESUME_DATA
    )
    
    # Verify resume was updated correctly
    assert updated_resume.id == resume.id  # Same ID as before (updated not created)
    assert updated_resume.file_name == "updated_resume.pdf" 