// Renderizador genérico dos MODELOS profissionais.
// A estrutura vem do modelo (src/lib/nabio/templates.ts) e o conteúdo vem
// sempre do perfil do usuário — nenhum texto de exemplo é exibido aqui.

import {
  AtSign,
  Download,
  Instagram,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Music,
  QrCode,
  Share2,
  Youtube,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { useMediaUrl } from "@/hooks/use-media";
import { parseSpotify } from "@/lib/nabio/spotify";
import type { NaBioTemplate } from "@/lib/nabio/templates";
import type { LinkType, ProfileLink, UserProfile } from "@/lib/nabio/types";

const ICONS: Record<LinkType, typeof LinkIcon> = {
  url: LinkIcon,
  whatsapp: MessageCircle,
  instagram: Instagram,
  youtube: Youtube,
  pix: AtSign,
  email: Mail,
  file: Download,
  spotify: Music,
};

const SOCIAL_TYPES: LinkType[] = ["instagram", "youtube", "whatsapp", "email", "spotify"];

function href(link: ProfileLink) {
  switch (link.type) {
    case "whatsapp":
      return `https://wa.me/${link.value.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${link.value}`;
    case "spotify":
      return parseSpotify(link.value).url;
    case "pix":
      return `#pix-${link.value}`;
    default:
      return link.value.startsWith("http") ? link.value : `https://${link.value}`;
  }
}

interface Props {
  template: NaBioTemplate;
  user: UserProfile;
  links: ProfileLink[];
  compact?: boolean;
  onLinkClick?: (link: ProfileLink) => void;
  onShare?: () => void;
}

export function TemplateProfileView({
  template,
  user,
  links,
  compact,
  onLinkClick,
  onShare,
}: Props) {
  const { theme, layout } = template;
  const avatarUrl = useMediaUrl(user.avatarUrl);
  const backgroundUrl = useMediaUrl(user.backgroundUrl);
  const coverUrl = backgroundUrl ?? avatarUrl;

  const socials = links.filter((l) => SOCIAL_TYPES.includes(l.type));
  const rest = links.filter((l) => !SOCIAL_TYPES.includes(l.type));
  const primary = rest.slice(0, layout.primaryCount);
  const secondary = [...rest.slice(layout.primaryCount), ...(layout.socialRow ? [] : socials)];
  const gallery = layout.gallery ? links.filter((l) => l.thumbnail) : [];

  const containerStyle: CSSProperties = {
    background: theme.pageBackground,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
  };

  const headingStyle: CSSProperties = {
    fontFamily: layout.headingFont,
    color: theme.textColor,
    ...(layout.headingUppercase
      ? { textTransform: "uppercase", letterSpacing: "0.04em" }
      : { letterSpacing: "-0.01em" }),
  };

  const pad = compact ? "px-4" : "px-5";
  const sectionLabel = (text: string) => (
    <p
      className={`${compact ? "text-[8px]" : "text-[11px]"} font-semibold uppercase tracking-[0.18em]`}
      style={{ color: theme.mutedColor }}
    >
      {text}
    </p>
  );

  const Cover = ({ className }: { className: string }) => (
    <div className={`relative overflow-hidden ${className}`}>
      {user.backgroundVideoUrl ? (
        <TrimmedVideo
          value={user.backgroundVideoUrl}
          className="h-full w-full object-cover"
          style={{ pointerEvents: "none" }}
        />
      ) : coverUrl ? (
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(140deg, ${theme.accentColor}33, ${theme.pageBackground})`,
          }}
        />
      )}
      <div className="absolute inset-0" style={{ background: theme.overlay }} aria-hidden />
    </div>
  );

  const Avatar = ({ size }: { size: string }) => (
    <div
      className={`overflow-hidden rounded-full ${size}`}
      style={{
        border: `2px solid ${theme.accentColor}`,
        boxShadow: "0 20px 40px -24px rgba(0,0,0,0.7)",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Foto de ${user.displayName}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-xl font-semibold"
          style={{ background: "rgba(127,127,127,0.25)" }}
        >
          {user.displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );

  const Identity = ({ align = "center" }: { align?: "center" | "left" }) => (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h1
        className={`font-semibold ${compact ? "text-lg leading-tight" : "text-[28px] leading-tight"}`}
        style={headingStyle}
      >
        {user.displayName}
      </h1>
      <p
        className={`${compact ? "text-[9px]" : "text-xs"} font-medium tracking-wide`}
        style={{ color: theme.accentColor }}
      >
        @{user.username}
      </p>
      {user.bio && (
        <p
          className={`${compact ? "mt-1.5 text-[9px] leading-relaxed" : "mt-3 text-sm leading-relaxed"}`}
          style={{ color: theme.mutedColor, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
          {user.bio}
        </p>
      )}
    </div>
  );

  const ShareButton = (
    <button
      type="button"
      onClick={onShare}
      aria-label="Compartilhar página"
      className="absolute right-3 top-3 z-20 rounded-full p-2 backdrop-blur-md transition-opacity hover:opacity-70"
      style={{
        border: `1px solid ${theme.accentColor}55`,
        color: theme.accentColor,
        background: "rgba(0,0,0,0.15)",
      }}
    >
      <Share2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
    </button>
  );

  const Hero = () => {
    switch (layout.hero) {
      case "editorial":
        return (
          <header className="relative">
            <Cover className={compact ? "h-52 w-full" : "h-[20rem] w-full"} />
            <div className={`${pad} ${compact ? "-mt-8" : "-mt-12"} relative z-10`}>
              <Identity align="left" />
            </div>
          </header>
        );
      case "banner":
        return (
          <header className="relative">
            <Cover className={compact ? "h-36 w-full" : "h-56 w-full"} />
            <div className={`${pad} relative z-10 ${compact ? "-mt-10" : "-mt-14"}`}>
              <div
                className={`flex flex-col items-center ${compact ? "gap-2 rounded-2xl p-3" : "gap-3 rounded-3xl p-5"}`}
                style={{
                  background: theme.button.background,
                  border: theme.button.border,
                  boxShadow: theme.button.shadow,
                  backdropFilter: "blur(12px)",
                }}
              >
                <Avatar size={compact ? "h-12 w-12" : "h-20 w-20"} />
                <Identity />
              </div>
            </div>
          </header>
        );
      case "split":
        return (
          <header className="relative">
            <Cover className={compact ? "h-40 w-full" : "h-64 w-full"} />
            <div className={`${pad} relative z-10 ${compact ? "-mt-8" : "-mt-12"}`}>
              <div className={`flex items-end ${compact ? "gap-3" : "gap-4"}`}>
                <Avatar size={compact ? "h-14 w-14" : "h-24 w-24"} />
                <div className="min-w-0 flex-1 pb-1">
                  <Identity align="left" />
                </div>
              </div>
            </div>
          </header>
        );
      case "portrait":
        return (
          <header className={`relative ${pad} ${compact ? "pt-8" : "pt-12"}`}>
            <div
              className="absolute inset-x-0 top-0 h-1/2"
              style={{
                background: `radial-gradient(120% 90% at 50% 0%, ${theme.accentColor}2e, transparent 70%)`,
              }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-3">
              <Avatar size={compact ? "h-20 w-20" : "h-32 w-32"} />
              <Identity />
            </div>
          </header>
        );
      case "cover":
      default:
        return (
          <header className="relative">
            <Cover className={compact ? "h-56 w-full" : "h-[22rem] w-full"} />
            <div
              className={`${pad} relative z-10 flex flex-col items-center ${compact ? "-mt-12 gap-2" : "-mt-16 gap-3"}`}
            >
              <Avatar size={compact ? "h-16 w-16" : "h-28 w-28"} />
              <Identity />
            </div>
          </header>
        );
    }
  };

  const LinkCard = ({ link, big }: { link: ProfileLink; big: boolean }) => {
    const Icon = ICONS[link.type];
    return (
      <a
        href={href(link)}
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => onLinkClick?.(link)}
        className={`group flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
          compact ? "px-3 py-2" : big ? "px-4 py-4" : "px-4 py-3"
        }`}
        style={{
          background: big ? theme.accentColor : theme.button.background,
          border: big ? "1px solid transparent" : theme.button.border,
          color: big ? theme.pageBackground : theme.button.color,
          borderRadius: theme.button.radius,
          boxShadow: theme.button.shadow,
        }}
      >
        <span
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
            compact ? "h-6 w-6" : "h-9 w-9"
          }`}
          style={{ background: big ? "rgba(0,0,0,0.12)" : "rgba(127,127,127,0.18)" }}
        >
          {link.thumbnail ? (
            <img src={link.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
          )}
        </span>
        <span
          className={`flex-1 text-center font-semibold ${compact ? "text-[10px]" : big ? "text-[15px]" : "text-sm"}`}
        >
          {link.title}
        </span>
        <span className={compact ? "w-6" : "w-9"} />
      </a>
    );
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${compact ? "min-h-full" : "min-h-[100dvh]"}`}
      style={containerStyle}
    >
      {ShareButton}

      <div className={`relative flex w-full flex-col ${compact ? "min-h-full" : "min-h-[100dvh]"}`}>
        <Hero />

        <div
          className={`mx-auto flex w-full max-w-md flex-1 flex-col ${pad} ${
            compact ? "gap-3 pb-5 pt-4" : "gap-6 pb-10 pt-7"
          }`}
        >
          {layout.infoCard && user.counterValue && (
            <div
              className={`flex items-center justify-between ${compact ? "rounded-xl px-3 py-2" : "rounded-2xl px-4 py-3"}`}
              style={{
                background: theme.button.background,
                border: theme.button.border,
                borderRadius: theme.button.radius,
              }}
            >
              <span
                className={`${compact ? "text-[8px]" : "text-[11px]"} font-semibold uppercase tracking-[0.16em]`}
                style={{ color: theme.mutedColor }}
              >
                {user.counterLabel}
              </span>
              <span
                className={`font-semibold ${compact ? "text-[11px]" : "text-base"}`}
                style={{ color: theme.accentColor, fontFamily: layout.headingFont }}
              >
                {user.counterValue}
              </span>
            </div>
          )}

          {primary.length > 0 && (
            <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
              {primary.map((link) => (
                <LinkCard key={link.id} link={link} big />
              ))}
            </div>
          )}

          {gallery.length > 0 && (
            <section className={compact ? "space-y-1.5" : "space-y-3"}>
              {sectionLabel(layout.galleryLabel)}
              <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
                {gallery.slice(0, 6).map((link) => (
                  <a
                    key={`g-${link.id}`}
                    href={href(link)}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => onLinkClick?.(link)}
                    className="group relative aspect-square overflow-hidden rounded-xl"
                    style={{ border: theme.button.border }}
                  >
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {secondary.length > 0 && (
            <section className={compact ? "space-y-1.5" : "space-y-3"}>
              {sectionLabel(layout.listLabel)}
              <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
                {secondary.map((link) => (
                  <LinkCard key={link.id} link={link} big={false} />
                ))}
              </div>
            </section>
          )}

          {layout.socialRow && socials.length > 0 && (
            <div className={`flex flex-wrap items-center justify-center ${compact ? "gap-2" : "gap-3"}`}>
              {socials.map((link) => {
                const Icon = ICONS[link.type];
                return (
                  <a
                    key={`s-${link.id}`}
                    href={href(link)}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => onLinkClick?.(link)}
                    aria-label={link.title}
                    className={`flex items-center justify-center rounded-full transition-transform hover:scale-110 ${
                      compact ? "h-7 w-7" : "h-11 w-11"
                    }`}
                    style={{
                      background: theme.button.background,
                      border: theme.button.border,
                      color: theme.accentColor,
                    }}
                  >
                    <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                  </a>
                );
              })}
            </div>
          )}

          {links.length === 0 && (
            <p className="py-8 text-center text-xs" style={{ color: theme.mutedColor }}>
              Nenhum link publicado ainda.
            </p>
          )}

          <Link
            to="/"
            className={`mt-auto flex items-center justify-center gap-1 transition-opacity hover:opacity-70 hover:underline ${compact ? "pt-3 text-[8px]" : "pt-6 text-xs"}`}
            style={{ color: theme.mutedColor }}
          >
            <QrCode className="h-3 w-3" /> Feito com Na Bio
          </Link>
        </div>
      </div>
    </div>
  );
}
