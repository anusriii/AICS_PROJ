from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class DayPlanItem(BaseModel):
    day: int
    title: str
    focus_topic: str
    objectives: List[str]
    practice_tasks: List[str]
    recommended_resources: List[str]


class ImprovementPlanResponse(BaseModel):
    id: int
    interview_id: int
    target_role: Optional[str]
    focus_skills: List[str]
    daily_schedule: List[DayPlanItem]
    created_at: datetime


class SkillGapSummary(BaseModel):
    strong_areas: List[str]
    average_areas: List[str]
    weak_areas: List[str]
    topic_level_gaps: Dict[str, List[str]]


class FinalReportResponse(BaseModel):
    interview_id: int
    interview_type: str
    target_role: Optional[str]
    overall_score: float
    technical_score: float
    communication_score: float
    coding_score: float
    rubric_breakdown: Dict[str, float]
    speech_summary: Dict[str, Any]
    presentation_summary: Dict[str, Any]
    skill_gaps: SkillGapSummary
    strengths_identified: List[str]
    weaknesses_identified: List[str]
    actionable_recommendations: List[str]
    improvement_plan_id: Optional[int] = None
    created_at: datetime


class ProgressHistoryItem(BaseModel):
    interview_id: int
    date: str
    interview_type: str
    overall_score: float
    technical_score: float
    communication_score: float
    coding_score: float


class DashboardOverviewResponse(BaseModel):
    candidate_name: str
    total_interviews: int
    average_score: float
    best_score: float
    latest_interview_id: Optional[int]
    recent_interviews: List[Dict[str, Any]]
    skill_matrix: Dict[str, float]
    progress_timeline: List[ProgressHistoryItem]
    active_plan: Optional[ImprovementPlanResponse]
