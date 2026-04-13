import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPGRAM_API_KEY não configurada" }, { status: 500 });
  }

  // Return the API key for client-side WebSocket connection.
  // In production, use Deepgram's temporary key API for better security.
  return NextResponse.json({ apiKey });
}
