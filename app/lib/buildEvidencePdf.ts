import PDFDocument from "pdfkit";

export type EvidencePackInput = {
  postcode: string;
  userBand: string;
  likelyBand?: string;
  currentAnnual?: number;
  reducedAnnual?: number;
  annualSaving?: number;
  backdatedRefund?: number;
  totalOwed?: number;
  score?: number;
  strength?: string;
  lowerCount?: number;
  totalProperties?: number;
  comparables: Array<{ address: string; band: string }>;
  email: string;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

function fmtPostcode(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  return c.replace(/(.{3})$/, " $1");
}

function strengthLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Weak";
}

// ─── colours ──────────────────────────────────────────────────────────────────

const INK = "#14120D";
const MUTED = "#8A8472";
const FOREST = "#0F5C3E";
const RUST = "#C8431C";
const CREAM = "#FBF7EC";
const SAND = "#F4EFE5";
const RULE = "#EAE3D2";

// ─── layout constants ─────────────────────────────────────────────────────────

const MARGIN = 48;
const PAGE_W = 595; // A4 points
const INNER = PAGE_W - MARGIN * 2;

// ─── PDF generator ────────────────────────────────────────────────────────────

export function buildEvidencePdfBuffer(input: EvidencePackInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, compress: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const formatted = fmtPostcode(input.postcode);
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // ── Page header ──────────────────────────────────────────────────────────
    doc.fontSize(18).font("Helvetica-Bold").fillColor(INK).text("BandCheck", MARGIN, MARGIN, {
      continued: true,
    });
    doc.fillColor(RUST).text("AI");

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(MUTED)
      .text(`Evidence Pack · ${formatted}  ·  ${date}`, MARGIN, MARGIN + 6, {
        align: "right",
        width: INNER,
      });

    // Divider
    doc
      .moveTo(MARGIN, MARGIN + 28)
      .lineTo(MARGIN + INNER, MARGIN + 28)
      .lineWidth(1.5)
      .strokeColor(INK)
      .stroke();

    let y = MARGIN + 44;

    // ── Property section ─────────────────────────────────────────────────────
    y = sectionCard(doc, y, "PROPERTY", () => {
      const bandChange = input.likelyBand && input.likelyBand !== input.userBand;

      // Band badge
      doc
        .roundedRect(MARGIN + 16, doc.y, 44, 44, 8)
        .fillColor(RUST)
        .fill();
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(CREAM)
        .text(input.userBand, MARGIN + 16, doc.y, {
          width: 44,
          align: "center",
        });

      const badgeY = doc.y - 44;
      doc
        .fontSize(18)
        .font("Helvetica-Oblique")
        .fillColor(INK)
        .text(formatted, MARGIN + 72, badgeY + 4, {
          width: INNER - 88,
        });
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(MUTED)
        .text(
          `Band ${input.userBand}${bandChange ? ` → likely Band ${input.likelyBand}` : ""}`,
          MARGIN + 72,
          badgeY + 26,
        );

      doc.moveDown(0.5);

      // Cost row
      if (input.currentAnnual) {
        const boxW = bandChange && input.reducedAnnual ? (INNER - 16) / 2 : INNER - 16;
        costBox(doc, MARGIN + 8, fmt(input.currentAnnual), `Current (Band ${input.userBand})`, boxW, INK);
        if (bandChange && input.reducedAnnual) {
          costBox(
            doc,
            MARGIN + 8 + boxW + 8,
            fmt(input.reducedAnnual),
            `If Band ${input.likelyBand}`,
            boxW,
            FOREST,
          );
        }
        doc.moveDown(0.5);
      }
    });

    // ── Case strength ─────────────────────────────────────────────────────────
    if (input.score !== undefined) {
      y = sectionCard(doc, y, "CASE STRENGTH", () => {
        const score = input.score!;
        const label = strengthLabel(score);
        const sColor = score >= 70 ? FOREST : score >= 40 ? RUST : MUTED;

        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .fillColor(sColor)
          .text(`${label} Case`, { continued: true });
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor(MUTED)
          .text(`   ${score}/100`);

        // Bar track
        const barX = MARGIN + 8;
        const barY = doc.y + 4;
        const barH = 7;
        const barFull = INNER - 16;
        doc.roundedRect(barX, barY, barFull, barH, 3).fillColor(RULE).fill();
        doc
          .roundedRect(barX, barY, Math.round((score / 100) * barFull), barH, 3)
          .fillColor(sColor)
          .fill();

        doc.moveDown(0.9);
        if (input.lowerCount !== undefined && input.totalProperties !== undefined) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor(MUTED)
            .text(
              `${input.lowerCount} of ${input.totalProperties} nearby properties are in a lower band.`,
            );
        }
        doc.moveDown(0.3);
      });
    }

    // ── Savings ───────────────────────────────────────────────────────────────
    if (input.annualSaving && input.annualSaving > 0) {
      y = sectionCard(doc, y, "ESTIMATED SAVINGS", () => {
        const third = (INNER - 24) / 3;
        savingBox(doc, MARGIN + 8, fmt(input.annualSaving!), "per year", third);
        savingBox(doc, MARGIN + 8 + third + 8, fmt(input.backdatedRefund ?? 0), "backdated refund", third);
        savingBox(doc, MARGIN + 8 + (third + 8) * 2, fmt(input.totalOwed ?? 0), "total owed", third);
        doc.moveDown(0.5);
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(MUTED)
          .text("Figures are estimates. Actual amounts depend on your local authority rates.", {
            width: INNER - 16,
          });
        doc.moveDown(0.3);
      });
    }

    // ── Comparable properties ─────────────────────────────────────────────────
    y = sectionCard(
      doc,
      y,
      `COMPARABLE PROPERTIES (${input.comparables.length})`,
      () => {
        if (input.comparables.length === 0) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor(MUTED)
            .text("No comparable properties found for this postcode.", { align: "center" });
          doc.moveDown(0.5);
          return;
        }

        const colW = [INNER - 100, 56, 56];
        // Header row
        tableRow(doc, ["Address", "Band", "Evidence"], colW, SAND, 9, true);
        input.comparables.forEach((c, i) => {
          const isLower = c.band < input.userBand;
          tableRow(
            doc,
            [c.address, `Band ${c.band}`, isLower ? "✓ Match" : "—"],
            colW,
            i % 2 === 0 ? "#FFFFFF" : SAND,
            10,
            false,
            isLower ? FOREST : undefined,
          );
        });
        doc.moveDown(0.4);
      },
      true, // may need new page
    );

    // ── Draft appeal letter ───────────────────────────────────────────────────
    if (doc.y > 580) doc.addPage();

    y = sectionCard(doc, doc.y + 8, "DRAFT APPEAL LETTER", () => {
      const letter = buildDraftLetter(input);
      doc.fontSize(10).font("Helvetica").fillColor(INK).text(letter, { lineGap: 3 });
      doc.moveDown(0.5);
      doc
        .moveTo(MARGIN + 8, doc.y)
        .lineTo(MARGIN + INNER - 8, doc.y)
        .lineWidth(0.5)
        .dash(3, { space: 3 })
        .strokeColor(RULE)
        .stroke()
        .undash();
      doc.moveDown(0.4);
      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(MUTED)
        .text("Generated by BandCheck AI · Review before submitting · bandcheckai.co.uk");
      doc.moveDown(0.3);
    });

    // ── Page footer ──────────────────────────────────────────────────────────
    const footerY = doc.page.height - MARGIN;
    doc
      .fontSize(8.5)
      .font("Helvetica")
      .fillColor(MUTED)
      .text("BandCheck AI · bandcheckai.co.uk", MARGIN, footerY, { continued: true })
      .text("  Submit at gov.uk/challenge-council-tax-band", { align: "right", width: INNER });

    doc.end();
  });
}

// ─── layout helpers ───────────────────────────────────────────────────────────

function sectionCard(
  doc: PDFKit.PDFDocument,
  y: number,
  label: string,
  draw: () => void,
  mayNeedPage = false,
): number {
  if (mayNeedPage && doc.y > 500) {
    doc.addPage();
    y = MARGIN;
  }

  const startY = y + 4;
  doc.y = startY;

  // Label
  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(MUTED)
    .text(label, MARGIN + 8, doc.y, { characterSpacing: 0.8 });
  doc.moveDown(0.55);

  draw();

  const endY = doc.y + 8;

  // Card border
  doc
    .roundedRect(MARGIN, startY - 8, INNER, endY - startY + 8, 10)
    .lineWidth(0.75)
    .strokeColor(RULE)
    .stroke();

  doc.y = endY + 12;
  return doc.y;
}

function costBox(
  doc: PDFKit.PDFDocument,
  x: number,
  value: string,
  label: string,
  width: number,
  valueColor: string,
) {
  const startY = doc.y;
  doc
    .roundedRect(x, startY, width, 48, 6)
    .fillColor("#FFFFFF")
    .fill();
  doc
    .roundedRect(x, startY, width, 48, 6)
    .lineWidth(0.5)
    .strokeColor(RULE)
    .stroke();
  doc
    .fontSize(15)
    .font("Helvetica-Bold")
    .fillColor(valueColor)
    .text(value, x, startY + 8, { width, align: "center" });
  doc
    .fontSize(8.5)
    .font("Helvetica")
    .fillColor(MUTED)
    .text(label, x, startY + 28, { width, align: "center" });
}

function savingBox(
  doc: PDFKit.PDFDocument,
  x: number,
  value: string,
  label: string,
  width: number,
) {
  const startY = doc.y;
  doc
    .roundedRect(x, startY, width, 52, 6)
    .fillColor("rgba(15, 92, 62, 0.06)")
    .fill();
  doc
    .fontSize(15)
    .font("Helvetica-Bold")
    .fillColor(FOREST)
    .text(value, x, startY + 8, { width, align: "center" });
  doc
    .fontSize(8.5)
    .font("Helvetica")
    .fillColor(MUTED)
    .text(label, x, startY + 30, { width, align: "center" });
}

function tableRow(
  doc: PDFKit.PDFDocument,
  cols: string[],
  widths: number[],
  bg: string,
  fontSize: number,
  bold: boolean,
  accentColor?: string,
) {
  const rowH = 22;
  const x0 = MARGIN + 8;
  let x = x0;
  const y = doc.y;

  // Background
  doc
    .rect(MARGIN + 8, y, INNER - 16, rowH)
    .fillColor(bg)
    .fill();

  cols.forEach((text, i) => {
    const align = i === 0 ? "left" : "center";
    doc
      .fontSize(fontSize)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(accentColor && i > 0 ? accentColor : bold ? MUTED : INK)
      .text(text, x, y + 6, { width: widths[i], align });
    x += widths[i];
  });

  doc
    .moveTo(MARGIN + 8, y + rowH)
    .lineTo(MARGIN + INNER - 8, y + rowH)
    .lineWidth(0.4)
    .strokeColor(RULE)
    .stroke();

  doc.y = y + rowH;
}

// ─── draft letter ─────────────────────────────────────────────────────────────

function buildDraftLetter(input: EvidencePackInput): string {
  const formatted = fmtPostcode(input.postcode);
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lowerComps = input.comparables.filter((c) => c.band < input.userBand);
  const compLines =
    lowerComps.length > 0
      ? lowerComps.map((c) => `  • ${c.address} — Band ${c.band}`).join("\n")
      : "  [Comparable property details to be inserted]";
  const targetBand =
    input.likelyBand && input.likelyBand !== input.userBand
      ? input.likelyBand
      : "[lower band]";

  return `To the Valuation Officer,
Valuation Office Agency

${date}

Re: Challenge to Council Tax Band — ${formatted}

Dear Valuation Officer,

I am writing to formally challenge the council tax band assigned to my property at ${formatted}, which is currently recorded as Band ${input.userBand}.

Following a review of comparable properties in my area, I believe this banding is incorrect and that my property should be placed in Band ${targetBand}.

GROUNDS FOR APPEAL

The following comparable properties, located within close proximity to my home and of similar size, type and value, are currently banded lower than my property:

${compLines}

These properties are similar in construction, size and market value to my own, yet attract a lower council tax liability. This disparity suggests that my property has been incorrectly assessed.

REQUESTED OUTCOME

I respectfully request that the Valuation Office Agency review the council tax band assigned to ${formatted} and, where appropriate, reduce it to Band ${targetBand}.

I am happy to provide any further information required to support this challenge.

Yours faithfully,

[Your full name]
[Your address]
[Your phone number]
[Your email address]`;
}
