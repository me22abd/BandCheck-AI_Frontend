import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const [stats, recentLeads, recentChecks, outcomes, testimonials] = await Promise.all([
    query<{ total_checks: string; total_leads: string; total_outcomes: string; total_testimonials: string }>(`
      SELECT
        (SELECT COUNT(*) FROM postcode_checks)  AS total_checks,
        (SELECT COUNT(*) FROM leads)             AS total_leads,
        (SELECT COUNT(*) FROM appeal_outcomes)   AS total_outcomes,
        (SELECT COUNT(*) FROM testimonials)      AS total_testimonials
    `),
    query<{ id: number; email: string; postcode: string; user_band: string; referred_by: string; reminder_sent: boolean; created_at: string }>(`
      SELECT id, email, postcode, user_band, referred_by, reminder_sent, created_at
      FROM leads ORDER BY created_at DESC LIMIT 50
    `),
    query<{ postcode: string; district: string; user_band: string; band_source: string; case_strength: string; checked_at: string }>(`
      SELECT postcode, district, user_band, band_source, case_strength, checked_at
      FROM postcode_checks ORDER BY checked_at DESC LIMIT 50
    `),
    query<{ id: number; postcode: string; original_band: string; outcome: string; refund_amount: string; annual_reduction: string; recorded_at: string }>(`
      SELECT id, postcode, original_band, outcome, refund_amount, annual_reduction, recorded_at
      FROM appeal_outcomes ORDER BY recorded_at DESC LIMIT 50
    `),
    query<{ id: number; postcode: string; first_name: string; area: string; feedback: string; refund_amount: string; approved: boolean; created_at: string }>(`
      SELECT id, postcode, first_name, area, feedback, refund_amount, approved, created_at
      FROM testimonials ORDER BY created_at DESC LIMIT 50
    `),
  ]);

  return NextResponse.json({
    stats: stats[0],
    recentLeads,
    recentChecks,
    outcomes,
    testimonials,
  });
}
