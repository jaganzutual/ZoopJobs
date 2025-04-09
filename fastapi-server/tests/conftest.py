import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
import sys
from typing import Generator, Dict, Any
import json
from unittest.mock import MagicMock

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_db
from models import Base
from services.resume_parser import ResumeParser, MockOpenAIClient

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Mock resume data for testing
MOCK_RESUME_DATA = {
    "personal_info": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "555-123-4567",
        "location": "New York, NY",
        "linkedin": "https://linkedin.com/in/johndoe",
        "website": "https://johndoe.com",
        "summary": "Experienced software engineer with a passion for building great products."
    },
    "education": [
        {
            "institution": "Stanford University",
            "degree": "Bachelor of Science",
            "field_of_study": "Computer Science",
            "start_date": "2016-09-01",
            "end_date": "2020-05-31",
            "description": "Coursework in algorithms, data structures, and software engineering."
        }
    ],
    "work_experience": [
        {
            "company": "Tech Corp",
            "job_title": "Software Engineer",
            "start_date": "2020-06-01",
            "end_date": "",
            "description": "Developing web applications using React and Node.js."
        }
    ],
    "skills": [
        {
            "name": "Python",
            "category": "Programming Language"
        },
        {
            "name": "React",
            "category": "Frontend"
        },
        {
            "name": "FastAPI",
            "category": "Backend"
        }
    ]
}


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    """
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for testing
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop the tables after the test is complete
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db, mock_resume_parser) -> Generator[TestClient, None, None]:
    """
    Create a test client with a dependency override for the database.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Create a patched version of ResumeParser initialization
    original_init = ResumeParser.__init__
    
    def patched_init(self, mock_client=None):
        # Use the preconfigured mock client from mock_resume_parser
        mock_client = mock_resume_parser.client
        original_init(self, mock_client=mock_client)
    
    # Apply the patch
    ResumeParser.__init__ = patched_init
    
    # Override the dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create a test client
    with TestClient(app) as client:
        yield client
    
    # Reset the overrides and restore original init
    app.dependency_overrides = {}
    ResumeParser.__init__ = original_init


@pytest.fixture
def mock_resume_parser(monkeypatch):
    """
    Mock the ResumeParser class to return predictable test data.
    """
    from services.resume_parser import MockOpenAIClient
    
    # Create a mock client with the test data
    mock_client = MockOpenAIClient(MOCK_RESUME_DATA)
    
    # Create the parser with the mock client
    parser = ResumeParser(mock_client=mock_client)
    
    # Override the parse_uploaded_resume method to return the mock data
    async def mock_parse_uploaded_resume(self, file):
        # Check file extension to simulate validation
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise ValueError("Invalid file format. Please upload a PDF, DOCX, or TXT file.")
        return MOCK_RESUME_DATA
    
    # Apply the patch to the parser instance
    parser.parse_uploaded_resume = mock_parse_uploaded_resume.__get__(parser, ResumeParser)
    
    # Return the parser with mock client
    return parser


@pytest.fixture
def mock_file():
    """
    Create a mock file-like object for testing file uploads.
    """
    class MockFile:
        def __init__(self):
            self.filename = "resume.pdf"
            self.content_type = "application/pdf"
            self._read_data = b"mock pdf data"
        
        async def read(self):
            return self._read_data
    
    return MockFile() 