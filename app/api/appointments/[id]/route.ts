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

// GET — fetch single appointment
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { data, error } = await admin
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("[api/appointments GET]", error);
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ appointment: data });
}

// PUT — update appointment (split update + fetch to avoid PGRST116)
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

  console.log("[api/appointments PUT]", id, body);

  // Step 1: update (no .select().single())
  const { error: updateError } = await admin
    .from("appointments")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[api/appointments PUT] update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Step 2: fetch the updated row
  const { data, error: fetchError } = await admin
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    // Update worked but fetch failed — still success
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ appointment: data });
}

// PATCH — alias for PUT
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  return PUT(request, props);
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
