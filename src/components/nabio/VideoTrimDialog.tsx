import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { MAX_VIDEO_SECONDS } from "@/lib/nabio/media";

interface Props {
  file: File | null;
  duration: number;
  onCancel: () => void;
  onConfirm: (start: number) => void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Permite escolher qual trecho de 7s do vídeo será usado como fundo. */
export function VideoTrimDialog({ file, duration, onCancel, onConfirm }: Props) {
  const [start, setStart] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const max = Math.max(0, duration - MAX_VIDEO_SECONDS);
  const end = Math.min(duration, start + MAX_VIDEO_SECONDS);

  useEffect(() => {
    setStart(0);
  }, [file]);

  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = start;
    const onTime = () => {
      if (video.currentTime >= end) video.currentTime = start;
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [start, end, url]);

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escolher o trecho do vídeo</DialogTitle>
          <DialogDescription>
            Seu vídeo tem {fmt(duration)}. Selecione os {MAX_VIDEO_SECONDS} segundos que vão tocar
            no fundo do seu perfil.
          </DialogDescription>
        </DialogHeader>

        {url && (
          <video
            ref={videoRef}
            src={url}
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full rounded-xl bg-muted object-cover"
          />
        )}

        <div className="space-y-2">
          <Slider
            value={[start]}
            min={0}
            max={max}
            step={0.1}
            onValueChange={([v]) => setStart(v ?? 0)}
            aria-label="Início do trecho"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Início: {fmt(start)}</span>
            <span>Fim: {fmt(end)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(start)}>Usar este trecho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
