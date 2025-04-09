import os
from typing import Dict, Any, List
import openai
from pypdf import PdfReader
import tempfile
import json
import os
from dotenv import load_dotenv
from unittest.mock import MagicMock

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class MockOpenAIClient:
    """A mock OpenAI client for testing purposes"""
    def __init__(self, mock_response=None):
        self.mock_response = mock_response or {
            "personal_info": {},
            "education": [],
            "work_experience": [],
            "skills": []
        }
        self.chat = MagicMock()
        self.chat.completions = MagicMock()
        self.chat.completions.create = self._mock_create
    
    def _mock_create(self, model=None, temperature=None, messages=None, response_format=None):
        """Mock the create method to return a predefined response"""
        class MockMessage:
            def __init__(self, content):
                self.content = content
        
        class MockChoice:
            def __init__(self, message):
                self.message = message
        
        class MockResponse:
            def __init__(self, choices):
                self.choices = choices
        
        # Create a mock message with the JSON response
        message = MockMessage(json.dumps(self.mock_response))
        choice = MockChoice(message)
        return MockResponse([choice])

class ResumeParser:
    def __init__(self, mock_client=None):
        if mock_client:
            self.client = mock_client
        else:
            self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + " "
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def _extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error extracting text from text file: {e}")
            return ""
    
    def extract_text(self, file_path: str, file_extension: str) -> str:
        """Extract text from file based on extension."""
        if file_extension.lower() == ".pdf":
            return self._extract_text_from_pdf(file_path)
        elif file_extension.lower() == ".txt":
            return self._extract_text_from_txt(file_path)
        else:
            return ""
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """Parse resume text using OpenAI."""
        system_prompt = """
        You are an expert resume parser. Extract the following information from the resume text:
        
        1. Personal Information (name, email, phone, location)
        2. Education History (institution, degree, field of study, dates)
        3. Work Experience (company, job title, dates, responsibilities)
        4. Skills (technical skills, soft skills, tools)
        
        Return the extracted information as a valid JSON with the following structure:
        {
            "personal_info": {
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "website": "",
                "summary": ""
            },
            "education": [
                {
                    "institution": "",
                    "degree": "",
                    "field_of_study": "",
                    "start_date": "",
                    "end_date": "",
                    "description": ""
                }
            ],
            "work_experience": [
                {
                    "company": "",
                    "job_title": "",
                    "start_date": "",
                    "end_date": "",
                    "description": ""
                }
            ],
            "skills": [
                {
                    "name": "",
                    "category": ""
                }
            ]
        }
        
        Ensure this is valid JSON format with no trailing commas. Use empty strings for missing information.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                temperature=0,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": resume_text}
                ],
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            parsed_data = json.loads(result.strip())
            return parsed_data
        except Exception as e:
            print(f"Error parsing resume: {e}")
            return {
                "personal_info": {},
                "education": [],
                "work_experience": [],
                "skills": []
            }
    
    async def parse_uploaded_resume(self, file) -> Dict[str, Any]:
        """Parse an uploaded resume file."""
        try:
            # Create a temporary file to store the uploaded resume
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Write the uploaded file content to the temporary file
                temp_file.write(await file.read())
                temp_file_path = temp_file.name
            
            # Get the file extension
            file_extension = os.path.splitext(file.filename)[1]
            
            # Extract text from the resume
            resume_text = self.extract_text(temp_file_path, file_extension)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            if not resume_text:
                return {
                    "personal_info": {},
                    "education": [],
                    "work_experience": [],
                    "skills": []
                }
            
            # Parse the resume text
            return self.parse_resume(resume_text)
        
        except Exception as e:
            print(f"Error processing uploaded resume: {e}")
            return {
                "personal_info": {},
                "education": [],
                "work_experience": [],
                "skills": []
            } 