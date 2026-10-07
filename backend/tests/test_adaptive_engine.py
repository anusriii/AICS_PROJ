from app.services.adaptive_engine import adapt_difficulty, should_trigger_follow_up


def test_difficulty_adaptation_rules():
    # High score -> Step UP
    assert adapt_difficulty("EASY", 8.5) == "MEDIUM"
    assert adapt_difficulty("MEDIUM", 8.0) == "HARD"
    assert adapt_difficulty("HARD", 9.2) == "HARD"

    # Average score -> Maintain
    assert adapt_difficulty("MEDIUM", 6.5) == "MEDIUM"
    assert adapt_difficulty("EASY", 7.0) == "EASY"
    assert adapt_difficulty("HARD", 6.8) == "HARD"

    # Weak score -> Step DOWN
    assert adapt_difficulty("HARD", 4.5) == "MEDIUM"
    assert adapt_difficulty("MEDIUM", 5.0) == "EASY"
    assert adapt_difficulty("EASY", 3.0) == "EASY"


def test_follow_up_guardrails():
    # If already a follow-up, never trigger another consecutive follow-up
    evaluation = {
        "suggested_action": "ask_follow_up",
        "follow_up_prompt": "Explain deeper",
        "scores": {"technical_accuracy": 6.0, "example_usage": 3.0}
    }
    trigger, _ = should_trigger_follow_up(evaluation, was_last_question_follow_up=True)
    assert trigger is False

    # First time with missing examples -> trigger follow-up
    trigger2, reason = should_trigger_follow_up(evaluation, was_last_question_follow_up=False)
    assert trigger2 is True
    assert reason is not None
