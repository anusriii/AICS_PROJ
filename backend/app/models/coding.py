from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class CodingAttempt(Base):
    __tablename__ = "coding_attempts"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)

    problem_title = Column(String(255), nullable=False)
    problem_description = Column(Text, nullable=False)
    difficulty = Column(String(20), default="MEDIUM")
    constraints = Column(JSON, default=list)
    examples = Column(JSON, default=list)
    initial_code = Column(Text, nullable=False)
    user_code = Column(Text, nullable=True)
    language = Column(String(50), default="python")

    # Test cases & Verification
    visible_test_cases = Column(JSON, default=list)
    hidden_test_cases = Column(JSON, default=list)
    tests_passed = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)

    # Multi-dimensional Scoring (0 to 10 scale)
    correctness_score = Column(Float, default=0.0)
    complexity_score = Column(Float, default=0.0)
    code_quality_score = Column(Float, default=0.0)
    edge_case_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)

    # Complexity Breakdown
    detected_time_complexity = Column(String(50), nullable=True)
    expected_time_complexity = Column(String(50), nullable=True)
    detected_space_complexity = Column(String(50), nullable=True)
    expected_space_complexity = Column(String(50), nullable=True)
    complexity_explanation = Column(Text, nullable=True)
    execution_output = Column(JSON, default=dict)

    status = Column(String(50), default="started") # started, tested, submitted
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interview = relationship("Interview", back_populates="coding_attempts")
