import { Image as ImageIcon, Scissors, Trash2, Upload, Video } from "lucide-react";
import { useRef, useState } from "react";

import { TrimmedVideo } from "@/components/nabio/TrimmedVideo";
import { VideoTrimDialog } from "@/components/nabio/VideoTrimDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMediaUrl } from "@/hooks/use-media";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  type MediaFolder,
  deleteMedia,
  getVideoDuration,
  optimizeImage,
  parseMediaTrim,
  saveMedia,
  withMediaTrim,
} from "@/lib/nabio/media";

interface Props {
  label: string;
  hint?: string;
  kind: "image" | "video";
  folder?: MediaFolder;
  value?: string | undefined;
  onChange: (value: string | undefined) => void;
}

type Status = "idle" | "optimizing" | "uploading" | "done";

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  optimizing: "Otimizando…",
  uploading: "Enviando…",
  done: "Concluído ✓",
};

export function MediaUploader({ label, hint, kind, folder = "outros", value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [pending, setPending] = useState<{ file: File; duration: number } | null>(null);
  const previewUrl = useMediaUrl(kind === "image" ? value : undefined);
  const trim = parseMediaTrim(value);
  const busy = status === "optimizing" || status === "uploading";

  async function store(file: File, start?: number) {
    try {
      let payload = file;
      if (kind === "image") {
        setStatus("optimizing");
        payload = await optimizeImage(file);
      }
      setStatus("uploading");
      const previous = value;
      const ref = await saveMedia(payload, folder);
      onChange(
        start === undefined
          ? ref
          : withMediaTrim(ref, { start, end: start + MAX_VIDEO_SECONDS }),
      );
      void deleteMedia(previous);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("[media] falha no upload", err);
      setError("Não foi possível enviar o arquivo. Tente novamente.");
      setStatus("idle");
    }
  }

  async function handleFile(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(null);
    if (kind === "video") {
      if (file.size > MAX_VIDEO_BYTES) {
        setError("Este vídeo é muito grande. Escolha um vídeo menor ou reduza sua qualidade.");
        return;
      }
      // Se o navegador não conseguir ler a duração, seguimos com o upload
      // em vez de bloquear o usuário.
      const duration = await getVideoDuration(file).catch(() => null);
      if (duration !== null && Number.isFinite(duration) && duration > MAX_VIDEO_SECONDS + 0.3) {
        // Em vez de recusar, deixamos o usuário escolher o trecho de 7s.
        setPending({ file, duration });
        return;
      }
    }

    await store(file);
  }


  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
          {kind === "image" && previewUrl && (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          )}
          {kind === "video" && value && (
            <TrimmedVideo value={value} className="h-full w-full object-cover" />
          )}
          {!value &&
            (kind === "video" ? (
              <Video className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {busy
              ? STATUS_TEXT[status]
              : value
                ? kind === "video"
                  ? "Trocar vídeo"
                  : "Trocar imagem"
                : kind === "video"
                  ? "Selecionar vídeo"
                  : "Selecionar imagem"}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                void deleteMedia(value);
                onChange(undefined);
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remover
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {trim && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Scissors className="h-3 w-3" /> Trecho usado: {trim.start.toFixed(1)}s –{" "}
          {trim.end.toFixed(1)}s
        </p>
      )}
      {(busy || status === "done") && (
        <p className="text-xs text-muted-foreground">{STATUS_TEXT[status]}</p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}


      <VideoTrimDialog
        file={pending?.file ?? null}
        duration={pending?.duration ?? 0}
        onCancel={() => setPending(null)}
        onConfirm={(start) => {
          const file = pending?.file;
          setPending(null);
          if (file) void store(file, start);
        }}
      />
    </div>
  );
}
