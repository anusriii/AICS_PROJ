export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface EducationItem {
  degree?: string;
  institution?: string;
  year?: string;
  score?: string;
}

export interface ExperienceItem {
  title?: string;
  company?: string;
  duration?: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  description?: string;
  tech_stack: string[];
  highlights: string[];
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  candidate_name?: string;
  contact_email?: string;
  contact_phone?: string;
  extracted_skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  created_at: string;
}

export interface JobProfile {
  id: number;
  user_id: number;
  title: string;
  company?: string;
  role?: string;
  domain?: string;
  experience_level?: string;
  required_skills: string[];
  preferred_skills: string[];
  soft_skills: string[];
  responsibilities: string[];
  education_requirements: string[];
  tools: string[];
  created_at: string;
}

export interface SkillMatchItem {
  skill: string;
  status: 'MATCH' | 'PARTIAL' | 'GAP';
  importance: 'REQUIRED' | 'PREFERRED';
  candidate_evidence?: string;
  confidence_score: number;
}

export interface SkillMatchResponse {
  resume_id: number;
  job_id: number;
  candidate_name?: string;
  target_role?: string;
  overall_match_percentage: number;
  required_skills_coverage: number;
  total_matched_count: number;
  total_partial_count: number;
  total_gap_count: number;
  matches: SkillMatchItem[];
  strong_matches: string[];
  partial_matches: string[];
  missing_skills: string[];
  explanation: string;
}

export interface QuestionView {
  id: number;
  order: number;
  section: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
  question_text: string;
  expected_points: string[];
  is_follow_up?: boolean;
  follow_up_reason?: string;
}

export interface RubricScores {
  relevance: number;
  technical_accuracy: number;
  completeness: number;
  depth: number;
  clarity: number;
  example_usage: number;
  overall_score: number;
}

export interface EvaluationDetail {
  id: number;
  response_id: number;
  scores: RubricScores;
  strengths: string[];
  weaknesses: string[];
  evidence: string[];
  improvements: string[];
  explanation: string;
  suggested_action: string;
  follow_up_prompt?: string;
  created_at: string;
}

export interface AnswerSubmitResponse {
  response_id: number;
  evaluation: EvaluationDetail;
  adapted_difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  action_taken: string;
  next_question?: QuestionView;
  interview_finished: boolean;
}

export interface InterviewSessionState {
  interview_id: number;
  status: string;
  interview_type: string;
  current_difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_number: number;
  total_questions: number;
  completed_count: number;
  is_finished: boolean;
  current_question?: QuestionView;
  scores: Record<string, number>;
}

export interface DayPlanItem {
  day: number;
  title: string;
  focus_topic: string;
  objectives: string[];
  practice_tasks: string[];
  recommended_resources: string[];
}

export interface ImprovementPlan {
  id: number;
  interview_id: number;
  target_role?: string;
  focus_skills: string[];
  daily_schedule: DayPlanItem[];
  created_at: string;
}

export interface FinalReport {
  interview_id: number;
  interview_type: string;
  target_role?: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  coding_score: number;
  rubric_breakdown: Record<string, number>;
  speech_summary: {
    average_wpm?: number;
    cadence?: string;
    filler_words_detected?: string[];
  };
  presentation_summary: {
    face_visibility_percentage?: number;
    posture_stability_score?: number;
  };
  skill_gaps: {
    strong_areas: string[];
    average_areas: string[];
    weak_areas: string[];
    topic_level_gaps: Record<string, string[]>;
  };
  strengths_identified: string[];
  weaknesses_identified: string[];
  actionable_recommendations: string[];
  improvement_plan_id?: number;
  created_at: string;
}

export interface TestCaseView {
  id: number;
  input_str: string;
  expected_output: string;
}

export interface CodingProblem {
  id: number;
  interview_id: number;
  problem_title: string;
  problem_description: string;
  difficulty: string;
  constraints: string[];
  examples: Array<{ input: string; output: string }>;
  initial_code: string;
  language: string;
  function_name?: string;
  function_names?: Record<string, string>;
  starter_templates?: Record<string, string>;
  visible_tests: TestCaseView[];
}

export interface TestExecutionDetail {
  test_number: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  execution_time_ms: number;
}

export interface CodingRunResult {
  all_passed: boolean;
  passed_count: number;
  total_count: number;
  results: TestExecutionDetail[];
  console_output?: string;
}

export interface CodingEvaluationResponse {
  attempt_id: number;
  tests_passed: number;
  total_tests: number;
  correctness_score: number;
  time_complexity_score: number;
  space_complexity_score: number;
  edge_case_score: number;
  code_quality_score: number;
  final_coding_score: number;
  detected_time_complexity: string;
  expected_time_complexity: string;
  detected_space_complexity: string;
  expected_space_complexity: string;
  complexity_explanation: string;
  code_quality_feedback: string[];
  status: string;
}

export interface ProgressHistoryItem {
  interview_id: number;
  date: string;
  interview_type: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  coding_score: number;
}

export interface DashboardOverview {
  candidate_name: string;
  total_interviews: number;
  average_score: number;
  best_score: number;
  latest_interview_id?: number;
  recent_interviews: Array<{
    id: number;
    type: string;
    target_role?: string;
    difficulty: string;
    score: number;
    status: string;
    created_at: string;
  }>;
  skill_matrix: Record<string, number>;
  progress_timeline: ProgressHistoryItem[];
  active_plan?: ImprovementPlan;
}
