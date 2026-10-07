import React, { useState } from 'react';
import { QuestionView } from '../types';
import { Sparkles, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Bookmark } from 'lucide-react';

interface QuestionPanelProps {
  question: QuestionView;
  currentNumber: number;
  totalNumber: number;
  roundType: string;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  currentNumber,
  totalNumber,
  roundType,
}) => {
  const [showKeyPoints, setShowKeyPoints] = useState(false);

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toUpperCase()) {
      case 'HARD':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'MEDIUM':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            Question {currentNumber} of {totalNumber}
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 text-xs font-medium capitalize">
            {roundType.replace('_', ' ')} Round
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
        </div>

        {question.topic && (
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>{question.topic}</span>
          </div>
        )}
      </div>

      {/* Follow-Up Probing Banner */}
      {question.is_follow_up && (
        <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start space-x-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold uppercase tracking-wider text-amber-400">
              Adaptive Follow-Up Probing:{' '}
            </span>
            <span>
              {question.follow_up_reason ||
                'Testing claim specificity and implementation boundary conditions based on your previous answer.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Question Text */}
      <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug tracking-tight mb-4">
        {question.question_text}
      </h2>

      {/* Expected Concepts Key Points (Toggleable) */}
      {question.expected_points && question.expected_points.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setShowKeyPoints(!showKeyPoints)}
            className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rubric Coverage Criteria ({question.expected_points.length} Concepts)</span>
            {showKeyPoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showKeyPoints && (
            <div className="mt-2.5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Expected Evaluator Criteria:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {question.expected_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
