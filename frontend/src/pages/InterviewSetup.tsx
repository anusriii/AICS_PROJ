import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume, JobProfile } from '../types';
import {
  Sliders,
  PlayCircle,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
  Code,
  Users,
  FolderGit2,
  Building2,
  GraduationCap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const InterviewSetup: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | ''>('');
  const [selectedJobId, setSelectedJobId] = useState<number | ''>('');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [targetTrack, setTargetTrack] = useState('faang');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [rList, jList] = await Promise.all([api.listResumes(), api.listJobs()]);
        setResumes(rList);
        setJobs(jList);
        if (rList.length > 0) setSelectedResumeId(rList[0].id);
        if (jList.length > 0) setSelectedJobId(jList[0].id);
      } catch (err) {
        console.warn('Error loading options:', err);
      }
    }
    loadData();
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createInterview({
        resume_id: selectedResumeId ? Number(selectedResumeId) : undefined,
        job_id: selectedJobId ? Number(selectedJobId) : undefined,
        interview_type: interviewType,
        difficulty: difficulty,
        total_questions: totalQuestions,
      });

      if (interviewType === 'coding') {
        navigate(`/coding?interview_id=${res.interview_id}&questions=${totalQuestions}`);
      } else {
        navigate(`/interview/${res.interview_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize interview session.');
    } finally {
      setLoading(false);
    }
  };

  const interviewModes = [
    {
      id: 'technical',
      name: 'Technical Round',
      desc: 'Role-specific questions covering programming, DSA, DBMS, APIs, and System Design.',
      icon: Zap,
    },
    {
      id: 'hr',
      name: 'HR & Behavioral Round',
      desc: 'STAR-method situational queries, team collaboration, leadership, and culture fit.',
      icon: Users,
    },
    {
      id: 'resume_project',
      name: 'Resume / Project Round',
      desc: 'Deep challenge on datasets, algorithms, tradeoffs, and limitations in your uploaded projects.',
      icon: FolderGit2,
    },
    {
      id: 'coding',
      name: 'Coding Round',
      desc: 'Interactive code editor with visible/hidden test cases and AST complexity evaluation.',
      icon: Code,
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Simulation',
      desc: 'Multi-round blended mock interview covering Technical, Project, HR, and Coding.',
      icon: Layers,
    },
  ];

  const targetTracks = [
    {
      id: 'faang',
      name: 'FAANG / Tier-1 Tech',
      company: 'Google, Meta, Amazon, Microsoft',
      focus: 'High Scale, Data Structures, Concurrency, System Design & Leadership Principles',
    },
    {
      id: 'fintech',
      name: 'Fintech & High Reliability',
      company: 'Stripe, Goldman Sachs, Jane Street',
      focus: 'Low Latency, ACID Transactions, Concurrency, Security, Error Resiliency',
    },
    {
      id: 'ai_startup',
      name: 'AI & GenAI Systems',
      company: 'OpenAI, Anthropic, Scale AI',
      focus: 'LLM Workflows, RAG Architecture, Vector DBs, PyTorch, Fast Prototyping',
    },
    {
      id: 'enterprise_saas',
      name: 'Enterprise Cloud & SaaS',
      company: 'Salesforce, Atlassian, Snowflake',
      focus: 'REST/GraphQL APIs, Distributed Caching, Microservices, Clean Architecture',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Configure Adaptive Interview Session
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select target company track, interview round, calibrate difficulty, and link candidate profile.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-7">
        {/* Step 1: Target Track & Seniority */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>1. Select Target Company Track & Experience Level</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {targetTracks.map((tr) => {
              const isSelected = targetTrack === tr.id;
              return (
                <div
                  key={tr.id}
                  onClick={() => setTargetTrack(tr.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tr.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <span className="text-[11px] text-indigo-300/90 block mb-1 font-mono">
                    {tr.company}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tr.focus}</p>
                </div>
              );
            })}
          </div>

          {/* Seniority Selector */}
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">Target Seniority:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
              {[
                { id: 'entry', label: 'Junior (0-2 Yrs)' },
                { id: 'mid', label: 'Mid-Level (2-5 Yrs)' },
                { id: 'senior', label: 'Senior / Staff (5+ Yrs)' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    experienceLevel === lvl.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Select Profile Linkages */}
        <div className="pt-5 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            2. Link Candidate Profile & Job Target
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Attached Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- No Resume (General Session) --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.candidate_name || r.filename}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Attached Job Description</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- No Job Target (Standard Tech Role) --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company || 'Company'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Choose Interview Mode */}
        <div className="pt-5 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            3. Select Interview Round
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interviewModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = interviewType === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setInterviewType(mode.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-1.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-100">{mode.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Difficulty & Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Starting Difficulty Level
            </h3>
            <div className="flex space-x-2">
              {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Difficulty adaptively recalculates (EASY ↔ MEDIUM ↔ HARD) based on live evaluation rubrics.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Planned Question Count
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-400">{totalQuestions} Questions</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>3 (Express)</span>
              <span>5 (Standard)</span>
              <span>10 (Full Mock)</span>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
        >
          <PlayCircle className="w-5 h-5" />
          <span>{loading ? 'Initializing Adaptive Session...' : 'Enter Live Interview Room'}</span>
        </button>
      </div>
    </div>
  );
};
