import {
  AuthResponse,
  User,
  Resume,
  JobProfile,
  SkillMatchResponse,
  InterviewSessionState,
  AnswerSubmitResponse,
  FinalReport,
  CodingProblem,
  CodingRunResult,
  CodingEvaluationResponse,
  DashboardOverview,
  ProgressHistoryItem,
  ImprovementPlan
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = 'An API request error occurred.';
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      errMessage = `Server returned status ${res.status}: ${res.statusText}`;
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Authentication
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User>(res);
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Resumes
  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    return handleResponse<Resume>(res);
  },

  async getResume(id: number): Promise<Resume> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Resume>(res);
  },

  async listResumes(): Promise<Resume[]> {
    const res = await fetch(`${API_BASE}/resumes/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Resume[]>(res);
  },

  // Jobs
  async analyzeJob(title: string, raw_text: string, company: string = 'Target Company'): Promise<JobProfile> {
    const res = await fetch(`${API_BASE}/jobs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ title, raw_text, company }),
    });
    return handleResponse<JobProfile>(res);
  },

  async getJob(id: number): Promise<JobProfile> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<JobProfile>(res);
  },

  async listJobs(): Promise<JobProfile[]> {
    const res = await fetch(`${API_BASE}/jobs/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<JobProfile[]>(res);
  },

  // Skill Matching
  async matchResumeJob(resume_id: number, job_id: number): Promise<SkillMatchResponse> {
    const res = await fetch(`${API_BASE}/skills/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ resume_id, job_id }),
    });
    return handleResponse<SkillMatchResponse>(res);
  },

  // Interviews
  async createInterview(payload: {
    resume_id?: number;
    job_id?: number;
    interview_type: string;
    difficulty: string;
    total_questions: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async getInterviewState(interview_id: number): Promise<InterviewSessionState> {
    const res = await fetch(`${API_BASE}/interviews/${interview_id}/state`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<InterviewSessionState>(res);
  },

  async submitAnswer(interview_id: number, payload: {
    question_id: number;
    answer_text: string;
    duration_seconds: number;
    speech_metrics?: any;
    video_metrics?: any;
  }): Promise<AnswerSubmitResponse> {
    const res = await fetch(`${API_BASE}/interviews/${interview_id}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<AnswerSubmitResponse>(res);
  },

  async getQuestionHint(interview_id: number, question_id: number): Promise<{ hint: string; topic?: string; question_id: number }> {
    const res = await fetch(`${API_BASE}/interviews/${interview_id}/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ question_id }),
    });
    return handleResponse<{ hint: string; topic?: string; question_id: number }>(res);
  },

  async completeInterview(interview_id: number): Promise<FinalReport> {
    const res = await fetch(`${API_BASE}/interviews/${interview_id}/complete`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<FinalReport>(res);
  },

  async getReport(interview_id: number): Promise<FinalReport> {
    const res = await fetch(`${API_BASE}/interviews/${interview_id}/report`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<FinalReport>(res);
  },

  // Coding Round
  async startCoding(interview_id: number, difficulty: string = 'MEDIUM', problem_id?: number): Promise<CodingProblem> {
    const res = await fetch(`${API_BASE}/coding/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ interview_id, difficulty, problem_id }),
    });
    return handleResponse<CodingProblem>(res);
  },

  async startCodingBatch(interview_id: number, count: number = 5, difficulty: string = 'MEDIUM'): Promise<CodingProblem[]> {
    const res = await fetch(`${API_BASE}/coding/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ interview_id, count, difficulty }),
    });
    return handleResponse<CodingProblem[]>(res);
  },

  async runCode(attempt_id: number, code: string, language: string = 'python'): Promise<CodingRunResult> {
    const res = await fetch(`${API_BASE}/coding/${attempt_id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problem_id: attempt_id, code, language }),
    });
    return handleResponse<CodingRunResult>(res);
  },

  async submitCoding(attempt_id: number, code: string, language: string = 'python', approach_explanation?: string): Promise<CodingEvaluationResponse> {
    const res = await fetch(`${API_BASE}/coding/${attempt_id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ problem_id: attempt_id, code, language, approach_explanation }),
    });
    return handleResponse<CodingEvaluationResponse>(res);
  },

  // Analytics
  async getDashboard(): Promise<DashboardOverview> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardOverview>(res);
  },

  async getProgress(): Promise<ProgressHistoryItem[]> {
    const res = await fetch(`${API_BASE}/analytics/progress`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ProgressHistoryItem[]>(res);
  },

  async getPlan(plan_id: number): Promise<ImprovementPlan> {
    const res = await fetch(`${API_BASE}/analytics/plans/${plan_id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ImprovementPlan>(res);
  },
};
