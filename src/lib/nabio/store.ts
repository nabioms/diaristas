// ============================================================================
// CAMADA DE DADOS — Supabase (auth + banco).
//
// Todos os dados (perfis, links, denúncias, logs) vivem no Supabase, então a
// mesma URL pública funciona em qualquer navegador: Chrome, aba anônima,
// WebView do Instagram, WhatsApp, TikTok etc. Nada depende de localStorage,
// sessão de login, referrer ou User-Agent.
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import type { ActivityLog, LinkType, ProfileLink, Report, UserProfile } from "./types";

// ------------------------------------------------------------------ cache ---

interface Cache {
  users: UserProfile[];
  links: ProfileLink[];
  reports: Report[];
  logs: ActivityLog[];
}

const cache: Cache = { users: [], links: [], reports: [], logs: [] };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function upsertUser(user: UserProfile) {
  const i = cache.users.findIndex((u) => u.id === user.id);
  if (i >= 0) cache.users[i] = user;
  else cache.users.push(user);
}

function upsertLinks(userId: string, links: ProfileLink[]) {
  cache.links = cache.links.filter((l) => l.userId !== userId).concat(links);
}

// ----------------------------------------------------------------- mapeio ---

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  background_url: string | null;
  background_video_url: string | null;
  counter_label: string | null;
  counter_value: string | null;
  theme_id: string;
  featured_link_id?: string | null;
  plan: string;
  status: string;
  page_views: number;
  featured_on_home?: boolean | null;
  featured_order?: number | null;
  created_at: string;
};

type LinkRow = {
  id: string;
  user_id: string;
  title: string;
  type: string;
  value: string;
  thumbnail: string | null;
  position: number;
  active: boolean;
  clicks: number;
  created_at: string;
};

function toUser(row: ProfileRow, role: UserProfile["role"] = "user"): UserProfile {
  return {
    id: row.id,
    email: "",
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    backgroundUrl: row.background_url ?? undefined,
    backgroundVideoUrl: row.background_video_url ?? undefined,
    counterLabel: row.counter_label ?? undefined,
    counterValue: row.counter_value ?? undefined,
    themeId: row.theme_id,
    featuredLinkId: row.featured_link_id ?? undefined,
    plan: (row.plan === "pro" ? "pro" : "free") as UserProfile["plan"],
    status: (["active", "suspended", "banned"].includes(row.status)
      ? row.status
      : "active") as UserProfile["status"],
    role,
    pageViews: row.page_views,
    featuredOnHome: row.featured_on_home ?? false,
    featuredOrder: row.featured_order ?? 0,
    createdAt: row.created_at,
  };
}

function toLink(row: LinkRow): ProfileLink {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type as LinkType,
    value: row.value,
    thumbnail: row.thumbnail ?? undefined,
    position: row.position,
    active: row.active,
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

function toProfilePatch(patch: Partial<UserProfile>) {
  const row: Record<string, unknown> = {};
  if (patch.username !== undefined) row['username'] = patch.username;
  if (patch.displayName !== undefined) row['display_name'] = patch.displayName;
  if (patch.bio !== undefined) row['bio'] = patch.bio ?? null;
  if (patch.avatarUrl !== undefined) row['avatar_url'] = patch.avatarUrl ?? null;
  if (patch.backgroundUrl !== undefined) row['background_url'] = patch.backgroundUrl ?? null;
  if (patch.backgroundVideoUrl !== undefined)
    row['background_video_url'] = patch.backgroundVideoUrl ?? null;
  if (patch.counterLabel !== undefined) row['counter_label'] = patch.counterLabel ?? null;
  if (patch.counterValue !== undefined) row['counter_value'] = patch.counterValue ?? null;
  if (patch.themeId !== undefined) row['theme_id'] = patch.themeId;
  if (patch.featuredLinkId !== undefined) row['featured_link_id'] = patch.featuredLinkId ?? null;
  if (patch.plan !== undefined) row['plan'] = patch.plan;
  if (patch.status !== undefined) row['status'] = patch.status;
  return row;
}

const db = () => supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: unknown }>;
};

/** Normaliza o slug vindo da URL: minúsculas, sem `/`, `@`, espaços ou query. */
export function normalizeUsername(raw: string): string {
  let value = (raw ?? "").trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* mantém o valor original se não for percent-encoded */
  }
  value = value.split("?")[0]!.split("#")[0]!;
  value = value.replace(/^\/+|\/+$/g, "");
  value = value.split("/").pop() ?? "";
  value = value.replace(/^@+/, "").trim().toLowerCase();
  return value.replace(/[^a-z0-9._-]/g, "");
}

// ---------------------------------------------------------------- leitura ---
// Getters síncronos leem o cache já carregado pelos loaders assíncronos.

export function getUsers(): UserProfile[] {
  return cache.users.filter((u) => u.role === "user");
}

export function getAllUsers(): UserProfile[] {
  return cache.users;
}

export function getUserById(id: string): UserProfile | undefined {
  return cache.users.find((u) => u.id === id);
}

export function getUserByUsername(username: string): UserProfile | undefined {
  const slug = normalizeUsername(username);
  return cache.users.find((u) => u.username.toLowerCase() === slug);
}

export function getLinks(userId: string): ProfileLink[] {
  return cache.links.filter((l) => l.userId === userId).sort((a, b) => a.position - b.position);
}

export function getReports(): Report[] {
  return cache.reports;
}

export function getLogs(): ActivityLog[] {
  return cache.logs;
}

// ---------------------------------------------------------------- loaders ---

/** Busca um perfil público pela URL. Só depende do slug — nada do navegador. */
export async function loadPublicProfile(
  usernameFromUrl: string,
): Promise<{ user: UserProfile | null; links: ProfileLink[] }> {
  const slug = normalizeUsername(usernameFromUrl);
  if (!slug) return { user: null, links: [] };

  const { data, error } = await db()
    .from("profiles")
    .select("*")
    .ilike("username", slug)
    .maybeSingle();

  if (error || !data) return { user: null, links: [] };

  const user = toUser(data as ProfileRow);
  upsertUser(user);

  const { data: linkRows } = await db()
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const links = ((linkRows ?? []) as LinkRow[]).map(toLink);
  upsertLinks(user.id, links);
  notify();
  return { user, links };
}

/** Perfil + role do usuário autenticado (ou null). */
export async function loadSession(): Promise<UserProfile | null> {
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;
  if (!authUser) return null;

  const { data } = await db().from("profiles").select("*").eq("id", authUser.id).maybeSingle();
  if (!data) return null;

  const { data: roles } = await db().from("user_roles").select("role").eq("user_id", authUser.id);
  const isAdmin = ((roles ?? []) as { role: string }[]).some((r) => r.role === "admin");

  const user = toUser(data as ProfileRow, isAdmin ? "admin" : "user");
  user.email = authUser.email ?? "";
  upsertUser(user);
  notify();
  return user;
}

export async function loadLinks(userId: string): Promise<ProfileLink[]> {
  const { data } = await db()
    .from("links")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  const links = ((data ?? []) as LinkRow[]).map(toLink);
  upsertLinks(userId, links);
  notify();
  return links;
}

export interface AdminData {
  users: UserProfile[];
  links: ProfileLink[];
  reports: Report[];
  logs: ActivityLog[];
}

export async function loadAdminData(): Promise<AdminData> {
  const [profilesRes, linksRes, reportsRes, logsRes, rolesRes, authRes] = await Promise.all([
    db().from("profiles").select("*").order("created_at", { ascending: false }),
    db().from("links").select("*"),
    db().from("reports").select("*").order("created_at", { ascending: false }),
    db().from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200),
    db().from("user_roles").select("user_id, role"),
    db().rpc("admin_list_auth_users"),
  ]);

  const firstError = [profilesRes, linksRes, reportsRes, logsRes, rolesRes].find(
    (r) => (r as { error?: unknown }).error,
  ) as { error?: { message?: string } } | undefined;
  if (firstError?.error) {
    throw new Error(firstError.error.message ?? "Falha ao carregar dados administrativos.");
  }

  const authById = new Map(
    ((authRes.data ?? []) as {
      id: string;
      email: string | null;
      created_at: string;
      last_sign_in_at: string | null;
    }[]).map((u) => [u.id, u]),
  );

  const adminIds = new Set(
    ((rolesRes.data ?? []) as { user_id: string; role: string }[])
      .filter((r) => r.role === "admin")
      .map((r) => r.user_id),
  );

  cache.users = ((profilesRes.data ?? []) as ProfileRow[]).map((row) => {
    const user = toUser(row, adminIds.has(row.id) ? "admin" : "user");
    const authUser = authById.get(row.id);
    if (authUser) {
      user.email = authUser.email ?? "";
      user.lastSignInAt = authUser.last_sign_in_at ?? undefined;
    }
    return user;
  });
  cache.links = ((linksRes.data ?? []) as LinkRow[]).map(toLink);
  cache.reports = (
    (reportsRes.data ?? []) as {
      id: string;
      reported_user_id: string;
      reason: string;
      reporter: string;
      resolved: boolean;
      created_at: string;
    }[]
  ).map((r) => ({
    id: r.id,
    reportedUserId: r.reported_user_id,
    reason: r.reason,
    reporter: r.reporter,
    resolved: r.resolved,
    createdAt: r.created_at,
  }));
  cache.logs = (
    (logsRes.data ?? []) as { id: string; type: string; message: string; created_at: string }[]
  ).map((l) => ({
    id: l.id,
    type: l.type as ActivityLog["type"],
    message: l.message,
    createdAt: l.created_at,
  }));

  notify();
  return { users: cache.users, links: cache.links, reports: cache.reports, logs: cache.logs };
}

// ------------------------------------------------------------------ auth ----

export function onAuthChange(callback: () => void) {
  const { data } = supabase.auth.onAuthStateChange(() => callback());
  return () => data.subscription.unsubscribe();
}

export async function isUsernameAvailable(username: string, ignoreUserId?: string) {
  const slug = normalizeUsername(username);
  if (slug.length < 3) return false;
  const { data } = await db().from("profiles").select("id").ilike("username", slug);
  const rows = (data ?? []) as { id: string }[];
  return rows.every((r) => r.id === ignoreUserId);
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not confirmed") || msg.includes("email_not_confirmed"))
      throw new Error(
        "Sua conta ainda não foi confirmada. Abra o e-mail de confirmação que enviamos e clique no link.",
      );
    if (msg.includes("invalid")) throw new Error("E-mail ou senha incorretos.");
    throw new Error(error.message);
  }

  const user = await loadSession();
  if (!user) throw new Error("Não foi possível carregar seu perfil.");
  if (user.status === "banned") {
    await supabase.auth.signOut();
    throw new Error("Esta conta foi banida.");
  }
  return user;
}

export async function signUp(input: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}): Promise<UserProfile | null> {
  const username = normalizeUsername(input.username);
  if (!(await isUsernameAvailable(username)))
    throw new Error("Este nome de usuário já está em uso.");

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password.trim(),
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { username, display_name: input.displayName.trim() },
    },
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already")) throw new Error("Este e-mail já está cadastrado.");
    if (msg.includes("rate limit") || (error as { status?: number }).status === 429)
      throw new Error(
        "O limite de e-mails de confirmação do servidor foi atingido. Aguarde alguns minutos e tente de novo — sua conta ainda não foi criada.",
      );
    throw new Error(error.message);
  }


  if (!signUpData.session) return null;
  const user = await loadSession();
  if (!user) throw new Error("Conta criada, mas não foi possível carregar seu perfil.");
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
  cache.users = [];
  cache.links = [];
  notify();
}

/** Envia o e-mail de redefinição de senha. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/recuperar-senha`,
  });
  if (error) throw new Error(error.message);
}

/** Define a nova senha (após clicar no link recebido por e-mail). */
export async function updatePassword(newPassword: string) {
  if (newPassword.trim().length < 6)
    throw new Error("A nova senha precisa ter ao menos 6 caracteres.");
  const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------- perfil ----

export async function updateUser(id: string, patch: Partial<UserProfile>) {
  const existing = getUserById(id);
  if (existing) {
    upsertUser({ ...existing, ...patch });
    notify();
  }
  const row = toProfilePatch(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await db().from("profiles").update(row).eq("id", id).select("id").single();
  if (error) throw new Error((error as { message?: string }).message ?? "Falha ao salvar o perfil.");
}


// ------------------------------------------------------- destaque na home ---
// A permissão real é garantida no banco: um trigger em `public.profiles`
// rejeita qualquer alteração de `featured_on_home` / `featured_order` feita
// por quem não tem a role `admin` — inclusive por chamadas diretas à API.

async function requireAdmin() {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData.user?.id;
  if (!uid) throw new Error("Apenas administradores podem alterar o destaque na home.");
  const { data } = await db()
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Apenas administradores podem alterar o destaque na home.");
}

async function writeFeatured(id: string, featured: boolean, order: number) {
  const { error } = await db()
    .from("profiles")
    .update({ featured_on_home: featured, featured_order: order })
    .eq("id", id)
    .select("id")
    .single();
  if (error)
    throw new Error(
      (error as { message?: string }).message ?? "Apenas administradores podem alterar o destaque.",
    );
  const existing = getUserById(id);
  if (existing) {
    upsertUser({ ...existing, featuredOnHome: featured, featuredOrder: order });
    notify();
  }
}

export function getFeaturedUsers(): UserProfile[] {
  return cache.users
    .filter((u) => u.featuredOnHome)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.username.localeCompare(b.username));
}

/** Ativa/desativa um perfil no carrossel da home (somente admin). */
export async function setUserFeatured(id: string, featured: boolean) {
  await requireAdmin();
  const nextOrder = featured
    ? Math.max(0, ...getFeaturedUsers().map((u) => u.featuredOrder)) + 1
    : 0;
  await writeFeatured(id, featured, nextOrder);
}

/** Move um perfil destacado para cima (-1) ou para baixo (+1). */
export async function moveFeaturedUser(id: string, delta: number) {
  await requireAdmin();
  const list = getFeaturedUsers();
  const index = list.findIndex((u) => u.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= list.length) return;
  const reordered = [...list];
  const [item] = reordered.splice(index, 1);
  reordered.splice(target, 0, item!);
  for (let i = 0; i < reordered.length; i += 1) {
    const u = reordered[i]!;
    if (u.featuredOrder !== i) await writeFeatured(u.id, true, i);
  }
}

/** Leitura pública dos perfis destacados (usada na página inicial). */
export async function loadFeaturedProfiles(): Promise<UserProfile[]> {
  const { data } = await db()
    .from("profiles")
    .select("*")
    .eq("featured_on_home", true)
    .eq("status", "active")
    .order("featured_order", { ascending: true });
  const users = ((data ?? []) as ProfileRow[]).map((row) => toUser(row));
  users.forEach(upsertUser);
  notify();
  return users;
}

/** Perfis destacados + seus links ativos, para o slideshow do celular do Hero. */
export async function loadFeaturedProfilesWithLinks(): Promise<
  { user: UserProfile; links: ProfileLink[] }[]
> {
  const users = await loadFeaturedProfiles();
  if (users.length === 0) return [];

  const { data } = await db()
    .from("links")
    .select("*")
    .in(
      "user_id",
      users.map((u) => u.id),
    )
    .eq("active", true)
    .order("position", { ascending: true });

  const links = ((data ?? []) as LinkRow[]).map(toLink);
  users.forEach((u) => upsertLinks(u.id, links.filter((l) => l.userId === u.id)));
  notify();
  return users.map((user) => ({ user, links: links.filter((l) => l.userId === user.id) }));
}

export async function setUserStatus(id: string, status: UserProfile["status"]) {
  await updateUser(id, { status });
  const user = getUserById(id);
  await db()
    .from("activity_logs")
    .insert({
      type: status === "active" ? "reactivate" : status === "banned" ? "ban" : "suspend",
      message: `@${user?.username ?? id} agora está ${
        status === "active" ? "ativo" : status === "banned" ? "banido" : "suspenso"
      }`,
    });
}

// ----------------------------------------------------------------- links ----

export async function createLink(
  userId: string,
  input: Partial<ProfileLink>,
): Promise<ProfileLink | null> {
  const { data, error } = await db()
    .from("links")
    .insert({
      user_id: userId,
      title: input.title ?? "Novo link",
      type: input.type ?? "url",
      value: input.value ?? "",
      thumbnail: input.thumbnail ?? null,
      position: getLinks(userId).length,
      active: true,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const link = toLink(data as LinkRow);
  cache.links.push(link);
  notify();
  return link;
}

export async function updateLink(id: string, patch: Partial<ProfileLink>) {
  const link = cache.links.find((l) => l.id === id);
  if (link) {
    Object.assign(link, patch);
    notify();
  }
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row['title'] = patch.title;
  if (patch.type !== undefined) row['type'] = patch.type;
  if (patch.value !== undefined) row['value'] = patch.value;
  if (patch.thumbnail !== undefined) row['thumbnail'] = patch.thumbnail ?? null;
  if (patch.position !== undefined) row['position'] = patch.position;
  if (patch.active !== undefined) row['active'] = patch.active;
  if (Object.keys(row).length === 0) return;
  await db().from("links").update(row).eq("id", id);
}

export async function deleteLink(id: string) {
  cache.links = cache.links.filter((l) => l.id !== id);
  notify();
  await db().from("links").delete().eq("id", id);
}

export async function reorderLinks(userId: string, orderedIds: string[]) {
  orderedIds.forEach((id, index) => {
    const link = cache.links.find((l) => l.id === id);
    if (link && link.userId === userId) link.position = index;
  });
  notify();
  await Promise.all(
    orderedIds.map((id, index) => db().from("links").update({ position: index }).eq("id", id)),
  );
}

export async function registerClick(linkId: string) {
  const link = cache.links.find((l) => l.id === linkId);
  if (link) link.clicks += 1;
  await db().rpc("increment_link_clicks", { _link_id: linkId });
}

export async function registerPageView(userId: string) {
  await db().rpc("increment_page_views", { _profile_id: userId });
}

// -------------------------------------------------------------- denúncias ---

export async function resolveReport(id: string) {
  const report = cache.reports.find((r) => r.id === id);
  if (report) report.resolved = true;
  notify();
  await db().from("reports").update({ resolved: true }).eq("id", id);
}

export async function removeReport(id: string) {
  cache.reports = cache.reports.filter((r) => r.id !== id);
  notify();
  await db().from("reports").delete().eq("id", id);
}

// --------------------------------------------------------------- métricas ---

export function getPlatformStats() {
  const users = getUsers();
  const totalClicks = cache.links.reduce((sum, l) => sum + l.clicks, 0);
  const signupsByMonth: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const total = users.filter((u) => {
      const c = new Date(u.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    signupsByMonth.push({ month: label, total });
  }
  return {
    totalUsers: users.length,
    totalLinks: cache.links.length,
    totalClicks,
    activeUsers: users.filter((u) => u.status === "active").length,
    openReports: cache.reports.filter((r) => !r.resolved).length,
    signupsByMonth,
  };
}
