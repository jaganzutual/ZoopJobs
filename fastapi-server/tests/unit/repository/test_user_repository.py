import pytest
from sqlalchemy.orm import Session
from repository.user_repository import UserRepository
import models
import schemas
from tests.conftest import MOCK_RESUME_DATA
from datetime import datetime


def test_create_user(db: Session):
    """Test creating a new user"""
    user_data = schemas.UserCreate(email="test@example.com")
    user = UserRepository.create_user(db, user_data)
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.onboarding_status == "not_started"


def test_get_user(db: Session):
    """Test getting a user by ID"""
    # Create a user first
    user_data = schemas.UserCreate(email="get_test@example.com")
    created_user = UserRepository.create_user(db, user_data)
    
    # Get the user
    user = UserRepository.get_user(db, created_user.id)
    
    assert user is not None
    assert user.id == created_user.id
    assert user.email == "get_test@example.com"


def test_get_user_by_email(db: Session):
    """Test getting a user by email"""
    # Create a user first
    user_data = schemas.UserCreate(email="email_test@example.com")
    created_user = UserRepository.create_user(db, user_data)
    
    # Get the user by email
    user = UserRepository.get_user_by_email(db, "email_test@example.com")
    
    assert user is not None
    assert user.id == created_user.id
    assert user.email == "email_test@example.com"


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
        is_student=False,
        linkedin="https://linkedin.com/in/johndoe",
        website="https://johndoe.com",
        is_employed=True,
        education=[{
            "school": "Kumaraguru College of Technology",
            "degree": "BACHELOR OF TECHNOLOGY",
            "fieldOfStudy": "INFORMATION TECHNOLOGY",
            "startYear": "2017",
            "endYear": "2021",
            "grade": "8.6/10 CGPA",
            "activities": ""
        }],
        work_experience=[{
            "title": "Software Developer",
            "employmentType": "Full-time",
            "company": "Thoughtworks",
            "currentlyWorking": True,
            "startMonth": "February",
            "startYear": "2025",
            "endMonth": "",
            "endYear": "",
            "location": "",
            "locationType": "Hybrid",
            "description": "Current position as a Software Developer at Thoughtworks."
        }]
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
    assert profile.is_student is False
    assert profile.linkedin == "https://linkedin.com/in/johndoe"
    assert profile.website == "https://johndoe.com"
    assert profile.is_employed is True
    
    # Verify education data
    assert len(profile.education) == 1
    edu = profile.education[0]
    assert edu["school"] == "Kumaraguru College of Technology"
    assert edu["degree"] == "BACHELOR OF TECHNOLOGY"
    assert edu["fieldOfStudy"] == "INFORMATION TECHNOLOGY"
    assert edu["startYear"] == "2017"
    assert edu["endYear"] == "2021"
    
    # Verify work experience data
    assert len(profile.work_experience) == 1
    exp = profile.work_experience[0]
    assert exp["title"] == "Software Developer"
    assert exp["employmentType"] == "Full-time"
    assert exp["company"] == "Thoughtworks"
    assert exp["currentlyWorking"] is True
    assert exp["startMonth"] == "February"
    assert exp["startYear"] == "2025"
    assert exp["locationType"] == "Hybrid"
    
    # Test updating the profile
    updated_profile_data = schemas.ProfileUpdate(
        first_name="Johnny",
        last_name="Doe",
        education=[{
            "school": "MIT",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "startYear": "2021",
            "endYear": "2023",
            "grade": "4.0/4.0",
            "activities": "Research Assistant"
        }]
    )
    
    updated_profile = UserRepository.create_user_profile(db, updated_profile_data, user.id)
    
    # Verify profile was updated correctly
    assert updated_profile.id == profile.id
    assert updated_profile.first_name == "Johnny"  # Updated
    assert updated_profile.last_name == "Doe"
    # Other fields should remain the same
    assert updated_profile.location == "New York"
    assert updated_profile.role == "Software Engineer"
    
    # Verify updated education data
    assert len(updated_profile.education) == 1
    edu = updated_profile.education[0]
    assert edu["school"] == "MIT"
    assert edu["degree"] == "Master of Science"
    assert edu["fieldOfStudy"] == "Computer Science"
    assert edu["startYear"] == "2021"
    assert edu["endYear"] == "2023"


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