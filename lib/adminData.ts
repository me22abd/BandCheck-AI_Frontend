import { query, migrate } from "@/lib/db";
import {
  buildDailySeries,
  EMPTY_CHARTS,
  type AdminCharts,
} from "@/lib/adminCharts";

export type AdminStats = {
  total_checks: string;
  total_leads: string;
  total_outcomes: string;
  total_testimonials: string;
};

export type AdminLead = {
  id: number;
  email: string;
  postcode: string;
  user_band: string | null;
  referred_by: string | null;
  reminder_sent: boolean;
  created_at: string;
};

export type AdminCheck = {
  postcode: string;
  district: string;
  user_band: string;
  band_source: string;
  case_strength: string | null;
  checked_at: string;
};

export type AdminOutcome = {
  id: number;
  postcode: string;
  original_band: string;
  outcome: string;
  refund_amount: string | null;
  annual_reduction: string | null;
  recorded_at: string;
};

export type AdminTestimonial = {
  id: number;
  postcode: string;
  first_name: string;
  area: string | null;
  feedback: string;
  refund_amount: string | null;
  approved: boolean;
  created_at: string;
};

export type AdminData = {
  stats: AdminStats;
  charts: AdminCharts;
  recentLeads: AdminLead[];
  recentChecks: AdminCheck[];
  outcomes: AdminOutcome[];
  testimonials: AdminTestimonial[];
};

const EMPTY_STATS: AdminStats = {
  total_checks: "0",
  total_leads: "0",
  total_outcomes: "0",
  total_testimonials: "0",
};

export async function getAdminData(): Promise<AdminData> {
  try {
    await migrate();

    const [stats, leadsDailyRows, checksDailyRows, outcomeRows, recentLeads, recentChecks, outcomes, testimonials] =
      await Promise.all([
        query<AdminStats>(`
          SELECT
            (SELECT COUNT(*)::text FROM postcode_checks)  AS total_checks,
            (SELECT COUNT(*)::text FROM leads)             AS total_leads,
            (SELECT COUNT(*)::text FROM appeal_outcomes)   AS total_outcomes,
            (SELECT COUNT(*)::text FROM testimonials)      AS total_testimonials
        `),
        query<{ day: string; count: string }>(`
          SELECT created_at::date::text AS day, COUNT(*)::text AS count
          FROM leads
          WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
          GROUP BY created_at::date
          ORDER BY day
        `),
        query<{ day: string; count: string }>(`
          SELECT checked_at::date::text AS day, COUNT(*)::text AS count
          FROM postcode_checks
          WHERE checked_at >= CURRENT_DATE - INTERVAL '29 days'
          GROUP BY checked_at::date
          ORDER BY day
        `),
        query<{ outcome: string; count: string }>(`
          SELECT outcome, COUNT(*)::text AS count
          FROM appeal_outcomes
          GROUP BY outcome
        `),
        query<AdminLead>(`
          SELECT id, email, postcode, user_band, referred_by, reminder_sent, created_at
          FROM leads ORDER BY created_at DESC LIMIT 50
        `),
        query<AdminCheck>(`
          SELECT postcode, district, user_band, band_source, case_strength, checked_at
          FROM postcode_checks ORDER BY checked_at DESC LIMIT 50
        `),
        query<AdminOutcome>(`
          SELECT id, postcode, original_band, outcome, refund_amount, annual_reduction, recorded_at
          FROM appeal_outcomes ORDER BY recorded_at DESC LIMIT 50
        `),
        query<AdminTestimonial>(`
          SELECT id, postcode, first_name, area, feedback, refund_amount, approved, created_at
          FROM testimonials ORDER BY created_at DESC LIMIT 50
        `),
      ]);

    let successful = 0;
    let unsuccessful = 0;
    let other = 0;
    for (const row of outcomeRows) {
      const n = parseInt(row.count, 10) || 0;
      if (row.outcome === "successful") successful += n;
      else if (row.outcome === "unsuccessful") unsuccessful += n;
      else other += n;
    }

    const charts: AdminCharts = {
      leadsDaily: buildDailySeries(leadsDailyRows),
      checksDaily: buildDailySeries(checksDailyRows),
      outcomes: {
        successful,
        unsuccessful,
        other,
        total: successful + unsuccessful + other,
      },
    };

    return {
      stats: stats[0] ?? EMPTY_STATS,
      charts,
      recentLeads,
      recentChecks,
      outcomes,
      testimonials,
    };
  } catch (err) {
    console.error("[admin] getAdminData failed:", err);
    return {
      stats: EMPTY_STATS,
      charts: EMPTY_CHARTS,
      recentLeads: [],
      recentChecks: [],
      outcomes: [],
      testimonials: [],
    };
  }
}
