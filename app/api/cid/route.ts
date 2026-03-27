import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseSuggestionsJson(text: string): { suggestions?: unknown[] } {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonStr) as { suggestions?: unknown[] };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { suggestions: [], error: "ANTHROPIC_API_KEY não configurada" },
      { status: 503 },
    );
  }

  let transcription: string;
  let patientContext: string | undefined;
  try {
    const body = await req.json();
    transcription = typeof body.transcription === "string" ? body.transcription : "";
    patientContext =
      typeof body.patientContext === "string" ? body.patientContext : undefined;
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 400 });
  }

  const wordCount = transcription.trim().split(/\s+/).filter(Boolean).length;
  if (!transcription || wordCount < 20) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_CID_MODEL ?? "claude-haiku-4-5",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em codificação CID-10 para o sistema de saúde brasileiro.

Analise a transcrição e sugira os CIDs mais prováveis.
Use APENAS códigos CID-10 em português brasileiro (não ICD-10 em inglês).
Responda SOMENTE com JSON válido, sem texto antes ou depois.

Contexto do paciente:
${patientContext ?? "Não disponível"}

Transcrição até agora:
${JSON.stringify(transcription)}

Formato de resposta:
{
  "suggestions": [
    {
      "code": "I10",
      "name": "Hipertensão essencial",
      "confidence": 94,
      "sourceQuote": "trecho exato da transcrição que embasou esta sugestão",
      "reasoning": "explicação em 1 frase curta"
    }
  ]
}

Regras:
- Máximo 3 sugestões, ordenadas por confiança (maior primeiro)
- Confidence entre 0 e 100
- sourceQuote deve ser trecho real da transcrição fornecida
- Preferir especificidade: G44.2 em vez de G44 quando o contexto permitir
- Se não houver diagnóstico claro ainda: { "suggestions": [] }`,
        },
      ],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const parsed = parseSuggestionsJson(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
