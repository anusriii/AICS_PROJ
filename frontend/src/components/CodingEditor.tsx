import React, { useState, useEffect } from 'react';
import {
  Play,
  Send,
  CheckCircle,
  XCircle,
  Code2,
  Cpu,
  Terminal,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CodingProblem, CodingRunResult, CodingEvaluationResponse } from '../types';

interface CodingEditorProps {
  problem: CodingProblem;
  code: string;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onCodeChange: (code: string) => void;
  onRun: () => Promise<CodingRunResult | null>;
  onSubmit: () => Promise<CodingEvaluationResponse | null>;
  isRunning: boolean;
  isSubmitting: boolean;
  runResult: CodingRunResult | null;
  evalResult: CodingEvaluationResponse | null;
}

export const CodingEditor: React.FC<CodingEditorProps> = ({
  problem,
  code,
  language = 'python',
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  runResult,
  evalResult,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'eval'>('tests');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [isEditorFullscreen, setIsEditorFullscreen] = useState<boolean>(false);

  const currentLang = language || problem.language || 'python';
  const displayFunctionName =
    problem.function_names?.[currentLang] || problem.function_name || 'main';

  useEffect(() => {
    if (evalResult) {
      setActiveTab('eval');
    } else if (runResult) {
      setActiveTab('console');
    } else {
      setActiveTab('tests');
    }
  }, [problem.id]);

  useEffect(() => {
    if (clipboardNotice) {
      const timer = setTimeout(() => setClipboardNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [clipboardNotice]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Keyboard shortcuts: Ctrl+Enter (Run), Ctrl+Shift+Enter (Submit)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        if (!isSubmitting && !isRunning) {
          setActiveTab('eval');
          onSubmit();
        }
      } else {
        if (!isRunning && !isSubmitting) {
          setActiveTab('console');
          onRun();
        }
      }
      return;
    }

    // Tab key indentation handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onCodeChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text') || '';
    if (text.length > 350) {
      setClipboardNotice('Notice: Large code paste (>350 chars) logged by integrity monitor.');
    }
  };

  const handleResetCode = () => {
    const starter =
      problem.starter_templates?.[currentLang] || problem.initial_code || '';
    if (window.confirm('Reset editor to initial starter template?')) {
      onCodeChange(starter);
    }
  };

  const lines = code.split('\n');

  const fontSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base';

  return (
    <div
      className={`flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative transition-all ${
        isEditorFullscreen ? 'fixed inset-4 z-50 rounded-3xl border-indigo-600/60' : 'h-full'
      }`}
    >
      {/* Notice Banner */}
      {clipboardNotice && (
        <div className="absolute top-14 left-4 right-4 z-30 p-2.5 rounded-xl bg-indigo-950/95 border border-indigo-600 text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-2xl animate-fadeIn">
          <span>ℹ️ {clipboardNotice}</span>
          <button
            type="button"
            onClick={() => setClipboardNotice(null)}
            className="px-2 py-0.5 rounded text-[10px] bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              {currentLang === 'cpp' ? 'C++' : currentLang} Algorithmic Sandbox
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              | {displayFunctionName}
            </span>
          </div>

          {/* Programming Language Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            {[
              { id: 'python', label: 'Python' },
              { id: 'java', label: 'Java' },
              { id: 'cpp', label: 'C++' },
              { id: 'javascript', label: 'JavaScript' },
            ].map((langItem) => {
              const isSelected = currentLang === langItem.id;
              return (
                <button
                  key={langItem.id}
                  type="button"
                  onClick={() => onLanguageChange && onLanguageChange(langItem.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={`Switch language to ${langItem.label}`}
                >
                  {langItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Controls & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Font Size controls */}
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-[11px] space-x-1 text-slate-400">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-slate-800 text-white font-bold' : ''}`}
              title="Small Font"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-slate-800 text-white font-bold' : ''}`}
              title="Medium Font"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-slate-800 text-white font-bold' : ''}`}
              title="Large Font"
            >
              A+
            </button>
          </div>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleResetCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            title="Reset starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            title={isEditorFullscreen ? 'Exit Editor Fullscreen' : 'Expand Editor Fullscreen'}
          >
            {isEditorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Run Visible Tests */}
          <button
            onClick={async () => {
              setActiveTab('console');
              await onRun();
            }}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
            title="Run code against visible test suites (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </button>

          {/* Submit Solution */}
          <button
            onClick={async () => {
              setActiveTab('eval');
              await onSubmit();
            }}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            title="Submit and grade AST complexity (Ctrl+Shift+Enter)"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Grading...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden min-h-[320px]">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-950 py-3 text-right pr-3 select-none border-r border-slate-800 font-mono text-xs text-slate-600">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input Area */}
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          spellCheck={false}
          className={`flex-1 p-3 bg-slate-950 text-slate-100 font-mono leading-6 resize-none focus:outline-none ${fontSizeClass}`}
        />
      </div>

      {/* Bottom Panel Tabs */}
      <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col">
        <div className="flex items-center justify-between px-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'tests'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Cases ({problem.visible_tests.length})
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'console'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Console
            </button>
            <button
              onClick={() => setActiveTab('eval')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'eval'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              AST Complexity & Grading
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden md:block">
            Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Ctrl+Enter</kbd> Run • <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Ctrl+Shift+Enter</kbd> Submit
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
          {/* Tab 1: Test Cases */}
          {activeTab === 'tests' && (
            <div className="space-y-3">
              {/* Test Case Pill Selector */}
              <div className="flex items-center space-x-2 pb-2">
                {problem.visible_tests.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTestCaseIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedTestCaseIdx === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>

              {problem.visible_tests[selectedTestCaseIdx] && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Input Arguments:</span>
                    <pre className="p-2 rounded-lg bg-slate-900 text-indigo-300 overflow-x-auto text-xs">
                      {problem.visible_tests[selectedTestCaseIdx].input_str}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Expected Output:</span>
                    <pre className="p-2 rounded-lg bg-slate-900 text-emerald-300 overflow-x-auto text-xs">
                      {problem.visible_tests[selectedTestCaseIdx].expected_output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Console / Test Runner Log */}
          {activeTab === 'console' && (
            <div>
              {!runResult ? (
                <div className="text-slate-500 italic py-6 text-center">
                  Click <span className="text-indigo-400 font-semibold">Run Tests</span> to execute code against visible test suites.
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-between ${
                      runResult.all_passed
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {runResult.all_passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {runResult.all_passed
                          ? '✓ All Visible Tests Passed'
                          : `✕ ${runResult.total_count - runResult.passed_count} Test(s) Failed`}
                      </span>
                    </div>
                    <span className="text-xs font-mono">
                      {runResult.passed_count} / {runResult.total_count} Passed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {runResult.results.map((r) => (
                      <div
                        key={r.test_number}
                        className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                          r.passed
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-rose-950/20 border-rose-800/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <span
                            className={`font-bold inline-flex items-center space-x-1 ${
                              r.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span>{r.passed ? '✓ Pass' : '✕ Fail'}</span>
                            <span className="text-slate-400 font-normal">| Test Case #{r.test_number}</span>
                          </span>

                          <div className="text-slate-400 text-xs">
                            <span className="text-slate-500">Input:</span> {r.input}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div>
                              <span className="text-slate-500">Expected:</span>{' '}
                              <span className="text-emerald-400">{r.expected}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Actual:</span>{' '}
                              <span className={r.passed ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                                {r.actual}
                              </span>
                            </div>
                          </div>

                          {r.error && (
                            <div className="text-rose-400 text-[11px] mt-1 bg-rose-950/50 p-1.5 rounded-lg border border-rose-800">
                              Error: {r.error}
                            </div>
                          )}
                        </div>

                        <span className="text-slate-500 text-[11px] font-mono shrink-0">
                          {r.execution_time_ms}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AST Complexity & Final Grading */}
          {activeTab === 'eval' && (
            <div>
              {!evalResult ? (
                <div className="text-slate-500 italic py-6 text-center">
                  Click <span className="text-indigo-400 font-semibold">Submit Code</span> to evaluate solution against hidden stress tests, AST time/space complexity analysis, and code quality rubrics.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score Banner */}
                  <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                        Algorithmic Final Score
                      </span>
                      <p className="text-2xl font-black text-indigo-400">
                        {evalResult.final_coding_score.toFixed(1)}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ 10</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Hidden + Visible Tests</span>
                        <span className="font-bold text-emerald-400">
                          {evalResult.tests_passed} / {evalResult.total_tests}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Correctness</span>
                        <span className="font-bold text-indigo-400">
                          {evalResult.correctness_score.toFixed(1)} / 10
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Code Quality</span>
                        <span className="font-bold text-purple-400">
                          {evalResult.code_quality_score.toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AST Complexity Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>AST Algorithmic Complexity Detection</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Time Complexity */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">
                            Time Complexity
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              evalResult.detected_time_complexity === evalResult.expected_time_complexity
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {evalResult.detected_time_complexity === evalResult.expected_time_complexity
                              ? 'Optimal'
                              : 'Sub-Optimal'}
                          </span>
                        </div>
                        <div className="text-base font-black text-amber-300 mt-1">
                          {evalResult.detected_time_complexity}
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          Target Asymptotic: {evalResult.expected_time_complexity}
                        </span>
                      </div>

                      {/* Space Complexity */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">
                            Space Complexity
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800">
                            Evaluated
                          </span>
                        </div>
                        <div className="text-base font-black text-sky-300 mt-1">
                          {evalResult.detected_space_complexity}
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          Target Asymptotic: {evalResult.expected_space_complexity}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      {evalResult.complexity_explanation}
                    </p>
                  </div>

                  {/* Clean Code Observations */}
                  {evalResult.code_quality_feedback && evalResult.code_quality_feedback.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        Static Code Quality Observations:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {evalResult.code_quality_feedback.map((fb, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="text-indigo-400 font-bold">→</span>
                            <span>{fb}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
