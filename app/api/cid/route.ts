import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) return JSON.parse(fence[1].trim());
  const brace = trimmed.match(/\{[\s\S]*\}/);
  if (brace) return JSON.parse(brace[0]);
  return {};
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ diagnosticos: [] }, { status: 503 });
  }

  let transcription: string;
  let patientContext: string | undefined;
  try {
    const body = await req.json();
    transcription = typeof body.transcription === "string" ? body.transcription : "";
    patientContext = typeof body.patientContext === "string" ? body.patientContext : undefined;
  } catch {
    return NextResponse.json({ diagnosticos: [] }, { status: 400 });
  }

  const wordCount = transcription.trim().split(/\s+/).filter(Boolean).length;
  if (!transcription || wordCount < 20) {
    return NextResponse.json({ diagnosticos: [] });
  }

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_CID_MODEL ?? "claude-haiku-4-5",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em codificação CID-10 para o sistema de saúde brasileiro.

Analise a transcrição e identifique os diagnósticos mencionados. Para cada diagnóstico, forneça termos de busca que ajudem o médico a encontrar o CID correto na base de dados.

NÃO invente códigos CID específicos. Sugira termos de busca e categorias.

Contexto do paciente:
${patientContext ?? "Não disponível"}

Transcrição:
${JSON.stringify(transcription)}

IMPORTANTE: Responda APENAS com JSON puro, sem markdown.

Formato:
{
  "diagnosticos": [
    {
      "texto": "descrição do diagnóstico identificado",
      "termos_busca": ["termo1", "termo2", "código parcial como M54"],
      "categoria": "categoria geral (ex: Dor articular - membro inferior)",
      "sourceQuote": "trecho da transcrição que embasou"
    }
  ]
}

Regras:
- Máximo 4 diagnósticos
- termos_busca: 3-5 termos relevantes (podem incluir prefixos de CID como I10, M54)
- Se não houver diagnóstico claro: { "diagnosticos": [] }`,
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const parsed = parseJson(text);
    const diagnosticos = Array.isArray(parsed.diagnosticos) ? parsed.diagnosticos : [];

    return NextResponse.json({ diagnosticos });
  } catch {
    return NextResponse.json({ diagnosticos: [] });
  }
}
