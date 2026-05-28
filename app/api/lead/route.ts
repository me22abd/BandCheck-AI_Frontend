import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type Comparable = { address: string; band: string };

type LeadBody = {
  email: string;
  postcode: string;
  userBand: string;
  draftAppeal: boolean;
  comparables?: Comparable[];
};

function isString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatPostcode(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  return c.replace(/(.{3})$/, " $1");
}

function buildEmailHtml(body: LeadBody): string {
  const formatted = formatPostcode(body.postcode);
  const hasComparables = Array.isArray(body.comparables) && body.comparables.length > 0;

  const comparablesRows = hasComparables
    ? body.comparables!
        .map(
          (c) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#4A4435;border-bottom:1px solid rgba(20,18,13,0.08);">${c.address}</td>
        <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#0F5C3E;border-bottom:1px solid rgba(20,18,13,0.08);text-align:center;">Band ${c.band}</td>
      </tr>`,
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your BandCheck AI evidence pack</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom:28px;">
              <span style="font-size:20px;font-weight:700;color:#14120D;letter-spacing:-0.4px;">BandCheck<span style="color:#C8431C;">AI</span></span>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background:#FBF7EC;border-radius:18px;border:1px solid rgba(20,18,13,0.10);padding:28px 28px 24px;box-shadow:0 12px 28px -10px rgba(20,18,13,0.10);">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.88px;text-transform:uppercase;color:#8A8472;">Evidence Pack</p>
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:400;color:#14120D;line-height:1.15;font-style:italic;">
                ${formatted}
              </h1>
              <p style="margin:0;font-size:14px;color:#4A4435;line-height:1.6;">
                Here is your BandCheck AI evidence pack for <strong>${formatted}</strong>.
                ${body.draftAppeal ? "We've also prepared a draft appeal letter — ready to submit to the VOA." : ""}
              </p>

              <!-- Band badge -->
              <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="background:#C8431C;border-radius:10px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#FBF7EC;">${body.userBand}</span>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:11px;color:#8A8472;font-weight:600;text-transform:uppercase;letter-spacing:0.7px;">Current band</p>
                    <p style="margin:2px 0 0;font-size:14px;color:#14120D;font-weight:600;">Council Tax Band ${body.userBand}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Comparable evidence table -->
          ${
            hasComparables
              ? `
          <tr>
            <td style="padding-top:20px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF7EC;border-radius:18px;border:1px solid rgba(20,18,13,0.10);overflow:hidden;">
                <tr>
                  <td colspan="2" style="padding:16px 16px 10px;border-bottom:1px solid rgba(20,18,13,0.10);">
                    <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.88px;color:#8A8472;">Comparable Properties</p>
                  </td>
                </tr>
                ${comparablesRows}
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- Next steps -->
          <tr>
            <td style="padding-top:20px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF7EC;border-radius:18px;border:1px solid rgba(20,18,13,0.10);padding:20px 20px 16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.88px;color:#8A8472;">Next Steps</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#4A4435;">
                          <span style="color:#0F5C3E;font-weight:700;margin-right:8px;">1.</span>
                          Review the comparable properties above
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#4A4435;">
                          <span style="color:#0F5C3E;font-weight:700;margin-right:8px;">2.</span>
                          Open the BandCheck AI app and complete your appeal
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#4A4435;">
                          <span style="color:#0F5C3E;font-weight:700;margin-right:8px;">3.</span>
                          Submit to the VOA — takes less than 5 minutes
                        </td>
                      </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td style="background:#C8431C;border-radius:10px;padding:12px 24px;">
                          <a href="https://www.bandcheckai.co.uk" style="font-size:14px;font-weight:600;color:#FBF7EC;text-decoration:none;">
                            Build my appeal →
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
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8A8472;line-height:1.6;">
                BandCheck AI · <a href="https://www.bandcheckai.co.uk" style="color:#8A8472;">bandcheckai.co.uk</a><br />
                You're receiving this because you requested an evidence pack.<br />
                Savings are estimates. Results should be used as a guide only.
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

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Request body is required" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // --- Validate required fields ---
  if (!isString(raw.email) || !isValidEmail(String(raw.email))) {
    return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
  }
  if (!isString(raw.postcode)) {
    return NextResponse.json({ success: false, error: "postcode is required" }, { status: 400 });
  }
  if (!isString(raw.userBand)) {
    return NextResponse.json({ success: false, error: "userBand is required" }, { status: 400 });
  }

  const lead: LeadBody = {
    email: String(raw.email).trim().toLowerCase(),
    postcode: String(raw.postcode).trim().toUpperCase().replace(/\s+/g, ""),
    userBand: String(raw.userBand).trim().toUpperCase().charAt(0),
    draftAppeal: raw.draftAppeal === true || raw.draftAppeal === "true",
    comparables: Array.isArray(raw.comparables)
      ? (raw.comparables as Comparable[]).filter(
          (c) => typeof c === "object" && c !== null && isString(c.address) && isString(c.band),
        )
      : [],
  };

  // --- Log lead (database integration point) ---
  console.log("[lead]", JSON.stringify({ ...lead, ts: new Date().toISOString() }));

  // --- Send confirmation email (best-effort — never blocks the user) ---
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[lead] RESEND_API_KEY not set — email skipped");
    return NextResponse.json({ success: true, emailSent: false });
  }

  const resend = new Resend(apiKey);
  const fromAddress =
    process.env.RESEND_FROM_EMAIL?.trim() || "BandCheck AI <hello@bandcheckai.co.uk>";

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [lead.email],
      subject: `Your BandCheck AI evidence pack — ${formatPostcode(lead.postcode)}`,
      html: buildEmailHtml(lead),
    });

    if (error) {
      // Lead is already captured above — degrade gracefully
      console.error("[lead] Resend error:", error);
      return NextResponse.json({ success: true, emailSent: false });
    }
  } catch (e) {
    console.error("[lead] Resend exception:", e);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
