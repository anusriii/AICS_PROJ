from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.analytics import ProgressRecord, ImprovementPlan
from app.schemas.analytics import (
    DashboardOverviewResponse,
    ProgressHistoryItem,
    ImprovementPlanResponse,
    DayPlanItem
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Progress"])


@router.get("/dashboard", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns candidate dashboard data:
    Aggregated metrics, historical sessions, longitudinal trends, and current improvement roadmap.
    """
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
    progress_records = db.query(ProgressRecord).filter(ProgressRecord.user_id == current_user.id).order_by(ProgressRecord.recorded_at.asc()).all()

    total_interviews = len(interviews)
    completed_interviews = [i for i in interviews if i.status == "completed"]
    
    if completed_interviews:
        avg_score = round(sum(i.total_score for i in completed_interviews) / len(completed_interviews), 1)
        best_score = round(max(i.total_score for i in completed_interviews), 1)
    else:
        avg_score = 0.0
        best_score = 0.0

    recent_list = []
    for i in interviews[:5]:
        recent_list.append({
            "id": i.id,
            "type": i.interview_type,
            "target_role": i.target_role,
            "difficulty": i.current_difficulty,
            "score": i.total_score,
            "status": i.status,
            "created_at": i.created_at.strftime("%b %d, %Y")
        })

    # Longitudinal progress points
    timeline = []
    for pr in progress_records:
        timeline.append(ProgressHistoryItem(
            interview_id=pr.interview_id,
            date=pr.recorded_at.strftime("%b %d"),
            interview_type=pr.interview_type,
            overall_score=pr.overall_score,
            technical_score=pr.technical_score,
            communication_score=pr.communication_score,
            coding_score=pr.coding_score
        ))

    # Skill Radar Aggregate
    skill_matrix = {
        "Python": 8.4,
        "System Design": 6.2,
        "FastAPI": 8.0,
        "React": 7.5,
        "SQL / DBMS": 6.8,
        "Communication": 8.2
    }

    # Latest active plan
    latest_plan_rec = db.query(ImprovementPlan).filter(ImprovementPlan.user_id == current_user.id).order_by(ImprovementPlan.created_at.desc()).first()
    active_plan_resp = None
    if latest_plan_rec:
        daily_items = [DayPlanItem(**d) for d in latest_plan_rec.plan_data]
        active_plan_resp = ImprovementPlanResponse(
            id=latest_plan_rec.id,
            interview_id=latest_plan_rec.interview_id,
            target_role=latest_plan_rec.target_role,
            focus_skills=latest_plan_rec.focus_skills or [],
            daily_schedule=daily_items,
            created_at=latest_plan_rec.created_at
        )

    return DashboardOverviewResponse(
        candidate_name=current_user.full_name,
        total_interviews=total_interviews,
        average_score=avg_score,
        best_score=best_score,
        latest_interview_id=interviews[0].id if interviews else None,
        recent_interviews=recent_list,
        skill_matrix=skill_matrix,
        progress_timeline=timeline,
        active_plan=active_plan_resp
    )


@router.get("/progress", response_model=List[ProgressHistoryItem])
def get_progress_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves full longitudinal progress progression over all interview rounds."""
    records = db.query(ProgressRecord).filter(ProgressRecord.user_id == current_user.id).order_by(ProgressRecord.recorded_at.asc()).all()
    return [
        ProgressHistoryItem(
            interview_id=r.interview_id,
            date=r.recorded_at.strftime("%b %d, %Y"),
            interview_type=r.interview_type,
            overall_score=r.overall_score,
            technical_score=r.technical_score,
            communication_score=r.communication_score,
            coding_score=r.coding_score
        )
        for r in records
    ]


@router.get("/plans/{plan_id}", response_model=ImprovementPlanResponse)
def get_improvement_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific personalized 7-Day Improvement Plan."""
    plan_rec = db.query(ImprovementPlan).filter(ImprovementPlan.id == plan_id, ImprovementPlan.user_id == current_user.id).first()
    if not plan_rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Improvement plan not found.")

    return ImprovementPlanResponse(
        id=plan_rec.id,
        interview_id=plan_rec.interview_id,
        target_role=plan_rec.target_role,
        focus_skills=plan_rec.focus_skills or [],
        daily_schedule=[DayPlanItem(**d) for d in plan_rec.plan_data],
        created_at=plan_rec.created_at
    )
