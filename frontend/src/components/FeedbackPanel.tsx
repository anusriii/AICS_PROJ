import React from 'react';
import { EvaluationDetail } from '../types';
import { CheckCircle2, AlertTriangle, Quote, Lightbulb } from 'lucide-react';

interface FeedbackPanelProps {
  evaluation: EvaluationDetail;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ evaluation }) => {
  return (
    <div className="space-y-4">
      {/* Strengths */}
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Demonstrated Strengths</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-200">
          {evaluation.strengths.map((str, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses / Missing Points */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Missing Concepts & Technical Deficiencies</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-200">
          {evaluation.weaknesses.map((wk, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>{wk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verbatim Evidence Citations */}
      {evaluation.evidence && evaluation.evidence.length > 0 && (
        <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Quote className="w-4 h-4" />
            <span>Verbatim Answer Evidence Cited</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 italic">
            {evaluation.evidence.map((ev, i) => (
              <p key={i} className="border-l-2 border-sky-600 pl-2">
                "{ev}"
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40">
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>Actionable Remediation & Practice</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-200">
          {evaluation.improvements.map((imp, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-purple-400 mt-0.5">→</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
