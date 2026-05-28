import { NextRequest, NextResponse } from "next/server";
import { getCheckAnalysisForPostcode } from "@/lib/checkAnalysis";
import { calculateCaseStrengthScore } from "@/lib/scoring";
import { fireAndForget } from "@/lib/db";

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

  // Store check result in DB (fire-and-forget — never slows down the response)
  const { district, userBand, bandSource, isEstimated, nearbyProperties } = result.data;
  const { score } = calculateCaseStrengthScore(userBand, nearbyProperties);
  fireAndForget(
    `INSERT INTO postcode_checks
       (postcode, district, user_band, band_source, is_estimated, case_strength, nearby_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [postcode, district, userBand, bandSource, isEstimated, score, nearbyProperties.length],
  );

  return NextResponse.json(result.data);
}
