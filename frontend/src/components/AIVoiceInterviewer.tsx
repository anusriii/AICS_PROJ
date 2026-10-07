import React, { useEffect, useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface AIVoiceInterviewerProps {
  questionText: string;
  interviewId: number;
  questionId: number;
  questionTopic?: string;
  difficulty?: string;
  isFollowUp?: boolean;
}

export const AIVoiceInterviewer: React.FC<AIVoiceInterviewerProps> = ({
  questionText,
  interviewId,
  questionId,
  questionTopic,
  difficulty = 'MEDIUM',
  isFollowUp = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem('ai_auto_speak') !== 'false';
  });
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [supported, setSupported] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  const prevQuestionIdRef = useRef<number | null>(null);

  // Initialize SpeechSynthesis and voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const updateVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      setVoices(availVoices);
      // Prefer English voices with natural sound
      const preferred =
        availVoices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Arthur') ||
              v.name.includes('David'))
        ) || availVoices.find((v) => v.lang.startsWith('en')) || availVoices[0];
      setSelectedVoice(preferred || null);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!supported || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak on new question
  useEffect(() => {
    setHint(null);
    setShowHintModal(false);

    if (prevQuestionIdRef.current !== questionId) {
      prevQuestionIdRef.current = questionId;

      if (autoSpeak && questionText) {
        // Short delay to let UI settle
        const timer = setTimeout(() => {
          speakText(questionText);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [questionId, questionText, autoSpeak]);

  const handleToggleAutoSpeak = () => {
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    localStorage.setItem('ai_auto_speak', String(nextVal));
    if (!nextVal) {
      stopSpeaking();
    }
  };

  const handleRequestHint = async () => {
    if (hint) {
      setShowHintModal(true);
      return;
    }
    setLoadingHint(true);
    try {
      const res = await api.getQuestionHint(interviewId, questionId);
      setHint(res.hint);
      setShowHintModal(true);
    } catch (err: any) {
      console.warn('Hint fetch error:', err);
      setHint('Consider key architectural tradeoffs, runtime complexity, and typical edge cases.');
      setShowHintModal(true);
    } finally {
      setLoadingHint(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden transition-all">
      {/* Subtle background glow when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        {/* Left: AI Avatar & Speaking State */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                isSpeaking
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              <Radio className={`w-5 h-5 ${isSpeaking ? 'animate-spin' : ''}`} />
            </div>
            {/* Animated online badge */}
            <span
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 transition-colors ${
                isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isSpeaking ? 'bg-emerald-400' : 'bg-indigo-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">
                AI Senior Interviewer
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-950/80 border border-indigo-800 text-indigo-300">
                {difficulty}
              </span>
              {isFollowUp && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/80 border border-amber-800 text-amber-300">
                  Follow-Up Probe
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-0.5">
              {isSpeaking ? (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-medium text-emerald-400">
                    Voicing question...
                  </span>
                  {/* Dynamic audio frequency bars */}
                  <div className="flex items-center space-x-0.5 h-3">
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-75" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-1.5 delay-150" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5 delay-100" />
                  </div>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {autoSpeak ? 'Voice guidance active' : 'Audio paused (click replay to listen)'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Audio Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Replay / Play Button */}
          {isSpeaking ? (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute Voice</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => speakText(questionText)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              title="Read Question Out Loud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen to Question</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px]">
            {[0.85, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  setSpeechRate(rate);
                  if (isSpeaking) {
                    stopSpeaking();
                    setTimeout(() => speakText(questionText), 100);
                  }
                }}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  speechRate === rate
                    ? 'bg-slate-800 text-indigo-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Auto-Speak Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
              autoSpeak
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
            title="Toggle Auto-Speak on each question"
          >
            <span>Auto-Voice</span>
            <span
              className={`w-2 h-2 rounded-full ${autoSpeak ? 'bg-emerald-400' : 'bg-slate-600'}`}
            />
          </button>

          {/* Request Hint / Clarification */}
          <button
            type="button"
            onClick={handleRequestHint}
            disabled={loadingHint}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Request a conceptual hint from the interviewer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{loadingHint ? 'Formulating...' : 'Ask for Hint'}</span>
          </button>
        </div>
      </div>

      {/* Conceptual Hint Modal / Dropdown */}
      {showHintModal && hint && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs shadow-inner animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  Interviewer Guidance & Conceptual Clue:
                </span>
                <p className="text-slate-200 leading-relaxed">{hint}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              className="text-amber-400 hover:text-white px-2 py-0.5 rounded text-[10px] bg-amber-900/40 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
