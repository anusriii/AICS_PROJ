from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)

    # Granular Rubric Criteria Scores (0 to 10 scale)
    relevance_score = Column(Float, default=0.0)          # 20%
    technical_accuracy_score = Column(Float, default=0.0) # 30%
    completeness_score = Column(Float, default=0.0)       # 20%
    depth_score = Column(Float, default=0.0)              # 15%
    clarity_score = Column(Float, default=0.0)            # 10%
    example_usage_score = Column(Float, default=0.0)      # 5%
    overall_score = Column(Float, default=0.0)            # Composite

    # Explainable Evidence Layer
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    evidence = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    explanation = Column(Text, nullable=True)

    # Adaptive Transition Directives
    suggested_action = Column(String(50), default="maintain_difficulty") # increase_difficulty, maintain_difficulty, decrease_difficulty, ask_follow_up
    follow_up_prompt = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    response = relationship("InterviewResponse", back_populates="evaluation")
    interview = relationship("Interview", back_populates="evaluations")
