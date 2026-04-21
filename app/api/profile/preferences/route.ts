import { NextRequest, NextResponse } from "next/server";
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

export async function GET(_request: NextRequest) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("profiles")
    .select("specialty, specialty_fields, writing_preferences, writing_profile")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[profile/preferences GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {});
}

export async function PUT(request: NextRequest) {
  const { auth, admin } = await getClients();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.specialty_fields !== undefined) updateData.specialty_fields = body.specialty_fields;
  if (body.writing_preferences !== undefined) updateData.writing_preferences = body.writing_preferences;

  const { error } = await admin
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("[profile/preferences PUT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
