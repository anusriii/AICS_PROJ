from app.services.question_generator import generate_question


def test_question_generation_and_expected_points():
    candidate_profile = {
        "candidate_name": "Test Candidate",
        "extracted_skills": ["Python", "FastAPI"],
        "projects": []
    }
    job_profile = {
        "title": "Backend Engineer",
        "required_skills": ["Python", "FastAPI"]
    }

    q_data = generate_question(
        interview_type="technical",
        difficulty="MEDIUM",
        topic="Python",
        candidate_profile=candidate_profile,
        job_profile=job_profile,
        previous_questions=[]
    )

    assert "question_text" in q_data
    assert len(q_data["question_text"]) > 10
    assert "expected_answer_points" in q_data
    assert isinstance(q_data["expected_answer_points"], list)
    assert len(q_data["expected_answer_points"]) > 0


def test_question_hint_formulation():
    expected = ["B-tree index mechanics", "Write amplification"]
    hint_core = expected[0]
    hint = f"Key direction to explore: Consider {hint_core.lower() if not hint_core.startswith(('B-', 'O(')) else hint_core}."
    assert "B-tree index mechanics" in hint
