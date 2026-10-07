import re
from typing import Dict, List, Optional
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text content from a PDF file using pypdf."""
    text_content = []
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        return "\n".join(text_content)
    except Exception as e:
        raise ValueError(f"Failed to read PDF document: {str(e)}")


def clean_extracted_text(raw_text: str) -> str:
    """Cleans whitespace, line endings, and non-printable characters."""
    cleaned = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extracts email and phone using regex heuristics."""
    email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    phone_pattern = r"(?:(?:\+|00)?[1-9]\d{0,2}[-.\s]?)?(?:(?:\(\d{1,4}\)|\d{1,4})[-.\s]?)?\d{3,5}[-.\s]?\d{4,6}"

    email_match = re.search(email_pattern, text)
    phone_match = re.search(phone_pattern, text)

    return {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0).strip() if phone_match else None,
    }


def segment_resume_sections(text: str) -> Dict[str, str]:
    """
    Segments raw resume text into logical sections based on standard header heuristics.
    """
    headers = [
        "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT HISTORY", "INTERNSHIPS",
        "EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS",
        "PROJECTS", "ACADEMIC PROJECTS", "KEY PROJECTS",
        "SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "TECHNOLOGIES",
        "CERTIFICATIONS", "LICENSES & CERTIFICATIONS", "ACHIEVEMENTS", "HONORS"
    ]
    pattern = r"(?i)(?:^|\n)\s*(" + "|".join(headers) + r")\s*[:\n]"

    matches = list(re.finditer(pattern, text))
    sections: Dict[str, str] = {}

    if not matches:
        sections["FULL_BODY"] = text
        return sections

    for i in range(len(matches)):
        header_name = matches[i].group(1).upper()
        start_idx = matches[i].end()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start_idx:end_idx].strip()
        sections[header_name] = content

    return sections
