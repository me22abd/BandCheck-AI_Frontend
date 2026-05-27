import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistMono, GeistSans } from "geist/font";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bandcheck ai",
    template: "%s | Bandcheck ai",
  },
  description:
    "Check if you may be overpaying council tax and build a stronger appeal case in minutes.",
  metadataBase: new URL("https://www.bandcheckai.co.uk"),
  openGraph: {
    title: "Bandcheck ai",
    description:
      "Check if you may be overpaying council tax and build a stronger appeal case in minutes.",
    type: "website",
    siteName: "Bandcheck ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bandcheck ai",
    description:
      "Check if you may be overpaying council tax and build a stronger appeal case in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <div className="animate-page-enter flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
