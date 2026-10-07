import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  Mic,
  Maximize2,
  Minimize2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  Settings2
} from 'lucide-react';

interface ProctoringHUDProps {
  tabSwitchCount: number;
  faceCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isMicActive?: boolean;
  isCameraActive?: boolean;
  onRunDiagnostics?: () => void;
}

export const ProctoringHUD: React.FC<ProctoringHUDProps> = ({
  tabSwitchCount,
  faceCount,
  isFullscreen,
  onToggleFullscreen,
  isMicActive = true,
  isCameraActive = true,
  onRunDiagnostics,
}) => {
  const [showLog, setShowLog] = useState<boolean>(false);

  // Compute live integrity index (100 base)
  const tabPenalty = tabSwitchCount * 5;
  const facePenalty = faceCount > 1 ? 15 : 0;
  const integrityScore = Math.max(20, 100 - tabPenalty - facePenalty);

  let statusBadge = {
    label: 'Verified & Secure',
    bgColor: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
    iconColor: 'text-emerald-400',
  };

  if (integrityScore < 70) {
    statusBadge = {
      label: 'High Integrity Risk',
      bgColor: 'bg-rose-950/60 border-rose-800 text-rose-300',
      iconColor: 'text-rose-400',
    };
  } else if (integrityScore < 90) {
    statusBadge = {
      label: 'Minor Warnings',
      bgColor: 'bg-amber-950/60 border-amber-800 text-amber-300',
      iconColor: 'text-amber-400',
    };
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Integrity Score & Security Level */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {integrityScore >= 80 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Proctoring HUD
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-white text-sm">
                  {integrityScore}%
                </span>
                <span className="text-[10px] text-slate-500">Integrity Index</span>
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${statusBadge.bgColor}`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Center: Live Sensor Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Camera status */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] ${
              isCameraActive
                ? 'bg-slate-950 border-slate-800 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCameraActive ? 'Camera OK' : 'Camera Inactive'}</span>
          </div>

          {/* Face Count */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] ${
              faceCount === 1
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-rose-950/60 border-rose-700 text-rose-300 animate-pulse font-bold'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {faceCount === 1 ? '1 Face Detected' : `${faceCount} Faces (Alert!)`}
            </span>
          </div>

          {/* Tab focus count */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] ${
              tabSwitchCount === 0
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-amber-950/50 border-amber-800 text-amber-300 font-semibold'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>{tabSwitchCount} Tab Shifts</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Secure Fullscreen Mode"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lock Fullscreen</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Expand Audit Log */}
        <div className="flex items-center space-x-2">
          {onRunDiagnostics && (
            <button
              type="button"
              onClick={onRunDiagnostics}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 cursor-pointer transition-colors flex items-center space-x-1"
              title="System Hardware Diagnostics"
            >
              <Settings2 className="w-3 h-3 text-slate-400" />
              <span>Diagnostics</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLog(!showLog)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors cursor-pointer"
          >
            <span>Audit Log</span>
            {showLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Integrity Audit Log */}
      {showLog && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 animate-fadeIn">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Session Integrity Event Timeline:
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] font-mono text-slate-400 pr-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>[Initial Verification] Hardware feed verified, camera & audio nominal.</span>
            </div>
            {tabSwitchCount > 0 && (
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  [{tabSwitchCount} Warning{tabSwitchCount > 1 ? 's' : ''}] Window focus was lost {tabSwitchCount} time(s).
                </span>
              </div>
            )}
            {faceCount > 1 && (
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                <span>[Flagged] Multiple faces detected in video frame.</span>
              </div>
            )}
            {integrityScore === 100 && (
              <div className="flex items-center space-x-2 text-slate-500">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>No anomalous behavior recorded. Integrity index pristine at 100%.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
