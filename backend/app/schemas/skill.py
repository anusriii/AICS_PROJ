from pydantic import BaseModel
from typing import List, Optional


class SkillMatchItem(BaseModel):
    skill: str
    status: str # MATCH, PARTIAL, GAP
    importance: str # REQUIRED, PREFERRED
    category: Optional[str] = "General"
    candidate_evidence: Optional[str] = None
    confidence_score: float = 1.0


class SkillMatchResponse(BaseModel):
    resume_id: int
    job_id: int
    candidate_name: Optional[str] = None
    target_role: Optional[str] = None
    overall_match_percentage: float
    required_skills_coverage: float
    total_matched_count: int
    total_partial_count: int
    total_gap_count: int
    matches: List[SkillMatchItem]
    strong_matches: List[str]
    partial_matches: List[str]
    missing_skills: List[str]
    explanation: str
