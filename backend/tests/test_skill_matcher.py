from app.services.skill_matcher import match_resume_to_jd, are_skills_related


def test_are_skills_related():
    assert are_skills_related("React", "Next.js") is True
    assert are_skills_related("Python", "FastAPI") is True
    assert are_skills_related("PostgreSQL", "SQL") is True
    assert are_skills_related("C++", "Java") is False


def test_match_resume_to_jd():
    resume_skills = ["Java", "Python", "SQL", "Machine Learning", "Spring Boot"]
    jd_req = ["Java", "Spring Boot", "SQL", "DSA", "Microservices"]
    jd_pref = ["AWS", "Docker"]

    result = match_resume_to_jd(resume_skills, jd_req, jd_pref)

    assert "Java" in result["strong_matches"]
    assert "Spring Boot" in result["strong_matches"]
    assert "SQL" in result["strong_matches"]
    assert "Microservices" in result["partial_matches"] or "Microservices" in result["missing_skills"]
    assert "AWS" in result["missing_skills"]

    assert result["total_matched_count"] >= 3
    assert result["required_skills_coverage"] > 50.0
    assert "not a hiring forecast" in result["explanation"]
