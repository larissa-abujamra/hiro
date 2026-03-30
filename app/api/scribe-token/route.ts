import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY não configurada" },
      { status: 500 },
    );
  }

  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const result = await client.tokens.singleUse.create("realtime_scribe");

    return NextResponse.json({ token: result.token });
  } catch (err) {
    console.error("Scribe token error:", err);
    return NextResponse.json(
      { error: "Falha ao gerar token de transcrição" },
      { status: 500 },
    );
  }
}
