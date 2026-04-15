import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 60;

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada" },
        { status: 500 },
      );
    }

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.file_data || !exam.file_type) {
      return NextResponse.json(
        { error: "Exame sem arquivo anexado" },
        { status: 400 },
      );
    }

    const { data: patient } = await supabase
      .from("patients")
      .select("name, date_of_birth, sex")
      .eq("id", exam.patient_id)
      .single();

    console.log("[exam analyze] Analyzing exam:", id);

    const content: Anthropic.Messages.ContentBlockParam[] = [];

    if (exam.file_type === "application/pdf") {
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: exam.file_data,
        },
      });
    } else if (
      typeof exam.file_type === "string" &&
      exam.file_type.startsWith("image/")
    ) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: exam.file_type as ImageMediaType,
          data: exam.file_data,
        },
      });
    } else {
      return NextResponse.json(
        { error: `Tipo de arquivo não suportado: ${exam.file_type}` },
        { status: 400 },
      );
    }

    content.push({
      type: "text",
      text: `Analise este exame médico e forneça:

CONTEXTO DO PACIENTE:
- Nome: ${patient?.name || "Não informado"}
- Data de nascimento: ${patient?.date_of_birth || "Não informada"}
- Sexo: ${patient?.sex || "Não informado"}
- Nome do exame: ${exam.name || "Não especificado"}
- Data do exame: ${exam.exam_date || "Não especificada"}

Por favor, forneça:
1. RESUMO: Um resumo dos achados principais
2. VALORES ALTERADOS: Liste valores fora da faixa de referência (se aplicável)
3. INTERPRETAÇÃO: Significado clínico dos achados
4. SUGESTÕES: Possíveis próximos passos ou exames complementares

Seja objetivo e clinicamente relevante. Não faça diagnósticos definitivos, apenas aponte achados que merecem atenção médica.`,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content }],
    });

    const analysisText =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    const { error: updateError } = await supabase
      .from("exams")
      .update({ analysis: analysisText })
      .eq("id", id);

    if (updateError) {
      console.error("[exam analyze] Failed to save analysis:", updateError);
    }

    console.log("[exam analyze] Analysis saved for:", id);

    return NextResponse.json({
      success: true,
      analysis: analysisText,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[exam analyze] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
