import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
  let writingPreferences: Record<string, unknown> = {};
  let writingProfile: Record<string, unknown> | null = null;
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

  // Fetch user's writing preferences from Supabase
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const admin = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } });
      const { data: profile } = await admin.from("profiles").select("writing_preferences, writing_profile").eq("id", user.id).single();
      if (profile?.writing_preferences) writingPreferences = profile.writing_preferences as Record<string, unknown>;
      if (profile?.writing_profile) {
        try { writingProfile = typeof profile.writing_profile === "string" ? JSON.parse(profile.writing_profile) : profile.writing_profile; } catch {}
      }
    }
  } catch { /* proceed without preferences */ }

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
- Terceira pessoa: "Paciente refere...", "Ao exame..."
- Incluir APENAS informações que aparecem na transcrição
- NÃO inventar dados não mencionados
${writingPreferences.tone === "concise" ? "- Seja CONCISO e direto, frases curtas, sem redundância" : writingPreferences.tone === "detailed" ? "- Seja DETALHADO, descreva todos os achados de forma completa" : "- Use tom FORMAL e técnico com terminologia médica apropriada"}
${writingPreferences.planFormat === "numbered_list" ? "- Formate o Plano como lista numerada (1. 2. 3.)" : writingPreferences.planFormat === "categories" ? "- Formate o Plano por categorias (Medicações: / Exames: / Orientações: / Retorno:)" : writingPreferences.planFormat === "prose" ? "- Escreva o Plano em texto corrido" : ""}
${writingPreferences.includeDateTime ? "- Incluir data e hora da consulta" : ""}
${writingPreferences.includeSuggestedCID ? "- Sugerir CID-10 relevantes na Avaliação" : ""}
${writingPreferences.includeSuggestedReturn ? "- Sugerir prazo de retorno no Plano" : ""}
${writingProfile?.instrucao_para_ia ? `\nPERFIL DE ESCRITA DO MÉDICO (imite este estilo):\n${writingProfile.instrucao_para_ia}` : ""}

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
