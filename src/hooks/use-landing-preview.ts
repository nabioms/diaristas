import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_PREVIEW,
  type LandingPreviewConfig,
  loadLandingPreview,
} from "@/lib/nabio/landing-preview";

// Cache em memória para evitar recarregar a cada navegação. Invalidado
// automaticamente quando o admin salva (ver `invalidateLandingPreview`).
let cached: LandingPreviewConfig | null = null;
const listeners = new Set<(c: LandingPreviewConfig) => void>();

export function invalidateLandingPreview(next?: LandingPreviewConfig) {
  cached = next ?? null;
  if (next) listeners.forEach((l) => l(next));
}

/** Carrega a configuração da prévia da landing page (com fallback ao padrão). */
export function useLandingPreview() {
  const [config, setConfig] = useState<LandingPreviewConfig>(cached ?? DEFAULT_PREVIEW);
  const [loading, setLoading] = useState(cached === null);

  const refresh = useCallback(() => {
    let active = true;
    setLoading(true);
    void loadLandingPreview()
      .then((next) => {
        cached = next;
        if (active) setConfig(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const stop = refresh();
    listeners.add(setConfig);
    return () => {
      stop();
      listeners.delete(setConfig);
    };
  }, [refresh]);

  return { config, loading, refresh };
}
