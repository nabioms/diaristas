import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/hooks/use-nabio";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Na Bio" },
      { name: "description", content: "Acesse o painel da sua página de links do Na Bio." },
      { property: "og:title", content: "Entrar — Na Bio" },
      { property: "og:description", content: "Acesse o painel da sua página de links." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // FUTURO SUPABASE: auth.signIn -> supabase.auth.signInWithPassword
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await auth.signIn(email, password);
      await navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Na<span className="text-primary">Bio</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Entrar na sua conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o e-mail e a senha que você cadastrou.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-sm">
          <Link to="/recuperar-senha" className="text-primary underline">
            Esqueci minha senha
          </Link>
        </p>

        <p className="mt-6 text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-primary underline">
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  );
}
