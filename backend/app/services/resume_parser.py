import re
import os
from typing import Dict, Any, List, Set
from app.utils.pdf_extract import (
    extract_text_from_pdf,
    clean_extracted_text,
    extract_contact_info,
    segment_resume_sections
)
from app.utils.docx_extract import extract_text_from_docx
from app.services.llm_service import llm_service


# Standardized CS & Software Engineering Knowledge Base for Deterministic Extraction
KNOWN_SKILLS = {
    # Languages
    "python", "java", "c++", "c", "c#", "javascript", "typescript", "golang", "go",
    "rust", "ruby", "php", "swift", "kotlin", "sql", "bash", "html", "css",
    # Frameworks & Libraries
    "react", "next.js", "vue", "angular", "node.js", "express", "fastapi", "django",
    "flask", "spring boot", "spring", "asp.net", "pytorch", "tensorflow", "keras",
    "scikit-learn", "pandas", "numpy", "tailwind css", "bootstrap",
    # Databases & Stores
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "cassandra", "dynamodb",
    "elasticsearch", "oracle",
    # Cloud & DevOps
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "terraform",
    "linux", "nginx", "jenkins",
    # Fundamentals & Architecture
    "dsa", "data structures", "algorithms", "oop", "object-oriented programming",
    "dbms", "system design", "rest apis", "restful api", "graphql", "microservices",
    "operating systems", "computer networks", "machine learning", "deep learning", "nlp"
}


def extract_skills_deterministically(text: str) -> List[str]:
    """Matches text against canonical computer science and software development skills dictionary."""
    text_lower = text.lower()
    matched: Set[str] = set()

    for skill in KNOWN_SKILLS:
        # Match using word boundaries or symbol-safe boundaries (e.g. c++, c#)
        if skill in ("c++", "c#"):
            pattern = re.escape(skill)
        else:
            pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            # Normalize casing for presentation
            normalized = skill.title()
            if skill in ("sql", "dsa", "oop", "dbms", "aws", "gcp", "nlp", "html", "css", "ci/cd"):
                normalized = skill.upper()
            elif skill == "fastapi":
                normalized = "FastAPI"
            elif skill == "c++":
                normalized = "C++"
            elif skill == "c#":
                normalized = "C#"
            elif skill == "node.js":
                normalized = "Node.js"
            elif skill == "next.js":
                normalized = "Next.js"
            elif skill == "scikit-learn":
                normalized = "scikit-learn"
            elif skill == "rest apis":
                normalized = "REST APIs"
            matched.add(normalized)

    return sorted(list(matched))


def parse_resume_pipeline(file_path: str) -> Dict[str, Any]:
    """
    Production-grade hybrid pipeline:
    1. Extract raw text from PDF
    2. Clean and normalize whitespace
    3. Segment into sections (Experience, Education, Projects, Skills)
    4. Deterministically extract contact details and skill tokens
    5. Pass to LLM for structured extraction of candidate name, project highlights, and dates
    6. Merge deterministic and LLM results into unified validated representation
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Resume file not found at {file_path}")

    if file_path.lower().endswith(".docx"):
        raw_text = extract_text_from_docx(file_path)
    else:
        raw_text = extract_text_from_pdf(file_path)
    cleaned_text = clean_extracted_text(raw_text)

    # 1. Deterministic Extraction
    contact_info = extract_contact_info(cleaned_text)
    deterministic_skills = extract_skills_deterministically(cleaned_text)
    sections = segment_resume_sections(cleaned_text)

    # 2. LLM Extraction Prompt for Structured Projects, Education, & Experience
    prompt = f"""
Analyze the following resume text and extract candidate details in structured JSON:

RESUME TEXT:
\"\"\"
{cleaned_text[:4000]}
\"\"\"

Return a valid JSON object matching this schema:
{{
  "candidate_name": string or null,
  "contact_email": string or null,
  "contact_phone": string or null,
  "extracted_skills": list of strings,
  "education": [
    {{"degree": string, "institution": string, "year": string, "score": string}}
  ],
  "experience": [
    {{"title": string, "company": string, "duration": string, "bullets": list of strings}}
  ],
  "projects": [
    {{"name": string, "description": string, "tech_stack": list of strings, "highlights": list of strings}}
  ],
  "certifications": list of strings
}}
"""
    system_prompt = "You are a resume analysis engine. Extract factual data without hallucinations. Return valid JSON only."

    llm_extracted = llm_service.generate_json(prompt, system_prompt)

    # 3. Merge & Deduplicate
    all_skills = set(deterministic_skills)
    candidate_name = llm_extracted.get("candidate_name")
    if not candidate_name:
        # Fallback to first line heuristic
        first_line = cleaned_text.split("\n")[0].strip()
        if len(first_line) < 40 and not any(h in first_line.upper() for h in ["RESUME", "CV", "CURRICULUM"]):
            candidate_name = first_line
    # If still None, keep as None (final_result will replace with "Candidate")

    final_result = {
        "raw_text": cleaned_text,
        "candidate_name": candidate_name or "Candidate",
        "contact_email": contact_info["email"] or llm_extracted.get("contact_email"),
        "contact_phone": contact_info["phone"] or llm_extracted.get("contact_phone"),
        "extracted_skills": sorted(list(all_skills)),
        "education": llm_extracted.get("education", []),
        "experience": llm_extracted.get("experience", []),
        "projects": llm_extracted.get("projects", []),
        "certifications": llm_extracted.get("certifications", []),
        "parsed_metadata": {
            "char_count": len(cleaned_text),
            "sections_detected": list(sections.keys()),
            "deterministic_skills_count": len(deterministic_skills),
            "total_skills_count": len(all_skills)
        }
    }

    return final_result
