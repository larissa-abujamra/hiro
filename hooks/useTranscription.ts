"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type TranscriptionLine = {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useTranscription() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isListeningRef = useRef(false);
  const [lines, setLines] = useState<TranscriptionLine[]>([]);
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback((): boolean => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError(
        "Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.",
      );
      return false;
    }

    if (recognitionRef.current) {
      return true;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript?.trim() ?? "";
        if (!transcript) continue;

        if (result.isFinal) {
          setLines((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: transcript,
              isFinal: true,
              timestamp: Date.now(),
            },
          ]);
          setInterimText("");
        } else {
          interim = transcript;
        }
      }

      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;

      if (event.error === "not-allowed") {
        setError(
          "Permissão de microfone negada. Permita o acesso nas configurações do navegador.",
        );
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }

      if (event.error === "network") {
        setError("Sem conexão. A transcrição requer internet neste navegador.");
        return;
      }

      setError(`Erro: ${event.error}`);
    };

    recognition.onend = () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, []);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText("");
  }, []);

  const reset = useCallback(() => {
    stop();
    setLines([]);
    setInterimText("");
    setError(null);
  }, [stop]);

  const wordCount = useMemo(
    () =>
      lines.reduce(
        (acc, line) => acc + line.text.split(" ").filter(Boolean).length,
        0,
      ),
    [lines],
  );

  return {
    lines,
    interimText,
    isListening,
    isSupported,
    error,
    start,
    stop,
    reset,
    wordCount,
  };
}
