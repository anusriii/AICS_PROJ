import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CodingProblem, CodingRunResult, CodingEvaluationResponse } from '../types';
import { CodingEditor } from '../components/CodingEditor';
import { Code2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuestionState {
  problem: CodingProblem;
  code: string;
  codeByLanguage: Record<string, string>;
  runResult: CodingRunResult | null;
  evalResult: CodingEvaluationResponse | null;
  status: 'unanswered' | 'tested' | 'submitted';
  isRunning: boolean;
  isSubmitting: boolean;
}

export const CodingRound: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const interviewIdParam = searchParams.get('interview_id');
  const countParam = searchParams.get('questions');

  const [questionCount, setQuestionCount] = useState<number>(() => {
    if (countParam) {
      const parsed = parseInt(countParam, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 5; // Default to 5 coding questions
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [clipboardWarning, setClipboardWarning] = useState<string | null>(null);

  // Monitor window blur and tab switching for proctoring integrity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setClipboardWarning(`Notice: Window navigated away during assessment (${next} tab switch event logged).`);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setClipboardWarning(`Notice: Assessment window focus lost (${next} focus lost event logged).`);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    if (clipboardWarning) {
      const timer = setTimeout(() => setClipboardWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [clipboardWarning]);

  // Load questions whenever interviewId or questionCount changes
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError(null);
      try {
        const interviewId = interviewIdParam ? Number(interviewIdParam) : 1;
        let probs: CodingProblem[] = [];

        try {
          probs = await api.startCodingBatch(interviewId, questionCount, 'MEDIUM');
        } catch (batchErr) {
          console.warn('Batch start fallback to single:', batchErr);
          const single = await api.startCoding(interviewId, 'MEDIUM');
          probs = [single];
        }

        if (probs.length > 0) {
          const initialQuestions: QuestionState[] = probs.map((prob) => {
            const templates = prob.starter_templates || {};
            const codeByLang: Record<string, string> = {
              python: templates.python || prob.initial_code,
              javascript: templates.javascript || '',
              java: templates.java || '',
              cpp: templates.cpp || '',
            };
            return {
              problem: prob,
              code: codeByLang[selectedLanguage] || prob.initial_code,
              codeByLanguage: codeByLang,
              runResult: null,
              evalResult: null,
              status: 'unanswered',
              isRunning: false,
              isSubmitting: false,
            };
          });
          setQuestions(initialQuestions);
          setActiveIndex(0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize coding problem suite.');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [interviewIdParam, questionCount]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === selectedLanguage) return;
    setSelectedLanguage(newLang);
    setQuestions((prev) =>
      prev.map((q) => {
        const nextCode =
          q.codeByLanguage[newLang] ||
          q.problem.starter_templates?.[newLang] ||
          q.problem.initial_code;
        return {
          ...q,
          code: nextCode,
          codeByLanguage: {
            ...q.codeByLanguage,
            [newLang]: nextCode,
          },
        };
      })
    );
  };

  const handleQuestionCountChange = (count: number) => {
    if (count === questionCount) return;
    setQuestionCount(count);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('questions', count.toString());
    setSearchParams(newParams);
  };

  const handleSelectQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setActiveIndex(idx);
      setError(null);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === activeIndex
          ? {
              ...q,
              code: newCode,
              codeByLanguage: {
                ...q.codeByLanguage,
                [selectedLanguage]: newCode,
              },
            }
          : q
      )
    );
  };

  const handleRun = async (): Promise<CodingRunResult | null> => {
    const current = questions[activeIndex];
    if (!current) return null;

    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeIndex ? { ...q, isRunning: true } : q))
    );
    setError(null);

    try {
      const res = await api.runCode(current.problem.id, current.code, selectedLanguage);
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === activeIndex
            ? {
                ...q,
                isRunning: false,
                runResult: res,
                status: q.status === 'submitted' ? 'submitted' : 'tested',
              }
            : q
        )
      );
      return res;
    } catch (err: any) {
      setQuestions((prev) =>
        prev.map((q, idx) => (idx === activeIndex ? { ...q, isRunning: false } : q))
      );
      setError(err.message || 'Execution error.');
      return null;
    }
  };

  const handleSubmit = async (): Promise<CodingEvaluationResponse | null> => {
    const current = questions[activeIndex];
    if (!current) return null;

    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeIndex ? { ...q, isSubmitting: true } : q))
    );
    setError(null);

    try {
      const res = await api.submitCoding(current.problem.id, current.code, selectedLanguage);
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === activeIndex
            ? {
                ...q,
                isSubmitting: false,
                evalResult: res,
                status: 'submitted',
              }
            : q
        )
      );
      return res;
    } catch (err: any) {
      setQuestions((prev) =>
        prev.map((q, idx) => (idx === activeIndex ? { ...q, isSubmitting: false } : q))
      );
      setError(err.message || 'Evaluation error.');
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const currentQ = questions[activeIndex];
  const problem = currentQ?.problem;
  const submittedCount = questions.filter((q) => q.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Algorithmic Coding Interview Round</h1>
            <p className="text-xs text-slate-400">Automated AST Asymptotic Complexity Detection & Test Suite</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Programming Language Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Language:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
              {[
                { id: 'python', label: 'Python' },
                { id: 'java', label: 'Java' },
                { id: 'cpp', label: 'C++' },
                { id: 'javascript', label: 'JavaScript' },
              ].map((langItem) => (
                <button
                  key={langItem.id}
                  onClick={() => handleLanguageChange(langItem.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedLanguage === langItem.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  title={`Select ${langItem.label}`}
                >
                  {langItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Select Questions:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
              {[1, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleQuestionCountChange(cnt)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {cnt} {cnt === 1 ? 'Question' : 'Questions'}
                </button>
              ))}
            </div>
          </div>

          {interviewIdParam && (
            <button
              onClick={() => navigate(`/results/${interviewIdParam}`)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Proceed to Final Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selectable Question Tabs (Question 1 - Question 5) */}
      {questions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            {questions.map((qState, idx) => {
              const isActive = activeIndex === idx;
              const isSubmitted = qState.status === 'submitted';
              const isTested = qState.status === 'tested';

              return (
                <button
                  key={qState.problem.id || idx}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/40'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>Question {idx + 1}</span>
                  {isSubmitted ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Submitted</span>
                    </span>
                  ) : isTested ? (
                    <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-950" title="Tested" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" title="Unanswered" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 px-2 text-xs">
            <span className="text-slate-400">
              Submitted:{' '}
              <span className="font-bold text-emerald-400">{submittedCount}</span> / {questions.length}
            </span>
            {interviewIdParam && (
              <button
                onClick={() => navigate(`/results/${interviewIdParam}`)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Finish Coding Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {clipboardWarning && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-600 text-indigo-200 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold">{clipboardWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setClipboardWarning(null)}
            className="px-2.5 py-1 rounded-lg bg-indigo-900 text-indigo-200 text-[11px] font-semibold border border-indigo-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Problem Spec (5 cols) & Code Editor (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Problem Details */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800 uppercase">
                {problem?.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Question {activeIndex + 1} of {questions.length} (ID #{problem?.id})
              </span>
              {currentQ?.status === 'submitted' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                  Submitted
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{problem?.problem_title}</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">{problem?.problem_description}</p>

          {/* Constraints */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-mono">
              {problem?.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examples</h4>
            <div className="space-y-2">
              {problem?.examples.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400">
                    Input: <span className="text-slate-200">{ex.input}</span>
                  </div>
                  <div className="text-slate-400">
                    Output: <span className="text-emerald-300">{ex.output}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Coding Editor & Runner */}
        <div className="lg:col-span-7 h-[680px]">
          {problem && currentQ && (
            <CodingEditor
              problem={problem}
              code={currentQ.code}
              language={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onCodeChange={handleCodeChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={currentQ.isRunning}
              isSubmitting={currentQ.isSubmitting}
              runResult={currentQ.runResult}
              evalResult={currentQ.evalResult}
            />
          )}
        </div>
      </div>
    </div>
  );
};
