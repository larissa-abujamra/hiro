import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Listar exames de um paciente ou consulta
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patient_id = searchParams.get("patient_id");
    const consultation_id = searchParams.get("consultation_id");

    let query = supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (patient_id) {
      query = query.eq("patient_id", patient_id);
    }

    if (consultation_id) {
      query = query.eq("consultation_id", consultation_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[exams GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[exams GET] Catch:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Upload de exame
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patient_id,
      consultation_id,
      name,
      exam_date,
      file_data, // base64 (sem prefixo "data:...;base64,")
      file_type, // 'application/pdf', 'image/jpeg', etc
      file_name,
    } = body;

    if (!patient_id || !file_data) {
      return NextResponse.json(
        { error: "patient_id and file_data are required" },
        { status: 400 },
      );
    }

    console.log("[exams POST] Creating exam for patient:", patient_id);

    const { data, error } = await supabase
      .from("exams")
      .insert({
        patient_id,
        consultation_id: consultation_id || null,
        uploaded_by: user.id,
        name: name || file_name || "Exame",
        exam_date: exam_date || new Date().toISOString().split("T")[0],
        file_data,
        file_type,
        analysis: null,
        values: null,
      })
      .select()
      .single();

    if (error) {
      console.error("[exams POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[exams POST] Created:", data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[exams POST] Catch:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
