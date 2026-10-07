# API DOCUMENTATION: AI MOCK INTERVIEW PLATFORM

All API endpoints reside beneath the base route `/api`. Protected routes require a valid JWT passed in the HTTP Authorization header: `Bearer <token>`.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a candidate user account.
- **Request Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "secretpassword",
    "full_name": "Aarav Sharma"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "candidate@example.com",
      "full_name": "Aarav Sharma",
      "role": "candidate",
      "is_active": true,
      "created_at": "2026-10-05T09:30:00Z"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates user credentials and issues JWT token.
- **Request Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "secretpassword"
  }
  ```
- **Response** (`200 OK`): TokenResponse

### `GET /api/auth/me`
Retrieves authenticated user profile. Requires Bearer Token.

---

## 2. Resume Intelligence Endpoints

### `POST /api/resumes/upload`
Uploads a PDF resume and runs multi-stage extraction pipeline.
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (PDF file binary)
- **Response** (`201 Created`):
  ```json
  {
    "id": 1,
    "user_id": 1,
    "filename": "candidate_resume.pdf",
    "candidate_name": "Aarav Sharma",
    "contact_email": "candidate@example.com",
    "extracted_skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Machine Learning"],
    "education": [{"degree": "B.Tech in CSE", "institution": "NITK", "year": "2024", "score": "8.84 CGPA"}],
    "experience": [{"title": "Software Engineering Intern", "company": "TechInnovate", "duration": "Jan 2024 - Jun 2024", "bullets": ["Built async APIs"]}],
    "projects": [{"name": "AI Mock Interview Platform", "description": "Adaptive full-stack simulator", "tech_stack": ["FastAPI", "React"]}],
    "certifications": ["AWS Solutions Architect Associate"]
  }
  ```

### `GET /api/resumes/{resume_id}`
Retrieves parsed resume by ID.

### `GET /api/resumes/`
Lists all resumes uploaded by current user.

---

## 3. Job Description Intelligence Endpoints

### `POST /api/jobs/analyze`
Extracts structured technical competencies from raw job description text.
- **Request Body**:
  ```json
  {
    "title": "Full Stack AI Engineer",
    "company": "CloudNexus Technologies",
    "raw_text": "We are seeking a Full Stack AI Engineer skilled in Python, FastAPI, React, and PostgreSQL..."
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 1,
    "title": "Full Stack AI Engineer",
    "company": "CloudNexus Technologies",
    "role": "Full Stack AI Engineer",
    "domain": "Artificial Intelligence & Enterprise SaaS",
    "required_skills": ["Python", "FastAPI", "React", "PostgreSQL", "REST APIs"],
    "preferred_skills": ["Docker", "AWS", "Redis"],
    "soft_skills": ["Communication", "Problem Solving"],
    "responsibilities": ["Design high-throughput APIs", "Build reactive UI"]
  }
  ```

---

## 4. Skill Alignment & Matching

### `POST /api/skills/match`
Evaluates profile-to-role syllabus coverage.
- **Request Body**:
  ```json
  {
    "resume_id": 1,
    "job_id": 1
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "resume_id": 1,
    "job_id": 1,
    "overall_match_percentage": 92.5,
    "required_skills_coverage": 100.0,
    "total_matched_count": 5,
    "total_partial_count": 1,
    "total_gap_count": 0,
    "matches": [
      {
        "skill": "Python",
        "status": "MATCH",
        "importance": "REQUIRED",
        "candidate_evidence": "Exact match found on candidate profile: 'Python'"
      }
    ],
    "explanation": "Resume covers 100.0% of required competencies..."
  }
  ```

---

## 5. Adaptive Interview Orchestration

### `POST /api/interviews`
Initializes adaptive session, blueprints rounds, and spawns Question #1.
- **Request Body**:
  ```json
  {
    "resume_id": 1,
    "job_id": 1,
    "interview_type": "technical",
    "difficulty": "MEDIUM",
    "total_questions": 5
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "interview_id": 1,
    "interview_type": "technical",
    "target_role": "Full Stack AI Engineer",
    "initial_difficulty": "MEDIUM",
    "current_question": {
      "id": 1,
      "order": 1,
      "section": "technical",
      "difficulty": "MEDIUM",
      "topic": "Python",
      "question_text": "How does Python's Global Interpreter Lock (GIL) impact multithreading vs multiprocessing?",
      "expected_points": ["Bytecode mutex", "CPU-bound vs I/O bound", "multiprocessing bypass"]
    }
  }
  ```

### `GET /api/interviews/{interview_id}/state`
Retrieves live state for browser refresh recovery.

### `POST /api/interviews/{interview_id}/response`
Submits candidate answer, computes speech/presentation telemetry, runs rubric scoring, and triggers adaptive difficulty scaling.
- **Request Body**:
  ```json
  {
    "question_id": 1,
    "answer_text": "The GIL is a mutex in CPython that prevents multiple native threads from executing bytecodes concurrently...",
    "duration_seconds": 45.0,
    "speech_metrics": {"speaking_duration_sec": 45.0, "total_words": 85},
    "video_metrics": {"face_visibility_ratio": 0.95, "posture_stability_score": 8.5}
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "response_id": 1,
    "evaluation": {
      "scores": {
        "technical_accuracy": 8.5,
        "relevance": 9.0,
        "completeness": 8.0,
        "depth": 8.0,
        "clarity": 8.5,
        "example_usage": 7.0,
        "overall_score": 8.3
      },
      "strengths": ["Clear explanation of CPython mutex mechanics."],
      "weaknesses": ["Could mention alternative Python runtimes without GIL."],
      "evidence": ["Candidate correctly noted: 'prevents multiple native threads from executing bytecodes'."],
      "improvements": ["Analyze asyncio single-threaded cooperative event loops."],
      "suggested_action": "increase_difficulty"
    },
    "adapted_difficulty": "HARD",
    "action_taken": "increase_difficulty",
    "next_question": {
      "id": 2,
      "order": 2,
      "difficulty": "HARD",
      "topic": "FastAPI",
      "question_text": "How would you implement distributed token revocation and WebSocket streaming in FastAPI at scale?"
    },
    "interview_finished": false
  }
  ```

### `POST /api/interviews/{interview_id}/complete`
Concludes interview, executes diagnostic skill gap engine, generates 7-day preparation roadmap, and saves longitudinal progress.

### `GET /api/interviews/{interview_id}/report`
Retrieves final evaluation report.

---

## 6. Algorithmic Coding Round

### `POST /api/coding/start`
Starts coding challenge. Returns problem description, starter template, visible tests.

### `POST /api/coding/{attempt_id}/run`
Runs candidate code in sandbox against visible test cases.

### `POST /api/coding/{attempt_id}/submit`
Submits code for evaluation: executes hidden test suite, AST complexity detection, and multidimensional grading.

---

## 7. Analytics & Dashboards

### `GET /api/analytics/dashboard`
Returns aggregated candidate metrics, skill radar map, historical sessions, and active 7-day roadmap.

### `GET /api/analytics/progress`
Returns multi-session timeline scores.

### `GET /api/analytics/plans/{plan_id}`
Retrieves personalized 7-day remedial roadmap.
