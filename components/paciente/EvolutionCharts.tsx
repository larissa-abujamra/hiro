"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import type { PatientMetrics } from "@/lib/types";

interface EvolutionChartsProps {
  data: PatientMetrics[];
}

export function EvolutionCharts({ data }: EvolutionChartsProps) {
  const [period, setPeriod] = useState<"3m" | "6m" | "1y" | "all">("all");
  const filteredData = useMemo(() => {
    if (period === "all") return data;
    const now = new Date();
    const monthMap = { "3m": 3, "6m": 6, "1y": 12, all: 1000 };
    return data.filter((item) => {
      const date = new Date(item.date);
      const monthsDiff =
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth());
      return monthsDiff <= monthMap[period];
    });
  }, [data, period]);

  if (filteredData.length < 2) {
    return (
      <section className="rounded-2xl border border-black/7 bg-hiro-card p-4">
        <OverlineLabel>Gráficos de evolução</OverlineLabel>
        <p className="mt-3 text-sm text-hiro-muted">
          Os dados aparecerão após 2 consultas.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-black/7 bg-hiro-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <OverlineLabel>Gráficos de evolução</OverlineLabel>
        <div className="flex flex-wrap gap-1">
          {[
            { label: "3 meses", value: "3m" },
            { label: "6 meses", value: "6m" },
            { label: "1 ano", value: "1y" },
            { label: "Tudo", value: "all" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value as "3m" | "6m" | "1y" | "all")}
              className={`rounded-full px-2 py-1 text-xs ${
                period === item.value
                  ? "bg-hiro-text text-white"
                  : "border border-black/15 text-hiro-text"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="systolic" stroke="#2D5C3F" strokeWidth={2} />
          <Line type="monotone" dataKey="diastolic" stroke="#C68B2F" strokeWidth={2} />
          <Line type="monotone" dataKey="weight" stroke="#1C2B1E" strokeWidth={2} />
          <Line type="monotone" dataKey="glucose" stroke="#D94F4F" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </section>
  );
}
