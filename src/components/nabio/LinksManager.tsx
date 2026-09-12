import { Eye, EyeOff, GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { lookupSpotifyTrack } from "@/lib/nabio/spotify.functions";
import { isSpotifyUrl, parseSpotify, serializeSpotify } from "@/lib/nabio/spotify";

import { MediaUploader } from "@/components/nabio/MediaUploader";
import { deleteMedia } from "@/lib/nabio/media";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LinkType, ProfileLink } from "@/lib/nabio/types";

const TYPE_LABELS: Record<LinkType, string> = {
  url: "URL genérica",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  youtube: "YouTube",
  pix: "PIX",
  email: "E-mail",
  file: "Arquivo para download",
  spotify: "Música (Spotify)",
};

const PLACEHOLDERS: Record<LinkType, string> = {
  url: "https://seusite.com",
  whatsapp: "5511999998888",
  instagram: "https://instagram.com/seuperfil",
  youtube: "https://youtube.com/@seucanal",
  pix: "sua-chave-pix",
  email: "voce@email.com",
  file: "https://.../arquivo.pdf",
  spotify: "https://open.spotify.com/track/...",
};

interface Props {
  links: ProfileLink[];
  onCreate: (input: Partial<ProfileLink>) => void;
  onUpdate: (id: string, patch: Partial<ProfileLink>) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
}

export function LinksManager({ links, onCreate, onUpdate, onDelete, onReorder }: Props) {
  const [editing, setEditing] = useState<ProfileLink | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = links.map((l) => l.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    onReorder(ids);
    setDragId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Meus links</h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> Novo link
        </Button>
      </div>

      <ul className="space-y-2">
        {links.map((link) => (
          <li
            key={link.id}
            draggable
            onDragStart={() => setDragId(link.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(link.id)}
            className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 ${
              link.active ? "" : "opacity-50"
            }`}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{link.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {TYPE_LABELS[link.type]} · {link.clicks} cliques
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={link.active ? "Ocultar link" : "Ativar link"}
              onClick={() => onUpdate(link.id, { active: !link.active })}
            >
              {link.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Editar link"
              onClick={() => setEditing(link)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Excluir link"
              onClick={() => {
                void deleteMedia(link.thumbnail);
                onDelete(link.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>

          </li>
        ))}
        {links.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Você ainda não criou links.
          </li>
        )}
      </ul>

      <LinkDialog
        open={creating || editing !== null}
        link={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) onUpdate(editing.id, data);
          else onCreate(data);
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function LinkDialog({
  open,
  link,
  onClose,
  onSave,
}: {
  open: boolean;
  link: ProfileLink | null;
  onClose: () => void;
  onSave: (data: Partial<ProfileLink>) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LinkType>("url");
  const [value, setValue] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [artist, setArtist] = useState("");
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [key, setKey] = useState("");

  const currentKey = `${open}-${link?.id ?? "new"}`;
  if (currentKey !== key) {
    const meta = link?.type === "spotify" ? parseSpotify(link.value) : null;
    setKey(currentKey);
    setTitle(link?.title ?? "");
    setType(link?.type ?? "url");
    setValue(meta ? meta.url : link?.value ?? "");
    setThumbnail(link?.thumbnail ?? "");
    setArtist(meta?.artist ?? "");
    setLoadingTrack(false);
  }

  const isSpotify = type === "spotify";

  const fetchTrack = () => {
    if (!isSpotifyUrl(value)) {
      toast.error("Cole um link válido do Spotify (open.spotify.com).");
      return;
    }
    setLoadingTrack(true);
    void lookupSpotifyTrack({ data: { url: value.trim() } })
      .then((track) => {
        setTitle(track.title);
        setArtist(track.artist);
        if (track.thumbnail) setThumbnail(track.thumbnail);
        toast.success("Música identificada!");
      })
      .catch((e: unknown) =>
        toast.error(e instanceof Error ? e.message : "Não foi possível ler esse link."),
      )
      .finally(() => setLoadingTrack(false));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? "Editar link" : "Novo link"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-title">Título</Label>
            <Input id="link-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as LinkType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-value">{isSpotify ? "Link do Spotify" : "Destino"}</Label>
            <div className="flex gap-2">
              <Input
                id="link-value"
                value={value}
                placeholder={PLACEHOLDERS[type]}
                onChange={(e) => setValue(e.target.value)}
              />
              {isSpotify && (
                <Button type="button" variant="secondary" disabled={loadingTrack} onClick={fetchTrack}>
                  {loadingTrack ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                </Button>
              )}
            </div>
            {isSpotify && (
              <p className="text-xs text-muted-foreground">
                Cole o link da faixa e toque em Buscar: nome, artista e capa são preenchidos
                automaticamente.
              </p>
            )}
          </div>
          {isSpotify && (
            <div className="space-y-2">
              <Label htmlFor="link-artist">Artista</Label>
              <Input
                id="link-artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nome do artista"
              />
            </div>
          )}
          <MediaUploader
            label={isSpotify ? "Capa da música" : "Imagem do link"}
            hint="Selecione uma imagem do seu dispositivo (JPG, PNG ou WebP)."
            kind="image"
            folder="links"
            value={thumbnail || undefined}
            onChange={(v) => setThumbnail(v ?? "")}
          />

        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onSave({
                title,
                type,
                value: isSpotify
                  ? serializeSpotify({ url: value.trim(), artist, preview: true })
                  : value,
                thumbnail,
              })
            }
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
