import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Allow larger request bodies for image/PDF uploads
export const maxDuration = 60;

function parseJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    // not plain JSON, continue
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim());
  }

  // Try extracting the first { ... } block
  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return JSON.parse(braceMatch[0]);
  }

  throw new Error("Não foi possível interpretar a resposta da IA");
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  let fileData: string;
  let mediaType: string;
  try {
    const body = await req.json();
    fileData = body.image;
    mediaType = body.mediaType ?? "image/jpeg";
    if (!fileData) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
    }
  } catch (err) {
    console.error("Exam analysis — body parse error:", err);
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const isPdf = mediaType === "application/pdf";

  // Build the content block depending on file type
  const fileContent: Anthropic.Messages.ContentBlockParam = isPdf
    ? {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: fileData,
        },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: fileData,
        },
      };

  const prompt = `Você é um assistente médico especializado em interpretação de exames laboratoriais e de imagem.

Analise este ${isPdf ? "documento PDF de exame médico" : "imagem de exame médico"} e extraia TODOS os valores encontrados.

Para cada valor, determine:
1. Nome do exame/parâmetro
2. Valor encontrado
3. Unidade de medida
4. Se está dentro da faixa normal (normal, alto, baixo)
5. Faixa de referência, se visível

IMPORTANTE: Responda APENAS com JSON puro e válido. Não use markdown, não use code blocks, não adicione texto antes ou depois. A resposta deve começar com { e terminar com }.

Formato:
{
  "results": [
    {
      "name": "Nome do exame",
      "value": "valor numérico ou texto",
      "unit": "unidade",
      "status": "normal" | "alto" | "baixo",
      "reference": "faixa de referência se disponível"
    }
  ],
  "summary": "Resumo breve dos achados principais em português",
  "type": "hemograma" | "bioquimica" | "urina" | "hormonal" | "imagem" | "outro"
}`;

  try {
    // Use sonnet for PDF/document support
    const model = isPdf
      ? "claude-sonnet-4-6"
      : (process.env.ANTHROPIC_PRONTUARIO_MODEL ?? "claude-haiku-4-5");

    console.log(`[exam-analysis] Analyzing ${isPdf ? "PDF" : "image"} (${(fileData.length / 1024).toFixed(0)} KB base64) with model: ${model}`);

    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [fileContent, { type: "text", text: prompt }],
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    console.log("[exam-analysis] Response:", text.slice(0, 200));

    const parsed = parseJson(text);

    return NextResponse.json({
      results: Array.isArray(parsed.results) ? parsed.results : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      type: typeof parsed.type === "string" ? parsed.type : "outro",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Exam analysis error:", message, err);

    const userMessage = message.includes("interpretar")
      ? "Não foi possível analisar o exame. Tente novamente ou envie um arquivo com melhor qualidade."
      : `Erro ao analisar exame: ${message}`;

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
