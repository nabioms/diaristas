import { useMemo } from "react";

import { resolveMediaUrl } from "@/lib/nabio/media";

/** Resolve uma referência de mídia (upload no Storage ou URL externa) para uso na UI. */
export function useMediaUrl(ref?: string | null): string | null {
  return useMemo(() => resolveMediaUrl(ref), [ref]);
}
