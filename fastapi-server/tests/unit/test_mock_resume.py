import json
from unittest.mock import MagicMock, patch
import sys
import os

# Add the current directory to the path so we can import the modules
current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, current_dir)

from services.resume_parser import ResumeParser, MockOpenAIClient

# Sample mock data
MOCK_RESUME_DATA = {
    "personal_info": {
        "name": "John Doe",
        "email": "john@example.com"
    },
    "education": [
        {
            "institution": "MIT",
            "degree": "BS"
        }
    ],
    "work_experience": [
        {
            "company": "Google",
            "job_title": "Engineer"
        }
    ],
    "skills": [
        {
            "name": "Python",
            "category": "Programming"
        }
    ]
}

def test_resume_parser_with_mock():
    """Test resume parsing with a mock client"""
    # Create mock client with predefined response
    mock_client = MockOpenAIClient(MOCK_RESUME_DATA)
    
    # Create parser with mock client
    parser = ResumeParser(mock_client=mock_client)
    
    # Test parsing
    result = parser.parse_resume("Sample resume text")
    
    # Verify results
    assert result["personal_info"]["name"] == "John Doe"
    assert result["education"][0]["institution"] == "MIT"
    assert result["work_experience"][0]["company"] == "Google"
    assert result["skills"][0]["name"] == "Python"
    
    print("All tests passed!")

# Run the test directly when this file is executed
if __name__ == "__main__":
    test_resume_parser_with_mock() 