import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

// This repo lives under a parent folder that also has package-lock.json; Next would
// infer the wrong root for output file tracing. Pin tracing to this project directory.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
