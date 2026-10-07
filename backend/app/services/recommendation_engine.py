from typing import Dict, Any, List


def generate_7_day_improvement_plan(
    weak_areas: List[str],
    average_areas: List[str],
    topic_level_gaps: Dict[str, List[str]],
    target_role: str = "Full Stack Engineer"
) -> List[Dict[str, Any]]:
    """
    Constructs a personalized 7-day preparation roadmap directly mapped
    to the candidate's diagnosed technical deficiencies.
    """
    plan = []
    
    # Flatten priority topics from diagnosed gaps
    priority_topics = []
    for skill in weak_areas + average_areas:
        gaps = topic_level_gaps.get(skill, [])
        for g in gaps:
            priority_topics.append((skill, g))

    # Fallback default curricular milestones if sparse
    default_milestones = [
        ("Databases", "Database Indexing & B-Trees"),
        ("Databases", "ACID Transactions & Isolation"),
        ("DSA", "Sliding Window & Two Pointer Techniques"),
        ("DSA", "Binary Search & Tree Traversals"),
        ("System Architecture", "REST API Design & Caching Strategies"),
        ("System Architecture", "SOLID Principles & Clean Code Patterns")
    ]

    for day in range(1, 7):
        if day - 1 < len(priority_topics):
            skill_domain, topic_name = priority_topics[day - 1]
        else:
            skill_domain, topic_name = default_milestones[day - 1]

        plan.append({
            "day": day,
            "title": f"Day {day}: {topic_name}",
            "focus_topic": topic_name,
            "objectives": [
                f"Master core internal mechanisms of {topic_name}.",
                f"Analyze asymptotic time and space complexity tradeoffs in {skill_domain}.",
                "Understand common production failure modes and boundary edge cases."
            ],
            "practice_tasks": [
                f"Implement a hands-on code prototype demonstrating {topic_name}.",
                f"Solve 2 LeetCode / HackerRank problems focusing on {topic_name}."
            ],
            "recommended_resources": [
                f"Official {skill_domain} Architecture Documentation",
                "NeetCode.io & System Design Primer Guides"
            ]
        })

    # Day 7 is always the Mock Interview Re-evaluation milestone
    plan.append({
        "day": 7,
        "title": "Day 7: Full Adaptive Mock Interview & Evaluation",
        "focus_topic": f"Comprehensive Re-assessment for {target_role}",
        "objectives": [
            "Test mastery of all remediated technical gaps from Days 1-6.",
            "Verify vocal pacing, filler word reduction, and presentation framing.",
            "Complete an end-to-end coding round with optimal time complexity."
        ],
        "practice_tasks": [
            f"Launch a new Adaptive Interview session on the platform targeting {target_role}.",
            "Compare before/after score metrics on the Progress Dashboard."
        ],
        "recommended_resources": [
            "Platform Analytics Dashboard",
            "Past Interview Explainable Evidence Logs"
        ]
    })

    return plan
