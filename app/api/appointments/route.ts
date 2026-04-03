import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClients() {
  const cookieStore = await cookies();

  const auth = createServerClient(
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

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll() {},
      },
    }
  );

  return { auth, admin };
}

// GET — list appointments for the current user (today + next 7 days)
export async function GET() {
  const { auth, admin } = await getSupabaseClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data, error } = await admin
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .gte("scheduled_time", now.toISOString())
    .lte("scheduled_time", nextWeek.toISOString())
    .order("scheduled_time", { ascending: true });

  if (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json({ error: "Erro ao buscar consultas" }, { status: 500 });
  }

  const appointments = (data ?? []).map((a) => ({
    id: a.id,
    title: a.patient_name,
    startTime: a.scheduled_time,
    endTime: a.scheduled_time,
    date: a.scheduled_time,
    source: a.source,
  }));

  return NextResponse.json({ appointments });
}

// POST — create a manual appointment
export async function POST(request: Request) {
  const { auth, admin } = await getSupabaseClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let patientName: string;
  let scheduledTime: string;
  try {
    const body = await request.json();
    patientName = body.patient_name;
    scheduledTime = body.scheduled_time;
    if (!patientName?.trim() || !scheduledTime) {
      return NextResponse.json({ error: "Nome e horário são obrigatórios" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("appointments")
    .insert({
      user_id: user.id,
      patient_name: patientName.trim(),
      scheduled_time: scheduledTime,
      source: "manual",
    })
    .select()
    .single();

  if (error) {
    console.error("Appointment create error:", error);
    return NextResponse.json({ error: "Erro ao criar consulta" }, { status: 500 });
  }

  return NextResponse.json({
    appointment: {
      id: data.id,
      title: data.patient_name,
      startTime: data.scheduled_time,
      endTime: data.scheduled_time,
      date: data.scheduled_time,
      source: data.source,
    },
  });
}

// DELETE — remove an appointment
export async function DELETE(request: Request) {
  const { auth, admin } = await getSupabaseClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const { error } = await admin
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Appointment delete error:", error);
    return NextResponse.json({ error: "Erro ao remover consulta" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
