import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { getOAuth2Client } from "@/lib/google-auth";

export async function GET() {
  // Use service role to read tokens from profiles
  const cookieStore = await cookies();
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

  // Service role client to bypass RLS for token access
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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(
      "calendar_connected, calendar_access_token, calendar_refresh_token, calendar_token_expires_at"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.calendar_connected) {
    return NextResponse.json(
      { error: "Calendário não conectado" },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: profile.calendar_access_token,
      refresh_token: profile.calendar_refresh_token,
    });

    // Refresh token if expired
    const expiresAt = profile.calendar_token_expires_at
      ? new Date(profile.calendar_token_expires_at).getTime()
      : 0;

    if (Date.now() >= expiresAt - 60_000) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Update tokens in DB
      await supabaseAdmin
        .from("profiles")
        .update({
          calendar_access_token: credentials.access_token,
          calendar_token_expires_at: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
        })
        .eq("id", user.id);
    }

    // Fetch events for the next 7 days
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: eventsData } = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const appointments = (eventsData.items ?? []).map((event) => ({
      id: event.id ?? "",
      title: event.summary ?? "Sem título",
      startTime: event.start?.dateTime ?? event.start?.date ?? "",
      endTime: event.end?.dateTime ?? event.end?.date ?? "",
      date: event.start?.dateTime ?? event.start?.date ?? "",
      description: event.description ?? undefined,
      location: event.location ?? undefined,
    }));

    return NextResponse.json({ appointments });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    // Token revoked or invalid
    if (message.includes("invalid_grant") || message.includes("Token has been")) {
      await supabaseAdmin
        .from("profiles")
        .update({
          calendar_connected: false,
          calendar_access_token: null,
          calendar_refresh_token: null,
          calendar_token_expires_at: null,
          calendar_provider: null,
        })
        .eq("id", user.id);

      return NextResponse.json(
        { error: "Acesso ao calendário revogado. Reconecte sua conta." },
        { status: 401 }
      );
    }

    console.error("Calendar fetch error:", err);
    return NextResponse.json(
      { error: "Erro ao buscar eventos do calendário" },
      { status: 500 }
    );
  }
}
