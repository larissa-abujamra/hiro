import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Anon client to get user identity
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Service role to clear tokens
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      calendar_connected: false,
      calendar_access_token: null,
      calendar_refresh_token: null,
      calendar_token_expires_at: null,
      calendar_provider: null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Calendar disconnect error:", error);
    return NextResponse.json(
      { error: "Erro ao desconectar calendário" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
