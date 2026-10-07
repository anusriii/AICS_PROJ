from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.coding import CodingAttempt
from app.schemas.coding import (
    CodingProblemResponse,
    CodingRunRequest,
    CodingRunResult,
    CodingSubmitRequest,
    CodingEvaluationResponse,
    TestCaseView
)
from app.services.coding_evaluator import (
    CODING_CHALLENGES,
    execute_test_suite,
    evaluate_coding_submission
)

router = APIRouter(prefix="/coding", tags=["Coding Round"])


class CodingStartRequest(BaseModel):
    interview_id: int
    difficulty: str = "MEDIUM"
    problem_id: Optional[int] = None


class CodingBatchStartRequest(BaseModel):
    interview_id: int
    difficulty: str = "MEDIUM"
    count: int = 5


@router.post("/start", response_model=CodingProblemResponse)
def start_coding_challenge(
    req: CodingStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initializes algorithmic coding problem for the candidate."""
    interview = db.query(Interview).filter(Interview.id == req.interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    diff = req.difficulty.upper()
    if req.problem_id is not None:
        selected_prob = next((p for p in CODING_CHALLENGES if p["id"] == req.problem_id), CODING_CHALLENGES[0])
    else:
        matched_problems = [p for p in CODING_CHALLENGES if p["difficulty"] == diff]
        if not matched_problems:
            matched_problems = CODING_CHALLENGES
        selected_prob = matched_problems[0]

    existing_attempt = db.query(CodingAttempt).filter(
        CodingAttempt.interview_id == interview.id,
        CodingAttempt.problem_title == selected_prob["title"]
    ).first()

    if existing_attempt:
        attempt = existing_attempt
    else:
        attempt = CodingAttempt(
            interview_id=interview.id,
            problem_title=selected_prob["title"],
            problem_description=selected_prob["description"],
            difficulty=selected_prob["difficulty"],
            constraints=selected_prob["constraints"],
            examples=selected_prob["examples"],
            initial_code=selected_prob["initial_code"],
            user_code=selected_prob["initial_code"],
            language="python",
            visible_test_cases=[{"input": str(tc["input"]), "expected": str(tc["expected"])} for tc in selected_prob["visible_tests"]],
            hidden_test_cases=[{"input": str(tc["input"]), "expected": str(tc["expected"])} for tc in selected_prob["hidden_tests"]],
            status="started"
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    visible_views = [
        TestCaseView(id=idx, input_str=str(tc["input"]), expected_output=str(tc["expected"]))
        for idx, tc in enumerate(selected_prob["visible_tests"], start=1)
    ]

    return CodingProblemResponse(
        id=attempt.id,
        interview_id=interview.id,
        problem_title=attempt.problem_title,
        problem_description=attempt.problem_description,
        difficulty=attempt.difficulty,
        constraints=attempt.constraints,
        examples=attempt.examples,
        initial_code=attempt.initial_code,
        language=attempt.language,
        starter_templates=selected_prob.get("starter_templates"),
        visible_tests=visible_views
    )


@router.post("/batch", response_model=List[CodingProblemResponse])
def start_coding_batch(
    req: CodingBatchStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initializes a batch of algorithmic coding problems for the candidate."""
    interview = db.query(Interview).filter(Interview.id == req.interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    count = min(max(req.count, 1), len(CODING_CHALLENGES))
    problems_to_load = CODING_CHALLENGES[:count]

    responses = []
    for selected_prob in problems_to_load:
        existing_attempt = db.query(CodingAttempt).filter(
            CodingAttempt.interview_id == interview.id,
            CodingAttempt.problem_title == selected_prob["title"]
        ).first()

        if existing_attempt:
            attempt = existing_attempt
        else:
            attempt = CodingAttempt(
                interview_id=interview.id,
                problem_title=selected_prob["title"],
                problem_description=selected_prob["description"],
                difficulty=selected_prob["difficulty"],
                constraints=selected_prob["constraints"],
                examples=selected_prob["examples"],
                initial_code=selected_prob["initial_code"],
                user_code=selected_prob["initial_code"],
                language="python",
                visible_test_cases=[{"input": str(tc["input"]), "expected": str(tc["expected"])} for tc in selected_prob["visible_tests"]],
                hidden_test_cases=[{"input": str(tc["input"]), "expected": str(tc["expected"])} for tc in selected_prob["hidden_tests"]],
                status="started"
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)

        visible_views = [
            TestCaseView(id=idx, input_str=str(tc["input"]), expected_output=str(tc["expected"]))
            for idx, tc in enumerate(selected_prob["visible_tests"], start=1)
        ]

        responses.append(CodingProblemResponse(
            id=attempt.id,
            interview_id=interview.id,
            problem_title=attempt.problem_title,
            problem_description=attempt.problem_description,
            difficulty=attempt.difficulty,
            constraints=attempt.constraints,
            examples=attempt.examples,
            initial_code=attempt.initial_code,
            language=attempt.language,
            starter_templates=selected_prob.get("starter_templates"),
            visible_tests=visible_views
        ))

    return responses


@router.post("/{attempt_id}/run", response_model=CodingRunResult)
def run_code_in_sandbox(
    attempt_id: int,
    req: CodingRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Executes candidate code against visible test cases with performance telemetry."""
    attempt = db.query(CodingAttempt).filter(CodingAttempt.id == attempt_id).first()
    if not attempt or attempt.interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coding challenge attempt not found.")

    prob = next((p for p in CODING_CHALLENGES if p["title"] == attempt.problem_title), CODING_CHALLENGES[0])

    attempt.user_code = req.code
    attempt.language = req.language
    db.commit()

    run_res = execute_test_suite(req.code, prob["id"], language=req.language, include_hidden=False)
    return CodingRunResult(**run_res)


@router.post("/{attempt_id}/submit", response_model=CodingEvaluationResponse)
def submit_coding_attempt(
    attempt_id: int,
    req: CodingSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits code for complete evaluation:
    Hidden test validation + AST time/space complexity detection + code quality grading.
    """
    attempt = db.query(CodingAttempt).filter(CodingAttempt.id == attempt_id).first()
    if not attempt or attempt.interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coding challenge attempt not found.")

    prob = next((p for p in CODING_CHALLENGES if p["title"] == attempt.problem_title), CODING_CHALLENGES[0])

    eval_res = evaluate_coding_submission(prob["id"], req.code, language=req.language, approach_explanation=req.approach_explanation)

    attempt.user_code = req.code
    attempt.language = req.language
    attempt.tests_passed = eval_res["tests_passed"]
    attempt.total_tests = eval_res["total_tests"]
    attempt.correctness_score = eval_res["correctness_score"]
    attempt.complexity_score = eval_res["time_complexity_score"]
    attempt.code_quality_score = eval_res["code_quality_score"]
    attempt.edge_case_score = eval_res["edge_case_score"]
    attempt.final_score = eval_res["final_coding_score"]
    attempt.detected_time_complexity = eval_res["detected_time_complexity"]
    attempt.expected_time_complexity = eval_res["expected_time_complexity"]
    attempt.detected_space_complexity = eval_res["detected_space_complexity"]
    attempt.expected_space_complexity = eval_res["expected_space_complexity"]
    attempt.complexity_explanation = eval_res["complexity_explanation"]
    attempt.execution_output = eval_res["execution_details"]
    attempt.status = "submitted"

    # Update parent interview coding score across submitted attempts
    submitted_attempts = [
        att for att in attempt.interview.coding_attempts
        if att.status == "submitted" or att.id == attempt.id
    ]
    if submitted_attempts:
        avg_score = round(sum(att.final_score or 0.0 for att in submitted_attempts) / len(submitted_attempts), 1)
        attempt.interview.coding_score = avg_score
    else:
        attempt.interview.coding_score = eval_res["final_coding_score"]
    db.commit()

    return CodingEvaluationResponse(
        attempt_id=attempt.id,
        tests_passed=eval_res["tests_passed"],
        total_tests=eval_res["total_tests"],
        correctness_score=eval_res["correctness_score"],
        time_complexity_score=eval_res["time_complexity_score"],
        space_complexity_score=eval_res["space_complexity_score"],
        edge_case_score=eval_res["edge_case_score"],
        code_quality_score=eval_res["code_quality_score"],
        final_coding_score=eval_res["final_coding_score"],
        detected_time_complexity=eval_res["detected_time_complexity"],
        expected_time_complexity=eval_res["expected_time_complexity"],
        detected_space_complexity=eval_res["detected_space_complexity"],
        expected_space_complexity=eval_res["expected_space_complexity"],
        complexity_explanation=eval_res["complexity_explanation"],
        code_quality_feedback=eval_res["code_quality_feedback"],
        status=attempt.status
    )
