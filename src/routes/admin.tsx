import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FeaturedAdmin } from "@/components/nabio/FeaturedAdmin";
import { LandingPreviewAdmin } from "@/components/nabio/LandingPreviewAdmin";
import { PhonePreview } from "@/components/nabio/PhonePreview";
import { PublicProfileView } from "@/components/nabio/PublicProfileView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  auth,
  useAdminData,
  useLogs,
  usePlatformStats,
  useReports,
  useSession,
  useUsers,
} from "@/hooks/use-nabio";
import { getLinks, removeReport, resolveReport, setUserStatus, updateUser } from "@/lib/nabio/store";
import type { UserProfile } from "@/lib/nabio/types";

const ADMIN_TABS = ["usuarios", "destaques", "metricas", "denuncias", "logs", "personalizacao"] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { tab?: AdminTab } => {
    const raw = String(search['tab'] ?? "");
    return (ADMIN_TABS as readonly string[]).includes(raw) ? { tab: raw as AdminTab } : {};
  },
  head: () => ({
    meta: [
      { title: "Painel administrativo — Na Bio" },
      { name: "description", content: "Gestão de usuários, denúncias e métricas da plataforma." },
      { property: "og:title", content: "Painel administrativo — Na Bio" },
      { property: "og:description", content: "Gestão de usuários e métricas do Na Bio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUS_LABEL: Record<UserProfile["status"], string> = {
  active: "Ativo",
  suspended: "Suspenso",
  banned: "Banido",
};

function AdminPage() {
  const { user, loading } = useSession();

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user || user.role !== "admin") return <AdminLogin />;
  return <AdminDashboard />;
}

// Login separado de administrador.
// FUTURO SUPABASE: validar a role via tabela `user_roles` + RLS.
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="absolute left-3 top-3 h-11 min-h-11 gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:left-5 sm:top-5"
        aria-label="Voltar para o login"
      >
        <Link to="/login">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </Button>

      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const u = await auth.signIn(email, password);
            if (u.role !== "admin") {
              await auth.signOut();
              setError("Esta conta não é administradora.");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao entrar.");
          }
        }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" /> Acesso administrativo
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">E-mail</Label>
          <Input id="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-pass">Senha</Label>
          <Input
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          Entrar no painel
        </Button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const { loading, error, reload } = useAdminData(true);
  const users = useUsers();
  const reports = useReports();
  const logs = useLogs();
  const stats = usePlatformStats();

  const { tab = "usuarios" } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [viewing, setViewing] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState<UserProfile | null>(null);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchQuery && (status === "all" || u.status === status) && (plan === "all" || u.plan === plan);
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="flex items-center gap-2 text-base font-bold tracking-tight">
            Na<span className="text-primary">Bio</span>
            <Badge variant="secondary">admin</Badge>
          </span>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Site</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Usuários" value={stats.totalUsers} loading={loading} />
          <Metric label="Links criados" value={stats.totalLinks} loading={loading} />
          <Metric label="Cliques na plataforma" value={stats.totalClicks} loading={loading} />
          <Metric label="Denúncias abertas" value={stats.openReports} loading={loading} />
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>Erro ao carregar dados: {error}</span>
            <Button size="sm" variant="outline" onClick={reload}>
              Tentar novamente
            </Button>
          </div>
        )}

        <Tabs
          value={tab}
          onValueChange={(value) =>
            void navigate({ to: ".", search: (prev) => ({ ...prev, tab: value as AdminTab }) })
          }
          className="mt-8"
        >
          <TabsList className="flex-wrap">
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="destaques">⭐ Destaque na Home</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="denuncias">Denúncias</TabsTrigger>
            <TabsTrigger value="logs">Atividades</TabsTrigger>
            <TabsTrigger value="personalizacao">🎨 Personalização</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Buscar por nome ou @username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-xs"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                  <SelectItem value="banned">Banidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="pro">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Cadastro</th>
                    <th className="px-4 py-3">Plano</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Links</th>
                    <th className="px-4 py-3">Visitas</th>
                    <th className="px-4 py-3">Último acesso</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.plan === "pro" ? "default" : "secondary"}>
                          {u.plan === "pro" ? "PRO" : "Free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{STATUS_LABEL[u.status]}</td>
                      <td className="px-4 py-3">{getLinks(u.id).length}</td>
                      <td className="px-4 py-3">{u.pageViews.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setViewing(u)}>
                            Ver página
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
                            Editar
                          </Button>
                          {u.status === "active" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void setUserStatus(u.id, "suspended").then(reload)}
                            >
                              Suspender
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void setUserStatus(u.id, "active").then(reload)}
                            >
                              Reativar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => void setUserStatus(u.id, "banned").then(reload)}
                          >
                            Banir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr className="border-t border-border">
                      <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                        Carregando...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="destaques" className="mt-6">
            <FeaturedAdmin users={users} loading={loading} reload={reload} />
          </TabsContent>

          <TabsContent value="metricas" className="mt-6">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Novos cadastros por mês</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.signupsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <ReTooltip />
                    <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="denuncias" className="mt-6 space-y-3">
            {reports.map((r) => {
              const reported = users.find((u) => u.id === r.reportedUserId);
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      @{reported?.username ?? "desconhecido"} · {r.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reportado por {r.reporter} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      {r.resolved && " · resolvido"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => resolveReport(r.id)}>
                      Marcar resolvido
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeReport(r.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
            {!loading && reports.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma denúncia pendente.</p>
            )}
            {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <ul className="rounded-xl border border-border">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
                >
                  <span>{l.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
              {loading && (
                <li className="px-4 py-3 text-sm text-muted-foreground">Carregando...</li>
              )}
              {!loading && logs.length === 0 && (
                <li className="px-4 py-3 text-sm text-muted-foreground">Nenhuma atividade.</li>
              )}
            </ul>
          </TabsContent>
          <TabsContent value="personalizacao" className="mt-6">
            <LandingPreviewAdmin />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Página de @{viewing?.username}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <PhonePreview>
              <PublicProfileView
                user={viewing}
                links={getLinks(viewing.id).filter((l) => l.active)}
                compact
              />
            </PhonePreview>
          )}
        </DialogContent>
      </Dialog>

      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function EditUserDialog({ user, onClose }: { user: UserProfile | null; onClose: () => void }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");

  const currentKey = user?.id ?? "";
  if (currentKey !== key) {
    setKey(currentKey);
    setDisplayName(user?.displayName ?? "");
    setEmail(user?.email ?? "");
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (user) updateUser(user.id, { displayName, email });
              onClose();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value, loading }: { label: string; value: number; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-2xl font-bold">
        {loading ? <span className="text-base font-medium text-muted-foreground">Carregando...</span> : value.toLocaleString("pt-BR")}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
