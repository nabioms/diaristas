import { useEffect, useRef } from "react";

import { useMediaUrl } from "@/hooks/use-media";
import { parseMediaTrim } from "@/lib/nabio/media";

interface Props {
  /** Referência de mídia, podendo conter recorte (`#t=inicio,fim`). */
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Vídeo que toca em loop apenas o trecho selecionado. */
export function TrimmedVideo({ value, className, style }: Props) {
  const url = useMediaUrl(value);
  const trim = parseMediaTrim(value);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !trim) return;
    const seekStart = () => {
      if (Math.abs(video.currentTime - trim.start) > 0.05) video.currentTime = trim.start;
    };
    const onTime = () => {
      if (video.currentTime >= trim.end || video.currentTime < trim.start - 0.05) {
        video.currentTime = trim.start;
        void video.play().catch(() => undefined);
      }
    };
    video.addEventListener("loadedmetadata", seekStart);
    video.addEventListener("timeupdate", onTime);
    seekStart();
    return () => {
      video.removeEventListener("loadedmetadata", seekStart);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [url, trim?.start, trim?.end]);

  if (!url) return null;

  return (
    <video
      ref={ref}
      src={url}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={style ?? {}}
      aria-hidden
    />
  );
}
