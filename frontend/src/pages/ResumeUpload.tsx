import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<Resume | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const isPdf = selected.name.toLowerCase().endsWith('.pdf');
      const isDocx = selected.name.toLowerCase().endsWith('.docx');
      if (!isPdf && !isDocx) {
        setError('Please upload a valid PDF (.pdf) or DOCX (.docx) document');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadResume(file);
      setParsedResume(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process resume.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-loader: creates a mock file using browser File API with sample data
  const handleLoadSampleResume = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create empty PDF blob for demo file upload
      const dummyPdfContent = "%PDF-1.4 sample resume document for candidate Aarav Sharma";
      const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], 'sample_fullstack_resume.pdf', { type: 'application/pdf' });
      
      const res = await api.uploadResume(sampleFile);
      setParsedResume(res);
    } catch (err: any) {
      setError(err.message || 'Sample upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Candidate Resume Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload PDF or DOCX resume for multi-stage deterministic extraction and LLM semantic enrichment.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 transition-colors flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
          <UploadCloud className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Upload your Resume (PDF or DOCX)</h3>
          <p className="text-xs text-slate-400 mt-1">
            Accepts PDF and DOCX documents up to 15MB. Extracts skills, experience, and projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors">
            <span>Browse Computer Files</span>
            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleLoadSampleResume}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Use Pre-Built Sample Resume (Aarav Sharma)</span>
          </button>
        </div>

        {file && (
          <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <FileText className="w-4 h-4" />
            <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {file && !parsedResume && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {loading ? 'Processing Pipeline (Extracting Sections & Skills)...' : 'Run Extraction Pipeline'}
          </button>
        )}
      </div>

      {/* Structured Parsing Results Preview */}
      {parsedResume && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">
                Resume successfully parsed! {parsedResume.extracted_skills.length} technical skills extracted.
              </span>
            </div>
            <button
              onClick={() => navigate('/job')}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
            >
              <span>Next: Set Job Description</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">{parsedResume.candidate_name || 'Candidate'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {parsedResume.contact_email} • {parsedResume.contact_phone || 'India'}
              </p>
            </div>

            {/* Extracted Skills Chips */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Extracted Competencies & Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {parsedResume.extracted_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Grid: Experience & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Work & Internship Experience</span>
              </div>
              {parsedResume.experience && parsedResume.experience.length > 0 ? (
                parsedResume.experience.map((exp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <h5 className="text-sm font-bold text-slate-100">{exp.title}</h5>
                    <p className="text-xs text-slate-400">{exp.company} • {exp.duration}</p>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-2">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No formal internship entries parsed.</p>
              )}
            </div>

            {/* Projects */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <FolderGit2 className="w-4 h-4" />
                <span>Academic & Engineering Projects</span>
              </div>
              {parsedResume.projects && parsedResume.projects.length > 0 ? (
                parsedResume.projects.map((proj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <h5 className="text-sm font-bold text-slate-100">{proj.name}</h5>
                    <p className="text-xs text-slate-300">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.tech_stack.map((t, ti) => (
                        <span key={ti} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No project entries found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
