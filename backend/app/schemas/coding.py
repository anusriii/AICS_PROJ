from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class TestCaseView(BaseModel):
    id: int
    input_str: str
    expected_output: str


class CodingProblemResponse(BaseModel):
    id: int
    interview_id: int
    problem_title: str
    problem_description: str
    difficulty: str
    constraints: List[str]
    examples: List[Dict[str, Any]]
    initial_code: str
    language: str
    starter_templates: Optional[Dict[str, str]] = None
    visible_tests: List[TestCaseView]


class CodingRunRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"


class TestExecutionDetail(BaseModel):
    test_number: int
    input: str
    expected: str
    actual: str
    passed: bool
    error: Optional[str] = None
    execution_time_ms: float = 0.0


class CodingRunResult(BaseModel):
    all_passed: bool
    passed_count: int
    total_count: int
    results: List[TestExecutionDetail]
    console_output: Optional[str] = None


class CodingSubmitRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"
    approach_explanation: Optional[str] = None


class CodingEvaluationResponse(BaseModel):
    attempt_id: int
    tests_passed: int
    total_tests: int
    correctness_score: float # 0 to 10
    time_complexity_score: float # 0 to 10
    space_complexity_score: float # 0 to 10
    edge_case_score: float # 0 to 10
    code_quality_score: float # 0 to 10
    final_coding_score: float # 0 to 10
    detected_time_complexity: str
    expected_time_complexity: str
    detected_space_complexity: str
    expected_space_complexity: str
    complexity_explanation: str
    code_quality_feedback: List[str]
    status: str
