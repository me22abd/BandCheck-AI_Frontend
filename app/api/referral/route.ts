import { NextRequest, NextResponse } from "next/server";
import { fireAndForget, query } from "@/lib/db";

export const runtime = "nodejs";

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// POST /api/referral — log a referral click
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body as { ref?: unknown }).ref;
  if (!raw || typeof raw !== "string" || raw.trim().length < 3) {
    return NextResponse.json({ error: "ref is required" }, { status: 400 });
  }

  const refPostcode = normalizePostcode(raw.trim());
  const userAgent = request.headers.get("user-agent") ?? undefined;

  fireAndForget(
    `INSERT INTO referral_clicks (ref_postcode, user_agent) VALUES ($1, $2)`,
    [refPostcode, userAgent],
  );

  return NextResponse.json({ ok: true });
}

// GET /api/referral?ref=LU13RX — return click count for a postcode
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ref");
  if (!raw) return NextResponse.json({ clicks: 0 });

  const refPostcode = normalizePostcode(raw.trim());

  type Row = { clicks: string };
  const rows = await query<Row>(
    `SELECT COUNT(*)::text AS clicks FROM referral_clicks WHERE ref_postcode = $1`,
    [refPostcode],
  );

  return NextResponse.json(
    { ref: refPostcode, clicks: parseInt(rows[0]?.clicks ?? "0", 10) },
    { headers: { "Cache-Control": "public, s-maxage=60" } },
  );
}
