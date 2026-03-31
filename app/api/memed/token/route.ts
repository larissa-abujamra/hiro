import { MemedClient, MemedError } from "memed-node";
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

export async function POST(req: NextRequest) {
  // ── Credential check ──────────────────────────────────────────────────────
  if (!process.env.MEMED_API_KEY || !process.env.MEMED_SECRET_KEY) {
    return NextResponse.json(
      { error: "Credenciais Memed não configuradas (MEMED_API_KEY / MEMED_SECRET_KEY)" },
      { status: 500 },
    );
  }

  // ── Doctor profile from request body (sent by the frontend store) ─────────
  let body: DoctorBody = {};
  try {
    body = (await req.json()) as DoctorBody;
  } catch {
    // empty body is handled below
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

  // ── Validate required fields ──────────────────────────────────────────────
  const missing: string[] = [];
  if (!nome) missing.push("nome");
  if (!sobrenome) missing.push("sobrenome");
  if (!cpf) missing.push("CPF");
  if (!crm) missing.push("CRM");
  if (!uf) missing.push("UF");
  if (!data_nascimento) missing.push("data de nascimento");

  if (missing.length) {
    return NextResponse.json(
      {
        error: `Perfil incompleto. Preencha: ${missing.join(", ")}. Acesse "Meu perfil" no menu lateral.`,
      },
      { status: 422 },
    );
  }

  const memed = new MemedClient({
    apiKey: process.env.MEMED_API_KEY,
    secretKey: process.env.MEMED_SECRET_KEY,
    environment: "integration",
  });

  // ── Try to get existing prescritor, create if not found ───────────────────
  try {
    const prescritor = await memed.prescritor.get(external_id);
    return NextResponse.json({ token: prescritor.token });
  } catch (getErr) {
    const isNotFound =
      getErr instanceof MemedError &&
      (getErr.statusCode === 404 || getErr.statusCode === 422);

    if (!isNotFound) {
      const msg = getErr instanceof MemedError ? getErr.message : String(getErr);
      console.error("Memed get prescritor error:", getErr);
      return NextResponse.json(
        { error: `Erro ao consultar médico na Memed: ${msg}` },
        { status: 500 },
      );
    }

    // Prescritor not registered yet — create now
    try {
      const created = await memed.prescritor.create({
        external_id,
        nome,
        sobrenome,
        data_nascimento,
        cpf,
        sexo,
        board: { board_code: "CRM", board_number: crm, board_state: uf },
        email,
      });
      return NextResponse.json({ token: created.token });
    } catch (createErr) {
      const memedErr = createErr instanceof MemedError ? createErr : null;
      const detail = memedErr
        ? `[${memedErr.statusCode}] ${memedErr.message}`
        : String(createErr);

      console.error("Memed create prescritor error:", createErr);
      return NextResponse.json(
        { error: `Falha ao registrar médico na Memed: ${detail}` },
        { status: 500 },
      );
    }
  }
}
