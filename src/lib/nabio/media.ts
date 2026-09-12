// ============================================================================
// MÍDIA — upload de arquivos do dispositivo (fotos e vídeos).
//
// Os arquivos são enviados para o bucket `media` do Supabase Storage e
// referenciados por `nabio-media:<caminho>`. Assim a mesma mídia aparece em
// qualquer navegador/dispositivo (Chrome, Instagram, WhatsApp…), e não apenas
// no aparelho onde o upload foi feito.
// ============================================================================

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
const PREFIX = "nabio-media:";


export const MAX_VIDEO_SECONDS = 7;

export const isMediaRef = (value?: string | null) => !!value && value.startsWith(PREFIX);

/** Referências podem carregar um recorte: `nabio-media:path#t=1.5,8.5`. */
export interface MediaTrim {
  start: number;
  end: number;
}

export function parseMediaTrim(ref?: string | null): MediaTrim | null {
  const match = ref?.match(/#t=([\d.]+),([\d.]+)$/);
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]) };
}

export function withMediaTrim(ref: string, trim?: MediaTrim | null) {
  const base = ref.split("#t=")[0]!;
  return trim ? `${base}#t=${trim.start.toFixed(2)},${trim.end.toFixed(2)}` : base;
}

const baseRef = (ref: string) => ref.split("#t=")[0]!;
const refToPath = (ref: string) => baseRef(ref).slice(PREFIX.length);

export const MAX_VIDEO_BYTES = 10 * 1024 * 1024;
export const IMAGE_MAX_WIDTH = 1200;
const IMAGE_QUALITY = 0.82;
/** Abaixo disso a imagem já é leve o bastante: não vale reprocessar. */
const IMAGE_SKIP_BYTES = 120 * 1024;

export type MediaFolder = "profile" | "background" | "links" | "outros";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/jpg,image/png,image/webp";
export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/quicktime,video/*";

/**
 * Redimensiona (máx. 1200px de largura), comprime e converte a imagem para
 * WebP no próprio navegador. Se algo falhar, devolve o arquivo original.
 */
export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_MAX_WIDTH / bitmap.width);
    const alreadySmall = scale === 1 && file.size <= IMAGE_SKIP_BYTES && file.type === "image/webp";
    if (alreadySmall) {
      bitmap.close?.();
      return file;
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY),
    );
    if (!blob || blob.size === 0) return file;
    // Só troca se realmente ficou menor.
    if (blob.size >= file.size && scale === 1) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch (err) {
    console.warn("[media] falha ao otimizar imagem, enviando original", err);
    return file;
  }
}

/** Salva um arquivo do dispositivo no Storage e devolve a referência. */
export async function saveMedia(file: File, folder: MediaFolder = "outros"): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Faça login para enviar arquivos.");

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${folder}/${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    ...(file.type ? { contentType: file.type } : {}),
  });
  if (error) throw new Error(error.message);

  return `${PREFIX}${path}`;
}


export async function deleteMedia(ref?: string | null) {
  if (!isMediaRef(ref)) return;
  await supabase.storage.from(BUCKET).remove([refToPath(ref!)]);
}

/** Converte a referência em uma URL pública utilizável em <img>/<video>. */
export function resolveMediaUrl(ref?: string | null): string | null {
  if (!ref) return null;
  if (!isMediaRef(ref)) return ref;
  return `/api/public/media/${refToPath(ref)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

/** Duração de um vídeo local, em segundos. */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler o vídeo."));
    };
    video.src = url;
  });
}
