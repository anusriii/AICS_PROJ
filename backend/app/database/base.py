# Central SQLAlchemy metadata registry
from app.database.session import Base
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobProfile
from app.models.skill import Skill, CandidateSkill
from app.models.interview import Interview, InterviewSection
from app.models.question import Question
from app.models.response import InterviewResponse
from app.models.evaluation import Evaluation
from app.models.coding import CodingAttempt
from app.models.analytics import SkillScore, ImprovementPlan, ProgressRecord

__all__ = [
    "Base",
    "User",
    "Resume",
    "JobProfile",
    "Skill",
    "CandidateSkill",
    "Interview",
    "InterviewSection",
    "Question",
    "InterviewResponse",
    "Evaluation",
    "CodingAttempt",
    "SkillScore",
    "ImprovementPlan",
    "ProgressRecord",
]
