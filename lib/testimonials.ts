import { query } from "@/lib/db";

export type PublicTestimonial = {
  quote: string;
  name: string;
  area: string;
  saving: string | null;
};

type TestimonialRow = {
  first_name: string;
  area: string | null;
  feedback: string;
  refund_amount: string | null;
};

function formatSaving(refundAmount: string | null): string | null {
  if (!refundAmount) return null;
  const amount = Number(refundAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `£${amount.toLocaleString()} refund`;
}

export async function getApprovedTestimonials(
  limit = 6,
): Promise<PublicTestimonial[]> {
  try {
    const rows = await query<TestimonialRow>(
      `
        SELECT first_name, area, feedback, refund_amount
        FROM testimonials
        WHERE approved = true
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit],
    );

    return rows.map((row) => ({
      quote: row.feedback,
      name: row.first_name,
      area: row.area?.trim() || "UK",
      saving: formatSaving(row.refund_amount),
    }));
  } catch (err) {
    console.error("[testimonials] getApprovedTestimonials failed:", err);
    return [];
  }
}
