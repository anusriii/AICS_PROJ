import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume, JobProfile, SkillMatchResponse } from '../types';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export const SkillMatch: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | ''>('');
  const [selectedJobId, setSelectedJobId] = useState<number | ''>('');
  const [matchData, setMatchData] = useState<SkillMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function initData() {
      try {
        const [rList, jList] = await Promise.all([api.listResumes(), api.listJobs()]);
        setResumes(rList);
        setJobs(jList);
        if (rList.length > 0) setSelectedResumeId(rList[0].id);
        if (jList.length > 0) setSelectedJobId(jList[0].id);
      } catch (err: any) {
        console.warn('Initialization error:', err);
      }
    }
    initData();
  }, []);

  const handleRunMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError('Please select both a resume and a job description.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.matchResumeJob(Number(selectedResumeId), Number(selectedJobId));
      setMatchData(res);
    } catch (err: any) {
      setError(err.message || 'Skill matching failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCH':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'PARTIAL':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Resume-JD Skill Matching Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compute competency alignment, partial technology clusters, and targeted interview focus gaps.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Candidate Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.candidate_name || r.filename} ({r.extracted_skills.length} skills)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Target Job Profile
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company || 'Company'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRunMatch}
          disabled={loading || !selectedResumeId || !selectedJobId}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? 'Evaluating Competency Overlap...' : 'Run Profile-to-JD Skill Alignment Matrix'}
        </button>
      </div>

      {/* Results View */}
      {matchData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Required Skills Coverage</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {matchData.required_skills_coverage.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Mandatory prerequisite alignment</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Overall Syllabus Match</span>
              <div className="text-3xl font-black text-indigo-400 font-mono mt-1">
                {matchData.overall_match_percentage.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Weighted required & preferred skills</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Competency Breakdown</span>
              <div className="flex items-center space-x-3 text-xs mt-2 font-mono">
                <span className="text-emerald-400 font-bold">{matchData.total_matched_count} Matched</span>
                <span className="text-sky-400 font-bold">{matchData.total_partial_count} Partial</span>
                <span className="text-amber-400 font-bold">{matchData.total_gap_count} Gaps</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Directly guides interview question focus</p>
            </div>
          </div>

          {/* Academic Transparency Disclaimer Alert */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">Academic & Evaluative Notice: </strong>
              {matchData.explanation}
            </p>
          </div>

          {/* Detailed Skill Matrix Table */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Skill Verification & Gap Table</h3>
                <p className="text-xs text-slate-400">Granular mapping of JD requirements to candidate profile</p>
              </div>
              <button
                onClick={() => navigate('/setup')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Configure Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Skill Requirement</th>
                    <th className="px-5 py-3.5">Importance</th>
                    <th className="px-5 py-3.5">Match Status</th>
                    <th className="px-5 py-3.5">Candidate Evidence & Foundation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {matchData.matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-200">{m.skill}</td>
                      <td className="px-5 py-3.5 text-slate-400">{m.importance}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            m.status
                          )}`}
                        >
                          {m.status === 'MATCH' ? 'STRONG MATCH' : m.status === 'PARTIAL' ? 'PARTIAL / RELATED' : 'SKILL GAP'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono text-[11px]">
                        {m.candidate_evidence || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
