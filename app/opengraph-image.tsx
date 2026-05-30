import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BandCheck AI — Check if you're overpaying council tax";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F4EFE5",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#14120D", letterSpacing: -0.5 }}>
            BandCheck
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#C8431C", marginLeft: 6 }}>
            · AI
          </span>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "rgba(200,67,28,0.12)",
              borderRadius: 8,
              padding: "6px 14px",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#C8431C", letterSpacing: 1, textTransform: "uppercase" }}>
              UK Council Tax
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                fontSize: 64,
                fontWeight: 400,
                color: "#14120D",
                lineHeight: 1.1,
                letterSpacing: -2,
              }}
            >
              You might be in the{" "}
              <span style={{ color: "#C8431C", fontStyle: "italic" }}>wrong</span>
              {" "}band.
            </span>
            <span style={{ fontSize: 24, color: "#4A4435", lineHeight: 1.5, maxWidth: 680 }}>
              1 in 3 UK homes overpay council tax. Check yours against nearby
              comparable properties in seconds — free, no upfront cost.
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 40 }}>
          {[
            { v: "400k+", l: "homes checked" },
            { v: "£3,124", l: "avg. refund" },
            { v: "30 sec", l: "to check" },
            { v: "Free", l: "no win, no fee" },
          ].map(({ v, l }) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#14120D" }}>{v}</span>
              <span style={{ fontSize: 14, color: "#8A8472", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.6 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
