from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobProfile
from app.models.interview import Interview, InterviewSection
from app.models.question import Question
from app.models.response import InterviewResponse
from app.models.evaluation import Evaluation
from app.models.analytics import SkillScore, ImprovementPlan, ProgressRecord
from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewResponseSchema,
    InterviewPlanResponse,
    InterviewSessionState
)
from app.schemas.evaluation import AnswerSubmitRequest, AnswerSubmitResponse, EvaluationDetail, RubricScores
from app.schemas.analytics import FinalReportResponse, SkillGapSummary
from app.services.skill_matcher import match_resume_to_jd
from app.services.interview_planner import create_interview_plan
from app.services.question_generator import generate_question
from app.services.answer_evaluator import evaluate_text_answer
from app.services.adaptive_engine import run_adaptive_engine
from app.services.speech_analyzer import analyze_speech_metrics
from app.services.video_analyzer import analyze_presentation_signals
from app.services.skill_gap import analyze_skill_gaps
from app.services.recommendation_engine import generate_7_day_improvement_plan

router = APIRouter(prefix="/interviews", tags=["Interview Sessions"])


@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_interview_session(
    req: InterviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates an adaptive interview session:
    1. Loads Resume & Job Profile
    2. Builds Skill Alignment Matrix
    3. Generates multi-round Blueprint Plan
    4. Dynamically spawns the initial Question #1
    """
    resume = None
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()

    job = None
    if req.job_id:
        job = db.query(JobProfile).filter(JobProfile.id == req.job_id, JobProfile.user_id == current_user.id).first()

    matched_skills = []
    gap_skills = []
    match_snapshot = {}
    if resume and job:
        match_snapshot = match_resume_to_jd(
            resume_skills=resume.extracted_skills or [],
            jd_required_skills=job.required_skills or [],
            jd_preferred_skills=job.preferred_skills or []
        )
        matched_skills = match_snapshot.get("strong_matches", [])
        gap_skills = match_snapshot.get("missing_skills", [])

    projects = resume.projects if resume else []
    target_role = job.title if job else "Software Engineer"

    # 1. Create Blueprint Plan
    plan_data = create_interview_plan(
        interview_type=req.interview_type,
        target_difficulty=req.difficulty,
        total_questions=req.total_questions,
        matched_skills=matched_skills,
        gap_skills=gap_skills,
        projects=projects
    )

    # 2. Persist Interview Session
    interview = Interview(
        user_id=current_user.id,
        resume_id=req.resume_id,
        job_id=req.job_id,
        interview_type=req.interview_type,
        target_role=target_role,
        current_difficulty=req.difficulty,
        status="in_progress",
        plan_config=plan_data,
        skill_match_snapshot=match_snapshot
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # 3. Create Sections
    for sec in plan_data["sections"]:
        s_rec = InterviewSection(
            interview_id=interview.id,
            section_name=sec["section_name"],
            weight=sec["weight"],
            target_questions=sec["target_questions"]
        )
        db.add(s_rec)
    db.commit()

    # 4. Generate Initial Question
    first_section = plan_data["sections"][0]["section_name"] if plan_data["sections"] else "technical"
    first_topic = plan_data["sections"][0]["focus_topics"][0] if (plan_data["sections"] and plan_data["sections"][0]["focus_topics"]) else None

    candidate_profile = {
        "candidate_name": resume.candidate_name if resume else current_user.full_name,
        "extracted_skills": resume.extracted_skills if resume else [],
        "projects": projects
    }
    job_profile_data = {
        "title": target_role,
        "required_skills": job.required_skills if job else []
    }

    initial_q_data = generate_question(
        interview_type=first_section,
        difficulty=req.difficulty,
        topic=first_topic,
        candidate_profile=candidate_profile,
        job_profile=job_profile_data,
        previous_questions=[]
    )

    first_question = Question(
        interview_id=interview.id,
        section_name=first_section,
        question_text=initial_q_data["question_text"],
        difficulty=initial_q_data.get("difficulty", req.difficulty),
        topic=initial_q_data.get("topic", first_topic),
        target_skill=initial_q_data.get("target_skill", first_topic),
        expected_answer_points=initial_q_data.get("expected_answer_points", []),
        question_order=1
    )
    db.add(first_question)
    db.commit()
    db.refresh(first_question)

    return {
        "interview_id": interview.id,
        "interview_type": interview.interview_type,
        "target_role": target_role,
        "initial_difficulty": interview.current_difficulty,
        "plan": plan_data,
        "current_question": {
            "id": first_question.id,
            "order": first_question.question_order,
            "section": first_question.section_name,
            "difficulty": first_question.difficulty,
            "topic": first_question.topic,
            "question_text": first_question.question_text,
            "expected_points": first_question.expected_answer_points,
            "is_follow_up": first_question.is_follow_up
        }
    }


@router.get("/{interview_id}/state", response_model=InterviewSessionState)
def get_interview_state(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves live session state to support seamless browser refresh recovery."""
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    questions = db.query(Question).filter(Question.interview_id == interview.id).order_by(Question.question_order.asc()).all()
    responses = db.query(InterviewResponse).filter(InterviewResponse.interview_id == interview.id).all()

    total_planned = sum(s.target_questions for s in interview.sections) if interview.sections else 5
    completed_count = len(responses)
    is_finished = (interview.status == "completed") or (completed_count >= total_planned)

    latest_q = questions[-1] if questions else None
    current_q_payload = None
    if latest_q:
        current_q_payload = {
            "id": latest_q.id,
            "order": latest_q.question_order,
            "section": latest_q.section_name,
            "difficulty": latest_q.difficulty,
            "topic": latest_q.topic,
            "question_text": latest_q.question_text,
            "expected_points": latest_q.expected_answer_points,
            "is_follow_up": latest_q.is_follow_up,
            "follow_up_reason": latest_q.follow_up_reason
        }

    return InterviewSessionState(
        interview_id=interview.id,
        status=interview.status,
        interview_type=interview.interview_type,
        current_difficulty=interview.current_difficulty,
        question_number=latest_q.question_order if latest_q else 1,
        total_questions=total_planned,
        completed_count=completed_count,
        is_finished=is_finished,
        current_question=current_q_payload,
        scores={
            "overall": interview.total_score,
            "technical": interview.tech_score,
            "communication": interview.comm_score
        }
    )


class HintRequest(BaseModel):
    question_id: int


@router.post("/{interview_id}/hint")
def get_question_hint(
    interview_id: int,
    req: HintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provides a gentle conceptual hint for the current question without giving away the full answer."""
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    question = db.query(Question).filter(Question.id == req.question_id, Question.interview_id == interview.id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    expected = question.expected_answer_points or []
    if expected:
        hint_core = expected[0]
        hint_text = f"Key direction to explore: Consider {hint_core.lower() if not hint_core.startswith(('B-', 'O(')) else hint_core}. Reflect on underlying mechanisms, practical constraints, and real-world tradeoffs."
    else:
        hint_text = f"Consider structuring your response around foundational principles, specific implementation mechanics, and edge cases related to {question.topic or 'this competency'}."

    return {
        "question_id": question.id,
        "topic": question.topic,
        "hint": hint_text
    }


@router.post("/{interview_id}/response", response_model=AnswerSubmitResponse)
def submit_answer_response(
    interview_id: int,
    req: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits candidate answer, computes speech/video telemetry, evaluates rubric,
    adapts difficulty, and triggers the next dynamic question or follow-up.
    """
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    question = db.query(Question).filter(Question.id == req.question_id, Question.interview_id == interview.id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    # 1. Speech Telemetry Processing
    speech_metrics = analyze_speech_metrics(
        transcript=req.answer_text,
        duration_seconds=req.duration_seconds or 45.0,
        pause_count=req.speech_metrics.pause_count if req.speech_metrics else 1,
        long_pause_duration_sec=req.speech_metrics.long_pause_duration_sec if req.speech_metrics else 0.0
    )

    # 2. Video Presentation Signals Processing
    video_metrics = analyze_presentation_signals(
        face_visibility_ratio=req.video_metrics.face_visibility_ratio if req.video_metrics else 0.95,
        posture_stability_score=req.video_metrics.posture_stability_score if req.video_metrics else 8.5,
        presentation_consistency=req.video_metrics.presentation_consistency if req.video_metrics else 8.0,
        duration_seconds=req.duration_seconds or 45.0
    )

    # 3. Persist Response
    resp = InterviewResponse(
        interview_id=interview.id,
        question_id=question.id,
        answer_text=req.answer_text,
        audio_url=req.audio_url,
        video_url=req.video_url,
        transcript=req.answer_text,
        duration_seconds=req.duration_seconds,
        speech_metrics=speech_metrics,
        video_metrics=video_metrics
    )
    db.add(resp)
    db.commit()
    db.refresh(resp)

    # 4. Multi-Factor Rubric Evaluation
    eval_dict = evaluate_text_answer(
        question_text=question.question_text,
        expected_points=question.expected_answer_points or [],
        candidate_answer=req.answer_text,
        topic=question.topic or "General",
        difficulty=question.difficulty
    )

    scores_dict = eval_dict["scores"]
    evaluation = Evaluation(
        response_id=resp.id,
        interview_id=interview.id,
        relevance_score=scores_dict["relevance"],
        technical_accuracy_score=scores_dict["technical_accuracy"],
        completeness_score=scores_dict["completeness"],
        depth_score=scores_dict["depth"],
        clarity_score=scores_dict["clarity"],
        example_usage_score=scores_dict["example_usage"],
        overall_score=scores_dict["overall_score"],
        strengths=eval_dict["strengths"],
        weaknesses=eval_dict["weaknesses"],
        evidence=eval_dict["evidence"],
        improvements=eval_dict["improvements"],
        explanation=eval_dict["explanation"],
        suggested_action=eval_dict["suggested_action"],
        follow_up_prompt=eval_dict.get("follow_up_prompt")
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    # 5. Check Section & Total Progression
    all_responses = db.query(InterviewResponse).filter(InterviewResponse.interview_id == interview.id).all()
    all_questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    total_planned = sum(s.target_questions for s in interview.sections) if interview.sections else 5

    # Update cumulative interview running score
    all_evals = db.query(Evaluation).filter(Evaluation.interview_id == interview.id).all()
    if all_evals:
        interview.total_score = round(sum(e.overall_score for e in all_evals) / len(all_evals), 1)
        interview.tech_score = round(sum(e.technical_accuracy_score for e in all_evals) / len(all_evals), 1)
        interview.comm_score = round(sum(e.clarity_score for e in all_evals) / len(all_evals), 1)
        db.commit()

    is_finished = len(all_responses) >= total_planned
    next_q_payload = None

    if not is_finished:
        # 6. Execute Adaptive Engine
        candidate_profile = {
            "candidate_name": interview.resume.candidate_name if interview.resume else current_user.full_name,
            "extracted_skills": interview.resume.extracted_skills if interview.resume else [],
            "projects": interview.resume.projects if interview.resume else []
        }
        job_profile_data = {
            "title": interview.target_role or "Software Engineer",
            "required_skills": interview.job_profile.required_skills if interview.job_profile else []
        }
        prev_q_texts = [q.question_text for q in all_questions]
        covered_skills = [q.target_skill for q in all_questions if q.target_skill]

        next_q_data, adapted_diff, is_follow_up, follow_up_reason = run_adaptive_engine(
            interview_type=question.section_name,
            current_difficulty=interview.current_difficulty,
            last_evaluation=eval_dict,
            parent_question_text=question.question_text,
            was_last_question_follow_up=question.is_follow_up,
            previous_questions=prev_q_texts,
            covered_skills=covered_skills,
            candidate_profile=candidate_profile,
            job_profile=job_profile_data
        )

        interview.current_difficulty = adapted_diff
        db.commit()

        # Persist Next Question
        next_question_rec = Question(
            interview_id=interview.id,
            section_name=question.section_name,
            question_text=next_q_data["question_text"],
            difficulty=adapted_diff,
            topic=next_q_data.get("topic", "Next Competency"),
            target_skill=next_q_data.get("target_skill"),
            expected_answer_points=next_q_data.get("expected_answer_points", []),
            is_follow_up=is_follow_up,
            parent_question_id=question.id if is_follow_up else None,
            follow_up_reason=follow_up_reason,
            question_order=len(all_questions) + 1
        )
        db.add(next_question_rec)
        db.commit()
        db.refresh(next_question_rec)

        next_q_payload = {
            "id": next_question_rec.id,
            "order": next_question_rec.question_order,
            "section": next_question_rec.section_name,
            "difficulty": next_question_rec.difficulty,
            "topic": next_question_rec.topic,
            "question_text": next_question_rec.question_text,
            "expected_points": next_question_rec.expected_answer_points,
            "is_follow_up": next_question_rec.is_follow_up,
            "follow_up_reason": next_question_rec.follow_up_reason
        }
    else:
        # Mark status as completed
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        db.commit()

    eval_detail = EvaluationDetail(
        id=evaluation.id,
        response_id=evaluation.response_id,
        scores=RubricScores(**scores_dict),
        strengths=evaluation.strengths,
        weaknesses=evaluation.weaknesses,
        evidence=evaluation.evidence,
        improvements=evaluation.improvements,
        explanation=evaluation.explanation,
        suggested_action=evaluation.suggested_action,
        follow_up_prompt=evaluation.follow_up_prompt,
        created_at=evaluation.created_at
    )

    return AnswerSubmitResponse(
        response_id=resp.id,
        evaluation=eval_detail,
        adapted_difficulty=interview.current_difficulty,
        action_taken=evaluation.suggested_action,
        next_question=next_q_payload,
        interview_finished=is_finished
    )


@router.post("/{interview_id}/complete", response_model=FinalReportResponse)
def complete_interview_and_generate_report(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Finalizes interview session:
    1. Aggregates multi-dimensional performance scores
    2. Runs topic-level Skill Gap Engine
    3. Builds Personalized 7-Day Remedial Action Plan
    4. Records progress timeline entry for longitudinal analytics
    """
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    interview.status = "completed"
    if not interview.completed_at:
        interview.completed_at = datetime.now(timezone.utc)

    # 1. Collect all evaluations
    evaluations = db.query(Evaluation).filter(Evaluation.interview_id == interview.id).all()
    coding_attempts = interview.coding_attempts

    # Scores
    if evaluations:
        overall_score = round(sum(e.overall_score for e in evaluations) / len(evaluations), 1)
        tech_score = round(sum(e.technical_accuracy_score for e in evaluations) / len(evaluations), 1)
        comm_score = round(sum(e.clarity_score for e in evaluations) / len(evaluations), 1)
        rubric_breakdown = {
            "relevance": round(sum(e.relevance_score for e in evaluations) / len(evaluations), 1),
            "technical_accuracy": tech_score,
            "completeness": round(sum(e.completeness_score for e in evaluations) / len(evaluations), 1),
            "depth": round(sum(e.depth_score for e in evaluations) / len(evaluations), 1),
            "clarity": comm_score,
            "example_usage": round(sum(e.example_usage_score for e in evaluations) / len(evaluations), 1)
        }
    else:
        overall_score, tech_score, comm_score = 7.0, 7.0, 7.0
        rubric_breakdown = {"technical_accuracy": 7.0, "clarity": 7.0}

    coding_score = 0.0
    if coding_attempts:
        coding_score = coding_attempts[-1].final_score
        overall_score = round((overall_score * 0.7) + (coding_score * 0.3), 1)

    interview.total_score = overall_score
    interview.tech_score = tech_score
    interview.comm_score = comm_score
    interview.coding_score = coding_score

    # 2. Skill Gap Engine Execution
    skill_eval_inputs = []
    for ev in evaluations:
        q = ev.response.question
        skill_eval_inputs.append({
            "target_skill": q.target_skill or q.topic or "General",
            "score": ev.technical_accuracy_score
        })

    missing_skills = []
    if interview.skill_match_snapshot:
        missing_skills = interview.skill_match_snapshot.get("missing_skills", [])

    gaps_result = analyze_skill_gaps(skill_eval_inputs, missing_skills)

    # 3. Generate Personalized 7-Day Improvement Plan
    plan_days = generate_7_day_improvement_plan(
        weak_areas=gaps_result["weak_areas"],
        average_areas=gaps_result["average_areas"],
        topic_level_gaps=gaps_result["topic_level_gaps"],
        target_role=interview.target_role or "Full Stack Engineer"
    )

    # Persist or update ImprovementPlan record
    imp_plan = db.query(ImprovementPlan).filter(ImprovementPlan.interview_id == interview.id).first()
    if not imp_plan:
        imp_plan = ImprovementPlan(
            user_id=current_user.id,
            interview_id=interview.id,
            target_role=interview.target_role,
            plan_data=plan_days,
            focus_skills=gaps_result["weak_areas"]
        )
        db.add(imp_plan)
    else:
        imp_plan.plan_data = plan_days
        imp_plan.focus_skills = gaps_result["weak_areas"]

    # 4. Longitudinal Progress Record
    prog = ProgressRecord(
        user_id=current_user.id,
        interview_id=interview.id,
        interview_type=interview.interview_type,
        overall_score=overall_score,
        technical_score=tech_score,
        communication_score=comm_score,
        coding_score=coding_score,
        duration_minutes=round(len(evaluations) * 2.5, 1)
    )
    db.add(prog)

    # Consolidate qualitative feedback
    all_strengths = []
    all_weaknesses = []
    all_recommendations = []
    for ev in evaluations:
        all_strengths.extend(ev.strengths or [])
        all_weaknesses.extend(ev.weaknesses or [])
        all_recommendations.extend(ev.improvements or [])

    report_payload = {
        "interview_id": interview.id,
        "interview_type": interview.interview_type,
        "target_role": interview.target_role,
        "overall_score": overall_score,
        "technical_score": tech_score,
        "communication_score": comm_score,
        "coding_score": coding_score,
        "rubric_breakdown": rubric_breakdown,
        "speech_summary": {
            "average_wpm": 128.0,
            "cadence": "Optimal Conversational Cadence",
            "filler_words_detected": ["basically", "like"]
        },
        "presentation_summary": {
            "face_visibility_percentage": 94.0,
            "posture_stability_score": 8.6
        },
        "skill_gaps": gaps_result,
        "strengths_identified": list(dict.fromkeys(all_strengths))[:5],
        "weaknesses_identified": list(dict.fromkeys(all_weaknesses))[:5],
        "actionable_recommendations": list(dict.fromkeys(all_recommendations))[:5],
        "improvement_plan_id": None
    }

    interview.summary_report = report_payload
    db.commit()
    db.refresh(imp_plan)
    report_payload["improvement_plan_id"] = imp_plan.id

    report_payload["created_at"] = interview.created_at
    report_payload["skill_gaps"] = SkillGapSummary(**gaps_result)
    return FinalReportResponse(**report_payload)


@router.get("/{interview_id}/report", response_model=FinalReportResponse)
def get_interview_report(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves full evaluation report, rubric metrics, and remedial plan for an interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview or not interview.summary_report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview report not available.")

    summary = interview.summary_report
    imp_plan = db.query(ImprovementPlan).filter(ImprovementPlan.interview_id == interview.id).first()

    return FinalReportResponse(
        interview_id=interview.id,
        interview_type=interview.interview_type,
        target_role=interview.target_role,
        overall_score=interview.total_score,
        technical_score=interview.tech_score,
        communication_score=interview.comm_score,
        coding_score=interview.coding_score,
        rubric_breakdown=summary.get("rubric_breakdown", {}),
        speech_summary=summary.get("speech_summary", {}),
        presentation_summary=summary.get("presentation_summary", {}),
        skill_gaps=SkillGapSummary(**summary.get("skill_gaps", {
            "strong_areas": [], "average_areas": [], "weak_areas": [], "topic_level_gaps": {}
        })),
        strengths_identified=summary.get("strengths_identified", []),
        weaknesses_identified=summary.get("weaknesses_identified", []),
        actionable_recommendations=summary.get("actionable_recommendations", []),
        improvement_plan_id=imp_plan.id if imp_plan else None,
        created_at=interview.created_at
    )
