import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // FIRST LINE — if this doesn't print, Next.js isn't routing here at all
  console.log("\n\n========== CALENDAR CALLBACK HIT ==========");
  console.log("[calendar/callback] Full URL:", request.url);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  console.log("[calendar/callback] code:", code ? `${code.slice(0, 30)}...` : "NULL");
  console.log("[calendar/callback] state (userId):", state);
  console.log("[calendar/callback] error param:", errorParam);
  console.log("[calendar/callback] all params:", Object.fromEntries(searchParams.entries()));

  if (errorParam || !code || !state) {
    console.log("[calendar/callback] EARLY EXIT — missing code/state or error");
    return NextResponse.redirect(
      `${origin}/dashboard?calendar_error=${encodeURIComponent(errorParam ?? "missing_code")}`
    );
  }

  // Import google-auth lazily to isolate import errors
  let getOAuth2Client: typeof import("@/lib/google-auth").getOAuth2Client;
  try {
    const mod = await import("@/lib/google-auth");
    getOAuth2Client = mod.getOAuth2Client;
    console.log("[calendar/callback] google-auth module loaded OK");
  } catch (importErr) {
    console.error("[calendar/callback] IMPORT ERROR for google-auth:", importErr);
    return NextResponse.redirect(`${origin}/dashboard?calendar_error=import_failed`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  // Verify profile row exists
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, full_name, calendar_connected")
    .eq("id", state)
    .single();

  console.log("[calendar/callback] Profile lookup for id:", state);
  console.log("[calendar/callback] Profile found:", existingProfile);
  console.log("[calendar/callback] Profile lookup error:", selectError);

  if (!existingProfile) {
    console.error("[calendar/callback] NO PROFILE ROW for user id:", state);
    return NextResponse.redirect(`${origin}/dashboard?calendar_error=profile_not_found`);
  }

  try {
    console.log("[calendar/callback] Exchanging code for tokens...");
    console.log("[calendar/callback] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING");
    console.log("[calendar/callback] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING");
    console.log("[calendar/callback] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);

    console.log("[calendar/callback] Token exchange OK:");
    console.log("[calendar/callback]   access_token:", tokens.access_token ? `${tokens.access_token.slice(0, 20)}...` : "NULL");
    console.log("[calendar/callback]   refresh_token:", tokens.refresh_token ? `${tokens.refresh_token.slice(0, 20)}...` : "NULL");
    console.log("[calendar/callback]   expiry_date:", tokens.expiry_date);

    if (!tokens.access_token) {
      console.error("[calendar/callback] No access_token received");
      return NextResponse.redirect(`${origin}/dashboard?calendar_error=no_tokens`);
    }

    const updatePayload = {
      calendar_provider: "google",
      calendar_connected: true,
      calendar_access_token: tokens.access_token,
      calendar_refresh_token: tokens.refresh_token ?? null,
      calendar_token_expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      calendar_connected_at: new Date().toISOString(),
    };

    console.log("[calendar/callback] Updating profile id:", state);

    const { data: updateData, error: updateError, status, statusText } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", state)
      .select();

    console.log("[calendar/callback] UPDATE result:", { status, statusText, data: updateData, error: updateError });

    if (updateError) {
      console.error("[calendar/callback] DB UPDATE FAILED:", updateError);
      return NextResponse.redirect(`${origin}/dashboard?calendar_error=db_save_failed`);
    }

    if (!updateData || updateData.length === 0) {
      console.error("[calendar/callback] UPDATE matched 0 rows!");
      return NextResponse.redirect(`${origin}/dashboard?calendar_error=no_rows_updated`);
    }

    console.log("[calendar/callback] SUCCESS — calendar connected");
    return NextResponse.redirect(`${origin}/dashboard?calendar_connected=true`);
  } catch (err) {
    console.error("[calendar/callback] EXCEPTION:", err);
    return NextResponse.redirect(`${origin}/dashboard?calendar_error=exchange_failed`);
  }
}
