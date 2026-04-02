import type { Patient } from "@/lib/types";
import { formatDateBR } from "@/lib/formatDate";

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId?: string | null;
  onSelectPatient?: (patientId: string) => void;
}

export function PatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientSelectorProps) {
  return (
    <div className="space-y-2">
      {patients.map((patient) => (
        <button
          key={patient.id}
          type="button"
          onClick={() => onSelectPatient?.(patient.id)}
          className={`w-full rounded-xl px-4 py-3 text-left text-sm ${
            selectedPatientId === patient.id
              ? "border border-hiro-green bg-hiro-badge-bg"
              : "glass-card"
          }`}
        >
          <p className="font-medium text-hiro-text">{patient.name}</p>
          <p className="text-xs text-hiro-muted">{formatDateBR(patient.dateOfBirth)}</p>
        </button>
      ))}
    </div>
  );
}
