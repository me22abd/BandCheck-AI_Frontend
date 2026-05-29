import { NextRequest, NextResponse } from "next/server";
import { fireAndForget, migrate } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postcode, first_name, area, feedback, refund_amount } = body;

    if (!postcode || !first_name || !feedback) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (feedback.length > 500) {
      return NextResponse.json({ error: "Feedback too long" }, { status: 400 });
    }

    await migrate();

    fireAndForget(
      `INSERT INTO testimonials (postcode, first_name, area, feedback, refund_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        postcode.toUpperCase().replace(/\s+/g, " ").trim(),
        first_name.trim().substring(0, 50),
        area?.trim().substring(0, 100) ?? null,
        feedback.trim(),
        refund_amount ?? null,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonial] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  );
}
