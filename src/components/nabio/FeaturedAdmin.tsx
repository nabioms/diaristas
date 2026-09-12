import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getFeaturedUsers, moveFeaturedUser, setUserFeatured } from "@/lib/nabio/store";
import type { UserProfile } from "@/lib/nabio/types";

/**
 * Gestão do carrossel de destaques da página inicial.
 * Área exclusiva do administrador — a permissão real é validada no banco.
 */
export function FeaturedAdmin({
  users,
  loading,
  reload,
}: {
  users: UserProfile[];
  loading: boolean;
  reload: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const featured = getFeaturedUsers();

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o destaque.");
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = users.filter(
    (u) => !q || u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Perfis exibidos no Hero</h2>
        <p className="text-sm text-muted-foreground">
          Somente administradores podem escolher quais perfis aparecem no slideshow dentro
          do celular na página inicial. Não há limite de perfis selecionados; as alterações são salvas automaticamente.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold">
          Perfis em destaque <Badge variant="secondary">{featured.length}</Badge>
        </p>
        {featured.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum perfil em destaque no momento.</p>
        )}
        {featured.map((u, index) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{u.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                disabled={busy || index === 0}
                aria-label="Mover para cima"
                onClick={() => void run(() => moveFeaturedUser(u.id, -1))}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={busy || index === featured.length - 1}
                aria-label="Mover para baixo"
                onClick={() => void run(() => moveFeaturedUser(u.id, 1))}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => void run(() => setUserFeatured(u.id, false))}
              >
                Remover
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Todos os usuários</p>
          <Input
            placeholder="Buscar por nome ou @username"
            className="max-w-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        <div className="divide-y divide-border">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {u.featuredOnHome && <Star className="h-3.5 w-3.5 text-primary" />}
                  {u.displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <Switch
                aria-label={`Destacar @${u.username}`}
                disabled={busy}
                checked={u.featuredOnHome}
                onCheckedChange={(v) => void run(() => setUserFeatured(u.id, v))}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
