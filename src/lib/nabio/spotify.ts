// Utilitários do tema Music: links do Spotify.
// O campo `value` de um link do tipo "spotify" guarda um JSON com a URL da
// faixa e os metadados obtidos automaticamente (artista, prévia).

export interface SpotifyTrackMeta {
  url: string;
  artist: string;
  preview: boolean;
}

const SPOTIFY_RE = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/;

export function isSpotifyUrl(value: string): boolean {
  return SPOTIFY_RE.test(value.trim());
}

export function parseSpotifyId(value: string): { kind: string; id: string } | null {
  const m = SPOTIFY_RE.exec(value.trim());
  return m ? { kind: m[1] as string, id: m[2] as string } : null;
}

export function serializeSpotify(meta: SpotifyTrackMeta): string {
  return JSON.stringify(meta);
}

export function parseSpotify(value: string): SpotifyTrackMeta {
  const raw = value.trim();
  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<SpotifyTrackMeta>;
      return {
        url: parsed.url ?? "",
        artist: parsed.artist ?? "",
        preview: parsed.preview ?? true,
      };
    } catch {
      /* valor inválido — trata como URL simples */
    }
  }
  return { url: raw, artist: "", preview: true };
}

/** URL do player embutido do Spotify, quando o link for reconhecido. */
export function spotifyEmbedUrl(url: string): string | null {
  const parsed = parseSpotifyId(url);
  return parsed ? `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}` : null;
}
