import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json
from repository.user_repository import UserRepository
import schemas
from datetime import datetime


def test_get_current_user(client: TestClient, db: Session):
    """Test getting the current user profile (default user creation)"""
    # Make the request
    response = client.get("/api/users/me")
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response
    data = response.json()
    assert "id" in data
    assert data["id"] == 1  # Default user ID should be 1


def test_create_user(client: TestClient, db: Session):
    """Test creating a new user"""
    # Prepare test data
    user_data = {
        "email": "test@example.com"
    }
    
    # Make the request
    response = client.post("/api/users", json=user_data)
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "created_at" in data
    
    # Verify database record
    db_user = UserRepository.get_user_by_email(db, "test@example.com")
    assert db_user is not None
    assert db_user.email == "test@example.com"


def test_create_duplicate_user(client: TestClient, db: Session):
    """Test creating a user with an existing email"""
    # Create a user
    user_data = {
        "email": "duplicate@example.com"
    }
    client.post("/api/users", json=user_data)
    
    # Try to create the same user again
    response = client.post("/api/users", json=user_data)
    
    # Check that we get a 400 error
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_update_user_profile(client: TestClient, db: Session):
    """Test updating a user profile"""
    # First, make sure we have a user
    client.get("/api/users/me")
    
    # Prepare profile data
    profile_data = {
        "first_name": "John",
        "last_name": "Doe",
        "location": "New York, NY",
        "role": "Software Engineer",
        "is_student": False,
        "linkedin": "https://linkedin.com/in/johndoe",
        "website": "https://johndoe.com",
        "is_employed": True,
        "education": [
            {
                "school": "Kumaraguru College of Technology",
                "degree": "BACHELOR OF TECHNOLOGY",
                "fieldOfStudy": "INFORMATION TECHNOLOGY",
                "startYear": "2017",
                "endYear": "2021",
                "grade": "8.6/10 CGPA",
                "activities": ""
            }
        ],
        "work_experience": [
            {
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
            }
        ]
    }
    
    # Update the profile
    response = client.put("/api/users/profile", json=profile_data)
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["location"] == "New York, NY"
    assert data["role"] == "Software Engineer"
    assert data["is_student"] == False
    assert data["linkedin"] == "https://linkedin.com/in/johndoe"
    assert data["website"] == "https://johndoe.com"
    assert data["is_employed"] == True
    
    # Verify education data
    assert len(data["education"]) == 1
    edu = data["education"][0]
    assert edu["school"] == "Kumaraguru College of Technology"
    assert edu["degree"] == "BACHELOR OF TECHNOLOGY"
    assert edu["fieldOfStudy"] == "INFORMATION TECHNOLOGY"
    assert edu["startYear"] == "2017"
    assert edu["endYear"] == "2021"
    
    # Verify work experience data
    assert len(data["work_experience"]) == 1
    exp = data["work_experience"][0]
    assert exp["title"] == "Software Developer"
    assert exp["employmentType"] == "Full-time"
    assert exp["company"] == "Thoughtworks"
    assert exp["currentlyWorking"] == True
    assert exp["startMonth"] == "February"
    assert exp["startYear"] == "2025"
    assert exp["locationType"] == "Hybrid"
    
    # Verify database record
    response = client.get("/api/users/me")
    user_data = response.json()
    assert user_data["profile"]["first_name"] == "John"
    assert user_data["profile"]["last_name"] == "Doe" 