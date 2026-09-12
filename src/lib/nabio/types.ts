// Modelos de domínio do Na Bio.
// FUTURO SUPABASE: estes tipos espelham as tabelas `profiles`, `links`,
// `link_clicks`, `reports` e `activity_logs`. Ao integrar o Supabase, troque
// apenas a implementação em `src/lib/nabio/store.ts` — a UI não muda.

export type LinkType =
  | "url"
  | "whatsapp"
  | "instagram"
  | "youtube"
  | "pix"
  | "email"
  | "file"
  | "spotify";

export type PlanId = "free" | "pro";

export type UserStatus = "active" | "suspended" | "banned";

export interface ProfileLink {
  id: string;
  userId: string;
  title: string;
  type: LinkType;
  /** URL, número de WhatsApp, chave PIX, e-mail ou URL do arquivo. */
  value: string;
  /** URL de thumbnail (futuro: Supabase Storage). */
  thumbnail?: string | undefined;
  position: number;
  active: boolean;
  clicks: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  /** Disponível somente para o próprio usuário autenticado. */
  email: string;
  username: string;
  displayName: string;
  bio?: string | undefined;
  avatarUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  /** Vídeo de fundo (máx. 7s) — upload local ou URL. */
  backgroundVideoUrl?: string | undefined;
  counterLabel?: string | undefined;
  counterValue?: string | undefined;
  themeId: string;
  /** Link escolhido como destaque principal (modelo Creator). */
  featuredLinkId?: string | undefined;
  plan: PlanId;
  status: UserStatus;
  role: "user" | "admin";
  pageViews: number;
  /** Destaque no carrossel da home — somente administradores podem alterar. */
  featuredOnHome: boolean;
  featuredOrder: number;
  createdAt: string;
  /** Último acesso (auth.users.last_sign_in_at) — só no painel admin. */
  lastSignInAt?: string | undefined;
}

export interface Report {
  id: string;
  reportedUserId: string;
  reason: string;
  reporter: string;
  createdAt: string;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  type: "signup" | "ban" | "edit" | "suspend" | "reactivate" | "link";
  message: string;
  createdAt: string;
}
