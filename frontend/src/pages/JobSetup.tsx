import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobProfile } from '../types';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Wrench,
  ArrowRight,
  Target
} from 'lucide-react';

export const JobSetup: React.FC = () => {
  const [title, setTitle] = useState('Full Stack AI Engineer');
  const [company, setCompany] = useState('CloudNexus Technologies');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const navigate = useNavigate();

  const handleFillSampleJD = () => {
    setTitle('Full Stack AI Engineer');
    setCompany('CloudNexus Technologies');
    setRawText(`We are seeking an enthusiastic, technically rigorous Full Stack AI Engineer to join our core intelligence platform team. You will architect, develop, and optimize scalable enterprise web applications, integrate state-of-the-art AI inference pipelines, and build resilient microservices.

Key Responsibilities:
- Design and implement asynchronous, high-throughput RESTful APIs using Python, FastAPI, and PostgreSQL.
- Build modern, interactive user interfaces with React, TypeScript, and responsive styling.
- Implement robust database schemas, query optimization, and transaction boundaries.
- Develop unit, integration, and performance test suites to maintain high reliability.
- Collaborate with ML engineers to deploy and benchmark LLM workflows and algorithmic evaluation systems.

Required Qualifications & Skills:
- B.Tech/B.E. in Computer Science, Information Technology, or equivalent practical experience.
- Strong proficiency in Python, JavaScript/TypeScript, and Object-Oriented Design.
- Hands-on experience with FastAPI or Django and relational databases (PostgreSQL, SQL).
- Solid grasp of Data Structures & Algorithms, System Design fundamentals, and REST APIs.
- Experience building reactive component interfaces in React.

Preferred / Nice-to-Have Skills:
- Experience with Docker, Kubernetes, and AWS cloud environments.
- Knowledge of Redis caching and microservice architectures.
- Familiarity with AI / Generative AI workflows, NLP, and model evaluation metrics.
- Familiarity with CI/CD automation and Git version control.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.analyzeJob(title, rawText, company);
      setJobProfile(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Job Description Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest target role requirements to benchmark skills and calibrate interview questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Target Job Specification</span>
          </div>

          <button
            type="button"
            onClick={handleFillSampleJD}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sample AI Engineer JD</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Role Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack AI Engineer"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Organization / Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. CloudNexus Technologies"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Job Description Text
            </label>
            <textarea
              required
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job posting, required qualifications, and expectations..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Analyzing Job Requirements & Extracting Competencies...' : 'Analyze Job Description'}
          </button>
        </form>
      </div>

      {/* Structured JD Results Preview */}
      {jobProfile && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">
                Job Profile analyzed! {jobProfile.required_skills.length} mandatory & {jobProfile.preferred_skills.length} preferred requirements detected.
              </span>
            </div>
            <button
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer"
            >
              <span>Compare Skills Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skill Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Skills */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Mandatory / Required Skills ({jobProfile.required_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobProfile.required_skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Preferred / Nice-to-Have Skills ({jobProfile.preferred_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobProfile.preferred_skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800/60 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
