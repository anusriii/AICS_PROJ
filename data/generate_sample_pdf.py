from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_resume_pdf(output_path: str):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    y = height - 50
    margin = 50
    
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, y, "Aarav Sharma")
    y -= 18
    
    c.setFont("Helvetica", 10)
    c.drawString(margin, y, "aarav.sharma@example.com | +91 9876543210 | Bengaluru, India")
    y -= 14
    c.drawString(margin, y, "GitHub: github.com/aarav-sharma | LinkedIn: linkedin.com/in/aarav-sharma")
    y -= 25
    
    # Section: Education
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "EDUCATION")
    c.line(margin, y - 2, width - margin, y - 2)
    y -= 16
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "Bachelor of Technology in Computer Science and Engineering")
    c.setFont("Helvetica", 10)
    c.drawString(width - margin - 120, y, "2020 - 2024")
    y -= 14
    c.drawString(margin, y, "National Institute of Technology Karnataka | CGPA: 8.84 / 10.0")
    y -= 25
    
    # Section: Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "TECHNICAL SKILLS")
    c.line(margin, y - 2, width - margin, y - 2)
    y -= 16
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "Languages: ")
    c.setFont("Helvetica", 9)
    c.drawString(margin + 70, y, "Python, Java, TypeScript, JavaScript, SQL, C++")
    y -= 14
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "Backend & APIs: ")
    c.setFont("Helvetica", 9)
    c.drawString(margin + 80, y, "FastAPI, Spring Boot, REST APIs, Microservices, PostgreSQL, Redis, SQLite")
    y -= 14
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "Frontend: ")
    c.setFont("Helvetica", 9)
    c.drawString(margin + 50, y, "React, Next.js, Redux, Tailwind CSS, HTML5, CSS3")
    y -= 14
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "Cloud & DevOps: ")
    c.setFont("Helvetica", 9)
    c.drawString(margin + 80, y, "Docker, AWS, Git, CI/CD Pipelines, Linux")
    y -= 25
    
    # Section: Experience
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "EXPERIENCE")
    c.line(margin, y - 2, width - margin, y - 2)
    y -= 16
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "Software Engineering Intern | TechInnovate Solutions")
    c.setFont("Helvetica", 9)
    c.drawString(width - margin - 120, y, "Jan 2024 - Jun 2024")
    y -= 14
    c.drawString(margin + 10, y, "- Developed asynchronous RESTful APIs using FastAPI and PostgreSQL handling 100k+ requests.")
    y -= 14
    c.drawString(margin + 10, y, "- Reduced query latency by 40% with B-Tree composite indexes and Redis cache invalidation.")
    y -= 14
    c.drawString(margin + 10, y, "- Implemented JWT authentication and containerized microservices using Docker.")
    y -= 25
    
    # Section: Projects
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "KEY PROJECTS")
    c.line(margin, y - 2, width - margin, y - 2)
    y -= 16
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "AI-Powered Adaptive Mock Interview Platform")
    y -= 14
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, y, "- Tech Stack: FastAPI, React, TypeScript, PostgreSQL, Tailwind CSS")
    y -= 14
    c.drawString(margin + 10, y, "- Created dynamic difficulty adaptation engine based on real-time answer rubric scoring.")
    y -= 14
    c.drawString(margin + 10, y, "- Built AST-based algorithmic code complexity analyzer and test execution sandbox.")
    y -= 18
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "Financial Fraud Detection Engine")
    y -= 14
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, y, "- Tech Stack: Python, scikit-learn, XGBoost, Pandas")
    y -= 14
    c.drawString(margin + 10, y, "- Handled class imbalance using SMOTE and achieved 92% ROC-AUC score.")
    y -= 25

    # Section: Certifications
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "CERTIFICATIONS")
    c.line(margin, y - 2, width - margin, y - 2)
    y -= 16
    c.setFont("Helvetica", 9)
    c.drawString(margin + 10, y, "- AWS Certified Solutions Architect - Associate")
    y -= 14
    c.drawString(margin + 10, y, "- DeepLearning.AI Machine Learning Specialization")
    
    c.save()
    print(f"Sample PDF resume generated at {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__)) + "/sample_resumes"
    os.makedirs(out_dir, exist_ok=True)
    create_resume_pdf(os.path.join(out_dir, "sample_fullstack_resume.pdf"))
