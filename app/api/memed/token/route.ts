import { NextRequest, NextResponse } from "next/server";

interface DoctorBody {
  external_id?: string;
  nome?: string;
  sobrenome?: string;
  cpf?: string;
  crm?: string;
  uf?: string;
  data_nascimento?: string;
  sexo?: "M" | "F";
  email?: string;
}

const MEMED_API_URL = "https://integrations.api.memed.com.br/v1";

export async function POST(req: NextRequest) {
  console.log("=== MEMED DEBUG ===");
  console.log("MEMED_API_KEY exists:", !!process.env.MEMED_API_KEY);
  console.log("MEMED_SECRET_KEY exists:", !!process.env.MEMED_SECRET_KEY);
  console.log("MEMED_API_URL:", MEMED_API_URL);

  if (!process.env.MEMED_API_KEY || !process.env.MEMED_SECRET_KEY) {
    return NextResponse.json(
      { error: "Credenciais Memed não configuradas (MEMED_API_KEY / MEMED_SECRET_KEY)" },
      { status: 500 },
    );
  }

  let body: DoctorBody = {};
  try {
    body = (await req.json()) as DoctorBody;
  } catch {
    // empty body handled below
  }

  const nome = body.nome?.trim() ?? "";
  const sobrenome = body.sobrenome?.trim() ?? "";
  const cpf = body.cpf?.replace(/\D/g, "") ?? "";
  const crm = body.crm?.replace(/\D/g, "") ?? "";
  const uf = body.uf?.trim() ?? "";
  const data_nascimento = body.data_nascimento?.trim() ?? "";
  const sexo = body.sexo ?? "F";
  const email = body.email?.trim() ?? "";
  const external_id = body.external_id?.trim() || "hiro-medico-default";

  const missing: string[] = [];
  if (!nome) missing.push("nome");
  if (!sobrenome) missing.push("sobrenome");
  if (!cpf) missing.push("CPF");
  if (!crm) missing.push("CRM");
  if (!uf) missing.push("UF");
  if (!data_nascimento) missing.push("data de nascimento");

  if (missing.length) {
    return NextResponse.json(
      { error: `Perfil incompleto. Preencha: ${missing.join(", ")}. Acesse "Meu perfil" no menu lateral.` },
      { status: 422 },
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Memed-API-Key": process.env.MEMED_API_KEY,
    "Memed-Secret-Key": process.env.MEMED_SECRET_KEY,
  };

  const doctorPayload = {
    data: {
      type: "usuarios",
      attributes: {
        external_id,
        nome,
        sobrenome,
        data_nascimento,
        cpf,
        sexo,
        uf,
        crm,
        email: email || undefined,
      },
    },
  };

  console.log("[memed] Doctor payload:", JSON.stringify(doctorPayload, null, 2));

  // ── Try to GET existing prescritor first ──────────────────────────────────
  try {
    const getUrl = `${MEMED_API_URL}/sinapse-prescricao/usuarios/${external_id}`;
    console.log("[memed] GET", getUrl);

    const getRes = await fetch(getUrl, { method: "GET", headers });
    const getText = await getRes.text();

    console.log("[memed] GET status:", getRes.status);
    console.log("[memed] GET response:", getText.slice(0, 500));

    if (getRes.ok) {
      try {
        const getData = JSON.parse(getText);
        const token =
          getData?.data?.attributes?.token ??
          getData?.data?.token ??
          getData?.token;
        if (token) {
          console.log("[memed] Found existing prescritor, token:", token.slice(0, 20) + "...");
          return NextResponse.json({ token });
        }
      } catch {
        console.error("[memed] Failed to parse GET response");
      }
    }

    // If 404 or 422, prescritor doesn't exist yet — create below
    if (getRes.status !== 404 && getRes.status !== 422 && !getRes.ok) {
      return NextResponse.json(
        { error: `Erro ao consultar médico na Memed: [${getRes.status}] ${getText.slice(0, 200)}` },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[memed] GET request failed:", err);
    // Continue to create
  }

  // ── CREATE prescritor ─────────────────────────────────────────────────────
  try {
    const createUrl = `${MEMED_API_URL}/sinapse-prescricao/usuarios`;
    console.log("[memed] POST", createUrl);

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(doctorPayload),
    });

    const createText = await createRes.text();
    console.log("[memed] POST status:", createRes.status);
    console.log("[memed] POST response:", createText.slice(0, 500));

    if (!createRes.ok) {
      return NextResponse.json(
        { error: `Falha ao registrar médico na Memed: [${createRes.status}] ${createText.slice(0, 200)}` },
        { status: 500 },
      );
    }

    const createData = JSON.parse(createText);
    const token =
      createData?.data?.attributes?.token ??
      createData?.data?.token ??
      createData?.token;

    if (!token) {
      console.error("[memed] No token in create response:", createText.slice(0, 300));
      return NextResponse.json(
        { error: "Memed respondeu sem token. Verifique os dados do perfil." },
        { status: 500 },
      );
    }

    console.log("[memed] Created prescritor, token:", token.slice(0, 20) + "...");
    return NextResponse.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[memed] CREATE request failed:", err);
    return NextResponse.json(
      { error: `Erro de conexão com Memed: ${message}` },
      { status: 500 },
    );
  }
}
