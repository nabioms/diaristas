import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, updatePassword } from "@/lib/nabio/store";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Na Bio" },
      {
        name: "description",
        content: "Esqueceu sua senha do Na Bio? Defina uma nova senha e volte a acessar seu painel.",
      },
      { property: "og:title", content: "Recuperar senha — Na Bio" },
      { property: "og:description", content: "Defina uma nova senha da sua conta Na Bio." },
    ],
  }),
  component: RecoverPage,
});

function RecoverPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    setRecoveryMode(window.location.hash.includes("type=recovery"));
  }, []);

  // FUTURO SUPABASE: enviar e-mail com supabase.auth.resetPasswordForEmail
  // e concluir com supabase.auth.updateUser({ password }).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (recoveryMode && password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    try {
      if (recoveryMode) await updatePassword(password);
      else await requestPasswordReset(email);
      setDone(true);
      if (recoveryMode) setTimeout(() => navigate({ to: "/login" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Na<span className="text-primary">Bio</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Recuperar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {recoveryMode
            ? "Escolha uma nova senha para sua conta."
            : "Informe o e-mail da sua conta para receber o link de recuperação."}
        </p>

        {done ? (
          <p className="mt-8 text-sm text-primary">
            {recoveryMode
              ? "Senha redefinida! Redirecionando para o login…"
              : "Se a conta existir, o link de recuperação foi enviado para seu e-mail."}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {!recoveryMode && (
              <div className="space-y-2">
                <Label htmlFor="email">E-mail da conta</Label>
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
            )}
            {recoveryMode && <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>}
            {recoveryMode && <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              {recoveryMode ? "Redefinir senha" : "Enviar link de recuperação"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-primary underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
