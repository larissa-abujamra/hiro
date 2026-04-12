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

// PUT — update appointment
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("appointments")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Appointment update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}

// DELETE — delete appointment
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { error } = await admin.from("appointments").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });

  return NextResponse.json({ success: true });
}
