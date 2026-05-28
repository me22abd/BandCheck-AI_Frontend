type ExpoPrintModule = typeof import("expo-print");
type ExpoSharingModule = typeof import("expo-sharing");

export type PdfPackInput = {
  postcode: string;
  userBand: string;
  likelyBand: string;
  currentAnnual: number;
  reducedAnnual: number;
  annualSaving: number;
  backdatedRefund: number;
  totalOwed: number;
  score: number;
  strength: string;
  lowerCount: number;
  totalProperties: number;
  comparables: Array<{ address: string; band: string; distanceMiles?: number }>;
  propertyType: string;
  ownership: string;
  extensions: string;
  email: string;
};

function fmt(n: number): string {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

function fmtPostcode(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  return c.replace(/(.{3})$/, " $1");
}

function strengthColor(score: number): string {
  if (score >= 70) return "#0F5C3E";
  if (score >= 40) return "#C8431C";
  return "#8A8472";
}

function strengthLabel(score: number, strength: string): string {
  const map: Record<string, string> = { strong: "Strong", moderate: "Moderate", weak: "Weak" };
  return map[strength] ?? strength;
}

export function buildPdfHtml(input: PdfPackInput): string {
  const formatted = fmtPostcode(input.postcode);
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const barWidth = Math.round(input.score);
  const sColor = strengthColor(input.score);
  const sLabel = strengthLabel(input.score, input.strength);
  const hasSaving = input.annualSaving > 0;
  const bandChange = input.likelyBand !== input.userBand;

  const comparableRows = input.comparables
    .map(
      (c, i) => `
      <tr style="background:${i % 2 === 0 ? "#FFFFFF" : "#F9F6F0"};">
        <td style="padding:9px 14px;font-size:12px;color:#14120D;border-bottom:1px solid #EAE3D2;">${c.address}</td>
        <td style="padding:9px 14px;font-size:12px;text-align:center;border-bottom:1px solid #EAE3D2;">
          <span style="display:inline-block;background:${
            parseInt(c.band, 36) < parseInt(input.userBand, 36) ? "#0F5C3E" : "#4A4435"
          };color:#FBF7EC;font-weight:700;font-size:11px;padding:3px 10px;border-radius:5px;">${c.band}</span>
        </td>
        <td style="padding:9px 14px;font-size:12px;text-align:center;color:${
          c.band < input.userBand ? "#0F5C3E" : "#8A8472"
        };font-weight:600;border-bottom:1px solid #EAE3D2;">${
          c.band < input.userBand ? "✓ Match" : "—"
        }</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BandCheck AI — Evidence Pack — ${formatted}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #F4EFE5;
      color: #14120D;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .page { max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px solid #14120D; }
    .wordmark { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; }
    .wordmark span { color: #C8431C; }
    .header-meta { font-size: 11px; color: #8A8472; text-align: right; }
    .section { background: #FBF7EC; border-radius: 12px; border: 1px solid #EAE3D2; padding: 20px 22px; margin-bottom: 16px; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #8A8472; margin-bottom: 12px; }
    .hero-row { display: flex; align-items: center; gap: 16px; }
    .band-badge { width: 52px; height: 52px; border-radius: 10px; background: #C8431C; color: #FBF7EC; font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .band-badge-forest { background: #0F5C3E; }
    .hero-info h1 { font-size: 24px; font-weight: 400; letter-spacing: -0.5px; font-style: italic; }
    .hero-info p { font-size: 12px; color: #4A4435; margin-top: 3px; }
    .cost-grid { display: flex; gap: 0; border: 1px solid #EAE3D2; border-radius: 10px; overflow: hidden; margin-top: 14px; }
    .cost-cell { flex: 1; padding: 12px 14px; text-align: center; background: #FFFFFF; }
    .cost-cell + .cost-cell { border-left: 1px solid #EAE3D2; }
    .cost-val { font-size: 20px; font-weight: 600; }
    .cost-val.forest { color: #0F5C3E; }
    .cost-lbl { font-size: 10px; color: #8A8472; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .savings-grid { display: flex; gap: 12px; margin-top: 14px; }
    .saving-box { flex: 1; background: rgba(15,92,62,0.06); border-radius: 8px; padding: 12px; text-align: center; }
    .saving-val { font-size: 18px; font-weight: 700; color: #0F5C3E; }
    .saving-lbl { font-size: 10px; color: #4A4435; margin-top: 3px; }
    .strength-bar-bg { height: 8px; background: rgba(20,18,13,0.10); border-radius: 4px; overflow: hidden; margin: 10px 0 6px; }
    .strength-bar-fill { height: 100%; border-radius: 4px; }
    .strength-row { display: flex; justify-content: space-between; align-items: center; }
    .strength-label { font-size: 13px; font-weight: 600; }
    .strength-score { font-size: 12px; color: #8A8472; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 9px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #8A8472; background: #F4EFE5; text-align: left; border-bottom: 1px solid #EAE3D2; }
    th:not(:first-child) { text-align: center; }
    .letter-body { font-size: 12.5px; line-height: 1.7; color: #14120D; white-space: pre-wrap; }
    .letter-meta { font-size: 10px; color: #8A8472; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #EAE3D2; }
    .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #EAE3D2; display: flex; justify-content: space-between; font-size: 10px; color: #8A8472; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="wordmark">BandCheck<span>AI</span></div>
    <div class="header-meta">
      Evidence Pack · ${formatted}<br/>
      Generated ${date}
      ${input.email ? `<br/>${input.email}` : ""}
    </div>
  </div>

  <!-- Property -->
  <div class="section">
    <div class="section-label">Property</div>
    <div class="hero-row">
      <div class="band-badge">${input.userBand}</div>
      <div class="hero-info">
        <h1>${formatted}</h1>
        <p>Council Tax Band ${input.userBand}${bandChange ? ` → likely Band ${input.likelyBand}` : ""} · ${input.propertyType} · ${input.ownership}</p>
      </div>
    </div>
    <div class="cost-grid">
      <div class="cost-cell">
        <div class="cost-val">${fmt(input.currentAnnual)}</div>
        <div class="cost-lbl">Current (Band ${input.userBand})</div>
      </div>
      ${bandChange ? `
      <div class="cost-cell">
        <div class="cost-val forest">${fmt(input.reducedAnnual)}</div>
        <div class="cost-lbl">If reduced to Band ${input.likelyBand}</div>
      </div>` : ""}
    </div>
  </div>

  <!-- Case strength -->
  <div class="section">
    <div class="section-label">Case Strength</div>
    <div class="strength-row">
      <span class="strength-label" style="color:${sColor};">${sLabel} Case</span>
      <span class="strength-score">${input.score}/100</span>
    </div>
    <div class="strength-bar-bg">
      <div class="strength-bar-fill" style="width:${barWidth}%;background:${sColor};"></div>
    </div>
    <p style="font-size:12px;color:#4A4435;">${input.lowerCount} of ${input.totalProperties} comparable properties sit in a lower band than yours.</p>
  </div>

  ${hasSaving ? `
  <!-- Savings -->
  <div class="section">
    <div class="section-label">Estimated Savings</div>
    <div class="savings-grid">
      <div class="saving-box">
        <div class="saving-val">${fmt(input.annualSaving)}</div>
        <div class="saving-lbl">Per year</div>
      </div>
      <div class="saving-box">
        <div class="saving-val">${fmt(input.backdatedRefund)}</div>
        <div class="saving-lbl">Backdated refund</div>
      </div>
      <div class="saving-box">
        <div class="saving-val">${fmt(input.totalOwed)}</div>
        <div class="saving-lbl">Total owed</div>
      </div>
    </div>
    <p style="font-size:10px;color:#8A8472;margin-top:10px;">Figures are estimates based on average band reductions and your local authority's rates.</p>
  </div>` : ""}

  <!-- Comparable properties -->
  <div class="section">
    <div class="section-label">Comparable Properties (${input.comparables.length})</div>
    <table>
      <thead>
        <tr>
          <th>Address</th>
          <th>Band</th>
          <th>Evidence</th>
        </tr>
      </thead>
      <tbody>
        ${comparableRows || `<tr><td colspan="3" style="padding:14px;text-align:center;color:#8A8472;font-size:12px;">No comparable properties found for this postcode.</td></tr>`}
      </tbody>
    </table>
  </div>

  <!-- Draft appeal letter -->
  <div class="section page-break">
    <div class="section-label">Draft Appeal Letter</div>
    <div class="letter-body">${buildDraftLetter(input)}</div>
    <div class="letter-meta">Generated by BandCheck AI · Review before submitting · bandcheckai.co.uk</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>BandCheck AI · bandcheckai.co.uk</span>
    <span>Submit at gov.uk/challenge-council-tax-band</span>
  </div>

</div>
</body>
</html>`;
}

function buildDraftLetter(input: PdfPackInput): string {
  const formatted = fmtPostcode(input.postcode);
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const comparableLines = input.comparables
    .filter((c) => c.band < input.userBand)
    .map((c) => `  • ${c.address} — Band ${c.band}`)
    .join("\n");

  return `To the Valuation Officer,
Valuation Office Agency

${date}

Re: Challenge to Council Tax Band — ${formatted}

Dear Valuation Officer,

I am writing to formally challenge the council tax band assigned to my property at ${formatted}, which is currently recorded as Band ${input.userBand}.

Following a review of comparable properties in my area, I believe this banding is incorrect and that my property should be placed in Band ${input.likelyBand !== input.userBand ? input.likelyBand : "[lower band]"}.

GROUNDS FOR APPEAL

The following comparable properties, located within close proximity to my home and of similar size, type and value, are currently banded lower than my property:

${comparableLines || "  [Comparable property details to be inserted]"}

These properties are similar in construction, size and market value to my own, yet attract a lower council tax liability. This disparity suggests that my property has been incorrectly assessed.

SUPPORTING EVIDENCE

I have attached the following evidence in support of this appeal:
  • Comparable properties table generated from Land Registry and VOA data
  • Council tax band analysis prepared by BandCheck AI
  ${input.propertyType ? `• Property type: ${input.propertyType}` : ""}
  ${input.ownership ? `• Occupancy status: ${input.ownership}` : ""}
  ${input.extensions === "no" ? "• No structural extensions or material improvements since 1993" : ""}

REQUESTED OUTCOME

I respectfully request that the Valuation Office Agency review the council tax band assigned to ${formatted} and, where appropriate, reduce it to Band ${input.likelyBand !== input.userBand ? input.likelyBand : "[lower band]"}.

I am happy to provide any further information required to support this challenge.

Yours faithfully,

[Your full name]
[Your address]
[Your phone number]
[Your email address]`;
}

export async function generateAndSharePdf(input: PdfPackInput): Promise<void> {
  // Lazy-load native modules so the app can run in Expo Go / environments
  // where expo-print isn't bundled. If unavailable, we throw a friendly error
  // that the UI can surface.
  let Print: ExpoPrintModule;
  let Sharing: ExpoSharingModule;
  try {
    Print = await import("expo-print");
    Sharing = await import("expo-sharing");
  } catch {
    throw new Error(
      "PDF export isn't available in this build. Install the app via a Development Build (expo-dev-client / EAS) to enable PDF generation.",
    );
  }

  const html = buildPdfHtml(input);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    await Print.printAsync({ uri });
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `BandCheck AI — Evidence Pack — ${fmtPostcode(input.postcode)}`,
    UTI: "com.adobe.pdf",
  });
}
