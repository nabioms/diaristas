import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ExternalLink, LogOut, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LinksManager } from "@/components/nabio/LinksManager";
import { MediaUploader } from "@/components/nabio/MediaUploader";
import { PhonePreview } from "@/components/nabio/PhonePreview";
import { PublicProfileView } from "@/components/nabio/PublicProfileView";
import { ThemePicker } from "@/components/nabio/ThemePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { auth, useLinks, useProfileActions, useSession } from "@/hooks/use-nabio";
import { isUsernameAvailable } from "@/lib/nabio/store";
import type { UserProfile } from "@/lib/nabio/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Meu painel — Na Bio" },
      {
        name: "description",
        content: "Edite seu perfil, gerencie links, escolha temas e acompanhe seus cliques.",
      },
      { property: "og:title", content: "Meu painel — Na Bio" },
      { property: "og:description", content: "Edite seu perfil e gerencie seus links." },
    ],
  }),
  component: Dashboard,
});

type ProfileDraft = Pick<
  UserProfile,
  | "displayName"
  | "bio"
  | "avatarUrl"
  | "backgroundUrl"
  | "backgroundVideoUrl"
  | "counterLabel"
  | "counterValue"
>;

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const links = useLinks(user?.id);
  const actions = useProfileActions(user);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (!user) {
    return <div className="p-10 text-sm text-muted-foreground">Carregando…</div>;
  }

  const current: ProfileDraft = draft ?? {
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    backgroundUrl: user.backgroundUrl,
    backgroundVideoUrl: user.backgroundVideoUrl,
    counterLabel: user.counterLabel,
    counterValue: user.counterValue,
  };
  const setField = (patch: Partial<ProfileDraft>) =>
    setDraft({ ...current, ...patch });
  const dirty = draft !== null;

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="text-base font-bold tracking-tight">
            Na<span className="text-primary">Bio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/$username" params={{ username: user.username }}>
                Ver página <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void auth.signOut().then(() => navigate({ to: "/login" }));
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[1fr_320px]">
        <Tabs defaultValue="perfil">
          <TabsList className="flex-wrap">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="tema">Tema</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="conta">Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-6 space-y-4">
            {/* FUTURO SUPABASE: uploads de imagem vão para o Storage. */}
            <Field
              label="Nome de exibição"
              value={current.displayName}
              onChange={(v) => setField({ displayName: v })}
            />
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={current.bio ?? ""}
                onChange={(e) => setField({ bio: e.target.value })}
              />
            </div>
            <MediaUploader
              label="Foto de perfil"
              hint="JPG, PNG ou WebP direto do seu dispositivo."
              kind="image"
              folder="profile"
              value={current.avatarUrl}
              onChange={(v) => setField({ avatarUrl: v })}
            />
            <MediaUploader
              label="Imagem de fundo"
              hint="Usada quando não houver vídeo de fundo."
              kind="image"
              folder="background"
              value={current.backgroundUrl}
              onChange={(v) => setField({ backgroundUrl: v })}
            />
            <MediaUploader
              label="Vídeo de fundo"
              hint="Máximo de 7 segundos e 10 MB. Toca em loop e sem som, por cima da imagem de fundo."
              kind="video"
              folder="background"
              value={current.backgroundVideoUrl}
              onChange={(v) => setField({ backgroundVideoUrl: v })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Contador — valor"
                value={current.counterValue ?? ""}
                onChange={(v) => setField({ counterValue: v })}
              />
              <Field
                label="Contador — texto"
                value={current.counterLabel ?? ""}
                onChange={(v) => setField({ counterLabel: v })}
              />
            </div>

            <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
              <span className="text-xs text-muted-foreground">
                {dirty ? "Você tem alterações não salvas." : (
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-primary" /> Tudo salvo
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                {dirty && (
                  <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
                    Descartar
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={!dirty}
                  onClick={() => {
                    void actions
                      .save(current)
                      .then(() => {
                        setDraft(null);
                        toast.success("Alterações salvas");
                      })
                      .catch((e: unknown) =>
                        toast.error(
                          e instanceof Error ? e.message : "Não foi possível salvar.",
                        ),
                      );
                  }}
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  Salvar alterações
                </Button>

              </div>
            </div>
          </TabsContent>


          <TabsContent value="links" className="mt-6">
            <LinksManager
              links={links}
              onCreate={actions.addLink}
              onUpdate={actions.updateLink}
              onDelete={actions.deleteLink}
              onReorder={actions.reorder}
            />
          </TabsContent>

          <TabsContent value="tema" className="mt-6 space-y-4">
            <ThemePicker
              value={user.themeId}
              onChange={(id) => actions.save({ themeId: id })}
              user={{ ...user, ...current }}
              links={links.filter((link) => link.active)}
            />
            {user.themeId === "creator" && (
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium">Link em destaque</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha qual link terá maior destaque no seu perfil.
                </p>
                {links.filter((l) => l.active).length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Cadastre um link na aba “Links” para escolher o destaque.
                  </p>
                ) : (
                  <RadioGroup
                    className="mt-3 gap-2"
                    value={user.featuredLinkId ?? ""}
                    onValueChange={(id) => actions.save({ featuredLinkId: id })}
                  >
                    {links
                      .filter((l) => l.active)
                      .map((link) => (
                        <Label
                          key={link.id}
                          htmlFor={`featured-${link.id}`}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm font-normal"
                        >
                          <RadioGroupItem value={link.id} id={`featured-${link.id}`} />
                          <span className="truncate">{link.title || link.value}</span>
                        </Label>
                      ))}
                  </RadioGroup>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Tema personalizado</span>
                <Badge>PRO</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie paletas próprias e remova o rodapé “Feito com Na Bio”.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Visitas na página" value={user.pageViews} />
              <Stat label="Cliques totais" value={totalClicks} />
              <Stat label="Links ativos" value={links.filter((l) => l.active).length} />
            </div>
            <div className="rounded-xl border border-border">
              {links.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
                >
                  <span className="truncate">{l.title}</span>
                  <span className="text-muted-foreground">{l.clicks} cliques</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conta" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Seu endereço</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">nabio.com/</span>
                <Input
                  id="slug"
                  value={user.username}
                  onChange={(e) => {
                    const v = e.target.value.trim().toLowerCase();
                    void isUsernameAvailable(v, user.id).then((available) => {
                      if (available) actions.save({ username: v });
                    });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nomes já em uso são recusados automaticamente.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 text-sm">
              <p className="font-medium">
                Plano atual: {user.plan === "pro" ? "PRO" : "Gratuito"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Domínio próprio, remoção da marca e temas customizados são recursos PRO.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <aside className="hidden lg:block">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Preview</p>
          <PhonePreview>
            <PublicProfileView
              user={{ ...user, ...current }}
              links={links.filter((l) => l.active)}
              compact
            />
          </PhonePreview>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
