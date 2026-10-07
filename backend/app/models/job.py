from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class JobProfile(Base):
    __tablename__ = "job_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=False)
    
    # Structured Extracted Information
    role = Column(String(255), nullable=True)
    domain = Column(String(255), nullable=True)
    experience_level = Column(String(100), nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    education_requirements = Column(JSON, default=list)
    tools = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="job_profiles")
    interviews = relationship("Interview", back_populates="job_profile")
