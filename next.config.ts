import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export"
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
