"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConsultationStore, DEMO_EMAIL } from "@/lib/store";
import { useDoctorStore } from "@/lib/doctorStore";
import { loadPatients } from "@/lib/persistence";
import type { User } from "@supabase/supabase-js";

function syncDoctorProfile(user: User | null) {
  const store = useDoctorStore.getState();

  if (!user) {
    // Logout — reset to empty
    store.setProfile({
      nome: "",
      sobrenome: "",
      cpf: "",
      crm: "",
      uf: "",
      data_nascimento: "",
      sexo: "F",
      email: "",
      especialidade: "",
      clinica: "",
    });
    store.setSelectedSpecialtyFields([]);
    return;
  }

  const meta = user.user_metadata ?? {};

  // Only overwrite if the profile is empty or belongs to a different user
  // (detect by checking if email matches)
  const currentEmail = store.profile.email;
  const userEmail = user.email ?? "";

  if (currentEmail && currentEmail === userEmail) {
    // Same user — keep existing localStorage profile (user may have edited it)
    return;
  }

  // Different user or first load — populate from user_metadata
  const fullName: string = meta.full_name ?? "";
  const nameParts = fullName.trim().split(" ");
  const nome = nameParts[0] ?? "";
  const sobrenome = nameParts.slice(1).join(" ") ?? "";

  store.setProfile({
    nome,
    sobrenome,
    email: userEmail,
    sexo: meta.sexo === "M" ? "M" : "F",
    crm: meta.crm ?? "",
    uf: meta.uf ?? "",
    especialidade: meta.especialidade ?? "",
    // Don't overwrite cpf/data_nascimento/clinica — they're only set via the profile page
  });
}

export function StoreInitializer() {
  const initializedForUser = useConsultationStore((s) => s.initializedForUser);
  const initializePatients = useConsultationStore((s) => s.initializePatients);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function initForUser(user: User | null) {
      const userId = user?.id ?? null;
      const email = user?.email ?? null;

      // Sync doctor profile on every auth change
      syncDoctorProfile(user);

      if (!userId) {
        lastUserIdRef.current = null;
        return;
      }

      // Skip if already initialized for this user
      if (initializedForUser === userId && lastUserIdRef.current === userId) return;
      lastUserIdRef.current = userId;

      if (email === DEMO_EMAIL) {
        initializePatients(true, userId);
        return;
      }

      const patients = await loadPatients();
      if (patients.length > 0) {
        useConsultationStore.setState({
          patients,
          initialized: true,
          initializedForUser: userId,
        });
      } else {
        initializePatients(false, userId);
      }
    }

    // Initialize on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      initForUser(user);
    });

    // Re-initialize when user signs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initForUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [initializedForUser, initializePatients]);

  return null;
}
