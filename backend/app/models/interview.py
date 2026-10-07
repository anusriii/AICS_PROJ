from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True, index=True)
    job_id = Column(Integer, ForeignKey("job_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    
    interview_type = Column(String(50), default="technical") # hr, technical, resume_project, coding, comprehensive
    target_role = Column(String(255), nullable=True)
    current_difficulty = Column(String(20), default="MEDIUM") # EASY, MEDIUM, HARD
    status = Column(String(50), default="created")            # created, in_progress, completed
    
    # Quantitative Scores (0.0 to 10.0 scale)
    total_score = Column(Float, default=0.0)
    tech_score = Column(Float, default=0.0)
    comm_score = Column(Float, default=0.0)
    coding_score = Column(Float, default=0.0)

    # Dynamic Planning & Meta
    plan_config = Column(JSON, default=dict)
    skill_match_snapshot = Column(JSON, default=dict)
    summary_report = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    job_profile = relationship("JobProfile", back_populates="interviews")
    sections = relationship("InterviewSection", back_populates="interview", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")
    responses = relationship("InterviewResponse", back_populates="interview", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="interview", cascade="all, delete-orphan")
    coding_attempts = relationship("CodingAttempt", back_populates="interview", cascade="all, delete-orphan")
    improvement_plan = relationship("ImprovementPlan", back_populates="interview", uselist=False, cascade="all, delete-orphan")


class InterviewSection(Base):
    __tablename__ = "interview_sections"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    section_name = Column(String(50), nullable=False) # technical, hr, resume_project, coding
    weight = Column(Float, default=0.25)
    target_questions = Column(Integer, default=3)
    completed_questions = Column(Integer, default=0)

    interview = relationship("Interview", back_populates="sections")
