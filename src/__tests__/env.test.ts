/**
 * Testes de validação de env vars — Phase 1
 * RUN-01: validação fail-fast de vars obrigatórias via Zod
 */
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

describe("env validation", () => {
  // Salvar env original antes de cada teste
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restaurar env original
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
    vi.resetModules();
  });

  test("RUN-01: chama process.exit(1) com mensagem clara quando PKM_PATH está ausente", async () => {
    delete process.env.PKM_PATH;
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
    process.env.NEXTAUTH_URL = "http://localhost:3000";

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

  test("RUN-01: parse bem-sucedido quando todas as 5 vars obrigatórias estão presentes", async () => {
    process.env.PKM_PATH = "/home/user/pkm";
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpassword123";
    process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012"; // 32 chars
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    const { env } = await import("../lib/env");

    expect(env).toMatchObject({
      PKM_PATH: "/home/user/pkm",
      AUTH_USERNAME: "testuser",
      AUTH_PASSWORD: "testpassword123",
      NEXTAUTH_SECRET: "12345678901234567890123456789012",
      NEXTAUTH_URL: "http://localhost:3000",
    });
  });
});
