"use client";

import { Activity, AlertCircle, ArrowRight } from "lucide-react";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import type { TrackedMetric } from "@/lib/types";

function isOutOfRange(value: number, referenceRange?: string): boolean {
  if (!referenceRange) return false;
  const dashMatch = referenceRange.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
  if (dashMatch) return value < Number(dashMatch[1]) || value > Number(dashMatch[2]);
  const ltMatch = referenceRange.match(/^<=?\s*([\d.]+)$/);
  if (ltMatch) return value >= Number(ltMatch[1]);
  const gtMatch = referenceRange.match(/^>=?\s*([\d.]+)$/);
  if (gtMatch) return value <= Number(gtMatch[1]);
  return false;
}

interface MetricsSummaryCardProps {
  trackedMetrics: TrackedMetric[];
  onViewEvolution: () => void;
}

export function MetricsSummaryCard({ trackedMetrics, onViewEvolution }: MetricsSummaryCardProps) {
  if (trackedMetrics.length === 0) return null;

  const outOfRangeCount = trackedMetrics.filter((m) => {
    const last = m.history.at(-1)?.value;
    return last != null && isOutOfRange(last, m.referenceRange);
  }).length;

  return (
    <div className="mt-4">
      <OverlineLabel>MÉTRICAS EM ACOMPANHAMENTO</OverlineLabel>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-hiro-muted">
        <Activity className="h-3.5 w-3.5 text-hiro-green" strokeWidth={1.75} />
        <span>
          {trackedMetrics.length} {trackedMetrics.length === 1 ? "métrica" : "métricas"}
        </span>
        {outOfRangeCount > 0 && (
          <>
            <span className="text-hiro-muted/30">·</span>
            <span className="inline-flex items-center gap-1 text-hiro-red">
              <AlertCircle className="h-3 w-3" strokeWidth={2} />
              {outOfRangeCount} fora da ref.
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onViewEvolution}
        className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80"
      >
        Ver evolução
        <ArrowRight className="h-3 w-3" strokeWidth={2} />
      </button>
    </div>
  );
}
