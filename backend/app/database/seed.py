import os
from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobProfile
from app.models.skill import CandidateSkill
from app.models.interview import Interview, InterviewSection
from app.models.question import Question
from app.models.response import InterviewResponse
from app.models.evaluation import Evaluation
from app.models.coding import CodingAttempt
from app.models.analytics import ProgressRecord, ImprovementPlan
from app.services.skill_matcher import match_resume_to_jd
from app.services.skill_gap import analyze_skill_gaps
from app.services.recommendation_engine import generate_7_day_improvement_plan


def seed_demo_database():
    """Initializes tables and populates realistic demo candidate data for instant testing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Demo User
        demo_user = db.query(User).filter(User.email == "aarav.sharma@example.com").first()
        if not demo_user:
            demo_user = User(
                email="aarav.sharma@example.com",
                hashed_password=hash_password("secret123"),
                full_name="Aarav Sharma",
                role="candidate",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("Demo user created: aarav.sharma@example.com / secret123")

        # 2. Demo Resume
        demo_resume = db.query(Resume).filter(Resume.user_id == demo_user.id).first()
        if not demo_resume:
            demo_resume = Resume(
                user_id=demo_user.id,
                filename="aarav_sharma_cs_resume.pdf",
                file_path="./uploads/aarav_sharma_cs_resume.pdf",
                candidate_name="Aarav Sharma",
                contact_email="aarav.sharma@example.com",
                contact_phone="+91 9876543210",
                extracted_skills=[
                    "Python", "FastAPI", "React", "TypeScript", "PostgreSQL",
                    "Redis", "Docker", "Machine Learning", "Git", "REST APIs", "SQL", "DSA"
                ],
                education=[{
                    "degree": "B.Tech in Computer Science and Engineering",
                    "institution": "National Institute of Technology Karnataka",
                    "year": "2024",
                    "score": "8.84 CGPA"
                }],
                experience=[{
                    "title": "Software Engineering Intern",
                    "company": "TechInnovate Solutions",
                    "duration": "Jan 2024 - Jun 2024",
                    "bullets": [
                        "Designed and developed async REST APIs using FastAPI and PostgreSQL.",
                        "Optimized query response latency by 45% using composite B-Tree indexes and Redis caching."
                    ]
                }],
                projects=[
                    {
                        "name": "AI Mock Interview Platform",
                        "description": "Adaptive full-stack interview simulation with rubric scoring and AST code analysis.",
                        "tech_stack": ["FastAPI", "React", "TypeScript", "PostgreSQL", "Tailwind CSS"],
                        "highlights": ["Adaptive question tree", "Evidence-based rubric scoring"]
                    },
                    {
                        "name": "Credit Fraud Detection Engine",
                        "description": "Machine learning fraud classification with XGBoost and SMOTE handling class imbalance.",
                        "tech_stack": ["Python", "scikit-learn", "XGBoost", "Pandas"],
                        "highlights": ["92% ROC-AUC score", "Stratified cross validation"]
                    }
                ],
                certifications=[
                    "AWS Certified Solutions Architect - Associate",
                    "DeepLearning.AI Machine Learning Specialization"
                ]
            )
            db.add(demo_resume)
            db.commit()
            db.refresh(demo_resume)
            print("Demo resume loaded.")

        # 3. Demo Job Profile
        demo_job = db.query(JobProfile).filter(JobProfile.user_id == demo_user.id).first()
        if not demo_job:
            demo_job = JobProfile(
                user_id=demo_user.id,
                title="Full Stack AI Engineer",
                company="CloudNexus Technologies",
                raw_text="Architect scalable full stack web applications with FastAPI, React, PostgreSQL, Docker, and AI inference.",
                role="Full Stack AI Engineer",
                domain="Enterprise AI SaaS",
                experience_level="Entry to Mid Level (0-2 years)",
                required_skills=["Python", "FastAPI", "React", "PostgreSQL", "REST APIs", "DSA"],
                preferred_skills=["Docker", "AWS", "Redis", "TypeScript", "Microservices"],
                soft_skills=["Communication", "Problem Solving", "Adaptability"],
                responsibilities=["Build high-throughput REST APIs", "Develop reactive web UI", "Deploy ML evaluation pipelines"],
                education_requirements=["B.Tech/B.E. in CS or equivalent"],
                tools=["Git", "Docker", "Postman", "VS Code"]
            )
            db.add(demo_job)
            db.commit()
            db.refresh(demo_job)
            print("Demo job profile loaded.")

        # 4. Demo Historical Completed Interview & Progress Records
        existing_interview = db.query(Interview).filter(Interview.user_id == demo_user.id).first()
        if not existing_interview:
            match_res = match_resume_to_jd(
                resume_skills=demo_resume.extracted_skills,
                jd_required_skills=demo_job.required_skills,
                jd_preferred_skills=demo_job.preferred_skills
            )

            # Historical Interview 1 (Baseline: 6.8)
            t1 = datetime.now(timezone.utc) - timedelta(days=10)
            int1 = Interview(
                user_id=demo_user.id,
                resume_id=demo_resume.id,
                job_id=demo_job.id,
                interview_type="technical",
                target_role=demo_job.title,
                current_difficulty="MEDIUM",
                status="completed",
                total_score=6.8,
                tech_score=6.5,
                comm_score=7.2,
                coding_score=6.7,
                created_at=t1,
                completed_at=t1 + timedelta(minutes=25)
            )
            db.add(int1)

            # Historical Interview 2 (Improved: 7.6)
            t2 = datetime.now(timezone.utc) - timedelta(days=5)
            int2 = Interview(
                user_id=demo_user.id,
                resume_id=demo_resume.id,
                job_id=demo_job.id,
                interview_type="technical",
                target_role=demo_job.title,
                current_difficulty="MEDIUM",
                status="completed",
                total_score=7.6,
                tech_score=7.8,
                comm_score=7.5,
                coding_score=7.5,
                created_at=t2,
                completed_at=t2 + timedelta(minutes=30)
            )
            db.add(int2)

            # Current Interview 3 (Production Quality: 8.3)
            t3 = datetime.now(timezone.utc) - timedelta(hours=2)
            int3 = Interview(
                user_id=demo_user.id,
                resume_id=demo_resume.id,
                job_id=demo_job.id,
                interview_type="technical",
                target_role=demo_job.title,
                current_difficulty="HARD",
                status="completed",
                total_score=8.3,
                tech_score=8.5,
                comm_score=8.2,
                coding_score=8.2,
                skill_match_snapshot=match_res,
                created_at=t3,
                completed_at=t3 + timedelta(minutes=35)
            )
            db.add(int3)
            db.commit()

            # Add Questions, Responses, and Evaluations for Interview 3
            q1 = Question(
                interview_id=int3.id,
                section_name="technical",
                question_text="How does Python's Global Interpreter Lock (GIL) impact multithreading vs multiprocessing?",
                difficulty="MEDIUM",
                topic="Python",
                target_skill="Python",
                expected_answer_points=["Bytecode execution mutex", "CPU-bound vs I/O bound", "multiprocessing bypass"],
                question_order=1
            )
            db.add(q1)
            db.commit()
            db.refresh(q1)

            resp1 = InterviewResponse(
                interview_id=int3.id,
                question_id=q1.id,
                answer_text="The GIL is a mutex in CPython that prevents multiple native threads from executing Python bytecodes concurrently. For CPU-bound tasks, multithreading does not give true parallelism because of lock contention, whereas multiprocessing spawns separate processes with independent memory spaces and interpreter instances to utilize multi-core CPUs.",
                duration_seconds=55.0,
                speech_metrics={"speaking_rate_wpm": 128.0, "filler_words_count": 1, "detected_fillers": ["whereas"]},
                video_metrics={"face_visibility_ratio": 0.96, "posture_stability_score": 8.8}
            )
            db.add(resp1)
            db.commit()
            db.refresh(resp1)

            ev1 = Evaluation(
                response_id=resp1.id,
                interview_id=int3.id,
                relevance_score=9.0,
                technical_accuracy_score=8.8,
                completeness_score=8.5,
                depth_score=8.5,
                clarity_score=8.5,
                example_usage_score=7.0,
                overall_score=8.5,
                strengths=["Accurate distinction between CPython bytecode mutex and OS thread scheduling.", "Clear articulation of CPU-bound vs I/O tradeoffs."],
                weaknesses=["Could mention alternative implementations such as PyPy or Jython that eliminate GIL."],
                evidence=["Candidate accurately noted: 'multiprocessing spawns separate processes with independent memory spaces'."],
                improvements=["Analyze asyncio event loops as cooperative single-threaded concurrency."],
                explanation="Comprehensive answer exhibiting strong runtime understanding.",
                suggested_action="increase_difficulty"
            )
            db.add(ev1)

            # Skill Gaps and 7-day Plan for Interview 3
            gaps = analyze_skill_gaps(
                [{"target_skill": "Python", "score": 8.8}, {"target_skill": "FastAPI", "score": 8.0}],
                ["Microservices", "Docker"]
            )
            plan_days = generate_7_day_improvement_plan(
                weak_areas=gaps["weak_areas"],
                average_areas=gaps["average_areas"],
                topic_level_gaps=gaps["topic_level_gaps"],
                target_role=demo_job.title
            )
            plan_rec = ImprovementPlan(
                user_id=demo_user.id,
                interview_id=int3.id,
                target_role=demo_job.title,
                plan_data=plan_days,
                focus_skills=gaps["weak_areas"]
            )
            db.add(plan_rec)

            int3.summary_report = {
                "interview_id": int3.id,
                "interview_type": "technical",
                "target_role": demo_job.title,
                "overall_score": 8.3,
                "technical_score": 8.5,
                "communication_score": 8.2,
                "coding_score": 8.2,
                "rubric_breakdown": {
                    "technical_accuracy": 8.8,
                    "relevance": 9.0,
                    "completeness": 8.5,
                    "depth": 8.5,
                    "clarity": 8.5,
                    "example_usage": 7.0
                },
                "speech_summary": {
                    "average_wpm": 128.0,
                    "cadence": "Optimal Conversational Cadence",
                    "filler_words_detected": ["basically"]
                },
                "presentation_summary": {
                    "face_visibility_percentage": 96.0,
                    "posture_stability_score": 8.8
                },
                "skill_gaps": gaps,
                "strengths_identified": ["Strong CPython internals mastery", "Clear architectural communication"],
                "weaknesses_identified": ["Distributed microservices and container networking"],
                "actionable_recommendations": ["Review Docker multi-stage builds and Kubernetes pod lifecycle"]
            }

            # Progress Records for Timeline
            db.add(ProgressRecord(user_id=demo_user.id, interview_id=int1.id, interview_type="technical", overall_score=6.8, technical_score=6.5, communication_score=7.2, coding_score=6.7, recorded_at=t1))
            db.add(ProgressRecord(user_id=demo_user.id, interview_id=int2.id, interview_type="technical", overall_score=7.6, technical_score=7.8, communication_score=7.5, coding_score=7.5, recorded_at=t2))
            db.add(ProgressRecord(user_id=demo_user.id, interview_id=int3.id, interview_type="technical", overall_score=8.3, technical_score=8.5, communication_score=8.2, coding_score=8.2, recorded_at=t3))

            db.commit()
            print("Demo historical interviews and progress records successfully seeded.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding demo database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_database()
