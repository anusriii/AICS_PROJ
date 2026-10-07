import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProgressHistoryItem } from '../types';
import { TrendingUp, ArrowRight, Award, Calendar } from 'lucide-react';

export const Progress: React.FC = () => {
  const [timeline, setTimeline] = useState<ProgressHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.getProgress();
        setTimeline(res);
      } catch (err) {
        console.warn('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Calculate progression delta
  const firstScore = timeline.length > 0 ? timeline[0].overall_score : 0;
  const latestScore = timeline.length > 0 ? timeline[timeline.length - 1].overall_score : 0;
  const delta = (latestScore - firstScore).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Longitudinal Performance Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track multi-session candidate progression across technical, behavioral, and algorithmic rounds.
        </p>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Interviews Completed</span>
          <div className="text-3xl font-black text-indigo-400 font-mono mt-1">
            {timeline.length} Sessions
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Historical interview records</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Current Composite Score</span>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {latestScore.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Latest session assessment</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Longitudinal Growth</span>
          <div className="text-3xl font-black text-purple-400 font-mono mt-1">
            {Number(delta) >= 0 ? `+${delta}` : delta} pts
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Improvement since initial attempt</p>
        </div>
      </div>

      {/* Progress Timeline Cards & Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Interview Progression Curve</span>
          </div>
          <Link
            to="/setup"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            + Start Next Session
          </Link>
        </div>

        {timeline.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No interview history recorded yet. Complete an interview to populate longitudinal metrics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Session Date</th>
                  <th className="px-5 py-3.5">Interview Round</th>
                  <th className="px-5 py-3.5">Overall</th>
                  <th className="px-5 py-3.5">Technical</th>
                  <th className="px-5 py-3.5">Communication</th>
                  <th className="px-5 py-3.5">Coding</th>
                  <th className="px-5 py-3.5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {timeline.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-300 font-sans">{item.date}</td>
                    <td className="px-5 py-3.5 text-slate-200 capitalize font-sans">
                      {item.interview_type.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 text-indigo-400 font-bold">{item.overall_score.toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-emerald-400">{item.technical_score.toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-sky-400">{item.communication_score.toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-purple-400">{item.coding_score.toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <Link
                        to={`/results/${item.interview_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
