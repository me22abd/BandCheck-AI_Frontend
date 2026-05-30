import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { query, fireAndForget } from "@/lib/db";

export const runtime = "nodejs";

type LeadRow = {
  id: number;
  email: string;
  postcode: string;
  user_band: string | null;
  created_at: string;
};

function formatPostcode(compact: string): string {
  const s = compact.replace(/\s+/g, "").toUpperCase();
  if (s.length <= 3) return s;
  return `${s.slice(0, -3)} ${s.slice(-3)}`;
}

function buildReminderHtml(email: string, postcode: string, band: string | null, monthsAgo: number): string {
  const formatted = formatPostcode(postcode);
  const isApproachingDeadline = monthsAgo >= 5;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your council tax appeal window${isApproachingDeadline ? " is closing soon" : ""}</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom:24px;">
              <span style="font-size:20px;font-weight:700;color:#14120D;letter-spacing:-0.4px;">BandCheck<span style="color:#C8431C;margin-left:4px;">· AI</span></span>
            </td>
          </tr>

          <!-- Alert banner for near-deadline -->
          ${isApproachingDeadline ? `
          <tr>
            <td style="padding-bottom:16px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FFF3F0;border-radius:12px;border:1px solid rgba(200,67,28,0.30);padding:12px 16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 3px;font-size:11px;font-weight:700;color:#C8431C;text-transform:uppercase;letter-spacing:0.7px;">
                      ⏰ Your appeal window is closing
                    </p>
                    <p style="margin:0;font-size:12px;color:#4A4435;line-height:1.5;">
                      The VOA allows appeals within 6 months. You requested your pack ${monthsAgo} months ago — act soon.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ""}

          <!-- Main card -->
          <tr>
            <td style="background:#FBF7EC;border-radius:18px;border:1px solid rgba(20,18,13,0.10);padding:28px;box-shadow:0 12px 28px -10px rgba(20,18,13,0.10);">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.88px;text-transform:uppercase;color:#8A8472;">Appeal Reminder</p>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;color:#14120D;line-height:1.2;font-style:italic;">
                Have you submitted your appeal yet?
              </h1>
              <p style="margin:0 0 16px;font-size:14px;color:#4A4435;line-height:1.6;">
                A while back you requested an evidence pack for <strong>${formatted}</strong>${band ? ` (Band ${band})` : ""}.
                If you haven't submitted your appeal to the VOA yet, now is a great time.
              </p>
              <p style="margin:0;font-size:13px;color:#8A8472;line-height:1.6;">
                The appeal process takes less than 10 minutes. The VOA must acknowledge your challenge within 6 months of your request.
              </p>
            </td>
          </tr>

          <!-- Next steps -->
          <tr>
            <td style="padding-top:16px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF7EC;border-radius:16px;border:1px solid rgba(20,18,13,0.10);padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.88px;color:#8A8472;">Next steps</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${["Open your evidence pack email and review the comparables", "Visit gov.uk/challenge-council-tax-band to submit", "Reference the comparable properties in your submission"].map((s, i) => `
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#4A4435;">
                          <span style="color:#0F5C3E;font-weight:700;margin-right:8px;">${i + 1}.</span>${s}
                        </td>
                      </tr>`).join("")}
                    </table>
                    <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td style="background:#C8431C;border-radius:10px;padding:12px 24px;">
                          <a href="https://www.gov.uk/challenge-council-tax-band"
                             style="font-size:14px;font-weight:600;color:#FBF7EC;text-decoration:none;">
                            Submit my appeal →
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:10px;text-align:center;">
                          <a href="https://www.bandcheckai.co.uk"
                             style="font-size:12px;color:#8A8472;text-decoration:underline;">
                            Re-run my check →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8A8472;line-height:1.6;">
                BandCheck AI · <a href="https://www.bandcheckai.co.uk" style="color:#8A8472;">bandcheckai.co.uk</a><br />
                You're receiving this because you requested an evidence pack.<br />
                <a href="https://www.bandcheckai.co.uk" style="color:#8A8472;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (or manually with the secret)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[cron] RESEND_API_KEY not set — skipping reminder emails");
    return NextResponse.json({ skipped: true, reason: "no_resend_key" });
  }

  // Find leads that were created 5–6 months ago and haven't had a reminder sent
  const leads = await query<LeadRow>(`
    SELECT id, email, postcode, user_band, created_at
    FROM leads
    WHERE reminder_sent = false
      AND created_at BETWEEN NOW() - INTERVAL '6 months' AND NOW() - INTERVAL '5 months'
    ORDER BY created_at ASC
    LIMIT 50
  `);

  if (leads.length === 0) {
    return NextResponse.json({ sent: 0, message: "No leads due for reminders" });
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || "BandCheck AI <hello@bandcheckai.co.uk>";

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const monthsAgo = Math.round(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30),
    );

    try {
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: [lead.email],
        subject: monthsAgo >= 5
          ? `⏰ Your council tax appeal window is closing — ${formatPostcode(lead.postcode)}`
          : `Have you submitted your council tax appeal? — ${formatPostcode(lead.postcode)}`,
        html: buildReminderHtml(lead.email, lead.postcode, lead.user_band, monthsAgo),
      });

      if (error) {
        console.error(`[cron] Resend error for ${lead.email}:`, error);
        failed++;
      } else {
        // Mark as reminder sent
        fireAndForget(`UPDATE leads SET reminder_sent = true WHERE id = $1`, [lead.id]);
        sent++;
      }
    } catch (e) {
      console.error(`[cron] Exception for ${lead.email}:`, e);
      failed++;
    }
  }

  console.log(`[cron] appeal-reminders: sent=${sent} failed=${failed}`);
  return NextResponse.json({ sent, failed, total: leads.length });
}
