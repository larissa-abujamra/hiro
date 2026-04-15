import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Listar consultas do médico
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
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("consultations")
      .select("*")
      .eq("doctor_id", user.id)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (patient_id) {
      query = query.eq("patient_id", patient_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[consultations GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[consultations GET] Catch:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Criar nova consulta
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
    const { patient_id, appointment_id, chief_complaint } = body;

    if (!patient_id) {
      return NextResponse.json(
        { error: "patient_id is required" },
        { status: 400 },
      );
    }

    console.log("[consultations POST] Creating for patient:", patient_id);

    const { data, error } = await supabase
      .from("consultations")
      .insert({
        patient_id,
        doctor_id: user.id,
        appointment_id: appointment_id || null,
        chief_complaint: chief_complaint || null,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[consultations POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se veio de um agendamento, atualizar status do appointment
    if (appointment_id) {
      await supabase
        .from("appointments")
        .update({ status: "in_progress" })
        .eq("id", appointment_id);
    }

    console.log("[consultations POST] Created:", data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[consultations POST] Catch:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
