import os
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field, ConfigDict
from pypdf import PdfReader
import tempfile
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session
from datetime import datetime

from schemas.resume_schemas import ResumeData, ResumeResponse
from prompts.resume_prompts import ResumeSystemPrompts
from repository.resume_repository import ResumeRepository

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

class ResumeParser:
    def __init__(self, db: Session):
        logger.debug("Initializing ResumeParser...")
        self.db = db
        self.resume_repo = ResumeRepository
        
        # Initialize the output parser with ResumeData schema
        self.output_parser = PydanticOutputParser(pydantic_object=ResumeData)
        
        # Initialize the LLM with optimized configuration
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo-0125",  # Using GPT-3.5-turbo which has better token efficiency
            temperature=0.3,  # Lower temperature for more consistent output
            max_tokens=4000,  # Reduced max tokens
            timeout=30,  # Added timeout
            max_retries=3,  # Increased retries
            api_key=OPENAI_API_KEY
        ).with_structured_output(ResumeData, method="function_calling")
        
        logger.debug("Initialized OpenAI client")
        
        # Get system prompt from the prompts file
        system_prompt = ResumeSystemPrompts.get_resume_parser_prompt()
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{resume_text}")
        ])
        logger.debug("Initialized prompt template")
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + " "
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""
    
    def _extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error extracting text from text file: {e}")
            return ""
    
    def extract_text(self, file_path: str, file_extension: str) -> str:
        """Extract text from file based on extension."""
        if file_extension.lower() == ".pdf":
            return self._extract_text_from_pdf(file_path)
        elif file_extension.lower() == ".txt":
            return self._extract_text_from_txt(file_path)
        else:
            return ""
    
    def parse_resume(self, resume_text: str, user_id: int, file_name: str) -> ResumeResponse:
        """Parse resume text using LangChain and save to database."""
        try:
            # Truncate resume text if it's too long
            max_length = 6000  # Leave room for system prompt and function definitions
            if len(resume_text) > max_length:
                resume_text = resume_text[:max_length] + "..."
                logger.warning("Resume text was truncated to fit token limits")
            
            # Format the prompt with the resume text
            formatted_prompt = self.prompt.format_messages(
                resume_text=resume_text
            )
            
            # Get response from LLM with structured output
            response = self.llm.invoke(formatted_prompt)
            logger.debug(f"Response from LLM: {response}")
            
            # The response is already in the correct format due to with_structured_output
            parsed_data = response

            # Save to database using repository
            saved_resume = ResumeRepository.save_parsed_resume(
                self.db,
                user_id,
                file_name,
                parsed_data.dict()
            )
            
            # Transform the saved resume data to match the response schema
            response_data = {
                "personal_info": saved_resume.parsed_data.get("personal_info", {}),
                "education": saved_resume.parsed_data.get("education", []),
                "work_experience": saved_resume.parsed_data.get("work_experience", []),
                "skills": saved_resume.parsed_data.get("skills", [])
            }
            
            # Return successful response with the transformed data
            return ResumeResponse(
                status="success",
                message="Resume parsed and saved successfully",
                data=response_data,
                error=None
            )
            
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            # Try to return partial data if available
            try:
                if 'parsed_data' in locals():
                    return ResumeResponse(
                        status="partial",
                        message="Resume partially parsed",
                        data=parsed_data.dict(),
                        error=str(e)
                    )
            except:
                pass
                
            return ResumeResponse(
                status="error",
                message="Failed to parse resume",
                data=None,
                error=str(e)
            )
    
    async def parse_uploaded_resume(self, file, user_id: int) -> ResumeResponse:
        """Parse an uploaded resume file and save to database."""
        try:
            file_name = getattr(file, 'filename', file)
            logger.debug(f"Processing uploaded resume: {file_name}")
            
            # Extract text directly from the uploaded file
            file_extension = os.path.splitext(file_name)[1]
            content = await file.read()
            
            # Create a temporary file-like object
            from io import BytesIO
            file_obj = BytesIO(content)
            
            # Extract text based on file type
            if file_extension.lower() == ".pdf":
                reader = PdfReader(file_obj)
                resume_text = ""
                for page in reader.pages:
                    resume_text += page.extract_text() + " "
            elif file_extension.lower() == ".txt":
                resume_text = content.decode('utf-8')
            else:
                raise Exception(f"Unsupported file type: {file_extension}")
            
            if not resume_text:
                raise Exception("Could not extract text from file")
            logger.debug(f"Successfully extracted text from file (length: {len(resume_text)} characters)")

            # Parse the resume text and save to database
            result = self.parse_resume(resume_text, user_id, file_name)

            return result

        except Exception as e:
            logger.error(f"Error in parse_uploaded_resume: {str(e)}")
            return ResumeResponse(
                status="error",
                message="Failed to process uploaded resume",
                data=None,
                error=str(e)
            ) 