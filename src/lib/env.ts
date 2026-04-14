import path from "path";
import { z } from "zod";

// Zod 4: usa a função `error` para definir mensagens em pt-BR para campos ausentes (invalid_type)
const envSchema = z.object({
  PKM_PATH: z
    .string({ error: (iss) => (iss.input === undefined ? "PKM_PATH é obrigatório" : undefined) })
    .min(1, "PKM_PATH é obrigatório")
    .refine(path.isAbsolute, "PKM_PATH deve ser um caminho absoluto"),
  INDEX_PATH: z
    .string()
    .min(1, "INDEX_PATH não pode ser vazio")
    .refine(path.isAbsolute, "INDEX_PATH deve ser um caminho absoluto")
    .optional(),
  APP_ROOT_PATH: z
    .string()
    .min(1, "APP_ROOT_PATH não pode ser vazio")
    .refine(path.isAbsolute, "APP_ROOT_PATH deve ser um caminho absoluto")
    .optional(),
  AUTH_USERNAME: z
    .string({ error: (iss) => (iss.input === undefined ? "AUTH_USERNAME é obrigatório" : undefined) })
    .min(1, "AUTH_USERNAME é obrigatório"),
  AUTH_PASSWORD: z
    .string({ error: (iss) => (iss.input === undefined ? "AUTH_PASSWORD é obrigatório" : undefined) })
    .min(8, "AUTH_PASSWORD deve ter pelo menos 8 caracteres"),
  NEXTAUTH_SECRET: z
    .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_SECRET é obrigatório" : undefined) })
    .min(32, "NEXTAUTH_SECRET deve ter pelo menos 32 caracteres"),
  NEXTAUTH_URL: z
    .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_URL é obrigatório" : undefined) })
    .url("NEXTAUTH_URL deve ser uma URL válida"),
}).superRefine((data, ctx) => {
  if (process.env.NODE_ENV === "production" && !data.INDEX_PATH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["INDEX_PATH"],
      message: "INDEX_PATH é obrigatório em produção",
    });
  }
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n❌ Variáveis de ambiente inválidas ou ausentes:\n\n${issues}\n`
    );
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
