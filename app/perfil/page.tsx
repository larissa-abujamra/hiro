import { DoctorProfileWorkspace } from "@/components/layout/DoctorProfileWorkspace";
import { ProfilePreferences } from "@/components/settings/ProfilePreferences";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 space-y-8">
      <DoctorProfileWorkspace />

      {user && <ProfilePreferences userId={user.id} />}
    </div>
  );
}
