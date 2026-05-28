import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // pdfkit reads .afm font metric files from node_modules at runtime.
  // Without this, Vercel's file-tracer omits them and the PDF generation
  // crashes silently, so the email arrives with no attachment.
  outputFileTracingIncludes: {
    "/api/lead": [
      "./node_modules/pdfkit/js/data/**/*",
      "./node_modules/pdfkit/js/**/*.js",
    ],
  },
};

export default nextConfig;
