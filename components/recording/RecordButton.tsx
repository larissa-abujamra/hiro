"use client";

import { Mic, Pause, Play } from "lucide-react";

interface RecordButtonProps {
  phase: "idle" | "recording" | "paused";
  onClick: () => void;
  disabled?: boolean;
}

export function RecordButton({ phase, onClick, disabled }: RecordButtonProps) {
  const isRecording = phase === "recording";
  const isPaused = phase === "paused";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center justify-center focus-visible:outline-none"
      aria-label={
        isRecording ? "Pausar gravação" : isPaused ? "Retomar gravação" : "Iniciar gravação"
      }
    >
      {/* Outer pulse ring — only when recording */}
      {isRecording && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            animation: "recBtnPulse 2s ease-out infinite",
            background: "rgba(45, 90, 71, 0.15)",
          }}
        />
      )}

      {/* Main button circle */}
      <span
        className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
          isRecording
            ? "bg-[#2d5a47] shadow-[0_0_0_4px_rgba(45,90,71,0.15),0_8px_32px_rgba(45,90,71,0.3)]"
            : isPaused
              ? "bg-white/30 ring-2 ring-[#2d5a47] backdrop-blur-xl"
              : "bg-[#2d5a47] shadow-[0_4px_20px_rgba(45,90,71,0.25)] group-hover:shadow-[0_8px_32px_rgba(45,90,71,0.35)] group-hover:-translate-y-0.5"
        } group-active:scale-95`}
      >
        {isRecording ? (
          <Pause className="h-7 w-7 text-white" strokeWidth={2} />
        ) : isPaused ? (
          <Play className="h-7 w-7 text-[#2d5a47] ml-0.5" strokeWidth={2} />
        ) : (
          <Mic className="h-7 w-7 text-white" strokeWidth={1.75} />
        )}
      </span>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes recBtnPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
