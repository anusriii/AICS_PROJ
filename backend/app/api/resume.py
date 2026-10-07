import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.skill import CandidateSkill
from app.schemas.resume import ResumeResponse
from app.services.resume_parser import parse_resume_pipeline
from app.core.config import settings

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF or DOCX resume upload, executes multi-stage extraction pipeline,
    and stores normalized skills, projects, and educational milestones.
    """
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF (.pdf) and DOCX (.docx) format files are supported."
        )

    # Generate safe unique filename
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )

    # Execute parsing pipeline
    try:
        parsed_result = parse_resume_pipeline(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Resume parsing pipeline error: {str(e)}"
        )

    # Ensure only the most recent resume is kept per user.
    # Delete any previous resumes (and cascade‑delete related CandidateSkill rows).
    existing = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    for old in existing:
        db.query(CandidateSkill).filter(CandidateSkill.resume_id == old.id).delete()
        db.delete(old)
    db.commit()

    # Save the new resume
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=parsed_result["raw_text"],
        candidate_name=parsed_result["candidate_name"],
        contact_email=parsed_result["contact_email"],
        contact_phone=parsed_result["contact_phone"],
        education=parsed_result["education"],
        experience=parsed_result["experience"],
        projects=parsed_result["projects"],
        certifications=parsed_result["certifications"],
        extracted_skills=parsed_result["extracted_skills"],
        parsed_metadata=parsed_result["parsed_metadata"]
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Populate candidate_skills table
    for skill_str in parsed_result["extracted_skills"]:
        c_skill = CandidateSkill(
            resume_id=resume.id,
            skill_name=skill_str,
            proficiency="intermediate",
            match_status="matched"
        )
        db.add(c_skill)
    db.commit()

    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves structured information extracted from a candidate resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume record not found.")
    return resume


@router.get("/", response_model=List[ResumeResponse])
def list_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all resumes uploaded by the current user."""
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
