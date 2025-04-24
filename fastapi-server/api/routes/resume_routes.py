from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any
import json

from database import get_db
import schemas
from repository.resume_repository import ResumeRepository
from services.resume_parser import ResumeParser

router = APIRouter(
    prefix="/api/resume",
    tags=["resume"]
)

@router.post("/parse")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Upload and parse a resume file"""
    print("Processing resume upload...")
    try:
        # if debugging is true, return a sample response
        debugging = True
        if debugging:
            return {
                "status": "success",
                "message": "Resume parsed and saved successfully",
                "data": {
                    "personal_info": {
                        "name": "JAGAN SIVAM",
                        "email": "jagansivam71@gmail.com", 
                        "phone": "+91 8248561409",
                        "location": None,
                        "linkedin": "jagan28",
                        "website": "jaganzutual",
                        "summary": "Software developer with 4 years of professional experience in full-stack development, LLMs, and AI agent creation and mobile app development. Skilled in building and optimizing AI-powered applications. Committed to leveraging technology to solve complex problems and enhance user experiences."
                    },
                    "education": [
                        {
                            "institution": "Kumaraguru College of Technology",
                            "degree": "BACHELOR OF TECHNOLOGY",
                            "field_of_study": "INFORMATION TECHNOLOGY", 
                            "start_date": "2017",
                            "end_date": "2021",
                            "description": "8.6/10 CGPA"
                        }
                    ],
                    "work_experience": [
                        {
                            "company": "Zulip, inc",
                            "job_title": "Software Developer",
                            "start_date": "May 2020",
                            "end_date": "Sept 2020",
                            "description": "Redesigned Zulip Web app settings Page. Improved and De-duplicated Zulip Web app codebase. Bug fixing."
                        },
                        {
                            "company": "Skit.ai",
                            "job_title": "Software Engineer", 
                            "start_date": "April 2021",
                            "end_date": "May 2023",
                            "description": "Architecting and developing new features and optimizing existing applications. End to End Development. Building RESTful APIs, SOAP APIs, and Handling Backend Servers. Developed bots that could handle concurrency of around 1 million calls per day. Automating tools to increase productivity. Created observability dashboards using PostgreSQL to monitor critical business metrics. Reduced Voice AI agent latency by 80% by using Celery and Redis for making API calls."
                        },
                        {
                            "company": "Pesto.tech",
                            "job_title": "Founding Software Engineer",
                            "start_date": "May 2023", 
                            "end_date": "May 2024",
                            "description": "Built an end-to-end EduTech platform using TS.ED TypeScript framework for the backend and React with TypeScript for the frontend, improving digital learning. Developed a fully-fledged Admin Panel from backend, frontend, and database design for managing batches, reading materials, assignments, and users, significantly improving operational efficiency. Added live classes, mentor group sessions, and one-on-one interactions using web technologies for real-time learning. Built an AI agent to Automated assignment report generation using ChatGPT APIs, streamlining the feedback process and providing faster, AI-driven educational support."
                        },
                        {
                            "company": "Zutual",
                            "job_title": "CTO / Founding Engineer",
                            "start_date": "May 2024",
                            "end_date": "Dec 2024", 
                            "description": "Building an AI-powered life-tracking app for calorie monitoring, expense tracking, and personalized insights using Flutter, Django, and MongoDB. Integrated Langchain for AI-driven dynamic querying and LiveKit for real-time voice interactions with the AI agent. Designed a dynamic logging system to track fitness, finance, tasks, and schedules without predefined categories. Developed custom charts and analytics dashboards for visualizing user data."
                        },
                        {
                            "company": "Zutual App",
                            "job_title": "Solely designed, developed, and launched Zutual",
                            "start_date": None,
                            "end_date": None,
                            "description": "A social networking application that connects users with friends of friends. Built cross-platform mobile applications for iOS and Android using Flutter, delivering seamless user experiences. Developed a robust backend using Python Django and implemented MongoDB for data storage and Neo4j for graph-based relationships. Deployed the application on Google Cloud Platform (GCP) and AWS using Kubernetes and Docker, ensuring scalability and efficient resource management. Successfully launched on the Play Store and App Store, acquiring 700+ users."
                        },
                        {
                            "company": "Thoughtworks",
                            "job_title": "Software Developer",
                            "start_date": "Feb 2025",
                            "end_date": "Present",
                            "description": None
                        }
                    ],
                    "skills": [
                        {
                            "name": "Python",
                            "category": "Languages"
                        },
                        {
                            "name": "JavaScript",
                            "category": "Languages"
                        },
                        {
                            "name": "TypeScript",
                            "category": "Languages"
                        },
                        {
                            "name": "Dart",
                            "category": "Languages"
                        },
                        {
                            "name": "C++",
                            "category": "Languages"
                        },
                        {
                            "name": "Django",
                            "category": "Frameworks/Libraries"
                        },
                        {
                            "name": "React",
                            "category": "Frameworks/Libraries"
                        },
                        {
                            "name": "Flutter",
                            "category": "Frameworks/Libraries"
                        },
                        {
                            "name": "TSED",
                            "category": "Frameworks/Libraries"
                        },
                        {
                            "name": "Node.js",
                            "category": "Frameworks/Libraries"
                        },
                        {
                            "name": "Git",
                            "category": "Tools"
                        },
                        {
                            "name": "Docker",
                            "category": "Tools"
                        },
                        {
                            "name": "LLM",
                            "category": "Tools"
                        },
                        {
                            "name": "AI agents",
                            "category": "Tools"
                        },
                        {
                            "name": "REST API",
                            "category": "Tools"
                        },
                        {
                            "name": "Celery",
                            "category": "Tools"
                        },
                        {
                            "name": "Redis",
                            "category": "Tools"
                        },
                        {
                            "name": "Mongodb",
                            "category": "Tools"
                        },
                        {
                            "name": "Kubernatis",
                            "category": "Tools"
                        },
                        {
                            "name": "AWS",
                            "category": "Tools"
                        },
                        {
                            "name": "GCP",
                            "category": "Tools"
                        },
                        {
                            "name": "Azure",
                            "category": "Tools"
                        }
                    ]
                },
                "error": None
        }

         # Parse the resume
        resume_parser = ResumeParser(db)
        print("Parsing resume...")
        parsed_data = await resume_parser.parse_uploaded_resume(file, user_id)
        print("Resume parsed successfully",parsed_data)
        
 
        return {
            "status": parsed_data.status,
            "message": parsed_data.message,
            "data": parsed_data.data.dict() if parsed_data.data else None,
            "error": parsed_data.error
        }
    
    except Exception as e:
        print(f"Failed to process resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.post("/save", response_model=schemas.ResumeResponse)
async def save_parsed_resume(
    file_name: str = Form(...),
    personal_info: str = Form(...),
    education: str = Form("[]"),
    work_experience: str = Form("[]"),
    skills: str = Form("[]"),
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Save parsed resume data"""
    try:
        # Parse JSON data
        parsed_data = {
            "personal_info": json.loads(personal_info),
            "education": json.loads(education),
            "work_experience": json.loads(work_experience),
            "skills": json.loads(skills)
        }
        
        # Save resume data
        resume = ResumeRepository.save_parsed_resume(db, user_id, file_name, parsed_data)
        print(f"Resume data saved for user {user_id}")
        
        return resume
    
    except SQLAlchemyError as e:
        print(f"Database error while saving resume: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error saving resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

@router.get("/{user_id}", response_model=schemas.ResumeResponse)
async def get_resume(user_id: int, db: Session = Depends(get_db)):
    """Get resume by user ID"""
    resume = ResumeRepository.get_resume(db, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{user_id}")
async def delete_resume(user_id: int, db: Session = Depends(get_db)):
    """Delete resume"""
    if ResumeRepository.delete_resume(db, user_id):
        return {"message": "Resume deleted successfully"}
    raise HTTPException(status_code=404, detail="Resume not found") 