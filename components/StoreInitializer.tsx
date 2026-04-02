"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConsultationStore, DEMO_EMAIL } from "@/lib/store";

export function StoreInitializer() {
  const initialized = useConsultationStore((s) => s.initialized);
  const initializePatients = useConsultationStore((s) => s.initializePatients);

  useEffect(() => {
    if (initialized) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      initializePatients(user?.email === DEMO_EMAIL);
    });
  }, [initialized, initializePatients]);

  return null;
}
