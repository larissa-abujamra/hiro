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

// GET — list all appointments (optional date range via query params)
export async function GET(request: Request) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = admin
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .order("datetime", { ascending: true });

  if (from) query = query.gte("datetime", from);
  if (to) query = query.lte("datetime", to);

  const { data, error } = await query;

  if (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 });
  }

  return NextResponse.json({ appointments: data ?? [] });
}

// POST — create appointment
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

  if (!body.patient_name?.trim() || !body.datetime) {
    return NextResponse.json({ error: "Nome e horário são obrigatórios" }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    patient_name: body.patient_name.trim(),
    patient_phone: body.patient_phone || null,
    patient_cpf: body.patient_cpf || null,
    patient_dob: body.patient_dob || null,
    patient_sex: body.patient_sex || null,
    patient_id: body.patient_id || null,
    datetime: body.datetime,
    duration_minutes: body.duration_minutes || 30,
    type: body.type || "first_visit",
    insurance: body.insurance || null,
    status: body.status || "scheduled",
    notes: body.notes || null,
  };

  console.log("[api/appointments POST] Inserting:", JSON.stringify(row));

  const { data, error } = await admin
    .from("appointments")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("[api/appointments POST] Error:", JSON.stringify(error));
    return NextResponse.json({ error: `Erro ao criar agendamento: ${error.message}`, details: error }, { status: 500 });
  }

  console.log("[api/appointments POST] Success:", data?.id);
  return NextResponse.json({ appointment: data });
}

// DELETE — remove appointment
export async function DELETE(request: Request) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const { error } = await admin.from("appointments").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });

  return NextResponse.json({ success: true });
}
