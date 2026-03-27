import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseModelJson(text: string): { items?: unknown[] } {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonStr) as { items?: unknown[] };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { items: [], error: "ANTHROPIC_API_KEY não configurada" },
      { status: 503 },
    );
  }

  let transcript: string;
  let previousLines: string;
  try {
    const body = await req.json();
    transcript = typeof body.transcript === "string" ? body.transcript : "";
    previousLines =
      typeof body.previousLines === "string" ? body.previousLines : "";
  } catch {
    return NextResponse.json({ items: [] }, { status: 400 });
  }

  if (!transcript || transcript.trim().split(/\s+/).length < 5) {
    return NextResponse.json({ items: [] });
  }

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_DETECT_MODEL ?? "claude-haiku-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Você é um assistente médico analisando uma transcrição de consulta em português brasileiro.

Analise o trecho abaixo e extraia APENAS itens claramente mencionados.
Responda SOMENTE com JSON válido, sem texto antes ou depois.

Trecho novo:
${JSON.stringify(transcript)}

Contexto anterior:
${JSON.stringify(previousLines)}

Formato de resposta:
{
  "items": [
    {
      "type": "prescription" | "exam" | "return" | "certificate" | "referral",
      "text": "descrição curta",
      "sourceQuote": "trecho exato da fala",
      "details": {}
    }
  ]
}

Detalhes por tipo:
- prescription: { "drug": "nome", "dose": "dose", "frequency": "frequência", "duration": "duração" }
- exam: { "exams": ["exame1", "exame2"] }
- return: { "period": "ex: 30 dias" }
- certificate: { "period": "dias de afastamento" }
- referral: { "specialty": "especialidade", "urgency": "rotina|urgente" }

Exemplos:
"vou receitar amoxicilina 500mg de 8 em 8 horas por 7 dias" → prescription
"peço hemograma completo e glicemia em jejum" → exam
"volte daqui 30 dias" → return
"vou dar um atestado de 2 dias" → certificate
"encaminhar para cardiologista" → referral

Se não houver nada relevante: { "items": [] }`,
        },
      ],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const parsed = parseModelJson(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ items: [] });
  }
}
