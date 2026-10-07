from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobProfile
from app.schemas.skill import SkillMatchResponse
from app.services.skill_matcher import match_resume_to_jd

router = APIRouter(prefix="/skills", tags=["Skills & Matching"])


class MatchRequest(BaseModel):
    resume_id: int
    job_id: int


@router.post("/match", response_model=SkillMatchResponse)
def match_resume_and_job(
    req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates profile-to-role syllabus coverage:
    Computes exact, related (partial), and missing skill requirements with evidence.
    """
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    job = db.query(JobProfile).filter(JobProfile.id == req.job_id, JobProfile.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job profile not found.")

    match_result = match_resume_to_jd(
        resume_skills=resume.extracted_skills or [],
        jd_required_skills=job.required_skills or [],
        jd_preferred_skills=job.preferred_skills or []
    )

    return SkillMatchResponse(
        resume_id=resume.id,
        job_id=job.id,
        candidate_name=resume.candidate_name,
        target_role=job.title,
        **match_result
    )
