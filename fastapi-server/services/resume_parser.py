import os
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field, ConfigDict
from pypdf import PdfReader
import tempfile
import json
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class PersonalInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str] = Field(None, description="Full name of the person")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="Location/address")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL")
    website: Optional[str] = Field(None, description="Personal website URL")
    summary: Optional[str] = Field(None, description="Professional summary")

class Education(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    institution: Optional[str] = Field(None, description="Name of the educational institution")
    degree: Optional[str] = Field(None, description="Degree obtained")
    field_of_study: Optional[str] = Field(None, description="Field of study/major")
    start_date: Optional[str] = Field(None, description="Start date of education")
    end_date: Optional[str] = Field(None, description="End date of education")
    description: Optional[str] = Field(None, description="Description of education")

class WorkExperience(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    company: Optional[str] = Field(None, description="Company name")
    job_title: Optional[str] = Field(None, description="Job title/position")
    start_date: Optional[str] = Field(None, description="Start date of work")
    end_date: Optional[str] = Field(None, description="End date of work")
    description: Optional[str] = Field(None, description="Job description and responsibilities")

class Skill(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(..., description="Name of the skill")
    category: Optional[str] = Field(None, description="Category of the skill")

class ResumeData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    personal_info: PersonalInfo = Field(..., description="Personal information")
    education: List[Education] = Field(default_factory=list, description="List of education entries")
    work_experience: List[WorkExperience] = Field(default_factory=list, description="List of work experience entries")
    skills: List[Skill] = Field(default_factory=list, description="List of skills")

class ResumeParser:
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name="gpt-4",
            temperature=0,
            api_key=OPENAI_API_KEY
        )
        self.output_parser = PydanticOutputParser(pydantic_object=ResumeData)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert resume parser. Extract the following information from the resume text:
            
            1. Personal Information (name, email, phone, location)
            2. Education History (institution, degree, field of study, dates)
            3. Work Experience (company, job title, dates, responsibilities)
            4. Skills (technical skills, soft skills, tools)
            
            Format the output exactly according to the following schema:
            {format_instructions}
            """),
            ("human", "{resume_text}")
        ])
    
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
        """Parse resume text using LangChain."""
        try:
            # Format the prompt with the resume text and format instructions
            formatted_prompt = self.prompt.format_messages(
                resume_text=resume_text,
                format_instructions=self.output_parser.get_format_instructions()
            )
            
            # Get response from LLM
            response = self.llm.invoke(formatted_prompt)
            
            # Parse the response into our schema
            parsed_data = self.output_parser.parse(response.content)
            
            # Convert to dict for JSON serialization
            return parsed_data.model_dump()
            
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
                content = await file.read()
                temp_file.write(content)
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