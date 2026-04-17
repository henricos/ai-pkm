import { describe, expect, test } from "vitest";

import { normalizeBasePath, withBasePath } from "../lib/base-path";

describe("base path helpers", () => {
  test("CFG-03: normaliza /pkm sem alterar o valor canônico", () => {
    expect(normalizeBasePath("/pkm")).toBe("/pkm");
  });

  test("CFG-03: normaliza /pkm/ removendo a barra final", () => {
    expect(normalizeBasePath("/pkm/")).toBe("/pkm");
  });

  test("CFG-03: compõe a raiz da aplicação com o prefixo configurado", () => {
    expect(withBasePath("/", "/pkm")).toBe("/pkm");
  });

  test("CFG-03: compõe paths internos com o prefixo configurado", () => {
    expect(withBasePath("/login", "/pkm")).toBe("/pkm/login");
    expect(withBasePath("/library/item-1", "/pkm")).toBe("/pkm/library/item-1");
  });

  test("CFG-03: rejeita entradas inválidas com erro claro em pt-BR", () => {
    expect(() => normalizeBasePath("pkm")).toThrow('APP_BASE_PATH inválido: o valor deve começar com "/". Exemplo: "/pkm".');
    expect(() => normalizeBasePath("/pkm//viewer")).toThrow("APP_BASE_PATH inválido: não use barras duplicadas.");
    expect(() => withBasePath("login", "/pkm")).toThrow('pathname inválido: o path interno deve começar com "/".');
  });
});
