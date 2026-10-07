from typing import Dict, Any, List, Set
from difflib import SequenceMatcher


# Related Technology Clusters for Semantic & Partial Matching
SKILL_CLUSTERS = {
    "web_frontend": {"react", "next.js", "vue", "angular", "javascript", "typescript", "html", "css", "tailwind css"},
    "backend_python": {"python", "fastapi", "django", "flask", "rest apis"},
    "backend_java": {"java", "spring", "spring boot", "microservices"},
    "databases_sql": {"sql", "postgresql", "mysql", "sqlite", "oracle", "dbms"},
    "databases_nosql": {"mongodb", "redis", "cassandra", "dynamodb"},
    "cloud_devops": {"aws", "gcp", "azure", "docker", "kubernetes", "ci/cd", "terraform", "linux"},
    "algorithms_cs": {"dsa", "data structures", "algorithms", "oop", "system design", "operating systems", "computer networks"},
    "ai_ml": {"machine learning", "deep learning", "nlp", "pytorch", "tensorflow", "scikit-learn", "pandas"}
}


def compute_string_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def are_skills_related(skill_a: str, skill_b: str) -> bool:
    sa = skill_a.lower().strip()
    sb = skill_b.lower().strip()

    if sa in sb or sb in sa:
        return True
    
    if compute_string_similarity(sa, sb) >= 0.75:
        return True

    for cluster in SKILL_CLUSTERS.values():
        if sa in cluster and sb in cluster:
            return True

    return False


def match_resume_to_jd(
    resume_skills: List[str],
    jd_required_skills: List[str],
    jd_preferred_skills: List[str]
) -> Dict[str, Any]:
    """
    Computes an explainable, category-based alignment between resume skills and job requirements.
    Categorizes skills into MATCH (Strong Match), PARTIAL (Related experience), and GAP (Missing skill).
    """
    resume_set_lower = {s.lower().strip(): s for s in resume_skills}
    match_items: List[Dict[str, Any]] = []
    
    strong_matches: List[str] = []
    partial_matches: List[str] = []
    missing_skills: List[str] = []

    req_matched_count = 0.0
    total_req_count = max(len(jd_required_skills), 1)

    # 1. Match Required Skills
    for req in jd_required_skills:
        req_clean = req.strip()
        req_lower = req_clean.lower()

        if req_lower in resume_set_lower:
            status = "MATCH"
            evidence = f"Exact match found on candidate profile: '{resume_set_lower[req_lower]}'"
            strong_matches.append(req_clean)
            req_matched_count += 1.0
            confidence = 1.0
        else:
            # Check for partial / clustered match
            found_related = None
            for rs_lower, rs_original in resume_set_lower.items():
                if are_skills_related(req_lower, rs_lower):
                    found_related = rs_original
                    break

            if found_related:
                status = "PARTIAL"
                evidence = f"Related foundation detected: '{found_related}'"
                partial_matches.append(req_clean)
                req_matched_count += 0.5
                confidence = 0.7
            else:
                status = "GAP"
                evidence = "No direct or related keyword found in uploaded resume."
                missing_skills.append(req_clean)
                confidence = 0.0

        match_items.append({
            "skill": req_clean,
            "status": status,
            "importance": "REQUIRED",
            "candidate_evidence": evidence,
            "confidence_score": confidence
        })

    # 2. Match Preferred Skills
    pref_matched_count = 0.0
    total_pref_count = max(len(jd_preferred_skills), 1)

    for pref in jd_preferred_skills:
        pref_clean = pref.strip()
        pref_lower = pref_clean.lower()

        if pref_lower in resume_set_lower:
            status = "MATCH"
            evidence = f"Preferred requirement matched: '{resume_set_lower[pref_lower]}'"
            strong_matches.append(pref_clean)
            pref_matched_count += 1.0
            confidence = 1.0
        else:
            found_related = None
            for rs_lower, rs_original in resume_set_lower.items():
                if are_skills_related(pref_lower, rs_lower):
                    found_related = rs_original
                    break

            if found_related:
                status = "PARTIAL"
                evidence = f"Related experience found: '{found_related}'"
                partial_matches.append(pref_clean)
                pref_matched_count += 0.5
                confidence = 0.7
            else:
                status = "GAP"
                evidence = "Preferred skill not mentioned."
                missing_skills.append(pref_clean)
                confidence = 0.0

        match_items.append({
            "skill": pref_clean,
            "status": status,
            "importance": "PREFERRED",
            "candidate_evidence": evidence,
            "confidence_score": confidence
        })

    # Compute Coverage Metrics
    required_coverage_pct = round((req_matched_count / total_req_count) * 100, 1)
    
    if jd_preferred_skills:
        pref_coverage_pct = (pref_matched_count / total_pref_count) * 100
        overall_match_pct = round((0.75 * required_coverage_pct) + (0.25 * pref_coverage_pct), 1)
    else:
        overall_match_pct = required_coverage_pct

    explanation = (
        f"Resume covers {required_coverage_pct}% of required job competencies with {len(strong_matches)} strong "
        f"matches, {len(partial_matches)} related proficiencies, and {len(missing_skills)} skill gaps. "
        f"This metric reflects profile-to-role topic alignment for customized question selection and is not a hiring forecast."
    )

    return {
        "overall_match_percentage": min(overall_match_pct, 100.0),
        "required_skills_coverage": min(required_coverage_pct, 100.0),
        "total_matched_count": len(strong_matches),
        "total_partial_count": len(partial_matches),
        "total_gap_count": len(missing_skills),
        "matches": match_items,
        "strong_matches": strong_matches,
        "partial_matches": partial_matches,
        "missing_skills": missing_skills,
        "explanation": explanation
    }
