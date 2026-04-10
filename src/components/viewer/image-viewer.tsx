/**
 * ImageViewer — Client Component (Phase 4, VIEW-04, D-01, D-02, D-03, D-03b)
 *
 * Viewer leve de imagem com controles mínimos de zoom/reset.
 * O asset é o protagonista — sem chrome pesado nem pan livre.
 *
 * D-01: imagem centralizada sem texto competindo
 * D-03: controles de zoom limitados a in/out/reset — sem toolbar rica
 * D-03b: unsupported-format não aparece para imagem
 */

"use client";

import { useState } from "react";

interface ImageViewerProps {
  src: string;
  alt?: string;
}

export function ImageViewer({ src, alt = "" }: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-h-[60vh] w-full">
      {/* Área de visualização — container com overflow para acomodar zoom */}
      <div className="flex-1 flex items-center justify-center w-full overflow-auto">
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${scale})`, transformOrigin: "center top" }}
          className="object-contain max-w-full transition-transform duration-200"
          data-testid="image-asset"
        />
      </div>

      {/* Controles mínimos — zoom in/out/reset apenas (D-03) */}
      <div className="flex items-center gap-1 bg-surface-container rounded-full px-3 py-1.5 shadow-sm shrink-0">
        <button
          onClick={() => setScale((s) => Math.max(s - 0.25, 0.25))}
          data-testid="zoom-out"
          className="px-3 py-1 text-sm text-on-surface/70 hover:text-on-surface transition-colors rounded-full hover:bg-surface-container-high"
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <button
          onClick={() => setScale(1)}
          data-testid="zoom-reset"
          className="px-3 py-1 text-xs text-on-surface/50 hover:text-on-surface transition-colors rounded-full hover:bg-surface-container-high"
          aria-label="Redefinir zoom"
        >
          1:1
        </button>
        <button
          onClick={() => setScale((s) => Math.min(s + 0.25, 4))}
          data-testid="zoom-in"
          className="px-3 py-1 text-sm text-on-surface/70 hover:text-on-surface transition-colors rounded-full hover:bg-surface-container-high"
          aria-label="Aumentar zoom"
        >
          +
        </button>
      </div>
    </div>
  );
}
