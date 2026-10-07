from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True) # Programming, Database, Cloud, Web, AI/ML, Soft Skill
    description = Column(String(255), nullable=True)


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    proficiency = Column(String(50), default="intermediate") # beginner, intermediate, advanced
    match_status = Column(String(50), default="matched")     # match, partial, gap
    verified_in_interview = Column(Float, default=0.0)      # 0 to 10 score
    evidence = Column(JSON, default=list)

    resume = relationship("Resume", back_populates="skills")
