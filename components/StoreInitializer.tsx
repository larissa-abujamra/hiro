"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConsultationStore, DEMO_EMAIL } from "@/lib/store";
import { loadPatients } from "@/lib/persistence";

export function StoreInitializer() {
  const initializedForUser = useConsultationStore((s) => s.initializedForUser);
  const initializePatients = useConsultationStore((s) => s.initializePatients);

  useEffect(() => {
    const supabase = createClient();

    async function initForUser(userId: string | null, email: string | null) {
      if (!userId) return;
      if (initializedForUser === userId) return;

      if (email === DEMO_EMAIL) {
        initializePatients(true, userId);
        return;
      }

      // Load real patients from Supabase
      const patients = await loadPatients();
      if (patients.length > 0) {
        // Use loaded patients instead of empty array
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
      initForUser(user?.id ?? null, user?.email ?? null);
    });

    // Re-initialize when user signs in/out (account switch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      initForUser(user?.id ?? null, user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [initializedForUser, initializePatients]);

  return null;
}
