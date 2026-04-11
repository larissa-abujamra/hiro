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

interface SpecialtyFieldInput {
  id: string;
  label: string;
  unit?: string;
  section: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      soap: { s: "", o: "", a: "", p: "" },
      summary: "",
      flags: [],
      specialtyFields: {},
      error: "ANTHROPIC_API_KEY não configurada",
    });
  }

  let transcription: string;
  let patientContext: string | undefined;
  let confirmedCids: unknown;
  let detectedItems: unknown;
  let specialtyFields: SpecialtyFieldInput[] = [];
  try {
    const body = await req.json();
    transcription = typeof body.transcription === "string" ? body.transcription : "";
    patientContext = typeof body.patientContext === "string" ? body.patientContext : undefined;
    confirmedCids = body.confirmedCids;
    detectedItems = body.detectedItems;
    if (Array.isArray(body.specialtyFields)) {
      specialtyFields = body.specialtyFields;
    }
  } catch {
    return NextResponse.json({ soap: { s: "", o: "", a: "", p: "" }, summary: "", flags: [], specialtyFields: {} });
  }

  if (!transcription || transcription.trim().length < 20) {
    return NextResponse.json({ soap: { s: "", o: "", a: "", p: "" }, summary: "", flags: [], specialtyFields: {} });
  }

  const cidLines = Array.isArray(confirmedCids)
    ? confirmedCids
        .map((c: { code?: string; name?: string }) => c?.code && c?.name ? `${c.code} — ${c.name}` : null)
        .filter(Boolean)
        .join("\n")
    : "";

  const itemLines = Array.isArray(detectedItems)
    ? detectedItems
        .map((i: { type?: string; text?: string }) => i?.type && i?.text ? `[${i.type}] ${i.text}` : null)
        .filter(Boolean)
        .join("\n")
    : "";

  // Build specialty fields section for the prompt
  let specialtyPromptSection = "";
  let specialtyJsonSection = "";
  if (specialtyFields.length > 0) {
    const bySection: Record<string, SpecialtyFieldInput[]> = {};
    for (const f of specialtyFields) {
      if (!bySection[f.section]) bySection[f.section] = [];
      bySection[f.section].push(f);
    }

    const sectionNames: Record<string, string> = { subjetivo: "Subjetivo", objetivo: "Objetivo", avaliacao: "Avaliação", plano: "Plano" };
    const parts: string[] = [];
    for (const [section, fields] of Object.entries(bySection)) {
      parts.push(`Na seção ${sectionNames[section] ?? section}, extraia também:\n${fields.map((f) => `- ${f.label}${f.unit ? ` (${f.unit})` : ""}`).join("\n")}`);
    }
    specialtyPromptSection = `\nCAMPOS ESPECÍFICOS DA ESPECIALIDADE:\n${parts.join("\n\n")}\nSe um campo não foi mencionado na consulta, não o inclua.\n`;

    specialtyJsonSection = `,\n  "specialtyFields": {\n${specialtyFields.map((f) => `    "${f.id}": "valor extraído ou null"`).join(",\n")}\n  }`;
  }

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_PRONTUARIO_MODEL ?? "claude-haiku-4-5",
      max_tokens: 2000,
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
${specialtyPromptSection}
TRANSCRIÇÃO COMPLETA:
${JSON.stringify(transcription)}

IMPORTANTE: Responda APENAS com JSON puro, sem markdown.

Formato:
{
  "soap": {
    "s": "Subjetivo",
    "o": "Objetivo",
    "a": "Avaliação",
    "p": "Plano"
  },
  "summary": "resumo de 1-2 frases em linguagem acessível",
  "flags": ["alertas clínicos relevantes"]${specialtyJsonSection}
}`,
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const parsed = parseJson(text);

    const soap = (parsed.soap ?? {}) as Record<string, string>;
    const sfValues = (typeof parsed.specialtyFields === "object" && parsed.specialtyFields !== null)
      ? parsed.specialtyFields as Record<string, string>
      : {};

    // Remove null/empty values
    const cleanedSF: Record<string, string> = {};
    for (const [k, v] of Object.entries(sfValues)) {
      if (v && v !== "null" && typeof v === "string") cleanedSF[k] = v;
    }

    return NextResponse.json({
      soap: {
        s: typeof soap.s === "string" ? soap.s : "",
        o: typeof soap.o === "string" ? soap.o : "",
        a: typeof soap.a === "string" ? soap.a : "",
        p: typeof soap.p === "string" ? soap.p : "",
      },
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      flags: Array.isArray(parsed.flags) ? parsed.flags.filter((f): f is string => typeof f === "string") : [],
      specialtyFields: cleanedSF,
    });
  } catch {
    return NextResponse.json({ soap: { s: "", o: "", a: "", p: "" }, summary: "", flags: [], specialtyFields: {} });
  }
}
