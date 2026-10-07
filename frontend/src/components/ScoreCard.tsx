import React from 'react';
import { RubricScores } from '../types';
import { Award, CheckCircle2, Sliders } from 'lucide-react';

interface ScoreCardProps {
  scores: RubricScores;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ scores }) => {
  const getScoreColor = (val: number) => {
    if (val >= 8.0) return 'text-emerald-400 bg-emerald-500';
    if (val >= 6.0) return 'text-sky-400 bg-sky-500';
    if (val >= 4.0) return 'text-amber-400 bg-amber-500';
    return 'text-rose-400 bg-rose-500';
  };

  const categories = [
    { label: 'Technical Accuracy', weight: '30%', score: scores.technical_accuracy },
    { label: 'Relevance', weight: '20%', score: scores.relevance },
    { label: 'Completeness', weight: '20%', score: scores.completeness },
    { label: 'Depth & Principles', weight: '15%', score: scores.depth },
    { label: 'Clarity & Delivery', weight: '10%', score: scores.clarity },
    { label: 'Concrete Examples', weight: '5%', score: scores.example_usage },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Multi-Factor Rubric Evaluation</h3>
            <p className="text-xs text-slate-400">Weighted Academic Grading Framework</p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="text-right">
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {scores.overall_score.toFixed(1)}
            <span className="text-xs text-slate-500 font-normal"> / 10</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Overall Score
          </span>
        </div>
      </div>

      {/* Breakdown Meters */}
      <div className="space-y-3.5">
        {categories.map((cat, i) => {
          const pct = Math.min(100, (cat.score / 10) * 100);
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">
                  {cat.label} <span className="text-slate-500 text-[10px]">({cat.weight})</span>
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {cat.score.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    getScoreColor(cat.score).split(' ')[1]
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
