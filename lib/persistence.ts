import type { Patient } from "@/lib/types";

/**
 * Save a patient (and all their consultations) to Supabase.
 * Called after any mutation to patient data.
 */
export async function persistPatient(patient: Patient): Promise<void> {
  try {
    console.log("[persistence] Saving patient:", patient.id, patient.name, {
      consultations: patient.consultations.length,
      height: patient.height,
      weight: patient.weight,
    });

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch {}
      console.error("[persistence] Save FAILED:", res.status, data, text);
    } else {
      console.log("[persistence] Save OK for", patient.id);
    }
  } catch (err) {
    console.error("[persistence] Save ERROR:", err);
  }
}

/**
 * Load all patients for the current user from Supabase.
 */
export async function loadPatients(): Promise<Patient[]> {
  try {
    console.log("[persistence] Loading patients from Supabase...");
    const res = await fetch("/api/patients");

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[persistence] Load FAILED:", res.status, data);
      return [];
    }

    const data = await res.json();
    const patients = data.patients ?? [];
    console.log("[persistence] Loaded", patients.length, "patients:", patients.map((p: Patient) => p.name));
    return patients;
  } catch (err) {
    console.error("[persistence] Load ERROR:", err);
    return [];
  }
}
