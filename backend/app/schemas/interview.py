from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class InterviewCreateRequest(BaseModel):
    resume_id: Optional[int] = None
    job_id: Optional[int] = None
    interview_type: str = Field("technical", description="hr, technical, resume_project, coding, or comprehensive")
    difficulty: str = Field("MEDIUM", description="EASY, MEDIUM, or HARD")
    total_questions: int = Field(5, ge=3, le=15, description="Planned number of questions")


class InterviewPlanSectionSchema(BaseModel):
    section_name: str
    weight: float
    target_questions: int
    focus_topics: List[str]


class InterviewPlanResponse(BaseModel):
    interview_id: int
    interview_type: str
    difficulty: str
    estimated_duration_minutes: int
    sections: List[InterviewPlanSectionSchema]


class InterviewResponseSchema(BaseModel):
    id: int
    user_id: int
    resume_id: Optional[int]
    job_id: Optional[int]
    interview_type: str
    target_role: Optional[str]
    current_difficulty: str
    status: str
    total_score: float
    tech_score: float
    comm_score: float
    coding_score: float
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class InterviewSessionState(BaseModel):
    interview_id: int
    status: str
    interview_type: str
    current_difficulty: str
    question_number: int
    total_questions: int
    completed_count: int
    is_finished: bool
    current_question: Optional[Dict[str, Any]] = None
    scores: Dict[str, float] = {}
