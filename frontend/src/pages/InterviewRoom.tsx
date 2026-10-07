import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  InterviewSessionState,
  QuestionView,
  AnswerSubmitResponse,
  EvaluationDetail
} from '../types';
import { VideoRecorder } from '../components/VideoRecorder';
import { AudioRecorder } from '../components/AudioRecorder';
import { QuestionPanel } from '../components/QuestionPanel';
import { ScoreCard } from '../components/ScoreCard';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { Timer } from '../components/Timer';
import { AIVoiceInterviewer } from '../components/AIVoiceInterviewer';
import { ProctoringHUD } from '../components/ProctoringHUD';
import { HardwareDiagnosticsModal } from '../components/HardwareDiagnosticsModal';
import {
  Send,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  Users
} from 'lucide-react';

export const InterviewRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const interviewId = Number(id);

  const [sessionState, setSessionState] = useState<InterviewSessionState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionView | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<EvaluationDetail | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proctoring, Fullscreen & Integrity State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchWarning, setTabSwitchWarning] = useState<string | null>(null);
  const [multiFaceCount, setMultiFaceCount] = useState(1);
  const [clipboardWarning, setClipboardWarning] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Full Screen Mode handlers
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Detect tab switching and record/show warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setTabSwitchWarning(
            `Tab switch detected! You navigated away from the interview tab (${next} violation${next > 1 ? 's' : ''} recorded). Please remain on this tab.`
          );
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setTabSwitchWarning(
          `Window focus lost (${next} violation${next > 1 ? 's' : ''} recorded). Please keep the interview window active.`
        );
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

  // Smart clipboard monitor: flags abnormally large external bulk pastes
  const handlePasteCheck = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedData = e.clipboardData.getData('text') || '';
    if (pastedData.length > 350) {
      setClipboardWarning(
        `Large bulk paste detected (${pastedData.length} chars). External script copying is flagged in the integrity log.`
      );
    }
  };

  // Auto-dismiss clipboard warning
  useEffect(() => {
    if (clipboardWarning) {
      const timer = setTimeout(() => setClipboardWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [clipboardWarning]);

  // Load session on mount
  useEffect(() => {
    async function loadState() {
      try {
        const state = await api.getInterviewState(interviewId);
        setSessionState(state);
        if (state.current_question) {
          setCurrentQuestion(state.current_question);
        }
        if (state.is_finished) {
          setInterviewFinished(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load interview session.');
      }
    }
    loadState();
  }, [interviewId]);

  const handleTranscriptUpdate = (transcript: string) => {
    setAnswerText(transcript);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answerText.trim()) return;
    setSubmitting(true);
    setError(null);
    setIsListening(false); // Stop mic

    try {
      const res: AnswerSubmitResponse = await api.submitAnswer(interviewId, {
        question_id: currentQuestion.id,
        answer_text: answerText,
        duration_seconds: elapsedSeconds || 35.0,
        speech_metrics: {
          speaking_duration_sec: elapsedSeconds,
          total_words: answerText.split(/\s+/).length,
        },
      });

      setLastEvaluation(res.evaluation);

      // Build readable action notice
      if (res.action_taken === 'increase_difficulty') {
        setActionNotice(
          `Performance Excellent (${res.evaluation.scores.overall_score}/10) → Difficulty stepping up to ${res.adapted_difficulty}!`
        );
      } else if (res.action_taken === 'decrease_difficulty') {
        setActionNotice(
          `Difficulty stepping down to ${res.adapted_difficulty} to consolidate foundational concepts.`
        );
      } else if (res.next_question?.is_follow_up) {
        setActionNotice(
          `Adaptive Probing Triggered: Follow-up question queued to test specific claim details.`
        );
      } else {
        setActionNotice(
          `Answer recorded. Next competency question queued at ${res.adapted_difficulty} difficulty.`
        );
      }

      if (res.interview_finished) {
        setInterviewFinished(true);
      } else if (res.next_question) {
        setSessionState((prev) =>
          prev
            ? {
                ...prev,
                completed_count: prev.completed_count + 1,
                current_difficulty: res.adapted_difficulty,
              }
            : null
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error evaluating answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceToNextQuestion = async () => {
    setAnswerText('');
    setLastEvaluation(null);
    setActionNotice(null);
    setElapsedSeconds(0);

    // Refresh state from backend
    try {
      const state = await api.getInterviewState(interviewId);
      setSessionState(state);
      if (state.current_question) {
        setCurrentQuestion(state.current_question);
      }
      if (state.is_finished) {
        setInterviewFinished(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to advance question.');
    }
  };

  const handleFinishAndReport = async () => {
    setSubmitting(true);
    try {
      await api.completeInterview(interviewId);
      navigate(`/results/${interviewId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to complete interview.');
      setSubmitting(false);
    }
  };

  if (!sessionState && !error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const wpm = elapsedSeconds > 0 ? Math.round(wordCount / (elapsedSeconds / 60)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Session Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Mock Interview Session #{interviewId}
            </span>
            <p className="text-[11px] text-slate-400 capitalize">
              {sessionState?.interview_type.replace('_', ' ')} • Adaptive Cognitive Loop Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Timer
            isRunning={!lastEvaluation && !interviewFinished}
            onTick={(s) => setElapsedSeconds(s)}
            resetSignal={currentQuestion?.id}
          />

          <div className="text-xs font-mono text-slate-300 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
            Progress:{' '}
            <span className="font-bold text-indigo-400">
              {sessionState?.completed_count || 0} / {sessionState?.total_questions || 5}
            </span>
          </div>
        </div>
      </div>

      {/* Enterprise Proctoring HUD */}
      <ProctoringHUD
        tabSwitchCount={tabSwitchCount}
        faceCount={multiFaceCount}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onRunDiagnostics={() => setShowDiagnostics(true)}
      />

      {/* System Hardware Diagnostics Modal */}
      <HardwareDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />

      {/* Proctoring Warning Banners */}
      {tabSwitchWarning && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">Proctoring Tab Switch Alert</span>
              <p className="text-amber-200/90 mt-0.5">{tabSwitchWarning}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTabSwitchWarning(null)}
            className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-semibold border border-amber-700 cursor-pointer ml-3 shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {multiFaceCount > 1 && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold text-rose-300 block">Integrity Flag: Multiple Faces Visible</span>
              <p className="text-rose-200/90 mt-0.5">
                More than one face was detected in your webcam feed. Only the candidate is permitted in frame during the interview.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-900 border border-rose-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
            Flagged
          </span>
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

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Webcam Video & Speech Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Webcam stream with multiple face detection callback */}
          <VideoRecorder
            isRecording={isListening || !!answerText}
            onMultipleFacesDetected={(count) => setMultiFaceCount(count)}
          />

          {/* Upgraded Speech-to-Text Microphone Controls with Live Audio Frequency Bars */}
          <AudioRecorder
            isListening={isListening}
            onListeningChange={setIsListening}
            onTranscriptUpdate={handleTranscriptUpdate}
            currentTranscript={answerText}
            elapsedSeconds={elapsedSeconds}
          />
        </div>

        {/* Right Column: AI Voice Interviewer, Question Panel, Answer Input & Feedback (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive AI Voice Interviewer with Text-to-Speech & Hint Engine */}
          {currentQuestion && !lastEvaluation && (
            <AIVoiceInterviewer
              questionText={currentQuestion.question_text}
              interviewId={interviewId}
              questionId={currentQuestion.id}
              questionTopic={currentQuestion.topic}
              difficulty={currentQuestion.difficulty}
              isFollowUp={currentQuestion.is_follow_up}
            />
          )}

          {currentQuestion ? (
            <QuestionPanel
              question={currentQuestion}
              currentNumber={sessionState ? sessionState.completed_count + 1 : 1}
              totalNumber={sessionState ? sessionState.total_questions : 5}
              roundType={sessionState ? sessionState.interview_type : 'technical'}
            />
          ) : (
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              No active question loaded.
            </div>
          )}

          {/* Answer Area (When not in post-evaluation mode) */}
          {!lastEvaluation && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Answer (Speech Transcript or Typed)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {wordCount} words
                </span>
              </div>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onPaste={handlePasteCheck}
                placeholder="Speak using the microphone above or type your detailed response here..."
                rows={6}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-mono"
              />

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">
                  Provide architectural rationale, code syntax, or practical examples for highest rubric score.
                </p>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Evaluating Rubric...' : 'Submit Answer'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Post-Evaluation Feedback Display */}
          {lastEvaluation && (
            <div className="space-y-5 animate-fadeIn">
              {/* Adaptive Action Notification Banner */}
              {actionNotice && (
                <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-700/60 flex items-center space-x-3 text-xs text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold">{actionNotice}</span>
                </div>
              )}

              {/* Rubric Scorecard */}
              <ScoreCard scores={lastEvaluation.scores} />

              {/* Explainable Feedback & Evidence */}
              <FeedbackPanel evaluation={lastEvaluation} />

              {/* Advance Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {interviewFinished
                    ? 'All planned questions for this session completed!'
                    : 'Ready for the next adaptive question?'}
                </span>

                {interviewFinished ? (
                  <button
                    onClick={handleFinishAndReport}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <span>View Comprehensive Performance Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleAdvanceToNextQuestion}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    <span>Proceed to Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
