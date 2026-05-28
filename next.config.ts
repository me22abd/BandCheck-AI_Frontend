import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  // Keep pdfkit out of Next.js's bundle entirely so it is loaded from
  // node_modules at runtime. pdfkit uses __dirname to locate its .afm font
  // files; if Next.js inlines the module those relative paths break and PDF
  // generation silently fails (email arrives with no attachment).
  serverExternalPackages: ["pdfkit"],

  // Belt-and-suspenders: also tell the file tracer to copy the data files
  // so they exist alongside the function on Vercel.
  outputFileTracingIncludes: {
    "/api/lead": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

export default nextConfig;
