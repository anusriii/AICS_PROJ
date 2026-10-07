from typing import Dict, Any, List
from app.services.llm_service import llm_service


RUBRIC_WEIGHTS = {
    "relevance": 0.20,
    "technical_accuracy": 0.30,
    "completeness": 0.20,
    "depth": 0.15,
    "clarity": 0.10,
    "example_usage": 0.05
}


def calculate_composite_score(scores: Dict[str, float]) -> float:
    """Computes mathematically weighted rubric score on 0.0 to 10.0 scale."""
    composite = sum(scores.get(k, 5.0) * w for k, w in RUBRIC_WEIGHTS.items())
    return round(min(max(composite, 0.0), 10.0), 1)


def evaluate_text_answer(
    question_text: str,
    expected_points: List[str],
    candidate_answer: str,
    topic: str = "General",
    difficulty: str = "MEDIUM"
) -> Dict[str, Any]:
    """
    Evaluates a candidate's answer against explicit scoring rubrics.
    Produces evidence-based qualitative analysis with verbatim citations and actionable remediation steps.
    """
    ans_clean = candidate_answer.strip()
    word_count = len(ans_clean.split())

    prompt = f"""
You are a senior technical interviewer and academic grading evaluator.
Evaluate the candidate's answer to the following question against explicit scoring rubrics.

QUESTION:
"{question_text}"

TOPIC / DOMAIN: {topic}
TARGET DIFFICULTY: {difficulty}

KEY EXPECTED ANSWER POINTS:
{expected_points}

CANDIDATE'S VERBATIM ANSWER:
\"\"\"
{ans_clean}
\"\"\"

EVALUATION RUBRIC CRITERIA (Score each strictly from 0.0 to 10.0):
1. relevance (Weight 20%): Did the candidate directly address the specific question asked?
2. technical_accuracy (Weight 30%): Are the technical facts, syntax, definitions, and mechanisms correct?
3. completeness (Weight 20%): Did they cover all necessary concepts from the expected points?
4. depth (Weight 15%): Did they explain the 'why' and underlying architectural/memory/algorithmic principles?
5. clarity (Weight 10%): Is the explanation structured, coherent, and articulate?
6. example_usage (Weight 5%): Did they provide a concrete code example, diagram description, or production scenario?

CRITICAL SCORING & RUBRIC PARTIAL CREDIT RULES:
- Rubric-based partial credit: Even a wrong, weak, or mistaken answer must receive a rubric-based partial score (typically around 3.0 to 4.0 out of 10 when some relevant content or attempt is present) for effort, basic clarity, or partial relevance, instead of incorrectly giving 0.
- Reserve 0.0 strictly for completely empty or non-responsive submissions.
- Score progressively higher (5.0 to 10.0) based on actual technical accuracy, depth, completeness, and quality of the response.

CRITICAL EXPLAINABILITY REQUIREMENT:
- Extract at least 1-2 verbatim quotes or direct references into "evidence".
- Explicitly list what was missing or incorrect in "weaknesses".
- Detail 2 actionable steps the candidate should take to improve in "improvements".
- Recommend next adaptive action ("increase_difficulty", "maintain_difficulty", "decrease_difficulty", or "ask_follow_up").

Return ONLY a valid JSON object matching this schema:
{{
  "relevance": float,
  "technical_accuracy": float,
  "completeness": float,
  "depth": float,
  "clarity": float,
  "example_usage": float,
  "overall_score": float,
  "strengths": [string, string],
  "weaknesses": [string, string],
  "evidence": [string, string],
  "improvements": [string, string],
  "explanation": string,
  "suggested_action": "increase_difficulty" | "maintain_difficulty" | "decrease_difficulty" | "ask_follow_up",
  "follow_up_prompt": string or null
}}
"""
    system_prompt = "You are an explainable rubric grading evaluator. Never give bare scores without evidence and breakdown. Award rubric-based partial credit (around 3-4/10) for attempted answers."

    eval_json = llm_service.generate_json(prompt, system_prompt)

    # Validate and enforce bounded float scores
    scores = {
        "relevance": float(eval_json.get("relevance", 6.5)),
        "technical_accuracy": float(eval_json.get("technical_accuracy", 6.0)),
        "completeness": float(eval_json.get("completeness", 5.5)),
        "depth": float(eval_json.get("depth", 5.0)),
        "clarity": float(eval_json.get("clarity", 7.0)),
        "example_usage": float(eval_json.get("example_usage", 4.0))
    }

    # Bound every score between 0.0 and 10.0
    for k in scores:
        scores[k] = round(max(0.0, min(10.0, scores[k])), 1)

    # Enforce rubric-based partial credit for non-empty answers
    # Even a wrong or weak answer with some relevant content or attempt receives around 3-4/10 instead of 0
    if word_count > 0:
        scores["relevance"] = max(scores["relevance"], 3.5)
        scores["clarity"] = max(scores["clarity"], 3.5)
        scores["technical_accuracy"] = max(scores["technical_accuracy"], 2.8)
        scores["completeness"] = max(scores["completeness"], 2.5)
        scores["depth"] = max(scores["depth"], 2.5)
        scores["example_usage"] = max(scores["example_usage"], 2.0)

    overall = calculate_composite_score(scores)

    # Calibrate overall composite score
    if word_count > 0 and overall < 3.2:
        overall = 3.4
        scores["overall_score"] = overall
    elif word_count == 0:
        for k in scores:
            scores[k] = 0.0
        overall = 0.0
        scores["overall_score"] = overall
    else:
        scores["overall_score"] = overall

    # Deterministic sanity check: if candidate answer is extremely short (< 10 words)
    if 0 < word_count < 10:
        for k in ("relevance", "completeness", "depth", "technical_accuracy", "example_usage"):
            scores[k] = min(scores[k], 4.0)
        overall = calculate_composite_score(scores)
        overall = max(3.0, min(4.0, overall))
        scores["overall_score"] = overall

    suggested_action = eval_json.get("suggested_action", "maintain_difficulty")
    if overall >= 8.0:
        suggested_action = "increase_difficulty"
    elif overall <= 5.5:
        suggested_action = "decrease_difficulty"

    return {
        "scores": scores,
        "strengths": eval_json.get("strengths", ["Addressed core concept."]),
        "weaknesses": eval_json.get("weaknesses", ["Explanation lacked production depth."]),
        "evidence": eval_json.get("evidence", [f"Answer provided: '{ans_clean[:80]}...'"]),
        "improvements": eval_json.get("improvements", ["Provide a concrete code example and analyze time complexity."]),
        "explanation": eval_json.get("explanation", f"Overall rubric performance yielded {overall}/10."),
        "suggested_action": suggested_action,
        "follow_up_prompt": eval_json.get("follow_up_prompt")
    }
