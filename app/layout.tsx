import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BandCheck AI",
    template: "%s | BandCheck AI",
  },
  description:
    "Check if you may be overpaying council tax and build a stronger appeal case in minutes.",
  metadataBase: new URL("https://bandcheck-ai-frontend.vercel.app"),
  openGraph: {
    title: "BandCheck AI",
    description:
      "Check if you may be overpaying council tax and build a stronger appeal case in minutes.",
    type: "website",
    siteName: "BandCheck AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "BandCheck AI",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-gray-50 text-gray-900">
        <div className="animate-page-enter flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
