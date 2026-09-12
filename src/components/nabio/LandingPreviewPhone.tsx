import {
  AtSign,
  Heart,
  Instagram,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Music,
  QrCode,
  ShoppingBag,
  Star,
  Youtube,
} from "lucide-react";
import type { CSSProperties } from "react";

import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { useMediaUrl } from "@/hooks/use-media";
import type { LandingPreviewConfig, PreviewIcon } from "@/lib/nabio/landing-preview";

export const PREVIEW_ICON_COMPONENTS: Record<PreviewIcon, typeof LinkIcon> = {
  url: LinkIcon,
  whatsapp: MessageCircle,
  instagram: Instagram,
  youtube: Youtube,
  pix: AtSign,
  email: Mail,
  music: Music,
  star: Star,
  heart: Heart,
  shopping: ShoppingBag,
};

/**
 * Renderiza o conteúdo do "celular" da página inicial usando SOMENTE a
 * configuração administrável da prévia — não usa perfis de usuários.
 */
export function LandingPreviewPhone({ config }: { config: LandingPreviewConfig }) {
  const avatarUrl = useMediaUrl(config.avatarUrl);
  const backgroundUrl = useMediaUrl(config.backgroundType === "image" ? config.backgroundUrl : undefined);
  const links = config.links.filter((l) => l.isActive);

  const containerStyle: CSSProperties = {
    background: config.backgroundColor,
    color: config.textColor,
  };

  const buttonStyle: CSSProperties = {
    background: config.buttonColor,
    border: `${config.buttonBorderWidth}px solid ${config.buttonBorderColor}`,
    color: config.buttonTextColor,
    borderRadius: `${config.buttonRadius}px`,
    boxShadow: config.buttonShadow,
    opacity: config.buttonOpacity,
  };

  return (
    <div className="relative min-h-full w-full overflow-hidden" style={containerStyle}>
      {config.backgroundType === "video" && config.backgroundVideoUrl ? (
        <TrimmedVideo
          value={config.backgroundVideoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "blur(4px)", zIndex: 0, pointerEvents: "none" }}
        />
      ) : (
        backgroundUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: config.backgroundFit,
            backgroundPosition: config.backgroundPosition,
            backgroundRepeat: "no-repeat",
            filter: "blur(6px)",
            zIndex: 0,
          }}
          aria-hidden
        />
        )
      )}
      <div className="absolute inset-0" style={{ background: config.overlay, zIndex: 0 }} aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4 py-8">
        <div
          className="h-16 w-16 overflow-hidden rounded-full"
          style={{ border: `2px solid ${config.accentColor}` }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto de ${config.displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xl font-semibold"
              style={{ background: "rgba(127,127,127,0.25)" }}
            >
              {(config.displayName || "N").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="text-center">
          {config.displayName && (
            <p className="text-base font-semibold tracking-tight" style={{ color: config.textColor }}>
              {config.displayName}
            </p>
          )}
          {config.username && (
            <p className="text-[11px]" style={{ color: config.mutedColor }}>
              @{config.username}
            </p>
          )}
          {(config.bio || config.location) && (
            <p
              className="mt-1 break-words text-[10px]"
              style={{ color: config.mutedColor, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {[config.bio, config.location].filter(Boolean).join(" • ")}
            </p>
          )}
          {config.followersText && (
            <p className="mt-1 text-[10px] font-medium" style={{ color: config.accentColor }}>
              {config.followersText}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          {links.map((link) => {
            const Icon = PREVIEW_ICON_COMPONENTS[link.icon] ?? LinkIcon;
            return (
              <a
                key={link.id}
                href={link.url || "#"}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 px-3 py-2 transition-transform hover:scale-[1.02]"
                style={buttonStyle}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: "rgba(127,127,127,0.18)", color: config.buttonIconColor }}
                >
                  {link.thumbnailUrl ? (
                    <ThumbImage value={link.thumbnailUrl} />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                </span>
                <span className="flex-1 text-center text-[11px] font-medium">{link.title}</span>
                <span className="w-6" />
              </a>
            );
          })}
          {links.length === 0 && (
            <p className="py-8 text-center text-xs" style={{ color: config.mutedColor }}>
              Nenhum botão configurado.
            </p>
          )}
        </div>

        {config.footerText && (
          <p
            className="mt-4 flex items-center gap-1 text-[9px]"
            style={{ color: config.mutedColor }}
          >
            <QrCode className="h-3 w-3" /> {config.footerText}
          </p>
        )}
      </div>
    </div>
  );
}

function ThumbImage({ value }: { value: string }) {
  const url = useMediaUrl(value);
  return url ? <img src={url} alt="" className="h-full w-full object-cover" /> : null;
}
