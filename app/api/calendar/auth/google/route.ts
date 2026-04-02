import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google-auth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[calendar/auth/google] user:", user?.id ?? "NULL", user?.email ?? "no email");

  if (!user) {
    console.log("[calendar/auth/google] NOT AUTHENTICATED — returning 401");
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = getAuthUrl(user.id);
  console.log("[calendar/auth/google] Redirecting to Google with state:", user.id);
  return NextResponse.redirect(url);
}
