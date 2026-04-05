import type { Patient } from "@/lib/types";

/**
 * Save a patient (and all their consultations) to Supabase.
 * Called after any mutation to patient data.
 */
export async function persistPatient(patient: Patient): Promise<void> {
  try {
    await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient }),
    });
  } catch (err) {
    console.error("Failed to persist patient:", err);
  }
}

/**
 * Load all patients for the current user from Supabase.
 */
export async function loadPatients(): Promise<Patient[]> {
  try {
    const res = await fetch("/api/patients");
    if (!res.ok) return [];
    const data = await res.json();
    return data.patients ?? [];
  } catch (err) {
    console.error("Failed to load patients:", err);
    return [];
  }
}
