import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  description: "Check if you may be overpaying council tax",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-gray-50 text-gray-900">
        <div className="animate-page-enter min-h-screen">{children}</div>
      </body>
    </html>
  );
}
