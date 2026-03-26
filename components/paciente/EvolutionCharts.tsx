"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PatientMetrics } from "@/lib/types";

interface EvolutionChartsProps {
  data: PatientMetrics[];
}

export function EvolutionCharts({ data }: EvolutionChartsProps) {
  return (
    <section className="h-72 rounded-2xl bg-white/60 p-4">
      <p className="mb-3 text-sm font-medium text-hiro-text">Evolucao da PA</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="systolic" stroke="#2D5C3F" strokeWidth={2} />
          <Line type="monotone" dataKey="diastolic" stroke="#C68B2F" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
