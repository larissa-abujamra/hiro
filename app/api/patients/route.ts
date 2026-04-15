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

// GET — list all patients for the current user (supports ?q= for name search)
export async function GET(request: Request) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  console.log("[api/patients GET] user:", user.id, user.email, "q:", q);

  let query = admin
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q.length >= 2) {
    query = query.ilike("name", `%${q}%`).limit(10);
  }

  const { data, error } = await query;

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
    cpf: row.cpf ?? undefined,
    conditions: row.conditions ?? [],
    medications: row.medications ?? [],
    cids: row.cids ?? [],
    consultations: row.consultations ?? [],
    exams: row.exams ?? [],
    metrics: row.metrics ?? [],
    trackedMetrics: row.tracked_metrics ?? [],
    savedExams: row.saved_exams ?? [],
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

  // ─── Quick-create mode (flat shape) ─────────────────────────────────────
  // Used by the appointment modal when creating a new patient on the fly.
  // Body: { name, phone?, cpf?, date_of_birth?, sex? } — returns the created row.
  if (!body.patient && body.name) {
    const cpfDigits = body.cpf ? String(body.cpf).replace(/\D/g, "") : "";
    const row = {
      id: `patient-${Date.now()}`,
      user_id: user.id,
      name: String(body.name).trim(),
      date_of_birth: body.date_of_birth || null,
      sex: body.sex || "Other",
      phone: body.phone || null,
      cpf: cpfDigits || null,
      conditions: [],
      medications: [],
      cids: [],
      consultations: [],
      exams: [],
      metrics: [],
      tracked_metrics: [],
      saved_exams: [],
    };

    console.log("[api/patients POST quick-create] inserting:", row.id, row.name);

    const { data, error } = await admin
      .from("patients")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("[api/patients POST quick-create] error:", error);
      return NextResponse.json(
        { error: `Erro ao criar paciente: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      phone: data.phone,
      cpf: data.cpf,
      date_of_birth: data.date_of_birth,
      sex: data.sex,
    });
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
    saved_exams: patient.savedExams || [],
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
    console.error("Patient upsert error:", JSON.stringify(error));
    return NextResponse.json({ error: `Erro ao salvar paciente: ${error.message}`, details: error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
