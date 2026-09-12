import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/hooks/use-nabio";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Na Bio" },
      {
        name: "description",
        content: "Crie sua página de links Na Bio em menos de um minuto, grátis.",
      },
      { property: "og:title", content: "Criar conta — Na Bio" },
      { property: "og:description", content: "Crie sua página de links Na Bio, grátis." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const slug = form.username.trim().toLowerCase();
  useEffect(() => {
    if (slug.length < 3) {
      setAvailable(null);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void auth.isUsernameAvailable(slug).then((value) => {
        if (active) setAvailable(value);
      });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [slug]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await auth.signUp(form);
      if (user) await navigate({ to: "/dashboard" });
      else setCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Na<span className="text-primary">Bio</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Criar sua página</h1>

        {created ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-primary">
              Conta criada. Confirme seu e-mail e depois entre para acessar o painel.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Ir para o login</Link>
            </Button>
          </div>
        ) : <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome de exibição</Label>
            <Input id="name" value={form.displayName} onChange={set("displayName")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">nabio.com/</span>
              <Input id="username" value={form.username} onChange={set("username")} required />
              {available === true && <Check className="h-4 w-4 text-primary" />}
              {available === false && <X className="h-4 w-4 text-destructive" />}
            </div>
            {available === false && (
              <p className="text-xs text-destructive">Este nome já está em uso.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={available !== true || submitting}>
            {submitting ? "Criando…" : "Criar conta grátis"}
          </Button>
        </form>}

        <p className="mt-6 text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
