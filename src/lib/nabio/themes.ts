// Sistema de temas do Na Bio.
// Para adicionar um tema novo, basta acrescentar um objeto neste array.

import { TEMPLATES } from "@/lib/nabio/templates";

export interface NaBioTheme {
  id: string;
  name: string;
  /** CSS do container da página pública */
  pageBackground: string;
  /** overlay aplicado por cima da imagem de fundo */
  overlay: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  fontFamily: string;
  button: {
    background: string;
    border: string;
    color: string;
    radius: string;
    shadow: string;
  };
}

export const THEMES: NaBioTheme[] = [
  {
    id: "dark-elegant",
    name: "Escuro elegante",
    pageBackground: "#0b0b0d",
    overlay: "linear-gradient(180deg, rgba(10,8,8,0.55), rgba(8,6,6,0.92))",
    textColor: "#f7c9ae",
    mutedColor: "rgba(247,201,174,0.65)",
    accentColor: "#e88f63",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    button: {
      background: "rgba(20,16,16,0.55)",
      border: "1px solid rgba(232,143,99,0.55)",
      color: "#f7c9ae",
      radius: "999px",
      shadow: "none",
    },
  },
  {
    id: "light-minimal",
    name: "Claro minimalista",
    pageBackground: "#f6f6f4",
    overlay: "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.92))",
    textColor: "#15151a",
    mutedColor: "rgba(20,20,26,0.55)",
    accentColor: "#15151a",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    button: {
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.06)",
      color: "#15151a",
      radius: "16px",
      shadow: "0 6px 20px -8px rgba(0,0,0,0.25)",
    },
  },
  {
    id: "vibrant-gradient",
    name: "Gradiente vibrante",
    pageBackground: "linear-gradient(160deg, #ff6b6b 0%, #f06595 40%, #7048e8 100%)",
    overlay: "linear-gradient(180deg, rgba(255,107,107,0.35), rgba(112,72,232,0.55))",
    textColor: "#ffffff",
    mutedColor: "rgba(255,255,255,0.75)",
    accentColor: "#ffe066",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    button: {
      background: "#ffffff",
      border: "none",
      color: "#5f3dc4",
      radius: "999px",
      shadow: "0 10px 30px -12px rgba(0,0,0,0.5)",
    },
  },
  {
    id: "neon-dark",
    name: "Neon contrastante",
    pageBackground: "#000000",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.95))",
    textColor: "#eafff6",
    mutedColor: "rgba(57,255,176,0.7)",
    accentColor: "#39ffb0",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    button: {
      background: "rgba(0,0,0,0.6)",
      border: "1px solid #39ffb0",
      color: "#39ffb0",
      radius: "12px",
      shadow: "0 0 18px -4px rgba(57,255,176,0.6)",
    },
  },
  {
    id: "music",
    name: "Music",
    pageBackground: "#0a0a0b",
    overlay: "linear-gradient(180deg, rgba(10,10,11,0.15) 0%, rgba(10,10,11,0.85) 55%, #0a0a0b 100%)",
    textColor: "#ffffff",
    mutedColor: "rgba(255,255,255,0.62)",
    accentColor: "#1db954",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    button: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#ffffff",
      radius: "18px",
      shadow: "0 12px 30px -18px rgba(0,0,0,0.9)",
    },
  },
];

/** Temas clássicos + tokens dos modelos profissionais. */
export const ALL_THEMES = (): NaBioTheme[] => [...THEMES, ...TEMPLATES.map((t) => t.theme)];

export const getTheme = (id: string): NaBioTheme =>
  ALL_THEMES().find((t) => t.id === id) ?? (THEMES[0] as NaBioTheme);
