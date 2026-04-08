"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface AudioWaveformProps {
  isRecording: boolean;
  /** Total seconds elapsed (for timestamp display) */
  seconds: number;
  className?: string;
}

const BAR_W = 2.5;
const BAR_GAP = 1.5;
const BAR_STEP = BAR_W + BAR_GAP;
const SAMPLE_INTERVAL = 80; // ms between samples
const MAX_BARS = 600;
const GREEN = "#2d5a47";
const GREEN_LIGHT = "#7fb69a";
const GREY = "#d1d5db";
const FUTURE_BARS = 60;

export function AudioWaveform({
  isRecording,
  seconds,
  className,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<number[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connectAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      ctxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
    } catch {
      // Mic denied — bars will stay at minimum height
    }
  }, []);

  const disconnectAudio = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  // Connect/disconnect mic with recording state
  useEffect(() => {
    if (isRecording) {
      connectAudio();
    }
    return () => {
      if (!isRecording) disconnectAudio();
    };
  }, [isRecording, connectAudio, disconnectAudio]);

  // Sample volume at intervals while recording
  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) {
        // No mic — add small random bar
        setBars((prev) => {
          const next = [...prev, 0.05 + Math.random() * 0.08];
          return next.length > MAX_BARS ? next.slice(-MAX_BARS) : next;
        });
        return;
      }

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      // RMS amplitude normalized 0..1
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length) / 255;
      const volume = Math.min(1, rms * 2.2); // boost a bit

      setBars((prev) => {
        const next = [...prev, volume];
        return next.length > MAX_BARS ? next.slice(-MAX_BARS) : next;
      });
    }, SAMPLE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  // Auto-scroll to the right as new bars appear
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [bars.length]);

  // Format time for timestamp markers
  const formatTime = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Calculate which bar indices get timestamp labels (every ~10 seconds)
  const samplesPerSecond = 1000 / SAMPLE_INTERVAL;
  const samplesPerMark = Math.round(samplesPerSecond * 10);

  return (
    <div className={className}>
      {/* Waveform container */}
      <div
        ref={containerRef}
        className="relative flex items-center overflow-x-hidden"
        style={{ height: 80 }}
      >
        {/* Recorded bars */}
        {bars.map((vol, i) => (
          <div
            key={i}
            className="shrink-0 rounded-full"
            style={{
              width: BAR_W,
              marginRight: BAR_GAP,
              height: `${Math.max(6, vol * 100)}%`,
              backgroundColor: GREEN,
              opacity: 0.5 + vol * 0.5,
            }}
          />
        ))}

        {/* Playhead */}
        <div className="relative shrink-0 mx-1" style={{ width: 2 }}>
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 2,
              height: "100%",
              backgroundColor: GREEN_LIGHT,
              top: 0,
            }}
          />
          {/* Top dot */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 6, height: 6, backgroundColor: GREEN }}
          />
          {/* Bottom dot */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 6, height: 6, backgroundColor: GREEN }}
          />
        </div>

        {/* Future bars (grey placeholders) */}
        {Array.from({ length: FUTURE_BARS }).map((_, i) => (
          <div
            key={`f-${i}`}
            className="shrink-0 rounded-full"
            style={{
              width: BAR_W,
              marginRight: BAR_GAP,
              height: 4,
              backgroundColor: GREY,
              opacity: 0.4 - i * 0.005,
            }}
          />
        ))}
      </div>

    </div>
  );
}
