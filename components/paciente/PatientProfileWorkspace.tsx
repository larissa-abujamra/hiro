"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { useConsultationStore } from "@/lib/store";
import type { TrackedMetric } from "@/lib/types";
import { formatDateBR } from "@/lib/formatDate";
import { MetricEvolutionChart } from "@/components/paciente/MetricEvolutionChart";
import { MetricsSummaryCard } from "@/components/paciente/MetricsSummaryCard";
import { AddMetricManually } from "@/components/paciente/AddMetricManually";
import { CIDSearchModal } from "@/components/cid/CIDSearchModal";
import { ExamesTab } from "@/components/paciente/ExamesTab";
import { usePatientConsultations } from "@/hooks/usePatientConsultations";

interface PatientProfileWorkspaceProps {
  patientId: string;
}

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

export function PatientProfileWorkspace({ patientId }: PatientProfileWorkspaceProps) {
  const patients = useConsultationStore((state) => state.patients);
  const updatePatient = useConsultationStore((state) => state.updatePatient);
  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const { consultations: dbConsultations, isLoading: isLoadingConsultations } = usePatientConsultations(patientId);
  const [activeTab, setActiveTab] = useState<"Histórico" | "Evolução" | "Exames">(
    "Histórico",
  );
  const [period, setPeriod] = useState<"3m" | "6m" | "1a" | "Tudo">("Tudo");
  const [cidModalOpen, setCidModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dose: "", status: "active" as const });

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({
    name: "",
    height: "",
    weight: "",
    phone: "",
    conditions: "",
  });

  const startEditing = () => {
    setEditDraft({
      name: patient?.name ?? "",
      height: patient?.height?.toString() ?? "",
      weight: patient?.weight?.toString() ?? "",
      phone: patient?.phone ?? "",
      conditions: patient?.conditions?.join(", ") ?? "",
    });
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (!patient) return;
    updatePatient(patient.id, {
      name: editDraft.name.trim() || patient.name,
      height: editDraft.height ? Number(editDraft.height) : patient.height,
      weight: editDraft.weight ? Number(editDraft.weight) : patient.weight,
      phone: editDraft.phone.trim() || patient.phone,
      conditions: editDraft.conditions
        ? editDraft.conditions.split(",").map((s) => s.trim()).filter(Boolean)
        : patient.conditions,
    });
    setIsEditing(false);
  };

  const filteredData = useMemo(() => {
    if (!patient) return [];
    if (period === "Tudo") return patient.metrics;
    const monthMap = { "3m": 3, "6m": 6, "1a": 12, Tudo: 1000 };
    const now = new Date();
    return patient.metrics.filter((item) => {
      const date = new Date(item.date);
      const monthsDiff =
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth());
      return monthsDiff <= monthMap[period];
    });
  }, [patient, period]);

  if (!patient) {
    return (
      <CardHiro className="rounded-2xl p-6">
        <p className="text-sm text-hiro-muted">Paciente não encontrado.</p>
      </CardHiro>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const bmiValue =
    patient.height && patient.weight
      ? patient.weight / ((patient.height / 100) * (patient.height / 100))
      : null;
  const bmi = bmiValue ? bmiValue.toFixed(1) : "—";

  const bmiBadge = (() => {
    if (!bmiValue) return null;
    if (bmiValue < 18.5) {
      return { label: "Abaixo do peso", className: "bg-[#E6F1FB] text-[#185FA5]" };
    }
    if (bmiValue < 25) {
      return { label: "Normal", className: "bg-[#D6E8DC] text-[#0F6E56]" };
    }
    if (bmiValue < 30) {
      return { label: "Sobrepeso", className: "bg-[#FAEEDA] text-[#854F0B]" };
    }
    return { label: "Obesidade", className: "bg-[#FAECE7] text-[#993C1D]" };
  })();

  const activeMedications = patient.medications.filter((med) => med.status === "active");
  const hasInteraction = (medName: string) =>
    activeMedications.some(
      (med) =>
        med.name !== medName &&
        ((med.name.includes("Sinvastatina") && medName.includes("Anlodipino")) ||
          (medName.includes("Sinvastatina") && med.name.includes("Anlodipino"))),
    );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <CardHiro className="sticky top-6 flex flex-col gap-5 self-start rounded-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <AvatarInitials name={patient.name} size="lg" />
            <div>
              <h2 className="font-serif text-[20px] font-normal text-hiro-text">
                {patient.name}
              </h2>
              <p className="mt-0.5 text-[13px] text-hiro-muted">
                {age} anos · {patient.sex} · #{patient.id.slice(-4)}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-hiro-muted">Nome</p>
                <input
                  className={inputClass}
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-hiro-muted">Altura (cm)</p>
                  <input
                    className={inputClass}
                    type="number"
                    value={editDraft.height}
                    onChange={(e) => setEditDraft((d) => ({ ...d, height: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-hiro-muted">Peso (kg)</p>
                  <input
                    className={inputClass}
                    type="number"
                    value={editDraft.weight}
                    onChange={(e) => setEditDraft((d) => ({ ...d, weight: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-hiro-muted">Telefone</p>
                <input
                  className={inputClass}
                  value={editDraft.phone}
                  onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-hiro-muted">Condições (separadas por vírgula)</p>
                <input
                  className={inputClass}
                  value={editDraft.conditions}
                  onChange={(e) => setEditDraft((d) => ({ ...d, conditions: e.target.value }))}
                  placeholder="Hipertensão, Diabetes tipo 2"
                />
              </div>
              <div className="flex gap-2">
                <ButtonHiro className="flex-1" onClick={saveEdits}>Salvar</ButtonHiro>
                <ButtonHiro variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</ButtonHiro>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-card-input rounded-xl p-3 text-center">
                  <p className="mb-1 text-[11px] text-hiro-muted">Altura</p>
                  <p className="text-[15px] font-medium text-hiro-text">{patient.height ?? "—"} cm</p>
                </div>
                <div className="glass-card-input rounded-xl p-3 text-center">
                  <p className="mb-1 text-[11px] text-hiro-muted">Peso</p>
                  <p className="text-[15px] font-medium text-hiro-text">{patient.weight ?? "—"} kg</p>
                </div>
                <div className="glass-card-input rounded-xl p-3 text-center">
                  <p className="mb-1 text-[11px] text-hiro-muted">IMC</p>
                  <p className="text-[15px] font-medium text-hiro-text">{bmi}</p>
                  {bmiBadge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${bmiBadge.className}`}
                    >
                      {bmiBadge.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/consulta/nova?patientId=${patient.id}`}
                  prefetch={false}
                  className="w-full"
                >
                  <ButtonHiro className="w-full">Nova consulta</ButtonHiro>
                </Link>
                <ButtonHiro variant="secondary" className="w-full" onClick={startEditing}>
                  Editar dados
                </ButtonHiro>
              </div>
            </>
          )}

          <div>
            <OverlineLabel>MEDICAMENTOS ATIVOS</OverlineLabel>
            {activeMedications.length === 0 ? (
              <p className="mt-2 text-[12px] italic text-hiro-muted/60">Nenhum medicamento ativo.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {activeMedications.map((med, i) => (
                  <div key={`${med.name}-${i}`} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-hiro-text">{med.name}</p>
                      <p className="text-[11px] text-hiro-muted">{med.dose}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasInteraction(med.name) && (
                        <AlertTriangle className="h-3.5 w-3.5 text-hiro-amber" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = patient.medications.filter((m) => m !== med);
                          updatePatient(patient.id, { medications: updated });
                        }}
                        className="shrink-0 rounded-full p-0.5 text-hiro-muted/30 transition-colors hover:text-hiro-red"
                      >
                        <X className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMedModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Adicionar medicamento
            </button>
          </div>

          <div>
            <OverlineLabel>CIDS REGISTRADOS</OverlineLabel>
            {patient.cids.length === 0 ? (
              <p className="mt-2 text-[12px] italic text-hiro-muted/60">Nenhum CID registrado.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                {patient.cids.map((cid) => (
                  <div key={cid.code} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-hiro-muted">
                      <span className="font-medium text-hiro-text">{cid.code}</span>
                      {" · "}
                      {cid.name.split(" ").slice(0, 3).join(" ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = patient.cids.filter((c) => c.code !== cid.code);
                        updatePatient(patient.id, { cids: updated });
                      }}
                      className="shrink-0 rounded-full p-0.5 text-hiro-muted/30 transition-colors hover:text-hiro-red"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setCidModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Adicionar CID
            </button>
          </div>

          {/* Tracked metrics summary */}
          <MetricsSummaryCard
            trackedMetrics={patient.trackedMetrics ?? []}
            onViewEvolution={() => setActiveTab("Evolução")}
          />
        </CardHiro>
      </aside>

      <section className="lg:col-span-8">
        <div className="mb-5 flex gap-1 border-b border-black/[0.08]">
          {(["Histórico", "Evolução", "Exames"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "border-hiro-green text-hiro-green"
                  : "border-transparent text-hiro-muted hover:text-hiro-text"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Histórico" && (
          <CardHiro className="rounded-2xl p-5">
            {isLoadingConsultations ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-hiro-green border-t-transparent" />
              </div>
            ) : dbConsultations.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[13px] text-hiro-muted">
                  Nenhuma consulta registrada ainda.
                </p>
                <p className="mt-1 text-[12px] text-hiro-muted/60">
                  Inicie a primeira consulta com este paciente.
                </p>
              </div>
            ) : (
              dbConsultations.map((consultation) => {
                const date = new Date(consultation.started_at);
                const day = `${date.getDate()}`.padStart(2, "0");
                const monthYear = date.toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "2-digit",
                });
                return (
                  <div
                    key={consultation.id}
                    className="flex gap-4 border-b border-black/[0.06] py-4 last:border-0"
                  >
                    <div className="w-16 flex-shrink-0 text-center">
                      <p className="font-serif text-[15px] font-normal text-hiro-text">{day}</p>
                      <p className="text-[11px] text-hiro-muted">{monthYear}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-medium text-hiro-text">
                          {consultation.chief_complaint || "Atendimento clínico"}
                        </p>
                        <BadgeStatus
                          label={consultation.status === "completed" ? "Concluída" : consultation.status === "in_progress" ? "Em andamento" : "Cancelada"}
                          status={consultation.status === "completed" ? "ready" : consultation.status === "in_progress" ? "pending" : "danger"}
                        />
                      </div>
                      {consultation.plano && (
                        <p className="mt-1 line-clamp-2 text-[12px] text-hiro-muted">
                          {consultation.plano}
                        </p>
                      )}
                      <Link
                        href={`/consulta/${consultation.id}/resumo?patient=${patientId}`}
                        className="link-arrow mt-1.5 text-[12px] font-medium text-hiro-green underline-offset-2 hover:underline"
                      >
                        <span>Ver prontuário completo</span>
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardHiro>
        )}

        {activeTab === "Evolução" && (
          <div className="space-y-6">
            {/* Tracked metrics from exam analysis */}
            {(patient.trackedMetrics ?? []).length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <OverlineLabel>MÉTRICAS EM ACOMPANHAMENTO</OverlineLabel>
                  <span className="text-[11px] text-hiro-muted">
                    {patient.trackedMetrics!.length} {patient.trackedMetrics!.length === 1 ? "métrica" : "métricas"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {patient.trackedMetrics!.map((metric) => (
                    <MetricEvolutionChart
                      key={metric.name}
                      metric={metric}
                      onRemove={() => {
                        const updated = (patient.trackedMetrics ?? []).filter(
                          (m) => m.name !== metric.name,
                        );
                        updatePatient(patient.id, { trackedMetrics: updated });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legacy vitals charts */}
            {filteredData.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <OverlineLabel>SINAIS VITAIS DAS CONSULTAS</OverlineLabel>
                  <div className="flex gap-1.5">
                    {(["3m", "6m", "1a", "Tudo"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          period === p
                            ? "bg-hiro-active text-white"
                            : "glass-card text-hiro-muted hover:opacity-90"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <CardHiro className="rounded-2xl p-5">
                    <p className="text-[13px] font-medium text-hiro-text">Pressão Arterial</p>
                    {filteredData.filter((d) => d.systolic).length < 2 ? (
                      <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                        Dados após 2 consultas com esta métrica.
                      </p>
                    ) : (
                      <div className="mt-3 h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, fontSize: 12 }} />
                            <ReferenceLine y={140} stroke="#D94F4F" strokeDasharray="4 4" strokeWidth={1} />
                            <ReferenceLine y={90} stroke="#185FA5" strokeDasharray="4 4" strokeWidth={1} />
                            <Line dataKey="systolic" stroke="#D94F4F" strokeWidth={2} dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }} name="Sistólica" />
                            <Line dataKey="diastolic" stroke="#185FA5" strokeWidth={2} dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }} name="Diastólica" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardHiro>

                  <CardHiro className="rounded-2xl p-5">
                    <p className="text-[13px] font-medium text-hiro-text">Peso</p>
                    {filteredData.filter((d) => d.weight).length < 2 ? (
                      <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                        Dados após 2 consultas com esta métrica.
                      </p>
                    ) : (
                      <div className="mt-3 h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, fontSize: 12 }} />
                            <Line dataKey="weight" stroke="#2D5C3F" strokeWidth={2} dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }} name="Peso" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardHiro>

                  <CardHiro className="rounded-2xl p-5">
                    <p className="text-[13px] font-medium text-hiro-text">Glicemia</p>
                    {filteredData.filter((d) => d.glucose).length < 2 ? (
                      <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                        Dados após 2 consultas com esta métrica.
                      </p>
                    ) : (
                      <div className="mt-3 h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#6B7A6D" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, fontSize: 12 }} />
                            <ReferenceLine y={100} stroke="#C68B2F" strokeDasharray="4 4" strokeWidth={1} />
                            <Line dataKey="glucose" stroke="#C68B2F" strokeWidth={2} dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }} name="Glicemia" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardHiro>
                </div>
              </div>
            )}

            {/* Manual add */}
            <AddMetricManually
              currentMetrics={patient.trackedMetrics ?? []}
              onSave={(name, value, unit) => {
                const current: TrackedMetric[] = patient.trackedMetrics ?? [];
                const today = new Date().toISOString().slice(0, 10);
                const existingIdx = current.findIndex((m) => m.name === name);
                let updated: TrackedMetric[];
                if (existingIdx >= 0) {
                  updated = current.map((m, i) =>
                    i === existingIdx
                      ? { ...m, history: [...m.history, { value, date: today }] }
                      : m,
                  );
                } else {
                  updated = [
                    ...current,
                    { name, unit, history: [{ value, date: today }] },
                  ];
                }
                updatePatient(patient.id, { trackedMetrics: updated });
              }}
            />

            {/* Empty state */}
            {(patient.trackedMetrics ?? []).length === 0 && filteredData.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[13px] text-hiro-muted">
                  Nenhuma métrica em acompanhamento.
                </p>
                <p className="mt-1 text-[12px] text-hiro-muted/60">
                  Faça upload de exames na aba Exames e selecione valores, ou adicione manualmente acima.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Exames" && <ExamesTab patientId={patientId} />}

      </section>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}

      <CIDSearchModal
        isOpen={cidModalOpen}
        onClose={() => setCidModalOpen(false)}
        existingCodes={patient.cids.map((c) => c.code)}
        onAdd={(code, name) => {
          if (patient.cids.some((c) => c.code === code)) return;
          const updated = [
            ...patient.cids,
            { code, name, firstSeen: new Date().toISOString().slice(0, 10), lastSeen: new Date().toISOString().slice(0, 10) },
          ];
          updatePatient(patient.id, { cids: updated });
        }}
      />

      {medModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-normal text-hiro-text">
                Adicionar Medicamento
              </h3>
              <button
                type="button"
                onClick={() => { setMedModalOpen(false); setNewMed({ name: "", dose: "", status: "active" }); }}
                className="rounded-full p-1.5 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do medicamento"
                value={newMed.name}
                onChange={(e) => setNewMed((p) => ({ ...p, name: e.target.value }))}
                className="glass-card-input w-full rounded-xl px-3 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30"
              />
              <input
                type="text"
                placeholder="Dosagem e posologia (ex: 500mg 2x ao dia)"
                value={newMed.dose}
                onChange={(e) => setNewMed((p) => ({ ...p, dose: e.target.value }))}
                className="glass-card-input w-full rounded-xl px-3 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <ButtonHiro
                onClick={() => {
                  if (!newMed.name.trim()) return;
                  const updated = [
                    ...patient.medications,
                    { name: newMed.name.trim(), dose: newMed.dose.trim(), status: "active" as const },
                  ];
                  updatePatient(patient.id, { medications: updated });
                  setNewMed({ name: "", dose: "", status: "active" });
                  setMedModalOpen(false);
                }}
                className="flex-1"
                disabled={!newMed.name.trim()}
              >
                Adicionar
              </ButtonHiro>
              <ButtonHiro
                variant="secondary"
                onClick={() => { setMedModalOpen(false); setNewMed({ name: "", dose: "", status: "active" }); }}
                className="px-6"
              >
                Cancelar
              </ButtonHiro>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
