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

import { CreatorProfileView } from "@/components/nabio/CreatorProfileView";
import { MusicProfileView } from "@/components/nabio/MusicProfileView";
import { TemplateProfileView } from "@/components/nabio/TemplateProfileView";
import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { useMediaUrl } from "@/hooks/use-media";
import { parseSpotify } from "@/lib/nabio/spotify";
import { getTemplate } from "@/lib/nabio/templates";
import { getTheme } from "@/lib/nabio/themes";
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

export function resolveHref(link: ProfileLink) {
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
  user: UserProfile;
  links: ProfileLink[];
  compact?: boolean;
  onLinkClick?: (link: ProfileLink) => void;
  onShare?: () => void;
}

function BioText({
  bio,
  compact,
  color,
}: {
  bio: string;
  compact: boolean | undefined;
  color: string;
}) {
  return (
    <p
      className={`break-words ${compact ? "mt-1 text-[10px]" : "mt-2 text-sm"}`}
      style={{ color, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
    >
      {bio}
    </p>
  );
}

export function PublicProfileView(props: Props) {
  if (props.user.themeId === "music") return <MusicProfileView {...props} />;
  if (props.user.themeId === "creator")
    return <CreatorProfileView {...props} resolveHref={resolveHref} />;
  const template = getTemplate(props.user.themeId);
  if (template) return <TemplateProfileView template={template} {...props} />;
  return <DefaultProfileView {...props} />;
}

function DefaultProfileView({ user, links, compact, onLinkClick, onShare }: Props) {
  const theme = getTheme(user.themeId);
  const avatarUrl = useMediaUrl(user.avatarUrl);
  const backgroundUrl = useMediaUrl(user.backgroundUrl);
  

  const containerStyle: CSSProperties = {
    background: theme.pageBackground,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
  };

  // Em modo público o fundo é uma camada fixa da viewport (não depende do conteúdo);
  // no preview compacto ele fica absoluto dentro do "celular".
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
          style={{ filter: "blur(4px)", zIndex: 0, pointerEvents: "none" }}
        />
      ) : (
        backgroundUrl && (
          <div
            className={`${layer} bg-cover bg-center`}
            style={{ backgroundImage: `url(${backgroundUrl})`, filter: "blur(6px)", zIndex: 0 }}
            aria-hidden
          />
        )
      )}
      <div className={layer} style={{ background: theme.overlay, zIndex: 0 }} aria-hidden />

      <div
        className={`relative z-10 mx-auto flex w-full max-w-md flex-col items-center ${
          compact ? "min-h-full gap-3 px-4 py-6" : "min-h-[100dvh] px-5 py-10"
        }`}
      >
        <div className={`flex w-full flex-col items-center ${compact ? "gap-3" : "flex-1 gap-5"}`}>
        <div className="flex w-full justify-end">

          <button
            type="button"
            onClick={onShare}
            aria-label="Compartilhar página"
            className="rounded-full p-2 transition-opacity hover:opacity-70"
            style={{ border: theme.button.border, color: theme.accentColor }}
          >
            <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>

        <div
          className={`overflow-hidden rounded-full ${compact ? "h-16 w-16" : "h-28 w-28"}`}
          style={{ border: `2px solid ${theme.accentColor}` }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto de perfil de ${user.displayName}`}
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

        <div className="text-center">
          <h1
            className={`font-semibold tracking-tight ${compact ? "text-base" : "text-2xl"}`}
            style={{ color: theme.textColor }}
          >
            @{user.username}
          </h1>
          {user.bio && <BioText bio={user.bio} compact={compact} color={theme.mutedColor} />}
          {user.counterValue && (
            <p
              className={`font-medium ${compact ? "mt-1 text-[10px]" : "mt-2 text-sm"}`}
              style={{ color: theme.accentColor }}
            >
              {user.counterValue} {user.counterLabel}
            </p>
          )}
        </div>

        <div className={`flex w-full flex-col ${compact ? "gap-2" : "gap-3"}`}>
          {links.map((link) => {
            const Icon = ICONS[link.type];
            return (
              <a
                key={link.id}
                href={resolveHref(link)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => onLinkClick?.(link)}
                className={`flex items-center gap-3 transition-transform hover:scale-[1.02] ${
                  compact ? "px-3 py-2" : "px-4 py-3"
                }`}
                style={{
                  background: theme.button.background,
                  border: theme.button.border,
                  color: theme.button.color,
                  borderRadius: theme.button.radius,
                  boxShadow: theme.button.shadow,
                }}
              >
                <span
                  className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
                    compact ? "h-6 w-6" : "h-9 w-9"
                  }`}
                  style={{ background: "rgba(127,127,127,0.18)" }}
                >
                  {link.thumbnail ? (
                    <img src={link.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                  )}
                </span>
                <span
                  className={`flex-1 text-center font-medium ${compact ? "text-[11px]" : "text-sm"}`}
                >
                  {link.title}
                </span>
                <span className={compact ? "w-6" : "w-9"} />
              </a>
            );
          })}
          {links.length === 0 && (
            <p className="py-8 text-center text-xs" style={{ color: theme.mutedColor }}>
              Nenhum link publicado ainda.
            </p>
          )}
        </div>

        </div>
        <Link
          to="/"
          className={`flex items-center gap-1 transition-opacity hover:opacity-70 hover:underline ${compact ? "mt-4 text-[9px]" : "mt-auto text-xs"}`}
          style={{ color: theme.mutedColor }}
        >
          <QrCode className="h-3 w-3" /> Feito com Na Bio
        </Link>
      </div>
    </div>
  );
}
