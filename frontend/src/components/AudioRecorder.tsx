import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Activity, Zap, AlertCircle, RefreshCw } from 'lucide-react';

interface AudioRecorderProps {
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  onTranscriptUpdate: (newTranscript: string) => void;
  currentTranscript?: string;
  elapsedSeconds?: number;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isListening,
  onListeningChange,
  onTranscriptUpdate,
  currentTranscript = '',
  elapsedSeconds = 0,
}) => {
  const [supported, setSupported] = useState<boolean>(true);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      onTranscriptUpdate(fullTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onListeningChange(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          // Ignore restart conflicts
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Safe unmount
      }
    };
  }, []);

  // Handle SpeechRecognition start/stop
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
      startAudioMeter();
    } else {
      try {
        recognitionRef.current.stop();
      } catch {
        // Stopped
      }
      stopAudioMeter();
    }
  }, [isListening]);

  // Web Audio API mic level meter
  const startAudioMeter = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Mic meter init error:', err);
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setVolumeLevel(0);
  };

  useEffect(() => {
    return () => {
      stopAudioMeter();
    };
  }, []);

  const toggleMic = () => {
    onListeningChange(!isListening);
  };

  // Telemetry computations
  const wordCount = currentTranscript.trim() ? currentTranscript.trim().split(/\s+/).length : 0;
  const minutes = Math.max(0.1, (elapsedSeconds || 1) / 60);
  const wpm = Math.round(wordCount / minutes);

  // Filler words detection
  const fillerRegex = /\b(um|uh|like|you know|basically|actually|literally|sort of|kind of)\b/gi;
  const fillerMatches = currentTranscript.match(fillerRegex) || [];
  const fillerCount = fillerMatches.length;

  // Pace status
  let paceStatus = 'Ready';
  let paceColor = 'text-slate-400';
  if (wordCount > 5) {
    if (wpm < 110) {
      paceStatus = `${wpm} WPM (Deliberate / Calm)`;
      paceColor = 'text-sky-400';
    } else if (wpm <= 160) {
      paceStatus = `${wpm} WPM (Optimal Cadence)`;
      paceColor = 'text-emerald-400';
    } else {
      paceStatus = `${wpm} WPM (Rapid Delivery)`;
      paceColor = 'text-amber-400';
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
      <div className="flex flex-wrap items-center gap-3">
        {/* Microphone Toggle Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/50 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Pause Speech Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Speak Answer (Voice-to-Text)</span>
            </>
          )}
        </button>

        {/* Real-time Dynamic Waveform Bars */}
        <div className="flex items-center space-x-1 h-6 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-800">
          {[12, 28, 45, 65, 80, 50, 35, 70, 40, 20].map((baseHeight, i) => {
            const dynamicScale = isListening ? Math.max(15, (volumeLevel / 100) * baseHeight) : 15;
            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? volumeLevel > 15
                      ? 'bg-gradient-to-t from-indigo-500 to-emerald-400'
                      : 'bg-indigo-400'
                    : 'bg-slate-700'
                }`}
                style={{
                  height: `${dynamicScale}%`,
                  minHeight: '4px',
                  maxHeight: '100%',
                }}
              />
            );
          })}
        </div>

        {/* Clear / Reset Transcript button */}
        {currentTranscript.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onTranscriptUpdate('')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 cursor-pointer transition-colors"
            title="Clear Current Response Text"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Live Speech Telemetry Gauge */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        {/* Live Speaking Pace Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`font-semibold ${paceColor}`}>{paceStatus}</span>
        </div>

        {/* Live Filler Words Counter */}
        {fillerCount > 0 && (
          <div className="hidden md:flex items-center space-x-1 px-2 py-1 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-300 text-[11px]">
            <span>Fillers:</span>
            <span className="font-bold">{fillerCount}</span>
          </div>
        )}

        <div className="text-slate-400 text-[11px]">
          <span>{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};
