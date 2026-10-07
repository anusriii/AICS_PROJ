import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  onTick?: (seconds: number) => void;
  resetSignal?: any;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTick, resetSignal }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
  }, [resetSignal]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, onTick]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isWarning = seconds >= 120; // > 2 mins

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-colors ${
        isWarning
          ? 'bg-amber-950/40 text-amber-400 border-amber-800 animate-pulse'
          : 'bg-slate-800/80 text-slate-300 border-slate-700'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isWarning ? 'text-amber-400' : 'text-slate-400'}`} />
      <span>{formatted}</span>
    </div>
  );
};
