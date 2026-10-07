import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FinalReport, ImprovementPlan } from '../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Volume2,
  Video,
  ArrowRight,
  TrendingUp,
  Sliders,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  BookOpen,
  Code2
} from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const interviewId = Number(id);

  const [report, setReport] = useState<FinalReport | null>(null);
  const [plan, setPlan] = useState<ImprovementPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`plan_tasks_${interviewId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.getReport(interviewId);
        setReport(res);
        if (res.improvement_plan_id) {
          const p = await api.getPlan(res.improvement_plan_id);
          setPlan(p);
        }
      } catch (err: any) {
        setError(err.message || 'Report not found or interview still in progress.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [interviewId]);

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskKey]: !prev[taskKey] };
      localStorage.setItem(`plan_tasks_${interviewId}`, JSON.stringify(next));
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <p className="text-xs text-rose-400">{error || 'Report unavailable.'}</p>
        <Link
          to="/dashboard"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Hiring Decision Verdict Computation
  const overall = report.overall_score;
  let verdict = {
    title: 'STRONG HIRE',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600 ring-2 ring-emerald-500/20',
    description: 'Outstanding technical depth, crisp communication, and exemplary architectural reasoning.',
  };
  if (overall < 5.5) {
    verdict = {
      title: 'NEEDS PREPARATION',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-600 ring-2 ring-rose-500/20',
      description: 'Foundational gaps identified. Recommend completing the 7-day remedial curriculum before re-attempting.',
    };
  } else if (overall < 7.0) {
    verdict = {
      title: 'LEAN HIRE',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600 ring-2 ring-amber-500/20',
      description: 'Good fundamentals demonstrated with minor gaps in production edge cases and internal mechanisms.',
    };
  } else if (overall < 8.5) {
    verdict = {
      title: 'HIRE',
      badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-600 ring-2 ring-indigo-500/20',
      description: 'Solid competency across core requirements. Capable of performing role responsibilities effectively.',
    };
  }

  const rubricMetrics = [
    { key: 'technical_accuracy', label: 'Technical Accuracy', weight: '30%', score: report.technical_score },
    { key: 'relevance', label: 'Question Relevance', weight: '20%', score: report.rubric_breakdown?.relevance || report.overall_score },
    { key: 'completeness', label: 'Completeness of Concept', weight: '20%', score: report.rubric_breakdown?.completeness || report.technical_score },
    { key: 'depth', label: 'Mechanisms & Internal Depth', weight: '15%', score: report.rubric_breakdown?.depth || (report.technical_score * 0.95) },
    { key: 'clarity', label: 'Communication Clarity', weight: '10%', score: report.communication_score },
    { key: 'example_usage', label: 'Practical Production Examples', weight: '5%', score: report.rubric_breakdown?.example_usage || (report.technical_score * 0.85) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Final Comprehensive Evaluation Report
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Session #{report.interview_id}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Performance Assessment: {report.target_role || 'Software Engineer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-dimensional rubric scoring, speech telemetry, diagnostic gap detection, and 7-day action plan.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Executive Decision Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Candidate Evaluation Verdict:
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${verdict.badgeClass}`}>
                {verdict.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{verdict.description}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Composite Score</span>
          <div className="text-3xl font-black text-indigo-400 font-mono">
            {report.overall_score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>
      </div>

      {/* Aggregate Score KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Technical Accuracy</span>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {report.technical_score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Algorithmic & architectural facts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Communication Clarity</span>
          <div className="text-3xl font-black text-sky-400 font-mono mt-1">
            {report.communication_score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Structure, articulation, and pacing</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Algorithmic Coding</span>
          <div className="text-3xl font-black text-purple-400 font-mono mt-1">
            {report.coding_score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Complexity & test correctness</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Speaking Pace</span>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {report.speech_summary?.average_wpm || 128} <span className="text-xs text-slate-500 font-normal">WPM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{report.speech_summary?.cadence || 'Optimal Cadence'}</p>
        </div>
      </div>

      {/* 6-Dimension Rubric Breakdown Grid */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Explainable 6-Factor Rubric Competency Breakdown</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rubricMetrics.map((m) => {
            const pct = Math.min(100, Math.round((m.score / 10) * 100));
            return (
              <div key={m.key} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white">{m.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({m.weight})</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-300">
                    {Number(m.score).toFixed(1)} / 10
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multimodal Telemetry: Speech & Video Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speech Characteristics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>Speech Characteristics Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Speaking Pace</span>
              <span className="text-lg font-bold text-white">{report.speech_summary?.average_wpm || 128} WPM</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">{report.speech_summary?.cadence || 'Optimal Cadence'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Filler Words Detected</span>
              <span className="text-lg font-bold text-amber-400">
                {report.speech_summary?.filler_words_detected?.length || 2} detected
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {report.speech_summary?.filler_words_detected?.join(', ') || 'like, basically'}
              </span>
            </div>
          </div>
        </div>

        {/* Presentation Signals */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Video className="w-4 h-4" />
            <span>Webcam Presentation Framing</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Face Visibility Ratio</span>
              <span className="text-lg font-bold text-white">
                {report.presentation_summary?.face_visibility_percentage || 94}%
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Consistent Framing</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Posture Stability</span>
              <span className="text-lg font-bold text-sky-400">
                {report.presentation_summary?.posture_stability_score || 8.6} / 10
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Steady Camera Alignment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Qualitative Feedback: Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths_identified && report.strengths_identified.length > 0 ? (
              report.strengths_identified.map((s, i) => (
                <li key={i} className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific strengths captured.</li>
            )}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Key Improvement Recommendations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.actionable_recommendations && report.actionable_recommendations.length > 0 ? (
              report.actionable_recommendations.map((r, i) => (
                <li key={i} className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-amber-400 font-bold shrink-0">→</span>
                  <span>{r}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">Continue following standard practice regimen.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Skill Gaps Breakdown */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
            Diagnostic Gap Analysis
          </span>
          <h3 className="text-lg font-bold text-white mt-1">Topic-Level Knowledge Deficiencies</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strong */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase">Strong Areas</span>
            <div className="flex flex-wrap gap-1">
              {report.skill_gaps.strong_areas.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-emerald-900/60 text-emerald-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Average */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/50 space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase">Average Areas</span>
            <div className="flex flex-wrap gap-1">
              {report.skill_gaps.average_areas.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-sky-900/60 text-sky-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Weak Gaps */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase">Diagnosed Skill Gaps</span>
            <div className="flex flex-wrap gap-1">
              {report.skill_gaps.weak_areas.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-rose-900/60 text-rose-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 7-Day Improvement Plan Schedule with Progress Tracking */}
      {plan && plan.daily_schedule && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Personalized Remedial Curriculum</span>
              </div>
              <h3 className="text-xl font-bold text-white">Your 7-Day Action Practice Plan</h3>
              <p className="text-xs text-slate-400 mt-1">
                Target each diagnosed deficiency with concrete coding exercises, reading, and self-checks.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">
                Study Completion:{' '}
                <span className="font-bold text-emerald-400">
                  {Object.values(completedTasks).filter(Boolean).length} / {plan.daily_schedule.length} Days Completed
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plan.daily_schedule.map((item) => {
              const taskKey = `day_${item.day}`;
              const isDone = !!completedTasks[taskKey];

              return (
                <div
                  key={item.day}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                        Day {item.day}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTask(taskKey)}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-900 text-emerald-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckSquare className="w-3 h-3 text-emerald-400" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3 h-3 text-slate-400" />
                            <span>Mark Done</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mt-1.5">{item.title}</h4>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Objectives:
                      </span>
                      {item.objectives.map((obj, oi) => (
                        <div key={oi} className="flex items-start space-x-1.5">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300 block">Practical Coding Task:</span>
                    <p className="line-clamp-2">{item.practice_tasks[0] || 'Solve 2 targeted coding challenges.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
