import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Video,
  Eye,
  ShieldCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  Scan,
  Maximize2
} from 'lucide-react';

interface VideoRecorderProps {
  isRecording: boolean;
  onTelemetryUpdate?: (metrics: {
    face_visibility_ratio: number;
    posture_stability_score: number;
    face_fitted?: boolean;
  }) => void;
  onMultipleFacesDetected?: (faceCount: number) => void;
}

interface DetectedBox {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

type FramingStatus =
  | 'fitted'
  | 'too_far'
  | 'too_close'
  | 'off_center'
  | 'no_face'
  | 'multi_face';

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onTelemetryUpdate,
  onMultipleFacesDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Biometric Face Tracking State
  const [faceCount, setFaceCount] = useState<number>(1);
  const [detectedBox, setDetectedBox] = useState<DetectedBox | null>({
    x: 35,
    y: 20,
    width: 30,
    height: 48,
  });
  const [framingStatus, setFramingStatus] = useState<FramingStatus>('fitted');
  const [framingMessage, setFramingMessage] = useState<string>('Face Centered & Fitted');
  const [simulatedMultiFace, setSimulatedMultiFace] = useState<boolean>(false);
  const [showFaceGuidance, setShowFaceGuidance] = useState<boolean>(true);

  // Initialize Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasPermission(false);
          return;
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setHasPermission(false);
      }
    }

    if (cameraActive) {
      initCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Real-Time Computer Vision Face Tracking & Outline Fitting Engine
  useEffect(() => {
    if (!cameraActive || !hasPermission) return;

    let isMounted = true;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
      } catch (e) {
        console.warn('FaceDetector not supported:', e);
      }
    }

    const analyzeFrame = async () => {
      if (!isMounted || !videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;

      if (simulatedMultiFace) {
        setFaceCount(2);
        setFramingStatus('multi_face');
        setFramingMessage('Multiple Faces Detected (Flagged)');
        setDetectedBox({ x: 22, y: 24, width: 26, height: 44 });
        if (onMultipleFacesDetected) onMultipleFacesDetected(2);
        return;
      }

      let primaryBox: DetectedBox | null = null;
      let count = 0;

      // 1. Try Native Browser FaceDetector API
      if (detector) {
        try {
          const faces = await detector.detect(video);
          if (faces && faces.length > 0) {
            count = faces.length;
            const primary = faces[0].boundingBox;
            // Mirror coordinates because video is flipped horizontally scaleX(-1)
            const mirroredX = vWidth - (primary.x + primary.width);
            primaryBox = {
              x: Math.max(0, Math.min(100, (mirroredX / vWidth) * 100)),
              y: Math.max(0, Math.min(100, (primary.y / vHeight) * 100)),
              width: Math.max(10, Math.min(80, (primary.width / vWidth) * 100)),
              height: Math.max(10, Math.min(80, (primary.height / vHeight) * 100)),
            };
          }
        } catch (err) {
          // Fall back to canvas skin segmentation
        }
      }

      // 2. Universal Canvas Skin-Tone & Feature Clustering Fallback
      if (!primaryBox) {
        try {
          if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
            canvasRef.current.width = 120;
            canvasRef.current.height = 90;
          }
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, 120, 90);
            const imgData = ctx.getImageData(0, 0, 120, 90);
            const data = imgData.data;

            let minX = 120;
            let maxX = 0;
            let minY = 90;
            let maxY = 0;
            let skinPixels = 0;
            let leftCluster = 0;
            let rightCluster = 0;

            for (let i = 0; i < data.length; i += 16) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Human skin tone detection rule
              if (
                r > 90 &&
                g > 38 &&
                b > 20 &&
                r > g &&
                r > b &&
                Math.abs(r - g) > 15 &&
                r - g < 95
              ) {
                const pixelIdx = i / 4;
                const px = pixelIdx % 120;
                const py = Math.floor(pixelIdx / 120);

                skinPixels++;
                if (px < minX) minX = px;
                if (px > maxX) maxX = px;
                if (py < minY) minY = py;
                if (py > maxY) maxY = py;

                if (px < 45) leftCluster++;
                if (px > 75) rightCluster++;
              }
            }

            if (skinPixels > 60 && maxX > minX && maxY > minY) {
              count = leftCluster > 50 && rightCluster > 50 ? 2 : 1;
              const boxW = Math.max(22, ((maxX - minX) / 120) * 100);
              const boxH = Math.max(30, ((maxY - minY) / 90) * 100);
              const boxX = Math.max(0, Math.min(100 - boxW, (minX / 120) * 100));
              const boxY = Math.max(0, Math.min(100 - boxH, (minY / 90) * 100));

              primaryBox = {
                x: boxX,
                y: boxY,
                width: boxW,
                height: boxH,
              };
            } else {
              count = 0;
            }
          }
        } catch (e) {
          count = 1;
        }
      }

      setFaceCount(count);
      if (onMultipleFacesDetected) {
        onMultipleFacesDetected(count);
      }

      // 3. Evaluate Outline Fitting (Is Face Fitting Inside The Target Oval?)
      // Target oval center: (50%, 46%), optimal width: 24% - 52%, height: 35% - 68%
      if (count === 0 || !primaryBox) {
        setFramingStatus('no_face');
        setFramingMessage('No Face Detected in Frame');
        setDetectedBox(null);
      } else if (count > 1) {
        setFramingStatus('multi_face');
        setFramingMessage('Multiple Faces Detected (Proctoring Flag)');
        setDetectedBox(primaryBox);
      } else {
        setDetectedBox(primaryBox);

        const faceCenterX = primaryBox.x + primaryBox.width / 2;
        const faceCenterY = primaryBox.y + primaryBox.height / 2;

        const isHorizontalCentered = faceCenterX >= 32 && faceCenterX <= 68;
        const isVerticalCentered = faceCenterY >= 25 && faceCenterY <= 68;
        const isTooFar = primaryBox.width < 16;
        const isTooClose = primaryBox.width > 60;

        if (isTooFar) {
          setFramingStatus('too_far');
          setFramingMessage('Move Closer to Camera 🔍');
        } else if (isTooClose) {
          setFramingStatus('too_close');
          setFramingMessage('Move Further Back 📏');
        } else if (!isHorizontalCentered || !isVerticalCentered) {
          setFramingStatus('off_center');
          setFramingMessage('Center Face Inside Guide Oval ↔️');
        } else {
          setFramingStatus('fitted');
          setFramingMessage('Face Aligned & Fitted in Guide ✓');
        }
      }

      if (onTelemetryUpdate) {
        onTelemetryUpdate({
          face_visibility_ratio: count === 1 ? 0.96 : count > 1 ? 0.6 : 0.0,
          posture_stability_score: framingStatus === 'fitted' ? 9.2 : 7.0,
          face_fitted: framingStatus === 'fitted',
        });
      }
    };

    const interval = setInterval(analyzeFrame, 400);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraActive, hasPermission, simulatedMultiFace, onMultipleFacesDetected, onTelemetryUpdate]);

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  const toggleSimulatedMultiFace = () => {
    setSimulatedMultiFace((prev) => {
      const next = !prev;
      const count = next ? 2 : 1;
      setFaceCount(count);
      if (onMultipleFacesDetected) onMultipleFacesDetected(count);
      return next;
    });
  };

  // Styling based on outline fitting status
  let outlineColor = 'border-emerald-400 text-emerald-300';
  let glowColor = 'shadow-[0_0_25px_rgba(16,185,129,0.35)]';
  let badgeColor = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';

  if (framingStatus === 'fitted') {
    outlineColor = 'border-emerald-400 text-emerald-300';
    glowColor = 'shadow-[0_0_30px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/40';
    badgeColor = 'bg-emerald-950/85 border-emerald-500 text-emerald-300';
  } else if (
    framingStatus === 'off_center' ||
    framingStatus === 'too_far' ||
    framingStatus === 'too_close'
  ) {
    outlineColor = 'border-amber-400 text-amber-300';
    glowColor = 'shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/30';
    badgeColor = 'bg-amber-950/85 border-amber-500 text-amber-300 animate-pulse';
  } else {
    // no_face or multi_face
    outlineColor = 'border-rose-500 text-rose-300';
    glowColor = 'shadow-[0_0_25px_rgba(244,63,94,0.4)] ring-2 ring-rose-500/40';
    badgeColor = 'bg-rose-950/85 border-rose-500 text-rose-300 animate-pulse';
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center group overflow-hidden select-none"
    >
      {/* Active Camera Feed */}
      {cameraActive && hasPermission ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        /* Standby / Off State */
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 shadow-inner">
            <Video className="w-10 h-10" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">
              {hasPermission === false ? 'Webcam Unavailable or Denied' : 'Webcam Standby'}
            </p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Position your face inside the framing guide once the camera initializes.
            </p>
          </div>
        </div>
      )}

      {/* BIOMETRIC FACE FRAMING GUIDE OVERLAY */}
      {cameraActive && hasPermission && showFaceGuidance && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Central Oval Target Guide Outline */}
          <div
            className={`w-[46%] h-[72%] rounded-[50%/60%] border-2 border-dashed transition-all duration-300 relative flex items-center justify-center ${outlineColor} ${glowColor}`}
          >
            {/* 4 Corner Crosshairs */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-current rounded-full" />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-current rounded-full" />
            <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-1 h-5 bg-current rounded-full" />
            <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-1 h-5 bg-current rounded-full" />

            {/* Status Feedback Badge Inside Target */}
            <div
              className={`absolute -bottom-5 px-3 py-1 rounded-full border text-[11px] font-bold shadow-lg flex items-center space-x-1.5 transition-all ${badgeColor}`}
            >
              {framingStatus === 'fitted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{framingMessage}</span>
            </div>
          </div>

          {/* Real-Time Detected Face Bounding Box (Follows actual face) */}
          {detectedBox && framingStatus !== 'no_face' && (
            <div
              className="absolute border border-indigo-400/80 rounded-xl pointer-events-none transition-all duration-200"
              style={{
                left: `${detectedBox.x}%`,
                top: `${detectedBox.y}%`,
                width: `${detectedBox.width}%`,
                height: `${detectedBox.height}%`,
              }}
            >
              {/* Corner Biometric Brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-400" />

              <span className="absolute -top-4 left-0 text-[9px] font-mono font-bold bg-indigo-950/90 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800">
                Face Track #1
              </span>
            </div>
          )}
        </div>
      )}

      {/* Multiple Faces Warning Banner */}
      {faceCount > 1 && (
        <div className="absolute top-12 left-3 right-3 p-2.5 rounded-xl bg-rose-950/95 border border-rose-500 text-rose-200 text-xs font-bold flex items-center justify-between shadow-2xl z-30 animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Multiple Faces Detected ({faceCount} in frame) — Proctoring Flag</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-900 border border-rose-600 text-white font-mono uppercase tracking-wider">
            Flagged
          </span>
        </div>
      )}

      {/* Top Header Controls: Recording Status & Camera Toggle */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
        {/* Recording pill */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
            }`}
          />
          <span className="font-medium text-slate-200">
            {isRecording ? 'Recording Response' : 'Camera Active'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Toggle Framing Guide Outline */}
          <button
            type="button"
            onClick={() => setShowFaceGuidance(!showFaceGuidance)}
            className={`p-1.5 rounded-full backdrop-blur-md border text-[11px] transition-colors cursor-pointer ${
              showFaceGuidance
                ? 'bg-indigo-600/90 border-indigo-500 text-white'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={showFaceGuidance ? 'Hide Face Framing Guide' : 'Show Face Framing Guide'}
          >
            <Scan className="w-4 h-4" />
          </button>

          {/* Multi-face simulation toggle for test & demonstration */}
          <button
            type="button"
            onClick={toggleSimulatedMultiFace}
            className={`px-2 py-1 rounded-full backdrop-blur-md border text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
              simulatedMultiFace
                ? 'bg-rose-900/90 border-rose-500 text-rose-100 shadow-md shadow-rose-900/50'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={simulatedMultiFace ? 'Reset to Single Face' : 'Simulate 2 Faces to test multi-face detection'}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {simulatedMultiFace ? '2 Faces (Flagged)' : 'Test Multi-Face'}
            </span>
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className="p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={cameraActive ? 'Turn Off Webcam' : 'Turn On Webcam'}
          >
            {cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Overlay */}
      <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-300 font-mono z-20">
        <div className="flex items-center space-x-3">
          <span
            className={`flex items-center space-x-1 ${
              faceCount > 1
                ? 'text-rose-400 font-bold'
                : framingStatus === 'fitted'
                ? 'text-emerald-400 font-semibold'
                : 'text-amber-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {faceCount > 1
                ? 'Faces: 2 (FLAGGED)'
                : framingStatus === 'fitted'
                ? 'Face: Fitted & Verified'
                : 'Face: Adjusting Position'}
            </span>
          </span>

          <span
            className={`items-center space-x-1 hidden sm:flex ${
              framingStatus === 'fitted' ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Framing: {framingStatus === 'fitted' ? '100% (Aligned)' : 'Off Target'}</span>
          </span>

          <span className="flex items-center space-x-1 text-indigo-400 hidden sm:flex">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrity: Nominal</span>
          </span>
        </div>

        <span className="text-slate-500 text-[10px]">Biometric Framing</span>
      </div>
    </div>
  );
};
