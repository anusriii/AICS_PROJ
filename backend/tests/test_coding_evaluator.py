from app.services.coding_evaluator import (
    execute_test_suite,
    detect_algorithmic_complexity,
    evaluate_coding_submission
)


def test_two_sum_optimal_solution():
    code = """def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
"""
    result = execute_test_suite(code, problem_id=1, include_hidden=True)
    assert result["all_passed"] is True
    assert result["passed_count"] == result["total_count"]


def test_two_sum_ast_complexity():
    code = """def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
"""
    time_c, space_c, _ = detect_algorithmic_complexity(code)
    assert time_c == "O(n)"
    assert space_c == "O(n)"


def test_two_sum_nested_loops_complexity():
    code = """def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
"""
    time_c, space_c, _ = detect_algorithmic_complexity(code)
    assert time_c == "O(n^2)"


def test_complete_coding_submission_grading():
    code = """def two_sum(nums, target):
    # Hash table lookup
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
"""
    evaluation = evaluate_coding_submission(problem_id=1, code=code)
    assert evaluation["tests_passed"] == evaluation["total_tests"]
    assert evaluation["correctness_score"] == 10.0
    assert evaluation["final_coding_score"] >= 8.5
    assert evaluation["detected_time_complexity"] == "O(n)"


def test_valid_parentheses_and_max_subarray():
    from app.services.coding_evaluator import CODING_CHALLENGES
    assert len(CODING_CHALLENGES) >= 5

    p4 = next(p for p in CODING_CHALLENGES if p["id"] == 4)
    r4 = execute_test_suite(p4["initial_code"], problem_id=4, include_hidden=True)
    assert r4["all_passed"] is True

    p5 = next(p for p in CODING_CHALLENGES if p["id"] == 5)
    r5 = execute_test_suite(p5["initial_code"], problem_id=5, include_hidden=True)
    assert r5["all_passed"] is True

