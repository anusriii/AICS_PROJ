from typing import Dict, Any, List


TOPIC_LEVEL_KNOWLEDGE_GRAPH = {
    "dbms": ["Normalization (3NF / BCNF)", "ACID Transactions & Isolation Levels", "B-Tree Indexing & Query Optimization"],
    "sql": ["Window Functions (ROW_NUMBER, RANK)", "Index Scan vs Index Seek", "Query Execution Plans"],
    "dsa": ["Sliding Window & Two Pointers", "Binary Search on Answer Space", "Graph Traversal & Cycle Detection"],
    "oop": ["Liskov Substitution & Interface Segregation", "Runtime Polymorphism vs Overloading", "Design Patterns (Factory, Strategy)"],
    "python": ["Global Interpreter Lock (GIL) & Concurrency", "Generators & Memory Management", "Asyncio Event Loop Mechanics"],
    "react": ["Reconciliation Diffing Algorithm", "Hooks Dependency Arrays & Memoization", "Concurrent Features & Suspense"],
    "fastapi": ["ASGI Event Loop Lifecycle", "Pydantic Schema Serialization", "Dependency Injection Scopes"],
    "system design": ["Consistent Hashing & Partitioning", "Cache Invalidation & Thundering Herd", "Database Sharding & Replication Lag"]
}


def analyze_skill_gaps(
    skill_evaluations: List[Dict[str, Any]],
    missing_jd_skills: List[str]
) -> Dict[str, Any]:
    """
    Categorizes technical performance into Strong, Average, and Weak areas.
    Maps deficient domains to specific topic-level learning objectives.
    """
    skill_scores_map: Dict[str, List[float]] = {}

    for ev in skill_evaluations:
        target = ev.get("target_skill", "General")
        score = ev.get("score", 6.0)
        skill_scores_map.setdefault(target, []).append(score)

    strong_areas = []
    average_areas = []
    weak_areas = []

    for skill, scores in skill_scores_map.items():
        avg_score = sum(scores) / len(scores)
        if avg_score >= 7.5:
            strong_areas.append(skill)
        elif avg_score >= 5.5:
            average_areas.append(skill)
        else:
            weak_areas.append(skill)

    # Ingest missing JD skills into weak areas if not already listed
    for ms in missing_jd_skills:
        if ms not in weak_areas and ms not in strong_areas and ms not in average_areas:
            weak_areas.append(ms)

    # Default fallback populations if too few questions were asked
    if not strong_areas and not average_areas and not weak_areas:
        strong_areas = ["Python", "REST APIs"]
        average_areas = ["SQL", "FastAPI"]
        weak_areas = ["System Design", "DSA"]

    # Generate topic-level gaps
    topic_level_gaps: Dict[str, List[str]] = {}
    for w in weak_areas + average_areas:
        w_lower = w.lower()
        matched_kg = False
        for kg_key, topics in TOPIC_LEVEL_KNOWLEDGE_GRAPH.items():
            if kg_key in w_lower or w_lower in kg_key:
                topic_level_gaps[w] = topics
                matched_kg = True
                break
        if not matched_kg:
            topic_level_gaps[w] = [f"Foundations of {w}", f"Production Implementation in {w}", f"Performance Tuning in {w}"]

    return {
        "strong_areas": strong_areas,
        "average_areas": average_areas,
        "weak_areas": weak_areas,
        "topic_level_gaps": topic_level_gaps
    }
