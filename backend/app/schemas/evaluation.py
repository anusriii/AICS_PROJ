from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class SpeechMetricsInput(BaseModel):
    wpm: Optional[float] = 125.0
    filler_word_count: Optional[int] = 0
    pause_count: Optional[int] = 0
    long_pause_duration_sec: Optional[float] = 0.0
    speaking_duration_sec: Optional[float] = 0.0
    total_words: Optional[int] = 0


class VideoMetricsInput(BaseModel):
    face_visibility_ratio: Optional[float] = 0.95
    posture_stability_score: Optional[float] = 8.5
    presentation_consistency: Optional[float] = 8.0


class AnswerSubmitRequest(BaseModel):
    question_id: int
    answer_text: str = Field(..., min_length=2, description="Candidate verbal answer transcript or typed text")
    duration_seconds: float = Field(0.0, ge=0.0)
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    speech_metrics: Optional[SpeechMetricsInput] = None
    video_metrics: Optional[VideoMetricsInput] = None


class RubricScores(BaseModel):
    relevance: float = Field(..., ge=0, le=10)
    technical_accuracy: float = Field(..., ge=0, le=10)
    completeness: float = Field(..., ge=0, le=10)
    depth: float = Field(..., ge=0, le=10)
    clarity: float = Field(..., ge=0, le=10)
    example_usage: float = Field(..., ge=0, le=10)
    overall_score: float = Field(..., ge=0, le=10)


class EvaluationDetail(BaseModel):
    id: int
    response_id: int
    scores: RubricScores
    strengths: List[str]
    weaknesses: List[str]
    evidence: List[str]
    improvements: List[str]
    explanation: str
    suggested_action: str # increase_difficulty, maintain_difficulty, decrease_difficulty, ask_follow_up
    follow_up_prompt: Optional[str] = None
    created_at: datetime


class AnswerSubmitResponse(BaseModel):
    response_id: int
    evaluation: EvaluationDetail
    adapted_difficulty: str
    action_taken: str
    next_question: Optional[Dict[str, Any]] = None
    interview_finished: bool = False
