import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { toCsv } from "@/lib/csv";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportType = "leads" | "outcomes";

function isExportType(v: string | null): v is ExportType {
  return v === "leads" || v === "outcomes";
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");
  if (!isExportType(type)) {
    return NextResponse.json(
      { error: "type must be leads or outcomes" },
      { status: 400 },
    );
  }

  try {
    if (type === "leads") {
      const rows = await query<{
        email: string;
        postcode: string;
        user_band: string | null;
        referred_by: string | null;
        reminder_sent: boolean;
        created_at: string;
      }>(`
        SELECT email, postcode, user_band, referred_by, reminder_sent, created_at
        FROM leads
        ORDER BY created_at DESC
      `);

      const csv = toCsv(
        ["email", "postcode", "user_band", "referred_by", "reminder_sent", "created_at"],
        rows.map((r) => [
          r.email,
          r.postcode,
          r.user_band ?? "",
          r.referred_by ?? "",
          r.reminder_sent ? "yes" : "no",
          r.created_at,
        ]),
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bandcheck-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const rows = await query<{
      postcode: string;
      original_band: string;
      outcome: string;
      refund_amount: string | null;
      annual_reduction: string | null;
      recorded_at: string;
    }>(`
      SELECT postcode, original_band, outcome, refund_amount, annual_reduction, recorded_at
      FROM appeal_outcomes
      ORDER BY recorded_at DESC
    `);

    const csv = toCsv(
      [
        "postcode",
        "original_band",
        "outcome",
        "refund_amount",
        "annual_reduction",
        "recorded_at",
      ],
      rows.map((r) => [
        r.postcode,
        r.original_band,
        r.outcome,
        r.refund_amount ?? "",
        r.annual_reduction ?? "",
        r.recorded_at,
      ]),
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bandcheck-outcomes-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[admin/export] error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
