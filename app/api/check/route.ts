import { NextRequest, NextResponse } from "next/server";
import { getCheckAnalysisForPostcode } from "@/lib/checkAnalysis";

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { error: "postcode is required" },
      { status: 400 },
    );
  }

  const postcodeRaw = (body as { postcode?: unknown }).postcode;
  if (
    postcodeRaw === undefined ||
    postcodeRaw === null ||
    String(postcodeRaw).trim() === ""
  ) {
    return NextResponse.json(
      { error: "postcode is required" },
      { status: 400 },
    );
  }

  const postcode = normalizePostcode(String(postcodeRaw));
  const houseNumberRaw = (body as { houseNumber?: unknown }).houseNumber;
  const houseNumber =
    houseNumberRaw !== undefined && houseNumberRaw !== null && String(houseNumberRaw).trim() !== ""
      ? String(houseNumberRaw).trim()
      : undefined;

  const result = await getCheckAnalysisForPostcode(postcode, houseNumber);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data);
}
