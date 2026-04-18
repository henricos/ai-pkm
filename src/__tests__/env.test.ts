/**
 * Testes de validação de env vars — Phase 1 / Phase 12
 * RUN-01: validação fail-fast de vars obrigatórias via Zod
 * TST-01: contrato de ambiente — 4 casos requeridos cobertos abaixo (ENV-01, ENV-02, ENV-03, RUN-01)
 */
import { describe, test, expect, afterEach, vi } from "vitest";

describe("env validation", () => {
  // Salvar env original antes de cada teste
  const originalEnv = { ...process.env };

  function setRequiredEnv(overrides: Partial<NodeJS.ProcessEnv> = {}) {
    process.env.PKM_PATH = "/home/user/pkm";
    process.env.APP_BASE_PATH = "/pkm";
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
    process.env.NEXTAUTH_URL = "https://host/pkm";

    Object.assign(process.env, overrides);
  }

  afterEach(() => {
    // Restaurar env original
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  test("RUN-01: chama process.exit(1) com mensagem clara quando PKM_PATH está ausente", async () => {
    setRequiredEnv();
    delete process.env.PKM_PATH;

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("PKM_PATH");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("RUN-01: parse bem-sucedido quando todas as vars obrigatórias estão presentes e sincronizadas", async () => { // TST-01
    setRequiredEnv();

    const { env } = await import("../lib/env");

    expect(env).toMatchObject({
      PKM_PATH: "/home/user/pkm",
      APP_BASE_PATH: "/pkm",
      AUTH_USERNAME: "testuser",
      AUTH_PASSWORD: "testpassword123",
      NEXTAUTH_SECRET: "12345678901234567890123456789012",
      NEXTAUTH_URL: "https://host/pkm",
    });
  });

  test("PKG-02: INDEX_PATH passa a integrar o contrato quando configurado", async () => {
    setRequiredEnv();
    process.env.INDEX_PATH = "/home/user/index";

    const { env } = await import("../lib/env");

    expect(env.INDEX_PATH).toBe("/home/user/index");
  });

  test("PKG-02: produção falha cedo quando INDEX_PATH está ausente", async () => {
    vi.stubEnv("NODE_ENV", "production");
    setRequiredEnv();
    delete process.env.INDEX_PATH;

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("INDEX_PATH");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("ENV-01: falha cedo quando APP_BASE_PATH está ausente", async () => { // TST-01
    setRequiredEnv();
    delete process.env.APP_BASE_PATH;

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("APP_BASE_PATH");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("ENV-02: falha cedo quando NEXTAUTH_URL está ausente", async () => { // TST-01
    setRequiredEnv();
    delete process.env.NEXTAUTH_URL;

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("NEXTAUTH_URL");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("ENV-03: falha cedo quando NEXTAUTH_URL diverge do APP_BASE_PATH", async () => { // TST-01
    setRequiredEnv({ NEXTAUTH_URL: "https://host/outro-path" });

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../lib/env")).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.join()).toContain("APP_BASE_PATH=/pkm");
    expect(errorSpy.mock.calls.join()).toContain("https://host/pkm");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
