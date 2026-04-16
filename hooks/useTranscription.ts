"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TranscriptionLine = {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
};

export function useTranscription() {
  const [lines, setLines] = useState<TranscriptionLine[]>([]);
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lineCountRef = useRef(0);

  useEffect(() => {
    return () => { cleanup(); };
  }, []);

  function cleanup() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;
  }

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      // 1. Get API key from backend
      const tokenRes = await fetch("/api/deepgram/token");
      if (!tokenRes.ok) throw new Error("Erro ao obter credenciais de transcrição");
      const { apiKey } = await tokenRes.json();
      if (!apiKey) throw new Error("API key não disponível");

      console.log("[Deepgram] Got API key, requesting microphone...");

      // 2. Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      console.log("[Deepgram] Microphone granted");

      // 3. Connect to Deepgram — simple params, no keywords in URL
      const params = new URLSearchParams({
        model: "nova-3",
        language: "pt-BR",
        smart_format: "true",
        punctuate: "true",
        interim_results: "true",
        endpointing: "300",
      });

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;
      console.log("[Deepgram] Connecting...");

      const ws = new WebSocket(wsUrl, ["token", apiKey]);
      wsRef.current = ws;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => { ws.close(); reject(new Error("Timeout")); }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          console.log("[Deepgram] Connected");
          resolve();
        };

        ws.onclose = (event) => {
          clearTimeout(timeout);
          console.error("[Deepgram] Closed during connect — code:", event.code, "reason:", event.reason);
          reject(new Error(event.reason || `Conexão recusada (${event.code})`));
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Erro de conexão WebSocket"));
        };
      });

      // 4. Handle messages
      ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          const data = JSON.parse(raw);
          console.log("[Deepgram] Message type:", data.type, "is_final:", data.is_final);

          const alt = data.channel?.alternatives?.[0];
          const transcript = alt?.transcript?.trim();

          if (transcript) {
            console.log("[Deepgram] Transcript:", transcript, "final:", data.is_final);
          }

          if (!transcript) return;

          if (data.is_final === true) {
            lineCountRef.current += 1;
            setLines((prev) => [
              ...prev,
              { id: `dg-${lineCountRef.current}`, text: transcript, isFinal: true, timestamp: Date.now() },
            ]);
            setInterimText("");
          } else {
            setInterimText(transcript);
          }
        } catch {
          // non-JSON metadata
          console.log("[Deepgram] Non-JSON message:", typeof event.data);
        }
      };

      ws.onclose = (ev) => {
        console.log("[Deepgram] Session closed — code:", ev.code, "reason:", ev.reason);
        setIsListening(false);
      };
      ws.onerror = () => { setError("Conexão perdida"); setIsListening(false); };

      // 5. Send audio
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      console.log("[Deepgram] MediaRecorder mimeType:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      let chunkCount = 0;
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          chunkCount++;
          if (chunkCount <= 5 || chunkCount % 20 === 0) {
            console.log(`[Deepgram] Sending audio chunk #${chunkCount}:`, event.data.size, "bytes");
          }
          ws.send(await event.data.arrayBuffer());
        }
      };

      mediaRecorder.start(250);
      console.log("[Deepgram] MediaRecorder started, state:", mediaRecorder.state);
      setIsListening(true);
      console.log("[Deepgram] Recording started");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar gravação";
      console.error("[Deepgram] Start error:", msg);
      setError(msg);
      cleanup();
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
    }
    cleanup();
    setIsListening(false);
    setInterimText("");
  }, []);

  const reset = useCallback(() => {
    stop();
    setLines([]);
    lineCountRef.current = 0;
  }, [stop]);

  const wordCount = useMemo(
    () => lines.reduce((acc, l) => acc + l.text.split(" ").filter(Boolean).length, 0),
    [lines],
  );

  return {
    lines,
    interimText,
    isListening,
    isSupported: true, // Checked at runtime in start(); avoids hydration mismatch
    error,
    start,
    stop,
    reset,
    wordCount,
  };
}
