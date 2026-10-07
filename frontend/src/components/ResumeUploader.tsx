import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // Adjust path as needed

/**
 * ResumeUploader component
 * - Requires the user to be logged in.
 * - Allows uploading a resume (PDF/DOCX).
 * - After a successful upload, it refreshes the user's resume list and clears any stale data.
 */
const ResumeUploader: React.FC = () => {
  const { user, isAuthenticated } = useAuth(); // assume this hook provides authentication state
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [resumes, setResumes] = useState<any[]>([]);

  // Load user's resumes – called on mount and after each successful upload
  const fetchResumes = async () => {
    try {
      const resp = await fetch('/api/v1/resumes', { credentials: 'include' });
      if (!resp.ok) throw new Error('Failed to load resumes');
      const data = await resp.json();
      setResumes(data);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchResumes();
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset UI state for a new upload
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const resp = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'Upload failed');
      }
      await resp.json(); // we don't need the specific payload here
      setStatus('success');
      setFile(null);
      // Refresh the list to reflect the newly uploaded resume (clears stale data)
      await fetchResumes();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  // Helper to show upload button state
  const isUploading = status === 'uploading';

  if (!isAuthenticated) {
    return <div className="text-slate-300">Please log in to upload a resume.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-slate-200">
      <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
        <Upload className="w-5 h-5" />
        <span>Upload Resume</span>
      </h2>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={isUploading}
          className="border border-slate-600 rounded px-2 py-1 bg-slate-800 text-slate-100"
        />
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-3 py-1 rounded ${isUploading ? 'bg-slate-600' : 'bg-emerald-600'} text-white hover:${isUploading ? '' : 'bg-emerald-500'} transition`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={fetchResumes}
          className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {status === 'error' && (
        <div className="mb-3 text-rose-400 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>{errorMsg}</span>
        </div>
      )}
      {status === 'success' && (
        <div className="mb-3 text-emerald-400 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Resume uploaded successfully.</span>
        </div>
      )}

      <h3 className="text-md font-medium mb-2 mt-6">Your Uploaded Resumes</h3>
      {resumes.length === 0 ? (
        <p className="text-slate-400">No resumes uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {resumes.map((r) => (
            <li key={r.id} className="p-2 border border-slate-600 rounded bg-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-medium">{r.filename}</span>
                <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Candidate: {r.candidate_name || '—'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResumeUploader;
