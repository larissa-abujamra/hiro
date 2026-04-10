"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import type { TrackedMetric } from "@/lib/types";

interface MetricEvolutionChartProps {
  metric: TrackedMetric;
  onRemove?: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function parseReferenceRange(range: string | undefined) {
  if (!range) return null;
  const dashMatch = range.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
  if (dashMatch) return { min: Number(dashMatch[1]), max: Number(dashMatch[2]) };
  const ltMatch = range.match(/^<=?\s*([\d.]+)$/);
  if (ltMatch) return { max: Number(ltMatch[1]) };
  const gtMatch = range.match(/^>=?\s*([\d.]+)$/);
  if (gtMatch) return { min: Number(gtMatch[1]) };
  return null;
}

function isOutOfRange(value: number, referenceRange?: string): boolean {
  if (!referenceRange) return false;
  const ref = parseReferenceRange(referenceRange);
  if (!ref) return false;
  if (ref.min != null && value < ref.min) return true;
  if (ref.max != null && value > ref.max) return true;
  return false;
}

function getTrend(history: { value: number; date: string }[]): "up" | "down" | "stable" {
  if (history.length < 2) return "stable";
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last = sorted[sorted.length - 1].value;
  const prev = sorted[sorted.length - 2].value;
  const pct = ((last - prev) / prev) * 100;
  if (pct > 5) return "up";
  if (pct < -5) return "down";
  return "stable";
}

export function MetricEvolutionChart({ metric, onRemove }: MetricEvolutionChartProps) {
  const chartData = useMemo(
    () =>
      [...metric.history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((pt) => ({
          date: formatDate(pt.date),
          value: pt.value,
        })),
    [metric.history],
  );

  const ref = useMemo(() => parseReferenceRange(metric.referenceRange), [metric.referenceRange]);
  const lastValue = chartData.at(-1)?.value;
  const outOfRange = lastValue != null && isOutOfRange(lastValue, metric.referenceRange);
  const trend = getTrend(metric.history);
  const hasMultiplePoints = chartData.length > 1;

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-medium text-hiro-text">{metric.name}</h3>
            {/* Trend indicator */}
            {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-hiro-red" strokeWidth={2} />}
            {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-hiro-green" strokeWidth={2} />}
            {trend === "stable" && <Minus className="h-3.5 w-3.5 text-hiro-muted/50" strokeWidth={2} />}
          </div>
          <p className="mt-0.5 text-[12px] text-hiro-muted">
            Último:{" "}
            <span
              className={`font-medium tabular-nums ${
                outOfRange ? "text-hiro-red" : "text-hiro-text"
              }`}
            >
              {lastValue} {metric.unit}
              {outOfRange && (
                <AlertCircle className="ml-1 inline h-3 w-3 text-hiro-red" strokeWidth={2} />
              )}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {metric.referenceRange && (
            <span className="shrink-0 rounded-full border border-black/[0.06] bg-white/50 px-2.5 py-1 text-[10px] tabular-nums text-hiro-muted">
              Ref: {metric.referenceRange}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 rounded-full p-1 text-hiro-muted/30 transition-colors hover:bg-black/[0.04] hover:text-hiro-red"
              title="Parar de acompanhar"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {hasMultiplePoints ? (
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7A6D" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7A6D" }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
                formatter={(v: number) => [`${v} ${metric.unit}`, metric.name]}
                labelFormatter={(l) => `${l}`}
              />
              {ref?.min != null && (
                <ReferenceLine y={ref.min} stroke="#c9a962" strokeDasharray="4 4" strokeWidth={1} />
              )}
              {ref?.max != null && (
                <ReferenceLine y={ref.max} stroke="#c9a962" strokeDasharray="4 4" strokeWidth={1} />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2d5a47"
                strokeWidth={2}
                dot={{ fill: "#2d5a47", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#2d5a47", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[80px] items-center justify-center">
          <p className="text-[12px] italic text-hiro-muted/60">
            Gráfico aparecerá após 2 registros.
          </p>
        </div>
      )}

      {/* History pills */}
      <div className="mt-3 border-t border-black/[0.06] pt-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-hiro-muted">
          Histórico ({metric.history.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chartData.map((pt, i) => {
            const val = metric.history.find((h) => formatDate(h.date) === pt.date)?.value ?? pt.value;
            const bad = isOutOfRange(val, metric.referenceRange);
            return (
              <span
                key={i}
                className={`rounded-full border px-2 py-0.5 text-[10px] tabular-nums ${
                  bad
                    ? "border-hiro-red/20 bg-hiro-red/5 text-hiro-red"
                    : "border-black/[0.06] bg-white/50 text-hiro-muted"
                }`}
              >
                {pt.date}: <span className="font-medium">{pt.value}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
