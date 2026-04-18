import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("fs");

describe("runtime paths", () => {
  const originalEnv = { ...process.env };
  const originalCwd = process.cwd();

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
    vi.unstubAllEnvs();
    process.chdir(originalCwd);
  });

  test("PKG-02: usa INDEX_PATH explícito quando configurado", async () => {
    process.env.PKM_PATH = "/data/pkm";
    process.env.INDEX_PATH = "/data/index";
    process.env.APP_BASE_PATH = "/pkm";
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
    process.env.NEXTAUTH_URL = "https://host/pkm";

    const { getRuntimePaths } = await import("../lib/runtime-paths");
    const runtimePaths = getRuntimePaths();

    expect(runtimePaths.pkmRoot).toBe("/data/pkm");
    expect(runtimePaths.indexRoot).toBe("/data/index");
  });

  test("PKG-01: em dev usa fallback previsível para index dentro da raiz versionada", async () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.PKM_PATH = "/data/pkm";
    process.env.APP_BASE_PATH = "/pkm";
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
    process.env.NEXTAUTH_URL = "https://host/pkm";

    const { getRuntimePaths } = await import("../lib/runtime-paths");
    const runtimePaths = getRuntimePaths();

    expect(runtimePaths.indexRoot).toBe(`${runtimePaths.appRoot}/index`);
    expect(runtimePaths.modelsDir).toBe(`${runtimePaths.appRoot}/models`);
    expect(runtimePaths.referenceDir).toBe(`${runtimePaths.appRoot}/reference`);
  });

  test("PKG-02: falha cedo em produção quando INDEX_PATH não foi configurado", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.PKM_PATH = "/data/pkm";
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");

    exitSpy.mockRestore();
  });
});
