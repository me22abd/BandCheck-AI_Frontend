import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

// Cache stats responses for 10 minutes
export const revalidate = 600;

export type DistrictStats = {
  district: string;
  totalChecked: number;
  strongCaseCount: number;
  strongCasePct: number;
  bandBreakdown: Record<string, number>;
};

export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get("district");

  if (!district || district.trim().length < 2) {
    return NextResponse.json({ error: "district is required" }, { status: 400 });
  }

  try {
    type Row = {
      total_checked: string;
      strong_case_count: string;
      user_band: string;
      band_count: string;
    };

    const rows = await query<Row>(
      `SELECT
         COUNT(*)::text                                     AS total_checked,
         COUNT(*) FILTER (WHERE case_strength >= 55)::text AS strong_case_count,
         user_band,
         COUNT(*)::text                                     AS band_count
       FROM postcode_checks
       WHERE LOWER(district) = LOWER($1)
         AND checked_at > NOW() - INTERVAL '90 days'
       GROUP BY user_band
       ORDER BY user_band`,
      [district.trim()],
    );

    if (rows.length === 0) {
      return NextResponse.json({ district, totalChecked: 0, strongCaseCount: 0, strongCasePct: 0, bandBreakdown: {} });
    }

    const totalChecked = parseInt(rows[0].total_checked, 10);
    const strongCaseCount = parseInt(rows[0].strong_case_count, 10);
    const strongCasePct = totalChecked > 0 ? Math.round((strongCaseCount / totalChecked) * 100) : 0;

    const bandBreakdown: Record<string, number> = {};
    for (const row of rows) {
      bandBreakdown[row.user_band] = parseInt(row.band_count, 10);
    }

    const stats: DistrictStats = {
      district,
      totalChecked,
      strongCaseCount,
      strongCasePct,
      bandBreakdown,
    };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("[stats] DB error:", err);
    return NextResponse.json({ error: "stats unavailable" }, { status: 500 });
  }
}
