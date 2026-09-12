// Coleção de MODELOS profissionais do Na Bio.
//
// MODELO = estrutura visual + tokens da página (definidos aqui).
// CONTEÚDO = dados do usuário (perfil + links), nunca fixado no modelo.
//
// Para adicionar um modelo novo no futuro (clínica, advogado, DJ, ...),
// basta acrescentar um objeto ao array TEMPLATES: nenhum componente precisa
// ser alterado, o renderizador genérico (TemplateProfileView) cuida do resto.

import type { NaBioTheme } from "@/lib/nabio/themes";
import type { LinkType } from "@/lib/nabio/types";

export type HeroStyle =
  | "cover" // imagem full-bleed com avatar sobreposto
  | "editorial" // imagem grande + título abaixo, estilo revista
  | "banner" // faixa larga com card de identidade flutuante
  | "portrait" // retrato central grande
  | "split"; // imagem à esquerda, identidade à direita

export interface TemplateLayout {
  hero: HeroStyle;
  /** fonte dos títulos */
  headingFont: string;
  /** título em caixa alta com espaçamento entre letras */
  headingUppercase?: boolean;
  /** quantos links viram botões de destaque (CTA) */
  primaryCount: number;
  /** exibe a grade de portfólio com as miniaturas dos links */
  gallery: boolean;
  /** exibe o cartão de informação (contador do perfil) */
  infoCard: boolean;
  /** exibe as redes como ícones em linha */
  socialRow: boolean;
  /** rótulo da seção de links secundários */
  listLabel: string;
  /** rótulo da seção de portfólio */
  galleryLabel: string;
}

export interface TemplateDemoLink {
  title: string;
  type: LinkType;
  /** URL de exemplo usada só na miniatura (permite detectar a plataforma) */
  value?: string;
}

export interface NaBioTemplate {
  id: string;
  name: string;
  /** para quem é o modelo (aparece no seletor) */
  description: string;
  theme: NaBioTheme;
  layout: TemplateLayout;
  /** usado APENAS na miniatura quando o perfil ainda está vazio */
  demo: {
    displayName: string;
    username: string;
    bio: string;
    counterLabel: string;
    counterValue: string;
    links: TemplateDemoLink[];
  };
}

const SANS = '"Manrope", system-ui, sans-serif';
const GROTESK = '"Space Grotesk", system-ui, sans-serif';
const DM = '"DM Sans", system-ui, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const SERIF_LIGHT = '"Cormorant Garamond", Georgia, serif';
const CONDENSED = '"Bebas Neue", "Space Grotesk", sans-serif';

export const TEMPLATES: NaBioTemplate[] = [
  {
    id: "creator",
    name: "Creator",
    description:
      "Uma página completa para influencers, criadores de conteúdo e profissionais digitais.",
    theme: {
      id: "creator",
      name: "Creator",
      pageBackground: "#0a0a12",
      overlay:
        "linear-gradient(180deg, rgba(10,10,18,0.55) 0%, rgba(10,10,18,0.88) 55%, #0a0a12 100%)",
      textColor: "#f5f3ff",
      mutedColor: "rgba(245,243,255,0.6)",
      accentColor: "#8b5cf6",
      fontFamily: GROTESK,
      button: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#f5f3ff",
        radius: "22px",
        shadow: "0 24px 50px -32px rgba(0,0,0,0.95)",
      },
    },
    layout: {
      hero: "portrait",
      headingFont: GROTESK,
      primaryCount: 2,
      gallery: false,
      infoCard: false,
      socialRow: true,
      listLabel: "Meus links",
      galleryLabel: "Destaques",
    },
    demo: {
      displayName: "Marina Reis",
      username: "marinareis",
      bio: "Criadora de conteúdo sobre lifestyle e tecnologia. Novidades toda semana.",
      counterLabel: "seguidores",
      counterValue: "248k",
      links: [
        { title: "Instagram", type: "instagram", value: "https://instagram.com/marinareis" },
        { title: "Canal no YouTube", type: "youtube", value: "https://youtube.com/@marinareis" },
        { title: "TikTok", type: "url", value: "https://tiktok.com/@marinareis" },
        { title: "Falar comigo", type: "whatsapp", value: "5511999999999" },
        { title: "Playlist no Spotify", type: "url", value: "https://open.spotify.com/playlist/1" },
      ],
    },
  },
  {
    id: "restaurante",
    name: "Restaurante",
    description: "Cardápio, reservas e localização",
    theme: {
      id: "restaurante",
      name: "Restaurante",
      pageBackground: "#100d0a",
      overlay:
        "linear-gradient(180deg, rgba(16,13,10,0.15) 0%, rgba(16,13,10,0.85) 60%, #100d0a 100%)",
      textColor: "#fdf6ec",
      mutedColor: "rgba(253,246,236,0.62)",
      accentColor: "#d9a441",
      fontFamily: SANS,
      button: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(217,164,65,0.35)",
        color: "#fdf6ec",
        radius: "16px",
        shadow: "0 18px 40px -28px rgba(0,0,0,0.9)",
      },
    },
    layout: {
      hero: "cover",
      headingFont: SERIF,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Informações",
      galleryLabel: "Destaques da casa",
    },
    demo: {
      displayName: "Casa Oliveira",
      username: "casaoliveira",
      bio: "Cozinha contemporânea brasileira. Todos os dias, do almoço ao jantar.",
      counterLabel: "Aberto hoje",
      counterValue: "12h – 23h",
      links: [
        { title: "Ver cardápio", type: "url" },
        { title: "Reservar mesa", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Como chegar", type: "url" },
        { title: "Instagram", type: "instagram" },
      ],
    },
  },
  {
    id: "salao",
    name: "Salão de beleza",
    description: "Serviços, equipe e agendamento",
    theme: {
      id: "salao",
      name: "Salão de beleza",
      pageBackground: "#f7f1ec",
      overlay:
        "linear-gradient(180deg, rgba(247,241,236,0.1) 0%, rgba(247,241,236,0.86) 55%, #f7f1ec 100%)",
      textColor: "#2a211d",
      mutedColor: "rgba(42,33,29,0.58)",
      accentColor: "#b9705f",
      fontFamily: SANS,
      button: {
        background: "#ffffff",
        border: "1px solid rgba(42,33,29,0.08)",
        color: "#2a211d",
        radius: "18px",
        shadow: "0 16px 34px -26px rgba(42,33,29,0.6)",
      },
    },
    layout: {
      hero: "banner",
      headingFont: SERIF,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Serviços e contato",
      galleryLabel: "Nossos trabalhos",
    },
    demo: {
      displayName: "Studio Lumière",
      username: "studiolumiere",
      bio: "Cabelo, coloração e estética avançada em um espaço só seu.",
      counterLabel: "Atendimento",
      counterValue: "Ter – Sáb",
      links: [
        { title: "Agendar horário", type: "url" },
        { title: "Ver serviços", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Instagram", type: "instagram" },
        { title: "Localização", type: "url" },
      ],
    },
  },
  {
    id: "nail",
    name: "Nail designer",
    description: "Portfólio delicado e agendamento",
    theme: {
      id: "nail",
      name: "Nail designer",
      pageBackground: "#fdf5f7",
      overlay:
        "linear-gradient(180deg, rgba(253,245,247,0.1) 0%, rgba(253,245,247,0.88) 55%, #fdf5f7 100%)",
      textColor: "#3a2730",
      mutedColor: "rgba(58,39,48,0.55)",
      accentColor: "#d98ba6",
      fontFamily: DM,
      button: {
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(217,139,166,0.28)",
        color: "#3a2730",
        radius: "20px",
        shadow: "0 14px 32px -24px rgba(58,39,48,0.5)",
      },
    },
    layout: {
      hero: "portrait",
      headingFont: SERIF_LIGHT,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Serviços",
      galleryLabel: "Portfólio",
    },
    demo: {
      displayName: "Nails by Bia",
      username: "nailsbybia",
      bio: "Alongamento, blindagem e nail art autoral. Atendimento com hora marcada.",
      counterLabel: "a partir de",
      counterValue: "R$ 120",
      links: [
        { title: "Agendar horário", type: "url" },
        { title: "Tabela de preços", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Instagram", type: "instagram" },
      ],
    },
  },
  {
    id: "barbearia",
    name: "Barbearia",
    description: "Serviços, barbeiros e agenda",
    theme: {
      id: "barbearia",
      name: "Barbearia",
      pageBackground: "#0d0f10",
      overlay:
        "linear-gradient(180deg, rgba(13,15,16,0.2) 0%, rgba(13,15,16,0.88) 58%, #0d0f10 100%)",
      textColor: "#f2f2f0",
      mutedColor: "rgba(242,242,240,0.58)",
      accentColor: "#c8a25c",
      fontFamily: GROTESK,
      button: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(200,162,92,0.35)",
        color: "#f2f2f0",
        radius: "10px",
        shadow: "0 18px 36px -28px rgba(0,0,0,1)",
      },
    },
    layout: {
      hero: "cover",
      headingFont: CONDENSED,
      headingUppercase: true,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Serviços e contato",
      galleryLabel: "Na cadeira",
    },
    demo: {
      displayName: "Barbearia Norte",
      username: "barbearianorte",
      bio: "Corte, barba e navalha. Clássico bem feito, sem pressa.",
      counterLabel: "Seg – Sáb",
      counterValue: "09h – 20h",
      links: [
        { title: "Agendar horário", type: "url" },
        { title: "Serviços e preços", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Instagram", type: "instagram" },
        { title: "Como chegar", type: "url" },
      ],
    },
  },
  {
    id: "fotografo",
    name: "Fotógrafo",
    description: "Portfólio editorial e orçamento",
    theme: {
      id: "fotografo",
      name: "Fotógrafo",
      pageBackground: "#0f0f0f",
      overlay:
        "linear-gradient(180deg, rgba(15,15,15,0.1) 0%, rgba(15,15,15,0.8) 58%, #0f0f0f 100%)",
      textColor: "#f5f5f3",
      mutedColor: "rgba(245,245,243,0.55)",
      accentColor: "#e6e6e2",
      fontFamily: SANS,
      button: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        color: "#f5f5f3",
        radius: "4px",
        shadow: "none",
      },
    },
    layout: {
      hero: "editorial",
      headingFont: SERIF_LIGHT,
      primaryCount: 1,
      gallery: true,
      infoCard: false,
      socialRow: true,
      listLabel: "Contato",
      galleryLabel: "Selected work",
    },
    demo: {
      displayName: "Marina Reis",
      username: "marinareis",
      bio: "Fotografia editorial, casamentos e retratos. São Paulo e viagens.",
      counterLabel: "ensaios entregues",
      counterValue: "180+",
      links: [
        { title: "Solicitar orçamento", type: "url" },
        { title: "Portfólio completo", type: "url" },
        { title: "Instagram", type: "instagram" },
        { title: "WhatsApp", type: "whatsapp" },
      ],
    },
  },
  {
    id: "artista",
    name: "Músico / Artista",
    description: "Faixas, streaming e agenda",
    theme: {
      id: "artista",
      name: "Músico / Artista",
      pageBackground: "#0a0a12",
      overlay:
        "linear-gradient(180deg, rgba(10,10,18,0.1) 0%, rgba(10,10,18,0.85) 55%, #0a0a12 100%)",
      textColor: "#ffffff",
      mutedColor: "rgba(255,255,255,0.6)",
      accentColor: "#8b5cf6",
      fontFamily: GROTESK,
      button: {
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#ffffff",
        radius: "18px",
        shadow: "0 20px 40px -30px rgba(139,92,246,0.9)",
      },
    },
    layout: {
      hero: "cover",
      headingFont: GROTESK,
      headingUppercase: true,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Ouça e acompanhe",
      galleryLabel: "Em destaque",
    },
    demo: {
      displayName: "Lua Vermelha",
      username: "luavermelha",
      bio: "Novo single disponível em todas as plataformas.",
      counterLabel: "ouvintes mensais",
      counterValue: "42K",
      links: [
        { title: "Ouvir no Spotify", type: "spotify" },
        { title: "Apple / Amazon Music", type: "url" },
        { title: "YouTube", type: "youtube" },
        { title: "Próximos shows", type: "url" },
        { title: "Instagram", type: "instagram" },
      ],
    },
  },
  {
    id: "loja",
    name: "Loja / Moda",
    description: "Vitrine, catálogo e compras",
    theme: {
      id: "loja",
      name: "Loja / Moda",
      pageBackground: "#faf9f7",
      overlay:
        "linear-gradient(180deg, rgba(250,249,247,0.08) 0%, rgba(250,249,247,0.85) 55%, #faf9f7 100%)",
      textColor: "#1b1b1b",
      mutedColor: "rgba(27,27,27,0.55)",
      accentColor: "#1b1b1b",
      fontFamily: SANS,
      button: {
        background: "#ffffff",
        border: "1px solid rgba(27,27,27,0.1)",
        color: "#1b1b1b",
        radius: "8px",
        shadow: "0 14px 30px -26px rgba(0,0,0,0.6)",
      },
    },
    layout: {
      hero: "banner",
      headingFont: SANS,
      headingUppercase: true,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Atendimento",
      galleryLabel: "Coleção",
    },
    demo: {
      displayName: "Ateliê Norte",
      username: "atelienorte",
      bio: "Peças atemporais em algodão e linho. Nova coleção disponível.",
      counterLabel: "frete grátis acima de",
      counterValue: "R$ 299",
      links: [
        { title: "Comprar agora", type: "url" },
        { title: "Ver catálogo", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Instagram", type: "instagram" },
        { title: "Nossa loja física", type: "url" },
      ],
    },
  },
  {
    id: "fitness",
    name: "Personal / Fitness",
    description: "Planos, resultados e contato",
    theme: {
      id: "fitness",
      name: "Personal / Fitness",
      pageBackground: "#08131a",
      overlay:
        "linear-gradient(180deg, rgba(8,19,26,0.15) 0%, rgba(8,19,26,0.86) 58%, #08131a 100%)",
      textColor: "#ecfeff",
      mutedColor: "rgba(236,254,255,0.6)",
      accentColor: "#22d3ee",
      fontFamily: GROTESK,
      button: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(34,211,238,0.32)",
        color: "#ecfeff",
        radius: "14px",
        shadow: "0 18px 40px -30px rgba(34,211,238,0.8)",
      },
    },
    layout: {
      hero: "split",
      headingFont: CONDENSED,
      headingUppercase: true,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Planos e serviços",
      galleryLabel: "Resultados",
    },
    demo: {
      displayName: "Rafa Personal",
      username: "rafapersonal",
      bio: "Treino individualizado, presencial e online. Comece hoje.",
      counterLabel: "alunos treinados",
      counterValue: "300+",
      links: [
        { title: "Começar agora", type: "url" },
        { title: "Ver planos", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Instagram", type: "instagram" },
      ],
    },
  },
  {
    id: "empresa",
    name: "Profissional / Empresa",
    description: "Serviços, diferenciais e orçamento",
    theme: {
      id: "empresa",
      name: "Profissional / Empresa",
      pageBackground: "#0b1220",
      overlay:
        "linear-gradient(180deg, rgba(11,18,32,0.2) 0%, rgba(11,18,32,0.9) 58%, #0b1220 100%)",
      textColor: "#eef2f8",
      mutedColor: "rgba(238,242,248,0.6)",
      accentColor: "#5b8def",
      fontFamily: SANS,
      button: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(91,141,239,0.3)",
        color: "#eef2f8",
        radius: "12px",
        shadow: "0 18px 40px -30px rgba(0,0,0,0.9)",
      },
    },
    layout: {
      hero: "split",
      headingFont: SANS,
      primaryCount: 2,
      gallery: false,
      infoCard: true,
      socialRow: true,
      listLabel: "Serviços e contato",
      galleryLabel: "Projetos",
    },
    demo: {
      displayName: "Vértice Consultoria",
      username: "verticeconsultoria",
      bio: "Assessoria contábil e financeira para pequenas e médias empresas.",
      counterLabel: "clientes atendidos",
      counterValue: "120",
      links: [
        { title: "Solicitar orçamento", type: "url" },
        { title: "Agendar reunião", type: "url" },
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Nossos serviços", type: "url" },
        { title: "Onde estamos", type: "url" },
      ],
    },
  },
  {
    id: "eventos",
    name: "Eventos / Casamentos",
    description: "Convite, galeria e confirmação",
    theme: {
      id: "eventos",
      name: "Eventos / Casamentos",
      pageBackground: "#f6f3ee",
      overlay:
        "linear-gradient(180deg, rgba(246,243,238,0.08) 0%, rgba(246,243,238,0.88) 58%, #f6f3ee 100%)",
      textColor: "#2f2a24",
      mutedColor: "rgba(47,42,36,0.55)",
      accentColor: "#a58a5c",
      fontFamily: DM,
      button: {
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(165,138,92,0.28)",
        color: "#2f2a24",
        radius: "999px",
        shadow: "0 16px 34px -28px rgba(47,42,36,0.6)",
      },
    },
    layout: {
      hero: "editorial",
      headingFont: SERIF_LIGHT,
      primaryCount: 2,
      gallery: true,
      infoCard: true,
      socialRow: true,
      listLabel: "Informações do evento",
      galleryLabel: "Galeria",
    },
    demo: {
      displayName: "Ana & Pedro",
      username: "anaepedro",
      bio: "Celebramos nosso casamento com quem amamos. Sua presença é o nosso presente.",
      counterLabel: "Fazenda Bela Vista",
      counterValue: "12.09",
      links: [
        { title: "Confirmar presença", type: "url" },
        { title: "Lista de presentes", type: "url" },
        { title: "Como chegar", type: "url" },
        { title: "Falar com a cerimonialista", type: "whatsapp" },
      ],
    },
  },
];

export const getTemplate = (id: string): NaBioTemplate | undefined =>
  TEMPLATES.find((t) => t.id === id);

export const isTemplate = (id: string): boolean => TEMPLATES.some((t) => t.id === id);
