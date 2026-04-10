import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getClients() {
  const cookieStore = await cookies();
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );
  return { auth, admin };
}

// GET — list all patients for the current user
export async function GET() {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  console.log("[api/patients GET] user:", user.id, user.email);

  const { data, error } = await admin
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  console.log("[api/patients GET] result:", { count: data?.length ?? 0, error });

  if (error) {
    console.error("Patients fetch error:", error);
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 });
  }

  // Transform DB rows back to the app's Patient shape
  const patients = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth ?? "",
    sex: row.sex ?? "Other",
    height: row.height ?? undefined,
    weight: row.weight ?? undefined,
    phone: row.phone ?? undefined,
    conditions: row.conditions ?? [],
    medications: row.medications ?? [],
    cids: row.cids ?? [],
    consultations: row.consultations ?? [],
    exams: row.exams ?? [],
    metrics: row.metrics ?? [],
    trackedMetrics: row.tracked_metrics ?? [],
  }));

  return NextResponse.json({ patients });
}

// POST — create or update a patient
export async function POST(request: Request) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const patient = body.patient;
  if (!patient?.id || !patient?.name) {
    return NextResponse.json({ error: "Dados do paciente incompletos" }, { status: 400 });
  }

  const row = {
    id: patient.id,
    user_id: user.id,
    name: patient.name,
    date_of_birth: patient.dateOfBirth || null,
    sex: patient.sex || "Other",
    height: patient.height || null,
    weight: patient.weight || null,
    phone: patient.phone || null,
    conditions: patient.conditions || [],
    medications: patient.medications || [],
    cids: patient.cids || [],
    consultations: patient.consultations || [],
    exams: patient.exams || [],
    metrics: patient.metrics || [],
    tracked_metrics: patient.trackedMetrics || [],
  };

  console.log("[api/patients POST] upserting patient:", row.id, row.name, {
    user_id: row.user_id,
    height: row.height,
    weight: row.weight,
    consultations_count: Array.isArray(row.consultations) ? row.consultations.length : 0,
  });

  const { data: upsertData, error } = await admin
    .from("patients")
    .upsert(row, { onConflict: "id" })
    .select();

  console.log("[api/patients POST] result:", { data: upsertData?.length ?? 0, error });

  if (error) {
    console.error("Patient upsert error:", error);
    return NextResponse.json({ error: `Erro ao salvar paciente: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
