import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPGRAM_API_KEY not set", valid: false }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ valid: false, status: res.status, error: text });
    }

    return NextResponse.json({ valid: true, keyLength: apiKey.length });
  } catch (err) {
    return NextResponse.json({ valid: false, error: err instanceof Error ? err.message : "unknown" }, { status: 500 });
  }
}
