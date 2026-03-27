import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseProntuarioJson(text: string): {
  soap?: { s?: string; o?: string; a?: string; p?: string };
  summary?: string;
  flags?: unknown;
} {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonStr) as {
    soap?: { s?: string; o?: string; a?: string; p?: string };
    summary?: string;
    flags?: unknown;
  };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      soap: { s: "", o: "", a: "", p: "" },
      summary: "",
      flags: [],
      error: "ANTHROPIC_API_KEY não configurada",
    });
  }

  let transcription: string;
  let patientContext: string | undefined;
  let confirmedCids: unknown;
  let detectedItems: unknown;
  try {
    const body = await req.json();
    transcription = typeof body.transcription === "string" ? body.transcription : "";
    patientContext =
      typeof body.patientContext === "string" ? body.patientContext : undefined;
    confirmedCids = body.confirmedCids;
    detectedItems = body.detectedItems;
  } catch {
    return NextResponse.json({
      soap: { s: "", o: "", a: "", p: "" },
      summary: "",
      flags: [],
    });
  }

  if (!transcription || transcription.trim().length < 20) {
    return NextResponse.json({
      soap: { s: "", o: "", a: "", p: "" },
      summary: "",
      flags: [],
    });
  }

  const cidLines = Array.isArray(confirmedCids)
    ? confirmedCids
        .map((c: { code?: string; name?: string }) =>
          c?.code && c?.name ? `${c.code} — ${c.name}` : null,
        )
        .filter(Boolean)
        .join("\n")
    : "";

  const itemLines = Array.isArray(detectedItems)
    ? detectedItems
        .map(
          (i: { type?: string; text?: string }) =>
            i?.type && i?.text ? `[${i.type}] ${i.text}` : null,
        )
        .filter(Boolean)
        .join("\n")
    : "";

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_PRONTUARIO_MODEL ?? "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Você é um assistente de documentação médica especializado no sistema de saúde brasileiro.

Gere um prontuário médico estruturado no formato SOAP com base na transcrição abaixo.

REGRAS DE ESTILO:
- Linguagem técnica médica em português brasileiro
- Conciso e objetivo, sem repetições
- Terceira pessoa: "Paciente refere...", "Ao exame..."
- Incluir APENAS informações que aparecem na transcrição
- NÃO inventar dados não mencionados

CONTEXTO DO PACIENTE:
${patientContext ?? "Não disponível"}

CIDs CONFIRMADOS:
${cidLines || "Nenhum confirmado ainda"}

ITENS DETECTADOS NA CONSULTA:
${itemLines || "Nenhum"}

TRANSCRIÇÃO COMPLETA:
${JSON.stringify(transcription)}

Responda SOMENTE com JSON válido neste formato:
{
  "soap": {
    "s": "Subjetivo: queixas, história da doença, sintomas relatados, medicamentos em uso, alergias",
    "o": "Objetivo: exame físico, sinais vitais, achados ao exame — apenas o mencionado em voz alta",
    "a": "Avaliação: hipóteses diagnósticas, diagnóstico principal",
    "p": "Plano: condutas, medicamentos com posologia, exames solicitados, orientações, retorno"
  },
  "summary": "resumo de 1-2 frases em linguagem acessível para o paciente",
  "flags": ["alertas clínicos relevantes, se houver"]
}`,
        },
      ],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const parsed = parseProntuarioJson(text);

    const soap = parsed.soap ?? {};
    return NextResponse.json({
      soap: {
        s: typeof soap.s === "string" ? soap.s : "",
        o: typeof soap.o === "string" ? soap.o : "",
        a: typeof soap.a === "string" ? soap.a : "",
        p: typeof soap.p === "string" ? soap.p : "",
      },
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      flags: Array.isArray(parsed.flags)
        ? parsed.flags.filter((f): f is string => typeof f === "string")
        : [],
    });
  } catch {
    return NextResponse.json({
      soap: { s: "", o: "", a: "", p: "" },
      summary: "",
      flags: [],
    });
  }
}
