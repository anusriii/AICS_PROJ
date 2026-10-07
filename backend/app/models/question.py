from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    section_name = Column(String(50), default="technical")
    question_text = Column(Text, nullable=False)
    difficulty = Column(String(20), default="MEDIUM") # EASY, MEDIUM, HARD
    topic = Column(String(100), nullable=True)
    target_skill = Column(String(100), nullable=True)
    expected_answer_points = Column(JSON, default=list) # key concepts, examples, syntax expected
    
    # Adaptive & Follow-Up Linkage
    is_follow_up = Column(Boolean, default=False)
    parent_question_id = Column(Integer, ForeignKey("questions.id", ondelete="SET NULL"), nullable=True)
    follow_up_reason = Column(String(255), nullable=True)
    question_order = Column(Integer, default=1)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    responses = relationship("InterviewResponse", back_populates="question", cascade="all, delete-orphan")
    follow_ups = relationship("Question", backref="parent_question", remote_side=[id])
