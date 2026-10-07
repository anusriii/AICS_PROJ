import pytest
from app.services.coding_evaluator import (
    CODING_CHALLENGES,
    execute_test_suite,
    evaluate_coding_submission,
    detect_algorithmic_complexity
)

def test_python_evaluation():
    p1 = CODING_CHALLENGES[0]
    res = execute_test_suite(p1["starter_templates"]["python"], 1, language="python", include_hidden=False)
    assert res["all_passed"] is True
    assert res["passed_count"] == 3

    eval_res = evaluate_coding_submission(1, p1["starter_templates"]["python"], language="python")
    assert eval_res["tests_passed"] == 6
    assert eval_res["final_coding_score"] >= 8.5

def test_javascript_evaluation():
    p1 = CODING_CHALLENGES[0]
    res = execute_test_suite(p1["starter_templates"]["javascript"], 1, language="javascript", include_hidden=False)
    assert res["all_passed"] is True
    assert res["passed_count"] == 3

    time_c, space_c, _ = detect_algorithmic_complexity(p1["starter_templates"]["javascript"], language="javascript")
    assert time_c == "O(n)"
    assert space_c == "O(n)"

    eval_res = evaluate_coding_submission(1, p1["starter_templates"]["javascript"], language="javascript")
    assert eval_res["tests_passed"] == 6
    assert eval_res["final_coding_score"] >= 8.5

def test_java_evaluation():
    p1 = CODING_CHALLENGES[0]
    res = execute_test_suite(p1["starter_templates"]["java"], 1, language="java", include_hidden=False)
    assert res["all_passed"] is True
    assert res["passed_count"] == 3

    time_c, space_c, _ = detect_algorithmic_complexity(p1["starter_templates"]["java"], language="java")
    assert time_c == "O(n)"
    assert space_c == "O(n)"

    eval_res = evaluate_coding_submission(1, p1["starter_templates"]["java"], language="java")
    assert eval_res["tests_passed"] == 6
    assert eval_res["final_coding_score"] >= 8.5

def test_cpp_evaluation():
    p1 = CODING_CHALLENGES[0]
    res = execute_test_suite(p1["starter_templates"]["cpp"], 1, language="cpp", include_hidden=False)
    assert res["all_passed"] is True
    assert res["passed_count"] == 3

    time_c, space_c, _ = detect_algorithmic_complexity(p1["starter_templates"]["cpp"], language="cpp")
    assert time_c == "O(n)"
    assert space_c == "O(n)"

    eval_res = evaluate_coding_submission(1, p1["starter_templates"]["cpp"], language="cpp")
    assert eval_res["tests_passed"] == 6
    assert eval_res["final_coding_score"] >= 8.5
