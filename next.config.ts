import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";

const appVersion =
  process.env.APP_VERSION ?? process.env.npm_package_version ?? packageJson.version;

let gitHash = "dev";
try {
  gitHash =
    process.env.NEXT_PUBLIC_GIT_HASH ??
    execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // sem git disponível (ex: build em container sem histórico)
  gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? "dev";
}

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
};

export default nextConfig;
