"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useScribe } from "@elevenlabs/react";

export type TranscriptionLine = {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
};

export function useTranscription() {
  const {
    connect,
    disconnect,
    clearTranscripts,
    committedTranscripts,
    partialTranscript,
    isConnected,
    error,
  } = useScribe({
    modelId: "scribe_v2_realtime",
    languageCode: "pt",
  });

  // Disconnect and release mic on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map ElevenLabs TranscriptSegment → our TranscriptionLine shape
  const lines = useMemo<TranscriptionLine[]>(
    () =>
      committedTranscripts.map((seg) => ({
        id: seg.id,
        text: seg.text,
        isFinal: true,
        timestamp: seg.timestamp,
      })),
    [committedTranscripts],
  );

  // Fetch a single-use token from our backend, then open the Scribe WebSocket
  const start = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/scribe-token");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Token fetch failed (${res.status})`);
      }
      const { token } = (await res.json()) as { token: string };
      await connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      return true;
    } catch (err) {
      console.error("Scribe connect error:", err);
      return false;
    }
  }, [connect]);

  const stop = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const reset = useCallback(() => {
    disconnect();
    clearTranscripts();
  }, [disconnect, clearTranscripts]);

  const wordCount = useMemo(
    () =>
      lines.reduce(
        (acc, line) => acc + line.text.split(" ").filter(Boolean).length,
        0,
      ),
    [lines],
  );

  const errorMessage = error ?? null;

  return {
    lines,
    interimText: partialTranscript,
    isListening: isConnected,
    isSupported: true,
    error: errorMessage,
    start,
    stop,
    reset,
    wordCount,
  };
}
