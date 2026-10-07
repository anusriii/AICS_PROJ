from typing import Dict, Any, List, Optional, Tuple
from app.services.question_generator import generate_question


DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"]


def adapt_difficulty(current_difficulty: str, evaluation_score: float) -> str:
    """
    Deterministic Difficulty Transition Logic:
    - Score >= 7.8 -> Step UP difficulty (EASY -> MEDIUM -> HARD)
    - Score < 5.5  -> Step DOWN difficulty (HARD -> MEDIUM -> EASY)
    - 5.5 <= Score < 7.8 -> MAINTAIN current difficulty
    """
    curr = current_difficulty.upper()
    if curr not in DIFFICULTY_LEVELS:
        curr = "MEDIUM"

    idx = DIFFICULTY_LEVELS.index(curr)

    if evaluation_score >= 7.8:
        new_idx = min(idx + 1, len(DIFFICULTY_LEVELS) - 1)
    elif evaluation_score < 5.5:
        new_idx = max(idx - 1, 0)
    else:
        new_idx = idx

    return DIFFICULTY_LEVELS[new_idx]


def should_trigger_follow_up(
    last_evaluation: Dict[str, Any],
    was_last_question_follow_up: bool
) -> Tuple[bool, Optional[str]]:
    """
    Determines whether to trigger an adaptive follow-up.
    Guards against cascading follow-up traps (never asks more than 1 consecutive follow-up).
    """
    if was_last_question_follow_up:
        return False, None

    suggested = last_evaluation.get("suggested_action", "")
    scores = last_evaluation.get("scores", {})
    tech_accuracy = scores.get("technical_accuracy", 7.0)
    example_usage = scores.get("example_usage", 5.0)

    # Trigger follow-up if candidate made a bold claim without examples or showed partial ambiguity
    if suggested == "ask_follow_up" and last_evaluation.get("follow_up_prompt"):
        return True, last_evaluation.get("follow_up_prompt")

    if 5.0 <= tech_accuracy < 7.0 and example_usage < 4.5:
        return True, "Candidate provided conceptual definition but omitted concrete code example and runtime behavior."

    return False, None


def select_next_skill_target(
    all_required_skills: List[str],
    covered_skills: List[str]
) -> str:
    """Selects the next uncovered required competency to maximize interview syllabus coverage."""
    covered_set = {s.lower().strip() for s in covered_skills}
    for skill in all_required_skills:
        if skill.lower().strip() not in covered_set:
            return skill
    return "System Architecture & Integration"


def run_adaptive_engine(
    interview_type: str,
    current_difficulty: str,
    last_evaluation: Dict[str, Any],
    parent_question_text: str,
    was_last_question_follow_up: bool,
    previous_questions: List[str],
    covered_skills: List[str],
    candidate_profile: Optional[Dict[str, Any]] = None,
    job_profile: Optional[Dict[str, Any]] = None
) -> Tuple[Dict[str, Any], str, bool, Optional[str]]:
    """
    Main Adaptive Controller:
    Evaluates previous answer -> Adjusts difficulty -> Determines follow-up vs syllabus progression -> Generates next question.
    """
    overall_score = last_evaluation.get("scores", {}).get("overall_score", 6.5)

    # 1. Adapt Difficulty
    next_difficulty = adapt_difficulty(current_difficulty, overall_score)

    # 2. Check for targeted follow-up
    needs_follow_up, follow_up_reason = should_trigger_follow_up(last_evaluation, was_last_question_follow_up)

    # 3. Determine topic focus
    required_skills = []
    if job_profile:
        required_skills = job_profile.get("required_skills", [])
    if not required_skills and candidate_profile:
        required_skills = candidate_profile.get("extracted_skills", [])

    next_topic = select_next_skill_target(required_skills, covered_skills)

    # 4. Generate next question
    if needs_follow_up:
        next_q = generate_question(
            interview_type=interview_type,
            difficulty=next_difficulty,
            topic=next_topic,
            candidate_profile=candidate_profile,
            job_profile=job_profile,
            previous_questions=previous_questions,
            is_follow_up=True,
            follow_up_reason=follow_up_reason,
            parent_question_text=parent_question_text
        )
        return next_q, next_difficulty, True, follow_up_reason
    else:
        next_q = generate_question(
            interview_type=interview_type,
            difficulty=next_difficulty,
            topic=next_topic,
            candidate_profile=candidate_profile,
            job_profile=job_profile,
            previous_questions=previous_questions,
            is_follow_up=False
        )
        return next_q, next_difficulty, False, None
