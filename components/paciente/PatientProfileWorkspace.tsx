"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Upload,
} from "lucide-react";
import {
  CartesianGrid,
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
import type { Exam } from "@/lib/types";

interface PatientProfileWorkspaceProps {
  patientId: string;
}

export function PatientProfileWorkspace({ patientId }: PatientProfileWorkspaceProps) {
  const patients = useConsultationStore((state) => state.patients);
  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const [activeTab, setActiveTab] = useState<"Histórico" | "Evolução" | "Exames">(
    "Histórico",
  );
  const [period, setPeriod] = useState<"3m" | "6m" | "1a" | "Tudo">("Tudo");
  const [exams, setExams] = useState<Exam[]>(patient?.exams ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredData = useMemo(() => {
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
  }, [patient.metrics, period]);

  const activeMedications = patient.medications.filter((med) => med.status === "active");
  const hasInteraction = (medName: string) =>
    activeMedications.some(
      (med) =>
        med.name !== medName &&
        ((med.name.includes("Sinvastatina") && medName.includes("Anlodipino")) ||
          (medName.includes("Sinvastatina") && med.name.includes("Anlodipino"))),
    );

  const examTypeLabels: Record<Exam["type"], string> = {
    lab: "Laboratorial",
    imaging: "Imagem",
    report: "Laudo",
    other: "Outro",
  };

  const appendFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const uploaded: Exam[] = list.map((file, index) => {
      const type: Exam["type"] = file.type.includes("image")
        ? "imaging"
        : "report";
      return {
        id: `uploaded-${Date.now()}-${index}`,
        fileName: file.name,
        date: new Date().toISOString().slice(0, 10),
        type,
      };
    });
    setExams((prev) => [...uploaded, ...prev]);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    appendFiles(e.dataTransfer.files);
  };

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

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/50 p-3 text-center">
              <p className="mb-1 text-[11px] text-hiro-muted">Altura</p>
              <p className="text-[15px] font-medium text-hiro-text">{patient.height} cm</p>
            </div>
            <div className="rounded-xl bg-white/50 p-3 text-center">
              <p className="mb-1 text-[11px] text-hiro-muted">Peso</p>
              <p className="text-[15px] font-medium text-hiro-text">{patient.weight} kg</p>
            </div>
            <div className="rounded-xl bg-white/50 p-3 text-center">
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
            <Link href={`/consulta/nova?patientId=${patient.id}`} className="w-full">
              <ButtonHiro className="w-full">Nova consulta</ButtonHiro>
            </Link>
            <ButtonHiro variant="secondary" className="w-full">
              Editar dados
            </ButtonHiro>
          </div>

          <div>
            <OverlineLabel>MEDICAMENTOS ATIVOS</OverlineLabel>
            <div className="mt-2 flex flex-col gap-2">
              {activeMedications.map((med) => (
                <div key={med.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-hiro-text">{med.name}</p>
                    <p className="text-[11px] text-hiro-muted">{med.dose}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <BadgeStatus status="ready" label="Ativo" />
                    {hasInteraction(med.name) && (
                      <AlertTriangle className="h-3.5 w-3.5 text-hiro-amber" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <OverlineLabel>CIDS REGISTRADOS</OverlineLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {patient.cids.map((cid) => (
                <span
                  key={cid.code}
                  className="rounded-full border border-black/[0.08] bg-white/50 px-2.5 py-1 text-[11px] text-hiro-muted"
                >
                  {cid.code} · {cid.name.split(" ").slice(0, 2).join(" ")}
                </span>
              ))}
            </div>
          </div>
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
            {patient.consultations.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[13px] text-hiro-muted">
                  Nenhuma consulta registrada ainda.
                </p>
                <p className="mt-1 text-[12px] text-hiro-muted/60">
                  Inicie a primeira consulta com este paciente.
                </p>
              </div>
            ) : (
              [...patient.consultations]
                .reverse()
                .map((consultation) => {
                  const date = new Date(consultation.date);
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
                            {consultation.reason}
                          </p>
                          <span className="rounded-md bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-medium text-[#185FA5]">
                            {consultation.confirmedCids[0]?.code}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] text-hiro-muted">
                          {consultation.soap.p}
                        </p>
                        <button className="mt-1.5 text-[12px] text-hiro-green underline-offset-2 hover:underline">
                          Ver prontuário completo →
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </CardHiro>
        )}

        {activeTab === "Evolução" && (
          <div>
            <div className="mb-5 flex gap-2">
              {(["3m", "6m", "1a", "Tudo"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    period === p
                      ? "bg-hiro-active text-white"
                      : "bg-hiro-card text-hiro-muted hover:bg-[#DDD9D1]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <CardHiro className="mb-4 rounded-2xl p-5">
              <OverlineLabel>PRESSÃO ARTERIAL</OverlineLabel>
              {filteredData.length < 2 ? (
                <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                  Dados aparecerão após 2 consultas com esta métrica registrada.
                </p>
              ) : (
                <div className="mt-4 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#E8E4DC",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                      />
                      <ReferenceLine y={140} stroke="#D94F4F" strokeDasharray="4 4" strokeWidth={1} />
                      <ReferenceLine y={90} stroke="#185FA5" strokeDasharray="4 4" strokeWidth={1} />
                      <Line dataKey="systolic" stroke="#D94F4F" strokeWidth={2} dot={{ r: 3 }} name="Sistólica" />
                      <Line dataKey="diastolic" stroke="#185FA5" strokeWidth={2} dot={{ r: 3 }} name="Diastólica" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardHiro>

            <CardHiro className="mb-4 rounded-2xl p-5">
              <OverlineLabel>PESO</OverlineLabel>
              {filteredData.length < 2 ? (
                <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                  Dados aparecerão após 2 consultas com esta métrica registrada.
                </p>
              ) : (
                <div className="mt-4 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#E8E4DC",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                      />
                      <Line dataKey="weight" stroke="#2D5C3F" strokeWidth={2} dot={{ r: 3 }} name="Peso" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardHiro>

            <CardHiro className="rounded-2xl p-5">
              <OverlineLabel>GLICEMIA</OverlineLabel>
              {filteredData.length < 2 ? (
                <p className="mt-3 text-[13px] italic text-hiro-muted/60">
                  Dados aparecerão após 2 consultas com esta métrica registrada.
                </p>
              ) : (
                <div className="mt-4 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7A6D" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#E8E4DC",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                      />
                      <ReferenceLine y={100} stroke="#C68B2F" strokeDasharray="4 4" strokeWidth={1} />
                      <Line dataKey="glucose" stroke="#C68B2F" strokeWidth={2} dot={{ r: 3 }} name="Glicemia" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardHiro>
          </div>
        )}

        {activeTab === "Exames" && (
          <CardHiro className="rounded-2xl p-5">
            <div
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-black/15 p-8 transition-colors hover:border-hiro-green/40 hover:bg-black/[0.02]"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-hiro-muted/50" />
              <p className="text-[13px] text-hiro-muted">
                Arraste arquivos ou clique para selecionar
              </p>
              <p className="text-[11px] text-hiro-muted/60">PDF · JPG · PNG</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => appendFiles(e.target.files)}
              />
            </div>

            {exams.length === 0 ? (
              <p className="mt-4 text-[13px] italic text-hiro-muted/60">
                Nenhum exame enviado. Faça upload de laudos, imagens e resultados.
              </p>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className="mt-3 flex items-center gap-3 rounded-xl border border-black/[0.06] bg-hiro-card p-4"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                      exam.type === "lab" ? "bg-[#E1F5EE]" : "bg-[#E6F1FB]"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-hiro-text">
                      {exam.fileName}
                    </p>
                    <p className="text-[11px] text-hiro-muted">
                      {exam.date} · {examTypeLabels[exam.type]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[12px] text-hiro-green hover:underline">Ver</button>
                    <button
                      className="text-[12px] text-hiro-muted hover:text-hiro-red"
                      onClick={() =>
                        setExams((prev) => prev.filter((item) => item.id !== exam.id))
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardHiro>
        )}
      </section>
    </div>
  );
}
