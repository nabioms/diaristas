// Player de áudio único do perfil.
// Origem do som: o trecho (prévia de 30s) em MP3 hospedado pelo Spotify
// (p.scdn.co), obtido no servidor a partir do link da faixa.
import { useCallback, useEffect, useRef, useState } from "react";

import { parseSpotifyId } from "@/lib/nabio/spotify";
import { getSpotifyPreviewUrl } from "@/lib/nabio/spotify.functions";

const previewCache = new Map<string, string | null>();

export function useSpotifyPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Um único elemento de áudio para todo o perfil.
  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("playing", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("error", () => {
      setIsPlaying(false);
      console.error("[player] falha ao carregar o áudio:", audio.error, audio.currentSrc);
    });
    audioRef.current = audio;
    return audio;
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const resolvePreview = useCallback(async (url: string) => {
    const parsed = parseSpotifyId(url);
    if (!parsed) return null;
    const key = `${parsed.kind}:${parsed.id}`;
    if (previewCache.has(key)) return previewCache.get(key) ?? null;
    try {
      const res = await getSpotifyPreviewUrl({ data: { kind: parsed.kind, id: parsed.id } });
      previewCache.set(key, res.previewUrl);
      return res.previewUrl;
    } catch (err) {
      console.error("[player] não foi possível obter o trecho da música:", err);
      previewCache.set(key, null);
      return null;
    }
  }, []);

  /** Toca ou pausa a faixa. O estado só vira "tocando" quando o áudio inicia de verdade. */
  const toggle = useCallback(
    async (id: string, url: string) => {
      const audio = getAudio();

      // Mesma faixa já carregada: pausa/retoma mantendo o progresso.
      if (currentId === id && audio.src) {
        if (!audio.paused) {
          audio.pause();
          return;
        }
        try {
          await audio.play();
        } catch (err) {
          setIsPlaying(false);
          console.error("[player] play() falhou:", err);
        }
        return;
      }

      // Outra faixa: pausa a atual e carrega a nova.
      audio.pause();
      setIsPlaying(false);
      setLoadingId(id);
      const previewUrl = await resolvePreview(url);
      setLoadingId(null);
      if (!previewUrl) {
        console.error("[player] esta faixa não tem trecho disponível para tocar:", url);
        return;
      }
      setCurrentId(id);
      audio.src = previewUrl;
      audio.currentTime = 0;
      audio.load();
      try {
        await audio.play();
      } catch (err) {
        setIsPlaying(false);
        console.error("[player] play() falhou:", err);
      }
    },
    [currentId, getAudio, resolvePreview],
  );

  return { currentId, isPlaying, loadingId, toggle };
}
