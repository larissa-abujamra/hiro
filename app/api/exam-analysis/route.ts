import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 60;

/**
 * Try to fix truncated JSON by closing unclosed brackets/braces.
 */
function tryFixTruncatedJson(str: string): string {
  let fixed = str.trim();

  // Remove trailing comma before we close
  fixed = fixed.replace(/,\s*$/, "");

  // Remove incomplete last key-value (e.g. `"name": "Hemo` cut off)
  fixed = fixed.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
  fixed = fixed.replace(/,\s*\{[^}]*$/, "");

  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;

  for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
  for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";

  return fixed;
}

function parseJson(text: string): Record<string, unknown> {
  let source = text.trim();

  // Strip markdown fences
  const fenceMatch = source.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) source = fenceMatch[1].trim();

  // Extract first { ... } if there's surrounding text
  const braceMatch = source.match(/\{[\s\S]*\}?/);
  if (braceMatch) source = braceMatch[0];

  // Try direct parse
  try {
    return JSON.parse(source);
  } catch {
    // Try fixing truncated JSON
    try {
      const fixed = tryFixTruncatedJson(source);
      console.log("[exam-analysis] Fixed truncated JSON, length:", fixed.length);
      return JSON.parse(fixed);
    } catch {
      throw new Error("Não foi possível interpretar a resposta da IA");
    }
  }
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

  const fileContent: Anthropic.Messages.ContentBlockParam = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: fileData },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: fileData,
        },
      };

  const prompt = `Você é um assistente médico. Analise este ${isPdf ? "PDF" : "imagem"} de exame e extraia os valores mais importantes.

REGRAS:
- Retorne no máximo 25 valores (os mais relevantes clinicamente)
- Responda APENAS com JSON puro — sem markdown, sem code blocks
- A resposta DEVE começar com { e terminar com }
- Mantenha a resposta curta e completa

Formato:
{
  "results": [
    {"name": "Nome", "value": "valor", "unit": "unidade", "status": "normal", "reference": "ref"}
  ],
  "summary": "Resumo breve em português",
  "type": "hemograma"
}

Os valores possíveis de "status" são: "normal", "alto", "baixo".
Os valores possíveis de "type" são: "hemograma", "bioquimica", "urina", "hormonal", "imagem", "outro".`;

  try {
    const model = isPdf
      ? "claude-sonnet-4-6"
      : (process.env.ANTHROPIC_PRONTUARIO_MODEL ?? "claude-haiku-4-5");

    console.log(`[exam-analysis] Analyzing ${isPdf ? "PDF" : "image"} (${(fileData.length / 1024).toFixed(0)} KB base64) with model: ${model}`);

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [fileContent, { type: "text", text: prompt }],
        },
      ],
    });

    const stopReason = response.stop_reason;
    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";

    console.log(`[exam-analysis] stop_reason: ${stopReason}, response length: ${text.length}`);
    console.log("[exam-analysis] Response preview:", text.slice(0, 300));

    if (stopReason === "max_tokens") {
      console.warn("[exam-analysis] Response was truncated by max_tokens — attempting fix");
    }

    const parsed = parseJson(text);

    return NextResponse.json({
      results: Array.isArray(parsed.results) ? parsed.results : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      type: typeof parsed.type === "string" ? parsed.type : "outro",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Exam analysis error:", message, err);

    let userMessage: string;
    if (message.includes("interpretar")) {
      userMessage = "O exame é muito extenso para análise completa. Tente enviar apenas as páginas com os resultados.";
    } else if (message.includes("max_tokens") || message.includes("truncat")) {
      userMessage = "O exame é muito extenso. Tente enviar um arquivo menor ou apenas as páginas com os resultados.";
    } else {
      userMessage = `Erro ao analisar exame: ${message}`;
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
