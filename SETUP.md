# SETUP & RUNNING INSTRUCTIONS

## 1. Prerequisites

- **Python**: Version 3.12 or 3.14
- **Node.js**: Version 18+ (tested on Node v24.19 / npm 11.17)
- **Git** (optional)

---

## 2. Backend Installation & Run

1. Open a PowerShell or terminal session and navigate to `backend`:
   ```powershell
   cd backend
   ```

2. (Recommended) Activate the Python virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```

3. (If needed) Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Populate realistic demo candidate data (Aarav Sharma):
   ```powershell
   python -m app.database.seed
   ```

5. Start the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

   The backend will be live at `http://localhost:8000`.
   Interactive OpenAPI documentation is accessible at `http://localhost:8000/api/docs`.

---

## 3. Frontend Installation & Run

1. Open a second terminal window and navigate to `frontend`:
   ```powershell
   cd frontend
   ```

2. Install npm dependencies (if not already installed):
   ```powershell
   npm install
   ```

3. Start the Vite React development server:
   ```powershell
   npm run dev
   ```

   The frontend will be live at `http://localhost:3000`.

---

## 4. Running the Test Suites

### Unit & Integration Tests:
```powershell
cd backend
python -m pytest tests
```

### Academic Evaluation Experiment:
```powershell
cd backend
python tests/run_academic_evaluation.py
```
This executes the statistical benchmark against ground-truth human evaluations and generates `data/eval_benchmarks/evaluation_results.json`.

---

## 5. Environment Variables Configuration

Copy `.env.example` to `backend/.env` if adjusting settings:

```env
PROJECT_NAME="AI Mock Interview Platform"
ENVIRONMENT="development"
DEBUG=True
API_V1_STR="/api"

SECRET_KEY="super-secret-key-change-this-in-production-btech-final-year"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SQLite (Zero-configuration default)
DATABASE_URL="sqlite:///./interview_platform.db"

# PostgreSQL (Optional production cluster switch)
# DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/mock_interview_db"

# AI Provider: 'mock' (default offline heuristic), 'gemini', or 'openai'
LLM_PROVIDER="mock"
GEMINI_API_KEY=""
OPENAI_API_KEY=""

UPLOAD_DIR="./uploads"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```
