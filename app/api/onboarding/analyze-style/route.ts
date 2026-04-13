import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );

  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    if (files.length === 0) return NextResponse.json({ error: "Nenhum arquivo" }, { status: 400 });

    // Extract text from files
    const texts = await Promise.all(
      files.map(async (f) => {
        const text = await f.text();
        return text.substring(0, 5000);
      })
    );

    console.log("[Onboarding] Analyzing", texts.length, "documents for writing style");

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_PRONTUARIO_MODEL ?? "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em análise de escrita médica. Analise estes prontuários do mesmo médico e extraia um perfil de estilo.

PRONTUÁRIOS:
${texts.map((t, i) => `--- Prontuário ${i + 1} ---\n${t}`).join("\n\n")}

Responda APENAS com JSON puro (sem markdown):
{
  "tom": "formal|detalhado|conciso",
  "caracteristicas": ["lista de características do estilo"],
  "terminologia": "alto|médio|baixo",
  "expressoes_frequentes": ["expressões que o médico usa com frequência"],
  "formatacao": "bullets|paragrafos|misto",
  "nivel_detalhe": "alto|médio|baixo",
  "instrucao_para_ia": "Instrução de 2-3 frases descrevendo como a IA deve escrever para imitar este estilo"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Resposta inesperada");

    let writingProfile;
    try {
      const clean = content.text.replace(/```json\n?|\n?```/g, "").trim();
      writingProfile = JSON.parse(clean);
    } catch {
      // Try extracting JSON from the text
      const match = content.text.match(/\{[\s\S]*\}/);
      if (match) writingProfile = JSON.parse(match[0]);
      else throw new Error("Não foi possível analisar o estilo");
    }

    const { error } = await admin
      .from("profiles")
      .update({ writing_profile: JSON.stringify(writingProfile) })
      .eq("id", user.id);

    if (error) {
      console.error("[Onboarding] Save profile error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, writingProfile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro";
    console.error("[Onboarding] Analyze style error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
