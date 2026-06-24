import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  getApprovedTestimonials,
  type PublicTestimonial,
} from "@/lib/testimonials";

export const runtime = "nodejs";
export const revalidate = 300; // cache for 5 minutes

export type SiteStats = {
  totalChecks: number;
  strongCaseCount: number;
  strongCasePct: number;
  totalTestimonials: number;
  testimonials: PublicTestimonial[];
};

export async function GET() {
  try {
    type StatsRow = {
      total_checks: string;
      strong_case_count: string;
    };

    const [statsRows, testimonialRows, testimonials] = await Promise.all([
      query<StatsRow>(`
        SELECT
          COUNT(*)::text                                     AS total_checks,
          COUNT(*) FILTER (WHERE case_strength >= 55)::text AS strong_case_count
        FROM postcode_checks
        WHERE checked_at > NOW() - INTERVAL '90 days'
      `),
      query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM testimonials WHERE approved = true
      `),
      getApprovedTestimonials(6),
    ]);

    const totalChecks = parseInt(statsRows[0]?.total_checks ?? "0", 10);
    const strongCaseCount = parseInt(statsRows[0]?.strong_case_count ?? "0", 10);
    const strongCasePct = totalChecks > 0
      ? Math.round((strongCaseCount / totalChecks) * 100)
      : 0;
    const totalTestimonials = parseInt(testimonialRows[0]?.count ?? "0", 10);

    const stats: SiteStats = {
      totalChecks,
      strongCaseCount,
      strongCasePct,
      totalTestimonials,
      testimonials,
    };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[site-stats] DB error:", err);
    // Return graceful fallback so the landing page still renders
    return NextResponse.json({
      totalChecks: 0,
      strongCaseCount: 0,
      strongCasePct: 0,
      totalTestimonials: 0,
      testimonials: [],
    });
  }
}
