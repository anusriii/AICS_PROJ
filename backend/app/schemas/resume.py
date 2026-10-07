from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class EducationItem(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    score: Optional[str] = None


class ExperienceItem(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    bullets: List[str] = []


class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: List[str] = []
    highlights: List[str] = []


class ResumeParsedData(BaseModel):
    candidate_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    extracted_skills: List[str] = []
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    candidate_name: Optional[str]
    contact_email: Optional[str]
    extracted_skills: List[str]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
