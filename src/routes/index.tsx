import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Palette, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroPhoneSlideshow } from "@/components/nabio/HeroPhoneSlideshow";
import { PhonePreview } from "@/components/nabio/PhonePreview";
import { useLandingPreview } from "@/hooks/use-landing-preview";
import { SEED_USERS } from "@/lib/nabio/mock-data";
import { THEMES } from "@/lib/nabio/themes";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaBio — Seu link. Tudo em um só lugar." },
      {
        name: "description",
        content:
          "Crie uma página de links linda em minutos: temas personalizáveis, WhatsApp, PIX, estatísticas de cliques e um link só para toda a sua bio.",
      },
      { property: "og:title", content: "NaBio — Seu link. Tudo em um só lugar." },
      {
        property: "og:description",
        content: "Temas personalizáveis, links ilimitados e estatísticas de cliques.",
      },

    ],
  }),
  component: Landing,
});

const demoUser = SEED_USERS[1]!;


const features = [
  {
    icon: Palette,
    title: "Temas de verdade",
    text: "Escuro elegante, claro minimalista, gradiente vibrante ou neon — troque com um clique.",
  },
  {
    icon: Smartphone,
    title: "Feito para o celular",
    text: "Sua página abre rápido e bonita onde 90% do seu público está.",
  },
  {
    icon: BarChart3,
    title: "Estatísticas simples",
    text: "Veja quais links realmente convertem, sem planilha e sem complicação.",
  },
  {
    icon: ShieldCheck,
    title: "Controle total",
    text: "Ative, oculte ou reordene links a qualquer momento com arrastar e soltar.",
  },
];

function Landing() {
  const { config: previewConfig } = useLandingPreview();
  return (

    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="text-lg font-bold tracking-tight">
          Na<span className="text-primary">Bio</span>
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/cadastro">Criar minha página</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            um link. tudo seu.
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Sua bio merece mais do que um link solto.
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            O Na Bio reúne seus links, WhatsApp, PIX e conteúdos numa página personalizada com a sua
            cara — e mostra o que está dando resultado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/cadastro">
                Começar grátis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/$username" params={{ username: demoUser.username }}>
                Ver página de exemplo
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            nabio.com/<span className="text-foreground">seunome</span> · sem cartão de crédito
          </p>
        </div>

        <PhonePreview>
          <HeroPhoneSlideshow config={previewConfig} />
        </PhonePreview>

      </section>

      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-background p-6">
              <f.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-sm font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-bold tracking-tight">Escolha o clima da sua página</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quatro temas prontos, e mais chegando. Todos ajustáveis no seu painel.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              className="rounded-2xl border border-border p-5"
              style={{ background: theme.pageBackground }}
            >
              <p className="text-sm font-semibold" style={{ color: theme.textColor }}>
                {theme.name}
              </p>
              <div className="mt-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-7"
                    style={{
                      background: theme.button.background,
                      border: theme.button.border,
                      borderRadius: theme.button.radius,
                      boxShadow: theme.button.shadow,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Na Bio</span>
          <div className="flex gap-4">
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Cadastrar</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
