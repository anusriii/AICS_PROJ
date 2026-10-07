from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class InterviewResponse(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    answer_text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    duration_seconds = Column(Float, default=0.0)

    # Presentation / Multimodal Metrics
    speech_metrics = Column(JSON, default=dict) # wpm, filler_words, pauses, duration, etc.
    video_metrics = Column(JSON, default=dict)  # face_visibility_ratio, posture_stability, etc.

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interview = relationship("Interview", back_populates="responses")
    question = relationship("Question", back_populates="responses")
    evaluation = relationship("Evaluation", back_populates="response", uselist=False, cascade="all, delete-orphan")
