import random
from typing import Dict, Any, List, Optional
from app.services.llm_service import llm_service


# Structured Technical Knowledge Bank (Difficulty & Topic indexed)
TECHNICAL_QUESTION_BANK = {
    "Python": {
        "EASY": [
            ("Explain the difference between list and tuple in Python, including mutability and memory overhead.",
             ["Mutability difference", "Memory overhead", "Use cases (keys in dicts)", "Hashability"]),
            ("What are Python decorators and how do they work under the hood?",
             ["First-class functions", "Closure mechanics", "@ syntax syntactic sugar", "Wrapping functions"])
        ],
        "MEDIUM": [
            ("How does Python's Global Interpreter Lock (GIL) impact multithreading vs multiprocessing?",
             ["Bytecode execution mutex", "CPU-bound vs I/O bound tasks", "multiprocessing module bypass", "Context switching"]),
            ("Explain Python memory management, reference counting, and generational garbage collection.",
             ["Reference counting counter", "Cyclic reference detection", "Three generational thresholds (0, 1, 2)", "gc module"])
        ],
        "HARD": [
            ("Explain the internals of Python generators, coroutines, and asyncio event loops. How does 'yield from' delegate?",
             ["Stack frame preservation", "Generator iterator protocol", "Future/Task resolution in asyncio", "Bidirectional data transfer"])
        ]
    },
    "FastAPI": {
        "EASY": [
            ("What makes FastAPI performant compared to Flask or Django, and how does Pydantic fit in?",
             ["Starlette ASGI base", "Pydantic type parsing & validation", "Automatic OpenAPI docs", "Async def endpoints"]),
        ],
        "MEDIUM": [
            ("How does FastAPI dependency injection work (Depends), and how do you handle database session lifecycles?",
             ["Yield dependencies", "Automatic resource cleanup / finally block", "Sub-dependency resolution graph", "Connection pooling"])
        ],
        "HARD": [
            ("How would you implement rate limiting, distributed JWT token revocation, and WebSocket streaming in FastAPI at scale?",
             ["Redis token blacklist", "Token bucket / sliding window rate limiting", "Async WebSocket connection manager", "Background tasks vs Celery"])
        ]
    },
    "React": {
        "EASY": [
            ("Explain the virtual DOM and how React reconciles differences using the Diffing algorithm.",
             ["Virtual DOM in-memory representation", "Heuristic O(n) diffing", "Keys in lists", "Batching updates"])
        ],
        "MEDIUM": [
            ("What causes unnecessary re-renders in React, and how do useMemo, useCallback, and React.memo mitigate this?",
             ["Reference equality in JS", "Pure component comparisons", "Memoization overhead tradeoffs", "Prop drilling vs context"])
        ],
        "HARD": [
            ("Explain React 18 Concurrent features (Suspense, useTransition, useDeferredValue) and how they prevent UI blocking.",
             ["Time slicing", "Interruptible rendering", "Priority lanes", "Hydration boundaries"])
        ]
    },
    "SQL": {
        "EASY": [
            ("Explain the difference between WHERE and HAVING clauses in SQL, and when each is evaluated.",
             ["Evaluation order", "WHERE filters rows before aggregation", "HAVING filters groups post-GROUP BY", "Aggregate functions usage"])
        ],
        "MEDIUM": [
            ("Explain database indexing with B-Trees. What is a composite index and why does column order matter?",
             ["B-Tree search complexity O(log N)", "Leftmost prefix rule", "Write amplification overhead", "Covering indexes"])
        ],
        "HARD": [
            ("Explain ACID properties, database isolation levels (Read Uncommitted to Serializable), and phenomena like Phantom Reads.",
             ["Atomicity, Consistency, Isolation, Durability", "Dirty reads, Non-repeatable reads, Phantom reads", "Multi-Version Concurrency Control (MVCC)", "Two-Phase Locking"])
        ]
    },
    "General": {
        "EASY": [
            ("Explain the four fundamental pillars of Object-Oriented Programming (OOP) with practical software examples.",
             ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"]),
            ("What is REST and what are the key constraints of a RESTful architectural style?",
             ["Statelessness", "Client-Server separation", "Uniform interface & HTTP methods", "Cacheability"])
        ],
        "MEDIUM": [
            ("What is the difference between monolithic architecture and microservices? What tradeoffs do they involve?",
             ["Independent deployment", "Network latency & serialization overhead", "Distributed transactions / Saga pattern", "Operational complexity"]),
            ("Explain how DNS resolution, TCP handshake, and TLS negotiation work when typing a URL into a web browser.",
             ["Recursive DNS lookup", "SYN, SYN-ACK, ACK 3-way handshake", "TLS 1.3 cryptographic exchange", "HTTP GET request"])
        ],
        "HARD": [
            ("How would you design a distributed cache system like Redis? How do you handle cache invalidation, thundering herd, and split-brain?",
             ["LRU eviction policy", "Cache-aside vs Write-through", "Consistent hashing with virtual nodes", "Gossip protocol / Quorum consensus"])
        ]
    }
}

HR_QUESTION_BANK = [
    ("Tell me about yourself, your technical background, and what motivated you to pursue this engineering role.",
     ["Clear elevator pitch", "Academic/project highlights", "Relevance to target position", "Concise delivery"]),
    ("Describe a challenging technical obstacle you encountered in a group project. How did you resolve team disagreements?",
     ["STAR method structure", "Clear definition of conflict/problem", "Constructive communication", "Measurable resolution"]),
    ("What are your greatest technical strengths, and what is one area you have actively worked to improve over the last six months?",
     ["Self-awareness", "Specific strength with evidence", "Constructive weakness", "Concrete action taken to grow"]),
    ("Why are you interested in joining our engineering team, and where do you see your technical trajectory in the next 2-3 years?",
     ["Company / domain understanding", "Career aspirations", "Willingness to learn", "Long-term commitment"]),
    ("Tell me about a time when a software release or feature failed or didn't work as expected. What did you learn from it?",
     ["Accountability", "Root cause analysis mindset", "Post-mortem learning", "Resilience under pressure"])
]


def generate_question(
    interview_type: str,
    difficulty: str,
    topic: Optional[str] = None,
    candidate_profile: Optional[Dict[str, Any]] = None,
    job_profile: Optional[Dict[str, Any]] = None,
    previous_questions: Optional[List[str]] = None,
    previous_evaluations: Optional[List[Dict[str, Any]]] = None,
    is_follow_up: bool = False,
    follow_up_reason: Optional[str] = None,
    parent_question_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligently generates the next interview question using rich contextual prompt engineering,
    preventing duplicate questions and tailoring depth to candidate performance.
    """
    prev_q_list = previous_questions or []
    target_diff = difficulty.upper()
    if target_diff not in ("EASY", "MEDIUM", "HARD"):
        target_diff = "MEDIUM"

    role_title = job_profile.get("title", "Software Engineer") if job_profile else "Software Engineer"
    candidate_name = candidate_profile.get("candidate_name", "Candidate") if candidate_profile else "Candidate"
    projects = candidate_profile.get("projects", []) if candidate_profile else []

    # 1. Project / Resume Round Logic: Challenge Specific Claims
    if interview_type == "resume_project" and projects and not is_follow_up:
        chosen_project = random.choice(projects)
        p_name = chosen_project.get("name", "Key Project")
        p_tech = ", ".join(chosen_project.get("tech_stack", [])) or "Full Stack"
        p_desc = chosen_project.get("description", "")

        prompt = f"""
Candidate {candidate_name} claims the following project on their resume:
Project Title: "{p_name}"
Technologies: {p_tech}
Description: "{p_desc}"
Target Role: {role_title}
Difficulty: {target_diff}
Already asked questions to avoid: {prev_q_list}

Generate a probing, technically rigorous interview question that tests the candidate's actual engineering depth,
architectural decisions, algorithm/database tradeoffs, or limitations of their implementation.

Return valid JSON:
{{
  "question_text": string,
  "topic": "Resume Project Verification: {p_name}",
  "difficulty": "{target_diff}",
  "target_skill": "{p_name}",
  "expected_answer_points": [string, string, string]
}}
"""
        system_prompt = "You are a senior tech interviewer verifying candidate claims from their resume. Never ask generic questions."
        llm_q = llm_service.generate_json(prompt, system_prompt)
        if llm_q.get("question_text") and llm_q["question_text"] not in prev_q_list:
            return llm_q

        # Fallback project challenge
        return {
            "question_text": f"In your project '{p_name}', what were the most significant technical constraints or bottlenecks you faced, and why did you select {p_tech} over alternative architectures?",
            "topic": f"Project Architecture: {p_name}",
            "difficulty": target_diff,
            "target_skill": p_name,
            "expected_answer_points": [
                "Architectural justification",
                "Tradeoffs considered",
                "Data handling or bottleneck resolution",
                "Production limitations"
            ]
        }

    # 2. Intelligent Follow-Up Generation
    if is_follow_up and parent_question_text:
        prompt = f"""
You are conducting an adaptive interview. The candidate just answered the question:
Parent Question: "{parent_question_text}"
Reason for Follow-Up: "{follow_up_reason or 'Probe deeper on edge cases and code implementation'}"
Target Difficulty: {target_diff}
Previously asked questions: {prev_q_list}

Generate an immediate, targeted follow-up question that directly investigates their previous answer, asks for a concrete example, or challenges an unsubstantiated claim.

Return valid JSON:
{{
  "question_text": string,
  "topic": "Targeted Follow-up",
  "difficulty": "{target_diff}",
  "target_skill": "{topic or 'Core Engineering'}",
  "expected_answer_points": [string, string]
}}
"""
        llm_q = llm_service.generate_json(prompt, "You are an adaptive technical interviewer asking a follow-up.")
        if llm_q.get("question_text") and llm_q["question_text"] not in prev_q_list:
            return llm_q

        return {
            "question_text": f"Following up on your answer: could you provide a concrete code example or explain how that behaves when system concurrency or data scale increases significantly?",
            "topic": f"Follow-up: {topic or 'Deep Dive'}",
            "difficulty": target_diff,
            "target_skill": topic or "Technical Depth",
            "expected_answer_points": ["Concrete code / architecture illustration", "Scale and edge cases"]
        }

    # 3. HR Mode
    if interview_type == "hr":
        available_hr = [q for q in HR_QUESTION_BANK if q[0] not in prev_q_list]
        if not available_hr:
            available_hr = HR_QUESTION_BANK
        selected = random.choice(available_hr)
        return {
            "question_text": selected[0],
            "topic": "HR & Behavioral Competencies",
            "difficulty": target_diff,
            "target_skill": "Communication & Professionalism",
            "expected_answer_points": selected[1]
        }

    # 4. Technical Mode via LLM with Fallback to Deterministic Bank
    skills_to_test = []
    if job_profile and job_profile.get("required_skills"):
        skills_to_test.extend(job_profile.get("required_skills", []))
    if candidate_profile and candidate_profile.get("extracted_skills"):
        skills_to_test.extend(candidate_profile.get("extracted_skills", []))

    chosen_skill = topic or (random.choice(skills_to_test) if skills_to_test else "General")

    prompt = f"""
Role: {role_title}
Focus Skill/Topic: {chosen_skill}
Current Difficulty Level: {target_diff}
Already asked questions (DO NOT REPEAT ANY OF THESE):
{prev_q_list}

Generate a clear, technically precise interview question testing practical concepts, system behavior, or design tradeoffs.

Return valid JSON:
{{
  "question_text": string,
  "topic": "{chosen_skill}",
  "difficulty": "{target_diff}",
  "target_skill": "{chosen_skill}",
  "expected_answer_points": [string, string, string]
}}
"""
    llm_q = llm_service.generate_json(prompt, "You are a senior technical interviewer. Create unique, rigorous questions.")
    if llm_q.get("question_text") and llm_q["question_text"] not in prev_q_list:
        return llm_q

    # Fallback from question bank
    skill_category = "General"
    for k in TECHNICAL_QUESTION_BANK.keys():
        if k.lower() in chosen_skill.lower():
            skill_category = k
            break

    diff_bank = TECHNICAL_QUESTION_BANK[skill_category].get(target_diff, TECHNICAL_QUESTION_BANK[skill_category]["MEDIUM"])
    filtered = [item for item in diff_bank if item[0] not in prev_q_list]
    if not filtered:
        filtered = TECHNICAL_QUESTION_BANK["General"][target_diff]

    chosen = random.choice(filtered)
    return {
        "question_text": chosen[0],
        "topic": f"{skill_category} Fundamentals",
        "difficulty": target_diff,
        "target_skill": chosen_skill,
        "expected_answer_points": chosen[1]
    }
