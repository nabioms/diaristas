// Identificação automática de plataformas a partir da URL cadastrada pelo usuário.
// Usada pelo modelo "Creator" para transformar cada link em um bloco visual
// com a identidade da rede correspondente. Nada de scraping: só leitura da URL.

import type { ProfileLink } from "@/lib/nabio/types";

export type PlatformId =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "whatsapp"
  | "spotify"
  | "amazonmusic"
  | "applemusic"
  | "facebook"
  | "x"
  | "telegram"
  | "linkedin"
  | "twitch"
  | "pinterest"
  | "threads"
  | "discord"
  | "email"
  | "pix"
  | "file"
  | "website";

export interface PlatformStyle {
  id: PlatformId;
  label: string;
  /** rótulo do botão dentro do bloco */
  cta: string;
  /** gradiente/cor de marca usada no ícone e no botão */
  brand: string;
  /** cor do texto sobre a cor de marca */
  onBrand: string;
  /** true quando a rede usa @usuário */
  handle: boolean;
}

const P = (
  id: PlatformId,
  label: string,
  cta: string,
  brand: string,
  onBrand = "#ffffff",
  handle = false,
): PlatformStyle => ({ id, label, cta, brand, onBrand, handle });

export const PLATFORMS: Record<PlatformId, PlatformStyle> = {
  instagram: P(
    "instagram",
    "Instagram",
    "Seguir",
    "linear-gradient(135deg,#f9ce34,#ee2a7b 55%,#6228d7)",
    "#ffffff",
    true,
  ),
  youtube: P("youtube", "YouTube", "Inscrever-se", "#ff0033", "#ffffff", true),
  tiktok: P("tiktok", "TikTok", "Seguir", "linear-gradient(135deg,#25f4ee,#000000 55%,#fe2c55)", "#ffffff", true),
  whatsapp: P("whatsapp", "WhatsApp", "Falar no WhatsApp", "#25d366", "#062e17"),
  spotify: P("spotify", "Spotify", "Ouvir agora", "#1db954", "#04160b"),
  amazonmusic: P("amazonmusic", "Amazon Music", "Ouvir agora", "#25d1da", "#04252a"),
  applemusic: P("applemusic", "Apple Music", "Ouvir agora", "linear-gradient(135deg,#fa2f56,#fb5c74)"),
  facebook: P("facebook", "Facebook", "Curtir página", "#1877f2", "#ffffff", true),
  x: P("x", "X", "Seguir", "#111114", "#ffffff", true),
  telegram: P("telegram", "Telegram", "Abrir conversa", "#28a8e9"),
  linkedin: P("linkedin", "LinkedIn", "Conectar", "#0a66c2", "#ffffff", true),
  twitch: P("twitch", "Twitch", "Assistir", "#9146ff", "#ffffff", true),
  pinterest: P("pinterest", "Pinterest", "Ver pins", "#e60023", "#ffffff", true),
  threads: P("threads", "Threads", "Seguir", "#101014", "#ffffff", true),
  discord: P("discord", "Discord", "Entrar no servidor", "#5865f2"),
  email: P("email", "E-mail", "Enviar e-mail", "#4b5563"),
  pix: P("pix", "Pix", "Copiar chave", "#0f9b8e", "#03211f"),
  file: P("file", "Arquivo", "Baixar", "#6b7280"),
  website: P("website", "Site", "Acessar", "#3f3f46"),
};

const HOST_MAP: Array<[RegExp, PlatformId]> = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "whatsapp"],
  [/(^|\.)(spotify\.com|spotify\.link)$/, "spotify"],
  [/(^|\.)(music\.amazon\.[a-z.]+|amazon\.[a-z.]+)$/, "amazonmusic"],
  [/(^|\.)music\.apple\.com$/, "applemusic"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)(twitter\.com|x\.com)$/, "x"],
  [/(^|\.)(t\.me|telegram\.me)$/, "telegram"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)twitch\.tv$/, "twitch"],
  [/(^|\.)(pinterest\.com|pin\.it)$/, "pinterest"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)(discord\.gg|discord\.com)$/, "discord"],
];

function hostOf(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Descobre a plataforma de um link a partir do tipo e da URL cadastrada. */
export function detectPlatform(link: Pick<ProfileLink, "type" | "value">): PlatformId {
  switch (link.type) {
    case "whatsapp":
      return "whatsapp";
    case "email":
      return "email";
    case "pix":
      return "pix";
    case "file":
      return "file";
    case "instagram":
      return "instagram";
    case "youtube":
      return "youtube";
    case "spotify":
      return "spotify";
    default:
      break;
  }

  const host = hostOf(link.value);
  if (!host) return "website";
  for (const [pattern, id] of HOST_MAP) {
    if (pattern.test(host)) return id;
  }
  if (/music\.amazon\./.test(host)) return "amazonmusic";
  return "website";
}

/**
 * Link real de inscrição/seguir da plataforma.
 * No YouTube usamos `?sub_confirmation=1`, que abre o canal real e deixa o
 * próprio YouTube pedir login e confirmar a inscrição. Nada é simulado aqui.
 */
export function subscribeUrl(raw: string): string {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return raw;
    url.searchParams.set("sub_confirmation", "1");
    return url.toString();
  } catch {
    return raw;
  }
}


export function handleFromUrl(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const segment = url.pathname.split("/").filter(Boolean)[0];
    if (!segment) return null;
    const cleaned = decodeURIComponent(segment).replace(/^@/, "");
    if (!cleaned || cleaned.length > 40) return null;
    if (["watch", "channel", "c", "playlist", "in", "p", "shorts", "video"].includes(cleaned)) {
      const next = url.pathname.split("/").filter(Boolean)[1];
      return next ? next.replace(/^@/, "") : null;
    }
    return cleaned;
  } catch {
    return null;
  }
}
