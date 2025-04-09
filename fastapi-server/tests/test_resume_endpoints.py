import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json
from tests.conftest import MOCK_RESUME_DATA


@pytest.fixture
def mock_resumeparser_in_main(monkeypatch):
    """Mock the entire ResumeParser class in main.py"""
    class MockResumeParser:
        def __init__(self, mock_client=None):
            pass
        
        async def parse_uploaded_resume(self, file):
            if not file.filename.endswith(('.pdf', '.docx', '.txt')):
                raise ValueError("Invalid file format. Please upload a PDF, DOCX, or TXT file.")
            return MOCK_RESUME_DATA
    
    # Patch the ResumeParser class in main module
    import main
    monkeypatch.setattr(main, "ResumeParser", MockResumeParser)


def test_parse_resume(client: TestClient, db: Session, mock_resumeparser_in_main):
    """Test parsing a resume file"""
    # Create a mock file upload
    files = {"file": ("resume.pdf", b"mock pdf data", "application/pdf")}
    
    # Make the request
    response = client.post("/api/resume/parse", files=files)
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response matches our mock data
    data = response.json()
    assert data == MOCK_RESUME_DATA


def test_parse_resume_invalid_file(client: TestClient, db: Session, mock_resumeparser_in_main):
    """Test parsing with an invalid file format"""
    # Create an invalid file upload (not a PDF/DOCX/TXT)
    files = {"file": ("invalid.jpg", b"mock image data", "image/jpeg")}
    
    # Make the request
    response = client.post("/api/resume/parse", files=files)
    
    # Check that we get a 400 error for invalid file format
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_save_parsed_resume(client: TestClient, db: Session):
    """Test saving parsed resume data"""
    # First, ensure we have a user
    client.get("/api/users/me")
    
    # Prepare form data
    form_data = {
        "file_name": "resume.pdf",
        "personal_info": json.dumps(MOCK_RESUME_DATA["personal_info"]),
        "education": json.dumps(MOCK_RESUME_DATA["education"]),
        "work_experience": json.dumps(MOCK_RESUME_DATA["work_experience"]),
        "skills": json.dumps(MOCK_RESUME_DATA["skills"])
    }
    
    # Make the request
    response = client.post("/api/resume/save", data=form_data)
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response contains resume ID
    data = response.json()
    assert "id" in data
    assert data["file_name"] == "resume.pdf"
    
    # Verify that the resume is linked to the user
    response = client.get("/api/users/me")
    user_data = response.json()
    assert "resume" in user_data
    assert user_data["resume"]["file_name"] == "resume.pdf"


def test_manual_onboarding(client: TestClient, db: Session):
    """Test completing onboarding with manual data entry"""
    # Prepare profile data
    profile_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "location": "San Francisco, CA",
        "role": "Product Manager",
        "experience": "8",
        "is_student": False,
        "job_title": "Senior PM",
        "company": "Product Inc",
        "linkedin": "https://linkedin.com/in/janesmith",
        "website": "https://janesmith.com",
        "is_employed": True
    }
    
    # Make the request
    response = client.post("/api/onboarding/manual", json=profile_data)
    
    # Check status code
    assert response.status_code == 200
    
    # Verify response contains user with profile
    data = response.json()
    assert "id" in data
    assert "profile" in data
    assert data["profile"]["first_name"] == "Jane"
    assert data["profile"]["last_name"] == "Smith"
    assert data["profile"]["location"] == "San Francisco, CA"
    
    # Verify against the full user profile endpoint
    response = client.get("/api/users/me")
    user_data = response.json()
    assert user_data["profile"]["first_name"] == "Jane"
    assert user_data["profile"]["job_title"] == "Senior PM" 