// Modelo "Creator": página completa para influencers e criadores de conteúdo.
// Cada link cadastrado vira automaticamente um bloco com a identidade visual
// da plataforma detectada (src/lib/nabio/platforms.ts). Todo o conteúdo vem
// do perfil do usuário — nada é fixado aqui.

import {
  AtSign,
  Camera,
  Download,
  Facebook,
  Globe,
  Headphones,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Music4,
  Send,
  Share2,
  ShoppingBag,
  Twitch,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CSSProperties, ComponentType } from "react";

import { CreatorHighlightCard } from "@/components/nabio/CreatorHighlightCard";
import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { useMediaUrl } from "@/hooks/use-media";
import { PLATFORMS, detectPlatform, handleFromUrl, type PlatformId } from "@/lib/nabio/platforms";
import { getTheme } from "@/lib/nabio/themes";
import type { ProfileLink, UserProfile } from "@/lib/nabio/types";

type IconType = ComponentType<{ className?: string }>;

const PLATFORM_ICON: Record<PlatformId, IconType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music4,
  whatsapp: MessageCircle,
  spotify: Music2,
  amazonmusic: Headphones,
  applemusic: Music2,
  facebook: Facebook,
  x: Twitter,
  telegram: Send,
  linkedin: Linkedin,
  twitch: Twitch,
  pinterest: Camera,
  threads: AtSign,
  discord: MessageCircle,
  email: Mail,
  pix: ShoppingBag,
  file: Download,
  website: Globe,
};

/** Redes que aparecem como ícone na linha logo abaixo da bio. */
const SOCIAL_ROW: PlatformId[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "x",
  "threads",
  "twitch",
  "spotify",
  "applemusic",
  "amazonmusic",
  "pinterest",
  "linkedin",
  "telegram",
  "discord",
];

interface Props {
  user: UserProfile;
  links: ProfileLink[];
  compact?: boolean;
  onLinkClick?: (link: ProfileLink) => void;
  onShare?: () => void;
  resolveHref: (link: ProfileLink) => string;
}

export function CreatorProfileView({
  user,
  links,
  compact,
  onLinkClick,
  onShare,
  resolveHref,
}: Props) {
  const theme = getTheme(user.themeId);
  const avatarUrl = useMediaUrl(user.avatarUrl);
  const backgroundUrl = useMediaUrl(user.backgroundUrl);

  const items = links.map((link) => {
    const platformId = detectPlatform(link);
    return {
      link,
      platformId,
      platform: PLATFORMS[platformId],
      href: resolveHref(link),
    };
  });

  // Um único link em destaque: o escolhido pelo usuário ou, na falta dele, o primeiro.
  const highlight = items.find((item) => item.link.id === user.featuredLinkId) ?? items[0] ?? null;
  const secondary = items.filter((item) => item.link.id !== highlight?.link.id);

  const socials = items.filter((item) => SOCIAL_ROW.includes(item.platformId));
  const seen = new Set<PlatformId>();
  const socialIcons = socials.filter((item) => {
    if (seen.has(item.platformId)) return false;
    seen.add(item.platformId);
    return true;
  });

  const containerStyle: CSSProperties = {
    background: theme.pageBackground,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
  };

  const layer = compact ? "absolute inset-0" : "fixed inset-0 h-[100dvh] w-screen";

  return (
    <div
      className={`relative w-full ${compact ? "min-h-full overflow-hidden" : "min-h-[100dvh]"}`}
      style={containerStyle}
    >
      {user.backgroundVideoUrl ? (
        <TrimmedVideo
          value={user.backgroundVideoUrl}
          className={`${layer} object-cover ${compact ? "h-full w-full" : ""}`}
          style={{ filter: "blur(10px)", zIndex: 0, pointerEvents: "none" }}
        />
      ) : (
        backgroundUrl && (
          <div
            className={`${layer} bg-cover bg-center`}
            style={{ backgroundImage: `url(${backgroundUrl})`, filter: "blur(14px)", zIndex: 0 }}
            aria-hidden
          />
        )
      )}
      <div className={layer} style={{ background: theme.overlay, zIndex: 0 }} aria-hidden />
      <div
        className={layer}
        style={{
          background: `radial-gradient(120% 60% at 50% 0%, ${theme.accentColor}22 0%, transparent 65%)`,
          zIndex: 0,
        }}
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto flex w-full flex-col ${
          compact
            ? "min-h-full max-w-md gap-3 px-4 py-5"
            : "min-h-[100dvh] max-w-xl gap-6 px-5 py-8 sm:px-8 sm:py-12"
        }`}
      >
        <div className={`flex w-full flex-col ${compact ? "gap-3" : "flex-1 gap-6"}`}>
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={onShare}
              aria-label="Compartilhar página"
              className="rounded-full p-2 transition-transform hover:scale-105"
              style={{ border: theme.button.border, color: theme.accentColor }}
            >
              <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </button>
          </div>

          {/* Identidade */}
          <header className="flex flex-col items-center text-center">
            <div
              className={`overflow-hidden rounded-full ${compact ? "h-16 w-16" : "h-28 w-28"}`}
              style={{
                border: `3px solid ${theme.accentColor}`,
                boxShadow: `0 20px 45px -25px ${theme.accentColor}`,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Foto de perfil de ${user.displayName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-2xl font-semibold"
                  style={{ background: "rgba(127,127,127,0.25)" }}
                >
                  {(user.displayName || user.username).slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <h1
              className={`font-semibold tracking-tight ${compact ? "mt-2 text-base" : "mt-4 text-3xl"}`}
            >
              {user.displayName || `@${user.username}`}
            </h1>
            <p
              className={`font-medium ${compact ? "text-[10px]" : "mt-1 text-sm"}`}
              style={{ color: theme.accentColor }}
            >
              @{user.username}
            </p>
            {user.bio && (
              <p
                className={`break-words ${compact ? "mt-1 text-[10px]" : "mt-3 max-w-md text-sm leading-relaxed"}`}
                style={{ color: theme.mutedColor, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {user.bio}
              </p>
            )}
            {user.counterValue && (
              <p
                className={`font-semibold ${compact ? "mt-1 text-[10px]" : "mt-3 text-sm"}`}
                style={{ color: theme.textColor }}
              >
                {user.counterValue}{" "}
                <span style={{ color: theme.mutedColor }}>{user.counterLabel}</span>
              </p>
            )}

            {socialIcons.length > 0 && (
              <nav
                className={`flex flex-wrap items-center justify-center ${compact ? "mt-2 gap-1.5" : "mt-5 gap-2.5"}`}
                aria-label="Redes sociais"
              >
                {socialIcons.map(({ link, platform, platformId, href }) => {
                  const Icon = PLATFORM_ICON[platformId];
                  return (
                    <a
                      key={link.id}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() => onLinkClick?.(link)}
                      aria-label={platform.label}
                      title={platform.label}
                      className={`flex items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 ${
                        compact ? "h-6 w-6" : "h-10 w-10"
                      }`}
                      style={{
                        background: platform.brand,
                        color: platform.onBrand,
                        boxShadow: "0 14px 28px -20px rgba(0,0,0,0.85)",
                      }}
                    >
                      <Icon className={compact ? "h-3 w-3" : "h-[18px] w-[18px]"} />
                    </a>
                  );
                })}
              </nav>
            )}
          </header>

          {/* Link em destaque */}
          {highlight && (
            <CreatorHighlightCard
              link={highlight.link}
              platformId={highlight.platformId}
              href={highlight.href}
              theme={theme}
              compact={compact}
              avatarUrl={avatarUrl}
              displayName={user.displayName || user.username}
              bio={user.bio}
              onLinkClick={onLinkClick}
            />
          )}

          {/* Demais links, em blocos compactos */}
          <div className={`flex w-full flex-col ${compact ? "gap-1.5" : "gap-2.5"}`}>
            {secondary.map(({ link, platform, platformId, href }) => {
              const Icon = PLATFORM_ICON[platformId];
              const handle = platform.handle ? handleFromUrl(link.value) : null;
              return (
                <a
                  key={link.id}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => onLinkClick?.(link)}
                  className={`group flex items-center transition-all hover:-translate-y-0.5 ${
                    compact ? "gap-2 px-2 py-1.5" : "gap-3 px-4 py-3"
                  }`}
                  style={{
                    background: theme.button.background,
                    border: theme.button.border,
                    color: theme.button.color,
                    borderRadius: compact ? "10px" : "14px",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    className={`flex shrink-0 items-center justify-center overflow-hidden ${
                      compact ? "h-5 w-5 rounded-md" : "h-9 w-9 rounded-xl"
                    }`}
                    style={{ background: platform.brand, color: platform.onBrand }}
                  >
                    <Icon className={compact ? "h-2.5 w-2.5" : "h-4 w-4"} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span
                      className={`block truncate font-medium ${compact ? "text-[9px]" : "text-sm"}`}
                    >
                      {link.title || platform.label}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 truncate ${compact ? "text-[8px]" : "text-xs"}`}
                    style={{ color: theme.mutedColor }}
                  >
                    {handle ? `@${handle}` : platform.cta}
                  </span>
                </a>
              );
            })}

            {items.length === 0 && (
              <p className="py-8 text-center text-xs" style={{ color: theme.mutedColor }}>
                Nenhum link publicado ainda.
              </p>
            )}
          </div>

        </div>

        <Link
          to="/"
          className={`flex items-center justify-center gap-1 transition-opacity hover:opacity-70 hover:underline ${
            compact ? "mt-3 text-[9px]" : "mt-auto pt-4 text-xs"
          }`}
          style={{ color: theme.mutedColor }}
        >
          Feito com Na Bio
        </Link>
      </div>
    </div>
  );
}
