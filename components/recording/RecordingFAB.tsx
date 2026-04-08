"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause } from "lucide-react";

interface RecordingFABProps {
  /** Ref to the main recording panel — FAB appears when this is out of viewport */
  targetRef: React.RefObject<HTMLElement | null>;
  isRecording: boolean;
  isPaused: boolean;
  onClick: () => void;
  timerLabel: string;
}

export function RecordingFAB({
  targetRef,
  isRecording,
  isPaused,
  onClick,
  timerLabel,
}: RecordingFABProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show FAB when the main recording panel is NOT visible
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  // Only show FAB when recording or paused AND main panel is out of view
  if (!visible || (!isRecording && !isPaused)) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-5 z-40 flex items-center gap-2.5 rounded-full px-4 py-3 transition-all duration-300 hover:scale-105 active:scale-95 lg:right-8"
      style={{
        background: isRecording ? "rgba(45, 90, 71, 0.85)" : "rgba(45, 90, 71, 0.6)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {isRecording ? (
        <>
          {/* Pulse dot */}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="text-[13px] font-medium tabular-nums text-white">
            {timerLabel}
          </span>
          <Pause className="h-4 w-4 text-white" strokeWidth={2} />
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 text-white" strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-white/80">Retomar</span>
        </>
      )}
    </button>
  );
}
