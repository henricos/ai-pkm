import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("release traceability contract", () => {
  it("keeps the app version in full semver format inside package.json", () => {
    const packageJson = readRepoFile("package.json");

    expect(packageJson).toMatch(/"version"\s*:\s*"\d+\.\d+\.\d+"/);
  });

  it("exposes public app version and git hash through next.config env", () => {
    const nextConfig = readRepoFile("next.config.ts");

    expect(nextConfig).toContain("NEXT_PUBLIC_APP_VERSION");
    expect(nextConfig).toContain("NEXT_PUBLIC_GIT_HASH");
    expect(nextConfig).toMatch(/env\s*:\s*\{[\s\S]*NEXT_PUBLIC_APP_VERSION[\s\S]*NEXT_PUBLIC_GIT_HASH[\s\S]*\}/);
  });

  it("renders app version and git hash in the login footer", () => {
    const loginPage = readRepoFile("src/app/(auth)/login/page.tsx");

    expect(loginPage).toContain("NEXT_PUBLIC_APP_VERSION");
    expect(loginPage).toContain("NEXT_PUBLIC_GIT_HASH");
    expect(loginPage).toContain("const appVersion = process.env.NEXT_PUBLIC_APP_VERSION");
    expect(loginPage).toContain("v{appVersion}");
    expect(loginPage).toContain("·");
  });

  it("accepts explicit release metadata args in the docker build", () => {
    const dockerfile = readRepoFile("Dockerfile");

    expect(dockerfile).toContain("ARG APP_VERSION");
    expect(dockerfile).toContain("ARG NEXT_PUBLIC_GIT_HASH");
  });
});
