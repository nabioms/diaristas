// ============================================================================
// PRÉVIA DA PÁGINA INICIAL — configuração exclusiva do "celular" da landing.
//
// Esta camada é TOTALMENTE independente do sistema de perfis dos usuários:
// usa as tabelas `landing_preview` e `landing_preview_links` e nunca lê ou
// escreve em `profiles` / `links`.
// ============================================================================

import { supabase } from "@/integrations/supabase/client";

export type PreviewIcon =
  | "url"
  | "whatsapp"
  | "instagram"
  | "youtube"
  | "pix"
  | "email"
  | "music"
  | "star"
  | "heart"
  | "shopping";

export const PREVIEW_ICONS: PreviewIcon[] = [
  "url",
  "whatsapp",
  "instagram",
  "youtube",
  "pix",
  "email",
  "music",
  "star",
  "heart",
  "shopping",
];

export const PREVIEW_ICON_LABEL: Record<PreviewIcon, string> = {
  url: "Link",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  youtube: "YouTube",
  pix: "PIX",
  email: "E-mail",
  music: "Música",
  star: "Estrela",
  heart: "Coração",
  shopping: "Loja",
};

export interface PreviewLink {
  id: string;
  title: string;
  url: string;
  icon: PreviewIcon;
  thumbnailUrl?: string | undefined;
  sortOrder: number;
  isActive: boolean;
}

export interface LandingPreviewConfig {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  followersText: string;
  footerText: string;
  avatarUrl?: string | undefined;
  backgroundType: "image" | "video";
  backgroundUrl?: string | undefined;
  backgroundVideoUrl?: string | undefined;
  backgroundPosition: string;
  backgroundFit: string;
  backgroundColor: string;
  overlay: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonIconColor: string;
  buttonBorderColor: string;
  buttonBorderWidth: number;
  buttonRadius: number;
  buttonOpacity: number;
  buttonShadow: string;
  links: PreviewLink[];
}

/** Valores padrão — usados como fallback caso o banco falhe ou esteja vazio. */
export const DEFAULT_PREVIEW: LandingPreviewConfig = {
  displayName: "João Silva",
  username: "joaosilva",
  bio: "Criador de conteúdo",
  location: "São Paulo",
  followersText: "1,8M seguidores",
  footerText: "Feito com Na Bio",
  avatarUrl: undefined,
  backgroundType: "image",
  backgroundUrl: undefined,
  backgroundVideoUrl: undefined,
  backgroundPosition: "center",
  backgroundFit: "cover",
  backgroundColor: "#0b0b0d",
  overlay: "linear-gradient(180deg, rgba(10,8,8,0.55), rgba(8,6,6,0.92))",
  textColor: "#f7c9ae",
  mutedColor: "rgba(247,201,174,0.65)",
  accentColor: "#e88f63",
  buttonColor: "rgba(20,16,16,0.55)",
  buttonTextColor: "#f7c9ae",
  buttonIconColor: "#e88f63",
  buttonBorderColor: "rgba(232,143,99,0.55)",
  buttonBorderWidth: 1,
  buttonRadius: 999,
  buttonOpacity: 1,
  buttonShadow: "none",
  links: [
    { id: "d1", title: "Meu novo single", url: "https://open.spotify.com", icon: "music", sortOrder: 0, isActive: true },
    { id: "d2", title: "Fale comigo no WhatsApp", url: "https://wa.me/5511999999999", icon: "whatsapp", sortOrder: 1, isActive: true },
    { id: "d3", title: "Instagram", url: "https://instagram.com", icon: "instagram", sortOrder: 2, isActive: true },
    { id: "d4", title: "Apoie com PIX", url: "https://nabio.app", icon: "pix", sortOrder: 3, isActive: true },
  ],
};

const db = () =>
  supabase as unknown as {
    from: (table: string) => any;
  };

const PREVIEW_ID = "default";

type Row = Record<string, any>;

function toConfig(row: Row, linkRows: Row[]): LandingPreviewConfig {
  const d = DEFAULT_PREVIEW;
  return {
    displayName: row['display_name'] || d.displayName,
    username: row['username'] || d.username,
    bio: row['bio'] ?? d.bio,
    location: row['location'] ?? d.location,
    followersText: row['followers_text'] ?? d.followersText,
    footerText: row['footer_text'] || d.footerText,
    avatarUrl: row['avatar_url'] ?? undefined,
    backgroundType: row['background_type'] === "video" ? "video" : "image",
    backgroundUrl: row['background_url'] ?? undefined,
    backgroundVideoUrl: row['background_video_url'] ?? undefined,
    backgroundPosition: row['background_position'] || d.backgroundPosition,
    backgroundFit: row['background_fit'] || d.backgroundFit,
    backgroundColor: row['background_color'] || d.backgroundColor,
    overlay: row['overlay'] ?? d.overlay,
    textColor: row['text_color'] || d.textColor,
    mutedColor: row['muted_color'] || d.mutedColor,
    accentColor: row['accent_color'] || d.accentColor,
    buttonColor: row['button_color'] || d.buttonColor,
    buttonTextColor: row['button_text_color'] || d.buttonTextColor,
    buttonIconColor: row['button_icon_color'] || d.buttonIconColor,
    buttonBorderColor: row['button_border_color'] || d.buttonBorderColor,
    buttonBorderWidth: Number(row['button_border_width'] ?? d.buttonBorderWidth),
    buttonRadius: Number(row['button_radius'] ?? d.buttonRadius),
    buttonOpacity: Number(row['button_opacity'] ?? d.buttonOpacity),
    buttonShadow: row['button_shadow'] || d.buttonShadow,
    links: linkRows
      .map((l) => ({
        id: String(l['id']),
        title: l['title'] ?? "",
        url: l['url'] ?? "",
        icon: (PREVIEW_ICONS.includes(l['icon']) ? l['icon'] : "url") as PreviewIcon,
        thumbnailUrl: l['thumbnail_url'] ?? undefined,
        sortOrder: Number(l['sort_order'] ?? 0),
        isActive: l['is_active'] !== false,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/** Lê a configuração pública da prévia. Nunca lança: cai no padrão. */
export async function loadLandingPreview(): Promise<LandingPreviewConfig> {
  try {
    const [{ data: row }, { data: linkRows }] = await Promise.all([
      db().from("landing_preview").select("*").eq("id", PREVIEW_ID).maybeSingle(),
      db().from("landing_preview_links").select("*").eq("preview_id", PREVIEW_ID),
    ]);
    if (!row) return DEFAULT_PREVIEW;
    return toConfig(row as Row, (linkRows ?? []) as Row[]);
  } catch (err) {
    console.warn("[landing-preview] fallback para configuração padrão", err);
    return DEFAULT_PREVIEW;
  }
}

/** Salva a configuração + os botões (somente admin, garantido por RLS). */
export async function saveLandingPreview(config: LandingPreviewConfig) {
  const row = {
    id: PREVIEW_ID,
    display_name: config.displayName,
    username: config.username,
    bio: config.bio,
    location: config.location,
    followers_text: config.followersText,
    footer_text: config.footerText,
    avatar_url: config.avatarUrl ?? null,
    background_type: config.backgroundType,
    background_url: config.backgroundUrl ?? null,
    background_video_url: config.backgroundVideoUrl ?? null,
    background_position: config.backgroundPosition,
    background_fit: config.backgroundFit,
    background_color: config.backgroundColor,
    overlay: config.overlay,
    text_color: config.textColor,
    muted_color: config.mutedColor,
    accent_color: config.accentColor,
    button_color: config.buttonColor,
    button_text_color: config.buttonTextColor,
    button_icon_color: config.buttonIconColor,
    button_border_color: config.buttonBorderColor,
    button_border_width: config.buttonBorderWidth,
    button_radius: config.buttonRadius,
    button_opacity: config.buttonOpacity,
    button_shadow: config.buttonShadow,
  };

  const { error } = await db().from("landing_preview").upsert(row);
  if (error) throw new Error((error as { message?: string }).message ?? "Falha ao salvar a prévia.");

  // Regrava a lista de botões inteira (simples e sempre consistente com a ordem).
  const { error: delError } = await db()
    .from("landing_preview_links")
    .delete()
    .eq("preview_id", PREVIEW_ID);
  if (delError) throw new Error((delError as { message?: string }).message ?? "Falha ao salvar os botões.");

  if (config.links.length > 0) {
    const { error: insError } = await db()
      .from("landing_preview_links")
      .insert(
        config.links.map((l, index) => ({
          preview_id: PREVIEW_ID,
          title: l.title,
          url: l.url,
          icon: l.icon,
          thumbnail_url: l.thumbnailUrl ?? null,
          sort_order: index,
          is_active: l.isActive,
        })),
      );
    if (insError)
      throw new Error((insError as { message?: string }).message ?? "Falha ao salvar os botões.");
  }
}

/** Apaga a personalização e volta ao padrão de fábrica. */
export async function resetLandingPreview() {
  await saveLandingPreview(DEFAULT_PREVIEW);
}
