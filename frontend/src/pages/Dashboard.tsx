import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardOverview, DayPlanItem } from '../types';
import { SkillChart } from '../components/SkillChart';
import {
  Sparkles,
  PlayCircle,
  FileText,
  Briefcase,
  BrainCircuit,
  Code,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  ArrowRight,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayPlanItem | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const candidateName = data?.candidate_name || 'Candidate';
  const totalInterviews = data?.total_interviews || 0;
  const avgScore = data?.average_score || 0.0;
  const bestScore = data?.best_score || 0.0;
  const skills = data?.skill_matrix || {
    Python: 8.5,
    FastAPI: 8.0,
    React: 7.8,
    'SQL / DBMS': 6.8,
    'System Design': 6.4,
    Communication: 8.2,
  };
  const activePlan = data?.active_plan;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-800/40 p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Adaptive Mock Interview Simulation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {candidateName}
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Target role preparation with live dynamic difficulty adaptation, rubric-based
              evaluations, AST algorithmic complexity analysis, and automated 7-day remedial roadmaps.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/setup"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Sessions</p>
            <p className="text-2xl font-black text-white font-mono">{totalInterviews}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-black text-white font-mono">
              {avgScore.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Best Performance</p>
            <p className="text-2xl font-black text-white font-mono">
              {bestScore.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-600/15 text-sky-400 border border-sky-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Readiness Level</p>
            <p className="text-base font-bold text-sky-400">
              {avgScore >= 8.0 ? 'Production Ready' : avgScore >= 6.0 ? 'Interview Ready' : 'In Preparation'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Journey Cards */}
      <div>
        <h2 className="text-base font-bold text-slate-200 mb-4">Recommended Preparation Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/resume"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Upload Resume</h3>
            <p className="text-xs text-slate-400 mt-1">
              Extract projects, education, and technical competencies from PDF.
            </p>
          </Link>

          <Link
            to="/job"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Job Description</h3>
            <p className="text-xs text-slate-400 mt-1">
              Analyze required vs preferred skills, responsibilities, and tools.
            </p>
          </Link>

          <Link
            to="/skills"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Skill Matching</h3>
            <p className="text-xs text-slate-400 mt-1">
              View exact matches, partial experience, and diagnostic skill gaps.
            </p>
          </Link>

          <Link
            to="/coding"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">4. Coding Round</h3>
            <p className="text-xs text-slate-400 mt-1">
              Solve algorithmic problems with AST complexity detection & hidden tests.
            </p>
          </Link>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart */}
        <div className="lg:col-span-1">
          <SkillChart skills={skills} title="Candidate Competency Radar" />
        </div>

        {/* Recent Interviews List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Recent Interview Sessions</h3>
              <p className="text-xs text-slate-400">Longitudinal performance records</p>
            </div>
            <Link to="/progress" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All History →
            </Link>
          </div>

          {(!data?.recent_interviews || data.recent_interviews.length === 0) ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-3">
              <p>No mock interviews taken yet.</p>
              <Link
                to="/setup"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                <span>Launch Your First Interview</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_interviews.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white capitalize">
                        {item.type.replace('_', ' ')} Round
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.target_role || 'Software Engineer'} • {item.created_at}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-indigo-400 font-mono">
                        {item.score.toFixed(1)}
                        <span className="text-xs text-slate-500 font-normal"> / 10</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{item.status}</span>
                    </div>

                    <Link
                      to={`/results/${item.id}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="View Report"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active 7-Day Improvement Plan Preview */}
      {activePlan && activePlan.daily_schedule && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Personalized Diagnostic Curriculum</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                7-Day Remedial Practice Roadmap ({activePlan.target_role || 'Target Role'})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Click any day card to inspect tailored curriculum objectives, practice tasks, and launch exercises.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
              {activePlan.daily_schedule.length} Modules Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activePlan.daily_schedule.map((d) => (
              <div
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/70 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                      Day {d.day}
                    </span>
                    <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Open Details →
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mt-2">
                    {d.focus_topic}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {d.objectives[0] || 'Master internal mechanics and complexity tradeoffs.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-300">{d.practice_tasks.length} Exercises</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline">
                    View Tasks &amp; Exercises
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal / Detail View for Clicked Day */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Curriculum Module • Day {selectedDay.day} of {activePlan?.daily_schedule.length}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedDay.focus_topic}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDay.title || activePlan?.target_role || 'Target Competency'}</p>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Learning Objectives</h4>
              <ul className="space-y-2">
                {selectedDay.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Tasks & Exercises */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Assigned Practice Tasks &amp; Exercises ({selectedDay.practice_tasks.length})
              </h4>
              <div className="space-y-2.5">
                {selectedDay.practice_tasks.map((task, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200">{task}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 inline-block">Estimated effort: 25-40 min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Resources */}
            {selectedDay.recommended_resources && selectedDay.recommended_resources.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Recommended References</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDay.recommended_resources.map((res, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  disabled={selectedDay.day <= 1}
                  onClick={() => {
                    const prev = activePlan?.daily_schedule.find((x) => x.day === selectedDay.day - 1);
                    if (prev) setSelectedDay(prev);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Day</span>
                </button>
                <button
                  disabled={!activePlan || selectedDay.day >= activePlan.daily_schedule.length}
                  onClick={() => {
                    const next = activePlan?.daily_schedule.find((x) => x.day === selectedDay.day + 1);
                    if (next) setSelectedDay(next);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <span>Next Day</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/coding"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Practice in Coding Lab</span>
                </Link>
                <Link
                  to="/setup"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Launch Interview Session</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
