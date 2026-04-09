/**
 * InfoPanel — Client Component (Phase 3, CTX-03, CTX-04)
 *
 * Painel lateral direito com metadados do item, apresentados de forma editorial.
 * Push layout (flex ao lado do conteúdo, não overlay) — D-14.
 * Toggle via ℹ️ no header + Escape fecha — D-15.
 * D-16: tipo + estado → chips coloridos no topo (maior destaque).
 * Campos ausentes omitidos completamente, sem N/A — D-17.
 * Slot de sidecar reservado vazio em Phase 3, Phase 4 preenche — D-18.
 *
 * Segurança (T-3-03): item.path absoluto nunca chega aqui —
 * apenas topic, group e RawFrontmatter (campos de frontmatter) são recebidos.
 */

"use client";

import { useEffect } from "react";
import type { RawFrontmatter } from "@/lib/pkm/types";

interface InfoPanelProps {
  panelOpen: boolean;
  onClose: () => void;
  frontmatter: RawFrontmatter;
  topic: string;
  group?: string;
}

// ── Formatação de datas em pt-BR (sem date-fns — Intl nativo) ──────────────

function formatDataCaptura(isoDate: string): string {
  // "2026-03-07" → "7 mar. 2026"
  const date = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDataPublicacao(isoPartial: string): string {
  if (/^\d{4}$/.test(isoPartial)) return isoPartial;
  if (/^\d{4}-\d{2}$/.test(isoPartial)) {
    const [year, month] = isoPartial.split("-");
    const date = new Date(`${year}-${month}-01T00:00:00`);
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date);
  }
  return formatDataCaptura(isoPartial);
}

function formatLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Componentes internos ────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function Chip({ children, variant = "neutral" }: {
  children: React.ReactNode;
  variant?: "neutral" | "rascunho" | "finalizado";
}) {
  const colorMap = {
    neutral: "bg-surface-container-high text-on-surface/70",
    rascunho: "bg-surface-container text-on-surface/50",
    finalizado: "bg-primary-container text-on-primary-container",
  };
  return (
    <span className={[
      "inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.05em]",
      colorMap[variant],
    ].join(" ")}>
      {children}
    </span>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

export function InfoPanel({ panelOpen, onClose, frontmatter, topic, group }: InfoPanelProps) {
  // D-15: Escape fecha o painel
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [panelOpen, onClose]);

  if (!panelOpen) return null;

  const topicLabel = topic === "__inbox" ? "Inbox" : formatLabel(topic);
  const groupLabel = group ? formatLabel(group) : undefined;

  return (
    <aside
      className="w-[280px] shrink-0 border-l border-outline-variant/20 overflow-y-auto bg-surface-container-low"
      aria-label="Painel de informações"
      data-testid="info-panel"
    >
      <div className="px-5 py-6 flex flex-col gap-5">
        {/* D-16: tipo + estado — chips coloridos no topo, maior destaque */}
        <FieldRow label="Tipo e Estado">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chip de tipo — exibido quando presente (D-16, D-17: omitir se ausente) */}
            {frontmatter.tipo && (
              <Chip variant="neutral">{frontmatter.tipo}</Chip>
            )}
            {/* Chip de estado — sempre presente (estado é obrigatório) */}
            <Chip variant={frontmatter.estado === "finalizado" ? "finalizado" : "rascunho"}>
              {frontmatter.estado}
            </Chip>
          </div>
        </FieldRow>

        {/* Modelo (D-16: chip neutro) */}
        {frontmatter.modelo && (
          <FieldRow label="Modelo">
            <Chip variant="neutral">{frontmatter.modelo}</Chip>
          </FieldRow>
        )}

        {/* Tópico › grupo (D-16: texto simples) */}
        <FieldRow label="Localização">
          <span className="text-[0.875rem] text-on-surface/70">
            {topicLabel}
            {groupLabel && (
              <> <span aria-hidden="true">›</span> {groupLabel}</>
            )}
          </span>
        </FieldRow>

        {/* Data de captura (D-16: formatada "7 mar. 2026") */}
        {frontmatter.data_captura && (
          <FieldRow label="Capturado em">
            <span className="text-[0.875rem] text-on-surface/70">
              {formatDataCaptura(frontmatter.data_captura)}
            </span>
          </FieldRow>
        )}

        {/* Data de publicação (D-17: omitir se ausente) */}
        {frontmatter.data_publicacao && (
          <FieldRow label="Publicado em">
            <span className="text-[0.875rem] text-on-surface/70">
              {formatDataPublicacao(frontmatter.data_publicacao)}
            </span>
          </FieldRow>
        )}

        {/* URL — apenas para itens url_ (D-17: omitir se ausente) */}
        {frontmatter.url && (
          <FieldRow label="URL">
            <a
              href={frontmatter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.875rem] text-tertiary hover:underline break-all"
              data-testid="info-panel-url"
            >
              {frontmatter.url}
            </a>
          </FieldRow>
        )}

        {/* Autores (D-17: omitir se ausente) */}
        {frontmatter.autores && frontmatter.autores.length > 0 && (
          <FieldRow label="Autores">
            <div className="flex flex-wrap gap-1.5">
              {frontmatter.autores.map((autor) => (
                <Chip key={autor} variant="neutral">{autor}</Chip>
              ))}
            </div>
          </FieldRow>
        )}

        {/* D-18: Slot reservado para texto de sidecar — vazio em Phase 3 */}
        <div data-slot="sidecar-content-phase4" aria-hidden="true" />
      </div>
    </aside>
  );
}
