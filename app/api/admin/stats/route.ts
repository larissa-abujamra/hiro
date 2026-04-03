import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAILS = ["lariafoliveira@gmail.com", "brunoqgiangrande@gmail.com"];

export async function GET() {
  const cookieStore = await cookies();

  // Anon client for auth
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(c) {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // Service role for data queries
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll() {} },
    }
  );

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, especialidade, crm, uf, sexo, created_at, updated_at")
    .order("updated_at", { ascending: false, nullsFirst: false });

  // Fetch auth users for email + last_sign_in
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 500 });
  const authUsers = authData?.users ?? [];

  // Build user map for email/last_sign_in lookup
  const authMap = new Map(authUsers.map((u) => [u.id, u]));

  // Enrich profiles with auth data
  const enrichedProfiles = (profiles ?? []).map((p) => {
    const authUser = authMap.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name ?? authUser?.user_metadata?.full_name ?? "—",
      email: authUser?.email ?? p.email ?? "—",
      especialidade: p.especialidade ?? "—",
      crm: p.crm ?? "—",
      uf: p.uf ?? "—",
      created_at: authUser?.created_at ?? p.created_at,
      last_sign_in: authUser?.last_sign_in_at ?? null,
      updated_at: p.updated_at,
    };
  });

  // Fetch recent consultations
  const { data: consultations } = await supabase
    .from("consultations")
    .select("id, user_id, patient_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // Total consultations count
  const { count: totalConsultations } = await supabase
    .from("consultations")
    .select("id", { count: "exact", head: true });

  // Active today — profiles updated today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const activeToday = authUsers.filter((u) => {
    if (!u.last_sign_in_at) return false;
    return new Date(u.last_sign_in_at) >= todayStart;
  }).length;

  // Enrich consultations with doctor name
  const enrichedConsultations = (consultations ?? []).map((c) => {
    const doctor = enrichedProfiles.find((p) => p.id === c.user_id);
    return {
      id: c.id,
      doctor_name: doctor?.full_name ?? "—",
      patient_name: c.patient_name ?? "—",
      created_at: c.created_at,
    };
  });

  return NextResponse.json({
    stats: {
      totalDoctors: enrichedProfiles.length,
      totalConsultations: totalConsultations ?? 0,
      activeToday,
    },
    profiles: enrichedProfiles,
    recentConsultations: enrichedConsultations,
  });
}
