import { createServerFn } from "@tanstack/react-start";

export interface SpotifyLookupResult {
  title: string;
  artist: string;
  thumbnail: string;
  url: string;
}

/** Busca título, artista e capa de uma faixa a partir do link público do Spotify. */
export const lookupSpotifyTrack = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    const url = String(input?.url ?? "").trim();
    if (!/^https?:\/\/open\.spotify\.com\//.test(url)) {
      throw new Error("Informe um link válido do Spotify (open.spotify.com).");
    }
    return { url };
  })
  .handler(async ({ data }): Promise<SpotifyLookupResult> => {
    const oembedRes = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(data.url)}`,
      { headers: { "user-agent": "Mozilla/5.0" } },
    );
    if (!oembedRes.ok) throw new Error("Não foi possível ler esse link do Spotify.");
    const oembed = (await oembedRes.json()) as { title?: string; thumbnail_url?: string };

    let artist = "";
    try {
      const pageRes = await fetch(data.url, { headers: { "user-agent": "Mozilla/5.0" } });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const match = /<meta property="og:description" content="([^"]*)"/.exec(html);
        const first = match?.[1]?.split("·")[0]?.trim();
        if (first) artist = first.replace(/&amp;/g, "&");
      }
    } catch {
      /* artista é opcional */
    }

    return {
      title: oembed.title ?? "Música",
      artist,
      thumbnail: oembed.thumbnail_url ?? "",
      url: data.url,
    };
  });

/**
 * Retorna a URL do trecho (prévia de 30s) em MP3 da faixa, extraída da página
 * de embed pública do Spotify. É esse arquivo que o player do perfil toca.
 */
export const getSpotifyPreviewUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { kind: string; id: string }) => {
    const kind = String(input?.kind ?? "track");
    const id = String(input?.id ?? "").trim();
    if (!/^[A-Za-z0-9]+$/.test(id)) throw new Error("ID do Spotify inválido.");
    return { kind, id };
  })
  .handler(async ({ data }): Promise<{ previewUrl: string | null }> => {
    const res = await fetch(`https://open.spotify.com/embed/${data.kind}/${data.id}`, {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    if (!res.ok) return { previewUrl: null };
    const html = await res.text();
    const match = /"audioPreview"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/.exec(html);
    const url = match?.[1]?.replace(/\\u0026/g, "&") ?? null;
    return { previewUrl: url };
  });
