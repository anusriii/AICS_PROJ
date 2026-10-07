from typing import Dict, Any, List
from app.services.llm_service import llm_service
from app.services.resume_parser import extract_skills_deterministically


def analyze_job_description(title: str, raw_text: str, company: str = "Company") -> Dict[str, Any]:
    """
    Parses and categorizes Job Description text into structured requirements:
    - Required skills vs preferred skills
    - Responsibilities & tools
    - Domain & experience requirements
    """
    # Deterministic skill extraction from the JD text
    deterministic_skills = extract_skills_deterministically(raw_text)

    prompt = f"""
Analyze the following Job Description for the role "{title}" at "{company}":

JOB DESCRIPTION TEXT:
\"\"\"
{raw_text[:4000]}
\"\"\"

Extract structured requirements into valid JSON matching this schema:
{{
  "role": "{title}",
  "domain": string,
  "experience_level": string,
  "required_skills": list of strings,
  "preferred_skills": list of strings,
  "soft_skills": list of strings,
  "responsibilities": list of strings,
  "education_requirements": list of strings,
  "tools": list of strings
}}
"""
    system_prompt = "You are a Job Description Intelligence engine. Accurately separate hard required skills from nice-to-have preferred skills."

    llm_result = llm_service.generate_json(prompt, system_prompt)

    # Merge deterministic skills into required/preferred if missing
    req_skills = set(s.strip() for s in llm_result.get("required_skills", []))
    pref_skills = set(s.strip() for s in llm_result.get("preferred_skills", []))

    for skill in deterministic_skills:
        if skill not in req_skills and skill not in pref_skills:
            req_skills.add(skill)

    return {
        "title": title,
        "company": company,
        "role": llm_result.get("role", title),
        "domain": llm_result.get("domain", "Software Engineering"),
        "experience_level": llm_result.get("experience_level", "Entry / Mid Level"),
        "required_skills": sorted(list(req_skills)),
        "preferred_skills": sorted(list(pref_skills)),
        "soft_skills": llm_result.get("soft_skills", ["Communication", "Problem Solving", "Teamwork"]),
        "responsibilities": llm_result.get("responsibilities", []),
        "education_requirements": llm_result.get("education_requirements", ["Bachelor's degree in CS or related field"]),
        "tools": llm_result.get("tools", ["Git", "Terminal", "Docker"])
    }
