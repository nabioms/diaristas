// Card grande de "link em destaque" do modelo Creator.
// Cada plataforma tem seu próprio visual, registrado em HIGHLIGHTS.
// Para adicionar um novo tipo de destaque no futuro, basta acrescentar
// uma entrada nesse mapa — o restante da página não muda.

import {
  Music2,
  Instagram,
  MessageCircle,
  Music4,
  Play,
  Youtube,
  ExternalLink,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

import { PLATFORMS, handleFromUrl, subscribeUrl, type PlatformId } from "@/lib/nabio/platforms";
import type { NaBioTheme } from "@/lib/nabio/themes";
import type { ProfileLink } from "@/lib/nabio/types";

interface HighlightProps {
  link: ProfileLink;
  platformId: PlatformId;
  href: string;
  theme: NaBioTheme;
  compact?: boolean | undefined;
  avatarUrl?: string | null | undefined;
  displayName: string;
  bio?: string | undefined;
  onLinkClick?: ((link: ProfileLink) => void) | undefined;
}

type HighlightSpec = {
  icon: ComponentType<{ className?: string }>;
  /** rótulo do botão principal */
  primary: string;
  /** rótulo do botão secundário */
  secondary: string;
  /** monta o link do botão principal (ex.: inscrição no YouTube) */
  primaryHref?: (href: string) => string;
};

const HIGHLIGHTS: Partial<Record<PlatformId, HighlightSpec>> = {
  youtube: {
    icon: Youtube,
    primary: "Inscrever-se",
    secondary: "Ver canal",
    primaryHref: subscribeUrl,
  },
  instagram: { icon: Instagram, primary: "Seguir", secondary: "Ver perfil" },
  tiktok: { icon: Music4, primary: "Seguir", secondary: "Ver perfil" },
  spotify: { icon: Music2, primary: "Ouvir agora", secondary: "Abrir no Spotify" },
  whatsapp: { icon: MessageCircle, primary: "Falar comigo", secondary: "Abrir conversa" },
};

const FALLBACK: HighlightSpec = { icon: Play, primary: "Acessar", secondary: "Abrir link" };

export function CreatorHighlightCard({
  link,
  platformId,
  href,
  theme,
  compact,
  avatarUrl,
  displayName,
  bio,
  onLinkClick,
}: HighlightProps) {
  const platform = PLATFORMS[platformId];
  const spec = HIGHLIGHTS[platformId] ?? FALLBACK;
  const Icon = spec.icon;
  const handle = platform.handle ? handleFromUrl(link.value) : null;
  const primaryHref = spec.primaryHref ? spec.primaryHref(href) : href;

  const cover = link.thumbnail;
  const cardStyle: CSSProperties = {
    background: theme.button.background,
    border: theme.button.border,
    color: theme.button.color,
    borderRadius: compact ? "16px" : "26px",
    boxShadow: theme.button.shadow,
    backdropFilter: "blur(14px)",
  };

  return (
    <section
      className={`relative w-full overflow-hidden ${compact ? "" : ""}`}
      style={cardStyle}
      aria-label={`Destaque: ${platform.label}`}
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: compact ? 3 : 5, background: platform.brand }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 10% 0%, ${platform.brand.startsWith("#") ? `${platform.brand}33` : "rgba(255,255,255,0.10)"} 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      {cover && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => onLinkClick?.(link)}
          className="relative block w-full overflow-hidden"
          style={{ aspectRatio: "16 / 9" }}
        >
          <img src={cover} alt="" className="h-full w-full object-cover" />
        </a>
      )}

      <div className={`relative ${compact ? "space-y-2 p-3" : "space-y-4 p-6"}`}>
        <div className={`flex items-center ${compact ? "gap-2" : "gap-4"}`}>
          <span
            className={`flex shrink-0 items-center justify-center overflow-hidden ${
              compact ? "h-9 w-9 rounded-xl" : "h-16 w-16 rounded-2xl"
            }`}
            style={{ background: platform.brand, color: platform.onBrand }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon className={compact ? "h-4 w-4" : "h-7 w-7"} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`flex items-center gap-1.5 font-semibold uppercase tracking-widest ${
                compact ? "text-[7px]" : "text-[10px]"
              }`}
              style={{ color: theme.mutedColor }}
            >
              <Icon className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
              {platform.label}
            </p>
            <p
              className={`truncate font-bold tracking-tight ${compact ? "text-sm" : "text-2xl"}`}
            >
              {link.title || displayName}
            </p>
            {handle && (
              <p
                className={`truncate ${compact ? "text-[8px]" : "text-sm"}`}
                style={{ color: theme.accentColor }}
              >
                @{handle}
              </p>
            )}
          </div>
        </div>

        {bio && !compact && (
          <p
            className="line-clamp-2 text-sm leading-relaxed"
            style={{ color: theme.mutedColor }}
          >
            {bio}
          </p>
        )}

        <div className={`flex items-center ${compact ? "gap-1.5" : "gap-3"}`}>
          <a
            href={primaryHref}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => onLinkClick?.(link)}
            className={`flex flex-1 items-center justify-center font-bold transition-transform hover:scale-[1.02] ${
              compact ? "rounded-full px-2 py-1.5 text-[9px]" : "rounded-full px-5 py-3.5 text-sm"
            }`}
            style={{ background: platform.brand, color: platform.onBrand }}
          >
            {spec.primary}
          </a>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => onLinkClick?.(link)}
            className={`flex items-center justify-center gap-1.5 font-semibold transition-opacity hover:opacity-80 ${
              compact ? "rounded-full px-2 py-1.5 text-[9px]" : "rounded-full px-4 py-3.5 text-sm"
            }`}
            style={{ border: theme.button.border, color: theme.textColor }}
          >
            {spec.secondary}
            <ExternalLink className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
          </a>
        </div>
      </div>
    </section>
  );
}
