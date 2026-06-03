import { query, migrate } from "@/lib/db";

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

    const [stats, recentLeads, recentChecks, outcomes, testimonials] =
      await Promise.all([
        query<AdminStats>(`
          SELECT
            (SELECT COUNT(*)::text FROM postcode_checks)  AS total_checks,
            (SELECT COUNT(*)::text FROM leads)             AS total_leads,
            (SELECT COUNT(*)::text FROM appeal_outcomes)   AS total_outcomes,
            (SELECT COUNT(*)::text FROM testimonials)      AS total_testimonials
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

    return {
      stats: stats[0] ?? EMPTY_STATS,
      recentLeads,
      recentChecks,
      outcomes,
      testimonials,
    };
  } catch (err) {
    console.error("[admin] getAdminData failed:", err);
    return {
      stats: EMPTY_STATS,
      recentLeads: [],
      recentChecks: [],
      outcomes: [],
      testimonials: [],
    };
  }
}
