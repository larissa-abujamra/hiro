import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const meta = user.user_metadata ?? {};
  const fullName = meta.full_name ?? "";
  const specialty = meta.especialidade ?? "Clínica Geral";

  return (
    <OnboardingFlow
      userProfile={{
        id: user.id,
        name: fullName,
        specialty,
      }}
    />
  );
}
