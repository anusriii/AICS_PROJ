import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HardwareDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareDiagnosticsModal: React.FC<HardwareDiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cameraStatus, setCameraStatus] = useState<'testing' | 'passed' | 'failed'>('testing');
  const [micStatus, setMicStatus] = useState<'testing' | 'passed' | 'failed'>('testing');
  const [audioStatus, setAudioStatus] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let localStream: MediaStream | null = null;

    async function initDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream = stream;
        streamRef.current = stream;

        // Video setup
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('passed');

        // Audio setup
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const vol = Math.min(100, Math.round((avg / 128) * 100));
          setMicVolume(vol);
          if (vol > 5) {
            setMicStatus('passed');
          }
          animRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        console.warn('Diagnostics media error:', err);
        setCameraStatus('failed');
        setMicStatus('failed');
      }
    }

    initDevices();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const testSpeaker = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      setAudioStatus(true);
    } catch (e) {
      console.warn('Speaker test error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">System Hardware Diagnostics</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Webcam Sensor</span>
            </div>
            <span
              className={`font-semibold ${
                cameraStatus === 'passed'
                  ? 'text-emerald-400'
                  : cameraStatus === 'failed'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {cameraStatus === 'passed'
                ? 'Camera Operational'
                : cameraStatus === 'failed'
                ? 'Access Denied'
                : 'Initializing...'}
            </span>
          </div>

          <div className="h-44 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {cameraStatus === 'passed' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[45%] h-[75%] rounded-[50%/60%] border-2 border-dashed border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/85 px-2 py-0.5 rounded-full border border-emerald-500">
                    Target Face Framing Area
                  </span>
                </div>
              </div>
            )}
            {cameraStatus === 'failed' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-rose-300 bg-rose-950/40">
                <AlertCircle className="w-6 h-6 mb-1 text-rose-400" />
                <span>Webcam permission required. Please allow camera access in browser.</span>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Microphone Input Level</span>
            </div>
            <span
              className={`font-semibold ${
                micStatus === 'passed' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {micVolume > 5 ? `${micVolume}% Activity` : 'Speak into mic to test'}
            </span>
          </div>

          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-100"
              style={{ width: `${Math.max(5, micVolume)}%` }}
            />
          </div>
        </div>

        {/* Speaker Test */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="font-semibold text-slate-200 block">Audio Output (Speaker)</span>
              <span className="text-[11px] text-slate-400">Play test chime to verify sound</span>
            </div>
          </div>
          <button
            type="button"
            onClick={testSpeaker}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer border border-slate-700"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>{audioStatus ? 'Tested OK' : 'Play Test Tone'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          Confirm & Return to Interview
        </button>
      </div>
    </div>
  );
};
