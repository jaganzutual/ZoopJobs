from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resume = relationship("Resume", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    role = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    is_student = Column(Boolean, default=False)
    job_title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_employed = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    parsed_data = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="resume")
    education = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    work_experience = relationship("WorkExperience", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")

class Education(Base):
    __tablename__ = "education"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    institution = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    field_of_study = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    resume = relationship("Resume", back_populates="education")

class WorkExperience(Base):
    __tablename__ = "work_experience"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    resume = relationship("Resume", back_populates="work_experience")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    
    # Relationships
    resume = relationship("Resume", back_populates="skills") 