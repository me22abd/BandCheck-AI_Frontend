import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function isString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // Honeypot — bots fill hidden fields
  if (isString(raw.company)) {
    return NextResponse.json({ success: true });
  }

  if (!isString(raw.name) || raw.name.trim().length < 2) {
    return NextResponse.json({ success: false, error: "Please enter your name" }, { status: 400 });
  }
  if (!isString(raw.email) || !isValidEmail(raw.email)) {
    return NextResponse.json({ success: false, error: "A valid email is required" }, { status: 400 });
  }
  if (!isString(raw.message) || raw.message.trim().length < 10) {
    return NextResponse.json(
      { success: false, error: "Please enter a message (at least 10 characters)" },
      { status: 400 },
    );
  }

  const name = raw.name.trim();
  const email = raw.email.trim().toLowerCase();
  const message = raw.message.trim();

  console.log("[contact]", JSON.stringify({ name, email, message: message.slice(0, 80), ts: new Date().toISOString() }));

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY not set — message logged only");
    return NextResponse.json({ success: true, emailSent: false });
  }

  const resend = new Resend(apiKey);
  const fromAddress =
    process.env.RESEND_FROM_EMAIL?.trim() || "BandCheck AI <hello@bandcheckai.co.uk>";
  const toAddress = process.env.CONTACT_TO_EMAIL?.trim() || "hello@bandcheckai.co.uk";

  const html = `
    <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;line-height:1.6;">${message.replace(/</g, "&lt;")}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: email,
      subject: `BandCheck AI contact — ${name}`,
      html,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json({ success: false, error: "Could not send message" }, { status: 500 });
    }
  } catch (err) {
    console.error("[contact] Resend exception:", err);
    return NextResponse.json({ success: false, error: "Could not send message" }, { status: 500 });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
