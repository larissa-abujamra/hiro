"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConsultationStore, DEMO_EMAIL } from "@/lib/store";

export function StoreInitializer() {
  const initializedForUser = useConsultationStore((s) => s.initializedForUser);
  const initializePatients = useConsultationStore((s) => s.initializePatients);

  useEffect(() => {
    const supabase = createClient();

    function initForUser(userId: string | null, email: string | null) {
      if (!userId) return;
      if (initializedForUser === userId) return;
      initializePatients(email === DEMO_EMAIL, userId);
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
