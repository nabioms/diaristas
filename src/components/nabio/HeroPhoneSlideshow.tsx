import { useEffect, useState } from "react";

import { LandingPreviewPhone } from "@/components/nabio/LandingPreviewPhone";
import { PublicProfileView } from "@/components/nabio/PublicProfileView";
import type { LandingPreviewConfig } from "@/lib/nabio/landing-preview";
import { loadFeaturedProfilesWithLinks } from "@/lib/nabio/store";
import type { ProfileLink, UserProfile } from "@/lib/nabio/types";

const INTERVAL_MS = 10_000;
const FADE_MS = 500;

/**
 * Conteúdo do celular do Hero: alterna automaticamente entre os perfis
 * selecionados pelo administrador. Sem perfis selecionados, mantém a prévia
 * padrão configurável.
 */
export function HeroPhoneSlideshow({ config }: { config: LandingPreviewConfig }) {
  const [items, setItems] = useState<{ user: UserProfile; links: ProfileLink[] }[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    void loadFeaturedProfilesWithLinks().then((list) => {
      if (active) setItems(list);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const current = items[Math.min(index, items.length - 1)];

  return (
    <div
      className="h-full w-full transition-opacity duration-500 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {current ? (
        <PublicProfileView user={current.user} links={current.links} compact />
      ) : (
        <LandingPreviewPhone config={config} />
      )}
    </div>
  );
}
