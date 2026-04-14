import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("release workflow contract", () => {
  it("runs only on push of release tags", () => {
    const workflow = readRepoFile(".github/workflows/release-ghcr.yml");

    expect(workflow).toContain("push:");
    expect(workflow).toContain("tags: ['v*.*.*']");
  });

  it("uses ubuntu runner with minimal package publication permissions", () => {
    const workflow = readRepoFile(".github/workflows/release-ghcr.yml");

    expect(workflow).toContain("runs-on: ubuntu-latest");
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("packages: write");
  });

  it("publishes the canonical GHCR image with release and latest tags", () => {
    const workflow = readRepoFile(".github/workflows/release-ghcr.yml");

    expect(workflow).toContain("ghcr.io/henricos/ai-pkm");
    expect(workflow).toContain("ghcr.io/henricos/ai-pkm:${{ env.RELEASE_TAG }}");
    expect(workflow).toContain("ghcr.io/henricos/ai-pkm:latest");
    expect(workflow).toContain("docker/login-action");
    expect(workflow).toContain("docker/build-push-action");
  });

  it("enforces main ancestry, package version parity, and OCI labels", () => {
    const workflow = readRepoFile(".github/workflows/release-ghcr.yml");

    expect(workflow).toContain("git merge-base --is-ancestor \"$GITHUB_SHA\" origin/main");
    expect(workflow).toContain("GITHUB_REF_NAME#v");
    expect(workflow).toContain("require('./package.json').version");
    expect(workflow).toContain("org.opencontainers.image.version");
    expect(workflow).toContain("org.opencontainers.image.revision");
    expect(workflow).toContain("org.opencontainers.image.source");
  });
});
