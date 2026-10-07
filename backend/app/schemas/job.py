from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class JobAnalyzeRequest(BaseModel):
    title: str = Field(..., min_length=2, description="Target Role Title (e.g., Full Stack Engineer)")
    company: Optional[str] = "Target Company"
    raw_text: str = Field(..., min_length=20, description="Full job description text")


class JobProfileResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company: Optional[str]
    role: Optional[str]
    domain: Optional[str]
    experience_level: Optional[str]
    required_skills: List[str]
    preferred_skills: List[str]
    soft_skills: List[str]
    responsibilities: List[str]
    education_requirements: List[str]
    tools: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
