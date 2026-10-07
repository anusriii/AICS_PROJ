from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    
    # Structured Extracted Information
    candidate_name = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    education = Column(JSON, default=list)        # list of {degree, institution, year, score}
    experience = Column(JSON, default=list)       # list of {title, company, duration, bullets}
    projects = Column(JSON, default=list)         # list of {name, description, tech_stack, highlights}
    certifications = Column(JSON, default=list)   # list of cert names/issuers
    extracted_skills = Column(JSON, default=list) # flat list of skill strings
    parsed_metadata = Column(JSON, default=dict)  # parsing timestamps, stats

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="resumes")
    interviews = relationship("Interview", back_populates="resume")
    skills = relationship("CandidateSkill", back_populates="resume", cascade="all, delete-orphan")
