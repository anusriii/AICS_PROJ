from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.job import JobProfile
from app.schemas.job import JobAnalyzeRequest, JobProfileResponse
from app.services.jd_analyzer import analyze_job_description

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/analyze", response_model=JobProfileResponse, status_code=status.HTTP_201_CREATED)
def analyze_job(
    req: JobAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes job description text, extracting structured technical prerequisites,
    preferred toolsets, and soft competencies.
    """
    try:
        analyzed = analyze_job_description(
            title=req.title,
            raw_text=req.raw_text,
            company=req.company or "Hiring Company"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Job description parsing failed: {str(e)}"
        )

    job_record = JobProfile(
        user_id=current_user.id,
        title=req.title,
        company=req.company,
        raw_text=req.raw_text,
        role=analyzed["role"],
        domain=analyzed["domain"],
        experience_level=analyzed["experience_level"],
        required_skills=analyzed["required_skills"],
        preferred_skills=analyzed["preferred_skills"],
        soft_skills=analyzed["soft_skills"],
        responsibilities=analyzed["responsibilities"],
        education_requirements=analyzed["education_requirements"],
        tools=analyzed["tools"]
    )
    db.add(job_record)
    db.commit()
    db.refresh(job_record)

    return job_record


@router.get("/{job_id}", response_model=JobProfileResponse)
def get_job_profile(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves structured Job Profile by ID."""
    job = db.query(JobProfile).filter(JobProfile.id == job_id, JobProfile.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job profile not found.")
    return job


@router.get("/", response_model=List[JobProfileResponse])
def list_user_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all Job Profiles parsed by the current user."""
    return db.query(JobProfile).filter(JobProfile.user_id == current_user.id).order_by(JobProfile.created_at.desc()).all()
