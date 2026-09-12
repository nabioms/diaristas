import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LandingPreviewPhone } from "@/components/nabio/LandingPreviewPhone";
import { MediaUploader } from "@/components/nabio/MediaUploader";
import { PhonePreview } from "@/components/nabio/PhonePreview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { invalidateLandingPreview, useLandingPreview } from "@/hooks/use-landing-preview";
import {
  DEFAULT_PREVIEW,
  PREVIEW_ICONS,
  PREVIEW_ICON_LABEL,
  type LandingPreviewConfig,
  type PreviewIcon,
  type PreviewLink,
  saveLandingPreview,
} from "@/lib/nabio/landing-preview";

const MAX_LINKS = 20;

export function LandingPreviewAdmin() {
  const { config, loading } = useLandingPreview();
  const [draft, setDraft] = useState<LandingPreviewConfig>(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) setDraft(config);
  }, [config, loading]);

  const set = <K extends keyof LandingPreviewConfig>(key: K, value: LandingPreviewConfig[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setLink = (id: string, patch: Partial<PreviewLink>) =>
    setDraft((d) => ({
      ...d,
      links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  const move = (index: number, delta: number) =>
    setDraft((d) => {
      const links = [...d.links];
      const target = index + delta;
      if (target < 0 || target >= links.length) return d;
      const [item] = links.splice(index, 1);
      links.splice(target, 0, item!);
      return { ...d, links: links.map((l, i) => ({ ...l, sortOrder: i })) };
    });

  async function handleSave() {
    setSaving(true);
    try {
      await saveLandingPreview(draft);
      invalidateLandingPreview(draft);
      toast.success("Prévia da página inicial atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await saveLandingPreview(DEFAULT_PREVIEW);
      setDraft(DEFAULT_PREVIEW);
      invalidateLandingPreview(DEFAULT_PREVIEW);
      toast.success("Configuração restaurada para o padrão.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível restaurar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 space-y-8">
        <div>
          <h2 className="text-lg font-semibold">Prévia da Página Inicial</h2>
          <p className="text-sm text-muted-foreground">
            Personalize o exemplo exibido na página inicial. Estes dados são exclusivos da prévia e
            não alteram nenhum perfil de usuário.
          </p>
        </div>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm font-semibold">Imagens</p>
          <MediaUploader
            label="Foto de perfil"
            kind="image"
            folder="profile"
            value={draft.avatarUrl}
            onChange={(v) => set("avatarUrl", v)}
          />
          <div className="space-y-2">
            <Label>Tipo de fundo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={draft.backgroundType === "image" ? "default" : "outline"}
                onClick={() => set("backgroundType", "image")}
              >
                Imagem
              </Button>
              <Button
                type="button"
                size="sm"
                variant={draft.backgroundType === "video" ? "default" : "outline"}
                onClick={() => set("backgroundType", "video")}
              >
                Vídeo
              </Button>
            </div>
          </div>
          {draft.backgroundType === "video" ? (
            <MediaUploader
              label="Vídeo de fundo"
              hint="Mesmo envio de vídeo usado no perfil: até 7s, sem áudio, em loop."
              kind="video"
              folder="background"
              value={draft.backgroundVideoUrl}
              onChange={(v) => set("backgroundVideoUrl", v)}
            />
          ) : (
            <MediaUploader
              label="Imagem de fundo"
              kind="image"
              folder="background"
              value={draft.backgroundUrl}
              onChange={(v) => set("backgroundUrl", v)}
            />
          )}
          <div
            className="grid gap-4 sm:grid-cols-2"
            hidden={draft.backgroundType === "video"}
          >
            <div className="space-y-2">
              <Label>Posição do fundo</Label>
              <Select
                value={draft.backgroundPosition}
                onValueChange={(v) => set("backgroundPosition", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="top">Topo</SelectItem>
                  <SelectItem value="bottom">Base</SelectItem>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ajuste do fundo</Label>
              <Select value={draft.backgroundFit} onValueChange={(v) => set("backgroundFit", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Preencher (cover)</SelectItem>
                  <SelectItem value="contain">Caber (contain)</SelectItem>
                  <SelectItem value="auto">Tamanho original</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm font-semibold">Identidade do perfil</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome exibido" value={draft.displayName} onChange={(v) => set("displayName", v)} max={60} />
            <Field label="Usuário (@)" value={draft.username} onChange={(v) => set("username", v)} max={40} />
            <Field label="Localização" value={draft.location} onChange={(v) => set("location", v)} max={60} />
            <Field
              label="Seguidores"
              value={draft.followersText}
              onChange={(v) => set("followersText", v)}
              max={40}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-bio">Descrição / bio</Label>
            <Textarea
              id="preview-bio"
              maxLength={200}
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>
          <Field
            label="Texto do rodapé"
            value={draft.footerText}
            onChange={(v) => set("footerText", v)}
            max={60}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Botões da prévia</p>
            <Button
              size="sm"
              variant="outline"
              disabled={draft.links.length >= MAX_LINKS}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  links: [
                    ...d.links,
                    {
                      id: `new-${Date.now()}`,
                      title: "Novo botão",
                      url: "https://",
                      icon: "url" as PreviewIcon,
                      sortOrder: d.links.length,
                      isActive: true,
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar botão
            </Button>
          </div>

          {draft.links.map((link, index) => (
            <div key={link.id} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => move(index, -1)} aria-label="Mover para cima">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => move(index, 1)} aria-label="Mover para baixo">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${link.id}`}
                      checked={link.isActive}
                      onCheckedChange={(v) => setLink(link.id, { isActive: v })}
                    />
                    <Label htmlFor={`active-${link.id}`} className="text-xs">
                      Ativo
                    </Label>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    aria-label="Excluir botão"
                    onClick={() =>
                      setDraft((d) => ({ ...d, links: d.links.filter((l) => l.id !== link.id) }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Texto" value={link.title} onChange={(v) => setLink(link.id, { title: v })} max={60} />
                <Field label="URL" value={link.url} onChange={(v) => setLink(link.id, { url: v })} max={500} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={link.icon}
                    onValueChange={(v) => setLink(link.id, { icon: v as PreviewIcon })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREVIEW_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {PREVIEW_ICON_LABEL[icon]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <MediaUploader
                  label="Miniatura (opcional)"
                  kind="image"
                  folder="links"
                  value={link.thumbnailUrl}
                  onChange={(v) => setLink(link.id, { thumbnailUrl: v })}
                />
              </div>
            </div>
          ))}
          {draft.links.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum botão. Adicione o primeiro.</p>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm font-semibold">Personalização visual</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Fundo do perfil" value={draft.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
            <ColorField label="Cor do texto" value={draft.textColor} onChange={(v) => set("textColor", v)} />
            <ColorField label="Cor secundária" value={draft.mutedColor} onChange={(v) => set("mutedColor", v)} />
            <ColorField label="Cor de destaque" value={draft.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColorField label="Cor dos botões" value={draft.buttonColor} onChange={(v) => set("buttonColor", v)} />
            <ColorField label="Texto dos botões" value={draft.buttonTextColor} onChange={(v) => set("buttonTextColor", v)} />
            <ColorField label="Cor dos ícones" value={draft.buttonIconColor} onChange={(v) => set("buttonIconColor", v)} />
            <ColorField label="Borda dos botões" value={draft.buttonBorderColor} onChange={(v) => set("buttonBorderColor", v)} />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <SliderField
              label={`Espessura da borda (${draft.buttonBorderWidth}px)`}
              value={draft.buttonBorderWidth}
              min={0}
              max={6}
              step={1}
              onChange={(v) => set("buttonBorderWidth", v)}
            />
            <SliderField
              label={`Arredondamento (${draft.buttonRadius}px)`}
              value={draft.buttonRadius}
              min={0}
              max={999}
              step={1}
              onChange={(v) => set("buttonRadius", v)}
            />
            <SliderField
              label={`Transparência (${Math.round(draft.buttonOpacity * 100)}%)`}
              value={draft.buttonOpacity * 100}
              min={20}
              max={100}
              step={1}
              onChange={(v) => set("buttonOpacity", v / 100)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sombra dos botões</Label>
              <Select value={draft.buttonShadow} onValueChange={(v) => set("buttonShadow", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem sombra</SelectItem>
                  <SelectItem value="0 2px 8px rgba(0,0,0,0.25)">Suave</SelectItem>
                  <SelectItem value="0 6px 18px rgba(0,0,0,0.35)">Média</SelectItem>
                  <SelectItem value="0 12px 30px rgba(0,0,0,0.45)">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field
              label="Camada sobre o fundo (CSS)"
              value={draft.overlay}
              onChange={(v) => set("overlay", v)}
              max={300}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void handleSave()} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" /> Salvar alterações
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={saving}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Restaurar padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar a prévia padrão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Toda a personalização da prévia da página inicial será apagada. Os perfis dos
                  usuários não são afetados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleReset()}>Restaurar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-3 text-center text-xs text-muted-foreground">Prévia em tempo real</p>
        <PhonePreview>
          <LandingPreviewPhone config={draft} />
        </PhonePreview>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={label}
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
        />
        <Input maxLength={80} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
    </div>
  );
}
