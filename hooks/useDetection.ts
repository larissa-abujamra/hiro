"use client";

import { useCallback, useEffect, useRef } from "react";
import { useConsultationStore } from "@/lib/store";
import type { DetectedItem } from "@/lib/types";

const DETECT_TYPES: DetectedItem["type"][] = [
  "prescription",
  "exam",
  "return",
  "certificate",
  "referral",
];

function isDetectedType(value: unknown): value is DetectedItem["type"] {
  return typeof value === "string" && DETECT_TYPES.includes(value as DetectedItem["type"]);
}

export function useDetection(consultationId: string) {
  const addDetectedItem = useConsultationStore((s) => s.addDetectedItem);
  const isProcessingRef = useRef(false);
  const processedRef = useRef(new Set<string>());

  useEffect(() => {
    processedRef.current.clear();
  }, [consultationId]);

  const analyze = useCallback(
    async (newLine: string, previousLines: string[]) => {
      if (isProcessingRef.current) return;
      if (processedRef.current.has(newLine)) return;
      if (newLine.trim().split(/\s+/).length < 5) return;

      processedRef.current.add(newLine);
      isProcessingRef.current = true;

      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: newLine,
            previousLines: previousLines.slice(-5).join(" "),
          }),
        });

        const data = (await res.json()) as {
          items?: Array<{
            type?: string;
            text?: string;
            sourceQuote?: string;
            details?: Record<string, unknown>;
          }>;
        };

        data.items?.forEach((item) => {
          if (!isDetectedType(item.type)) return;
          const text = typeof item.text === "string" ? item.text : "";
          const sourceQuote =
            typeof item.sourceQuote === "string" ? item.sourceQuote : newLine;
          if (!text.trim()) return;

          addDetectedItem({
            id: crypto.randomUUID(),
            type: item.type,
            text,
            sourceQuote,
            details:
              item.details && typeof item.details === "object"
                ? item.details
                : {},
          });
        });
      } catch (err) {
        console.error("Detection error:", err);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [addDetectedItem],
  );

  return { analyze };
}
