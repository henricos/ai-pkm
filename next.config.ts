import type { NextConfig } from "next";
import { execSync } from "child_process";

let gitHash = "dev";
try {
  gitHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // sem git disponível (ex: build em container sem histórico)
}

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
};

export default nextConfig;
