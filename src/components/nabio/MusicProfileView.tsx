import { BadgeCheck, Instagram, Link as LinkIcon, Mail, MessageCircle, Pause, Play, Plus, Share2, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type CSSProperties } from "react";

import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { useMediaUrl } from "@/hooks/use-media";
import { useSpotifyPlayer } from "@/hooks/use-spotify-player";
import { getTheme } from "@/lib/nabio/themes";
import { parseSpotify } from "@/lib/nabio/spotify";
import type { LinkType, ProfileLink, UserProfile } from "@/lib/nabio/types";

const SOCIAL_TYPES: LinkType[] = ["instagram", "youtube", "whatsapp", "email"];

const SOCIAL_ICONS: Partial<Record<LinkType, typeof LinkIcon>> = {
  instagram: Instagram,
  youtube: Youtube,
  whatsapp: MessageCircle,
  email: Mail,
};

function SpotifyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115.293.18.386.563.207.857Zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.688-1.652-6.786-2.13-9.965-1.166a.78.78 0 1 1-.452-1.492c3.63-1.1 8.145-.567 11.232 1.33a.78.78 0 0 1 .257 1.071Zm.105-2.835c-3.223-1.914-8.54-2.09-11.617-1.156a.935.935 0 1 1-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 1 1-.955 1.608Z" />
    </svg>
  );
}

function socialHref(link: ProfileLink) {
  switch (link.type) {
    case "whatsapp":
      return `https://wa.me/${link.value.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${link.value}`;
    default:
      return link.value.startsWith("http") ? link.value : `https://${link.value}`;
  }
}

interface Props {
  user: UserProfile;
  links: ProfileLink[];
  compact?: boolean;
  onLinkClick?: (link: ProfileLink) => void;
  onShare?: () => void;
}

export function MusicProfileView({ user, links, compact, onLinkClick, onShare }: Props) {
  const theme = getTheme("music");
  const player = useSpotifyPlayer();
  const avatarUrl = useMediaUrl(user.avatarUrl);
  const backgroundUrl = useMediaUrl(user.backgroundUrl);

  const tracks = links.filter((l) => l.type === "spotify");
  const socials = links.filter((l) => SOCIAL_TYPES.includes(l.type));
  const others = links.filter((l) => l.type !== "spotify" && !SOCIAL_TYPES.includes(l.type));

  const containerStyle: CSSProperties = {
    background: theme.pageBackground,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${compact ? "min-h-full" : "min-h-[100dvh]"}`}
      style={containerStyle}
    >
      {/* Capa */}
      <div className={`absolute inset-x-0 top-0 ${compact ? "h-56" : "h-[22rem]"}`}>
        {user.backgroundVideoUrl ? (
          <TrimmedVideo
            value={user.backgroundVideoUrl}
            className="h-full w-full object-cover"
            style={{ pointerEvents: "none" }}
          />
        ) : backgroundUrl ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
            aria-hidden
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: "linear-gradient(160deg, #1db954 0%, #0f3d2a 60%, #0a0a0b 100%)" }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0" style={{ background: theme.overlay }} aria-hidden />
      </div>

      <div
        className={`relative z-10 mx-auto flex w-full max-w-md flex-col ${
          compact ? "gap-3 px-4 pb-6" : "gap-5 px-5 pb-12"
        }`}
      >
        <div className={`flex justify-end ${compact ? "pt-3" : "pt-6"}`}>
          <button
            type="button"
            onClick={onShare}
            aria-label="Compartilhar página"
            className="rounded-full bg-black/30 p-2 backdrop-blur transition-opacity hover:opacity-70"
            style={{ color: theme.textColor }}
          >
            <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className={`overflow-hidden rounded-full ring-2 ${compact ? "h-20 w-20" : "h-32 w-32"}`}
            style={{ boxShadow: "0 18px 40px -20px rgba(0,0,0,0.9)", borderColor: "rgba(255,255,255,0.7)" }}
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
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {user.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className={`flex items-center justify-center gap-1.5 ${compact ? "mt-2" : "mt-4"}`}>
            <h1
              className={`font-semibold tracking-tight ${compact ? "text-lg" : "text-3xl"}`}
              style={{ color: theme.textColor }}
            >
              @{user.username}
            </h1>
            {user.plan === "pro" && (
              <BadgeCheck
                className={compact ? "h-4 w-4" : "h-6 w-6"}
                style={{ color: "#3897f0" }}
                aria-label="Perfil verificado"
              />
            )}
          </div>

          {user.bio && (
            <p
              className={`break-words ${compact ? "mt-1 text-[11px]" : "mt-2 text-base"}`}
              style={{ color: theme.mutedColor, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {user.bio}
            </p>
          )}

          {user.counterValue && (
            <p
              className={`font-medium ${compact ? "mt-1 text-[10px]" : "mt-2 text-sm"}`}
              style={{ color: theme.accentColor }}
            >
              {user.counterValue} {user.counterLabel}
            </p>
          )}

          {socials.length > 0 && (
            <div className={`flex items-center justify-center gap-3 ${compact ? "mt-2" : "mt-4"}`}>
              {socials.map((link) => {
                const Icon = SOCIAL_ICONS[link.type] ?? LinkIcon;
                return (
                  <a
                    key={link.id}
                    href={socialHref(link)}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={link.title}
                    onClick={() => onLinkClick?.(link)}
                    className="rounded-full bg-white/10 p-2.5 transition-transform hover:scale-110"
                    style={{ color: theme.textColor }}
                  >
                    <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Cards de música */}
        <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
          {tracks.map((link) => {
            const meta = parseSpotify(link.value);
            const isPlaying = player.currentId === link.id && player.isPlaying;
            return (
              <div
                key={link.id}
                className={`backdrop-blur transition-transform ${compact ? "p-2" : "p-3"}`}
                style={{
                  background: theme.button.background,
                  border: theme.button.border,
                  borderRadius: theme.button.radius,
                  boxShadow: theme.button.shadow,
                  color: theme.textColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 overflow-hidden rounded-lg ${compact ? "h-11 w-11" : "h-16 w-16"}`}
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    {link.thumbnail && (
                      <img src={link.thumbnail} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-semibold ${compact ? "text-[11px]" : "text-base"}`}
                    >
                      {link.title}
                    </span>
                    <span
                      className={`block truncate ${compact ? "text-[9px]" : "text-sm"}`}
                      style={{ color: theme.mutedColor }}
                    >
                      {meta.artist || user.displayName}
                    </span>
                    {meta.preview && (
                      <span
                        className={`mt-1 inline-block rounded-md px-2 py-0.5 font-medium ${
                          compact ? "text-[8px]" : "text-[11px]"
                        }`}
                        style={{ background: "rgba(255,255,255,0.16)" }}
                      >
                        Prévia
                      </span>
                    )}
                  </span>

                  <span className={`flex items-center ${compact ? "gap-1.5" : "gap-2.5"}`}>
                    <SpotifyGlyph className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
                    <a
                      href={meta.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Abrir ${link.title} no Spotify`}
                      onClick={() => onLinkClick?.(link)}
                      className="flex items-center justify-center transition-transform hover:scale-110"
                      style={{ color: theme.mutedColor }}
                    >
                      <Plus className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
                    </a>
                    <button
                      type="button"
                      aria-label={isPlaying ? `Pausar ${link.title}` : `Ouvir ${link.title}`}
                      onClick={() => {
                        void player.toggle(link.id, meta.url);
                        onLinkClick?.(link);
                      }}
                      className={`flex items-center justify-center rounded-full transition-transform hover:scale-105 ${
                        compact ? "h-6 w-6" : "h-10 w-10"
                      }`}
                      style={{ background: "#ffffff", color: "#0a0a0b" }}
                    >
                      {isPlaying ? (
                        <Pause className={compact ? "h-3 w-3" : "h-4 w-4"} fill="currentColor" />
                      ) : (
                        <Play className={compact ? "h-3 w-3" : "h-4 w-4"} fill="currentColor" />
                      )}
                    </button>
                  </span>
                </div>

              </div>
            );
          })}

          {others.map((link) => (
            <a
              key={link.id}
              href={link.value.startsWith("http") ? link.value : `https://${link.value}`}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => onLinkClick?.(link)}
              className={`flex items-center justify-center font-medium transition-transform hover:scale-[1.01] ${
                compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-sm"
              }`}
              style={{
                background: theme.button.background,
                border: theme.button.border,
                borderRadius: theme.button.radius,
                color: theme.textColor,
              }}
            >
              {link.title}
            </a>
          ))}

          {links.length === 0 && (
            <p className="py-8 text-center text-xs" style={{ color: theme.mutedColor }}>
              Nenhuma música publicada ainda.
            </p>
          )}
        </div>

        <Link
          to="/"
          className={`flex items-center justify-center gap-1 transition-opacity hover:opacity-70 hover:underline ${compact ? "mt-3 text-[9px]" : "mt-6 text-xs"}`}
          style={{ color: theme.mutedColor }}
        >
          Feito com Na Bio
        </Link>
      </div>
    </div>
  );
}
