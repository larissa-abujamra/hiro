import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Buscar consulta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .eq("doctor_id", user.id)
      .single();

    if (error) {
      console.error("[consultations GET by id] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Atualizar consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const allowedFields = [
      "transcription",
      "subjetivo",
      "objetivo",
      "avaliacao",
      "plano",
      "soap",
      "status",
      "ended_at",
      "duration_minutes",
      "chief_complaint",
    ];

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    console.log(
      "[consultations PUT] Updating:",
      id,
      Object.keys(updateData),
    );

    const { error: updateError } = await supabase
      .from("consultations")
      .update(updateData)
      .eq("id", id)
      .eq("doctor_id", user.id);

    if (updateError) {
      console.error("[consultations PUT] Error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    const { data } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .single();

    // Se status mudou para completed, atualizar appointment também
    if (body.status === "completed" && data?.appointment_id) {
      await supabase
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", data.appointment_id);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[consultations PUT] Catch:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Cancelar/deletar consulta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("consultations")
      .delete()
      .eq("id", id)
      .eq("doctor_id", user.id);

    if (error) {
      console.error("[consultations DELETE] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
