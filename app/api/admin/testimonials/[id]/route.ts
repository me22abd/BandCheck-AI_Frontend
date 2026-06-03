import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let approved: boolean;
  try {
    const body = await request.json();
    if (typeof body.approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean" }, { status: 400 });
    }
    approved = body.approved;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const rows = await query<{ id: number; approved: boolean }>(
      `UPDATE testimonials SET approved = $1 WHERE id = $2 RETURNING id, approved`,
      [approved, id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: rows[0].id, approved: rows[0].approved });
  } catch (err) {
    console.error("[admin/testimonials] PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
