from typing import Dict, Any, List


def create_interview_plan(
    interview_type: str,
    target_difficulty: str,
    total_questions: int,
    matched_skills: List[str],
    gap_skills: List[str],
    projects: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Constructs an adaptive multi-round interview blueprint detailing section breakdown,
    target question counts, expected duration, and topic priorities.
    """
    total_q = max(total_questions, 3)
    sections = []

    # Priority focus topics: combination of verified candidate skills and JD gap skills to probe
    core_technical_topics = (matched_skills[:4] + gap_skills[:2]) if matched_skills else ["Data Structures", "Algorithms", "System Architecture", "Databases"]
    project_names = [p.get("name", "Key Project") for p in projects[:2]] if projects else ["Academic Project", "Full Stack System"]

    if interview_type == "comprehensive":
        # Multi-round simulation
        q_tech = max(1, round(total_q * 0.40))
        q_proj = max(1, round(total_q * 0.25))
        q_hr = max(1, round(total_q * 0.20))
        q_coding = max(1, total_q - (q_tech + q_proj + q_hr))

        sections = [
            {
                "section_name": "technical",
                "weight": 0.40,
                "target_questions": q_tech,
                "focus_topics": core_technical_topics
            },
            {
                "section_name": "resume_project",
                "weight": 0.25,
                "target_questions": q_proj,
                "focus_topics": project_names
            },
            {
                "section_name": "hr",
                "weight": 0.15,
                "target_questions": q_hr,
                "focus_topics": ["Behavioral Situations", "Collaboration", "Career Motivation"]
            },
            {
                "section_name": "coding",
                "weight": 0.20,
                "target_questions": q_coding,
                "focus_topics": ["Data Structures & Algorithms", "Edge Case Handling", "Time/Space Complexity"]
            }
        ]
        est_minutes = (q_tech * 3) + (q_proj * 3) + (q_hr * 2) + (q_coding * 12)

    elif interview_type == "technical":
        sections = [
            {
                "section_name": "technical",
                "weight": 1.0,
                "target_questions": total_q,
                "focus_topics": core_technical_topics
            }
        ]
        est_minutes = total_q * 3

    elif interview_type == "hr":
        sections = [
            {
                "section_name": "hr",
                "weight": 1.0,
                "target_questions": total_q,
                "focus_topics": ["Self Introduction", "Strengths & Weaknesses", "STAR Behavioral Conflict", "Company Alignment"]
            }
        ]
        est_minutes = total_q * 3

    elif interview_type == "resume_project":
        sections = [
            {
                "section_name": "resume_project",
                "weight": 1.0,
                "target_questions": total_q,
                "focus_topics": project_names + ["Architecture Tradeoffs", "Data Preprocessing", "Production Scalability"]
            }
        ]
        est_minutes = total_q * 3

    elif interview_type == "coding":
        sections = [
            {
                "section_name": "coding",
                "weight": 1.0,
                "target_questions": 1,
                "focus_topics": ["Algorithmic Problem Solving", "Time & Space Complexity", "Edge Cases"]
            }
        ]
        est_minutes = 20

    else:
        # Default fallback to technical
        sections = [
            {
                "section_name": "technical",
                "weight": 1.0,
                "target_questions": total_q,
                "focus_topics": core_technical_topics
            }
        ]
        est_minutes = total_q * 3

    return {
        "interview_type": interview_type,
        "difficulty": target_difficulty,
        "estimated_duration_minutes": est_minutes,
        "sections": sections
    }
