import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

import { PublicProfileView } from "@/components/nabio/PublicProfileView";
import { usePublicProfile } from "@/hooks/use-nabio";
import { registerClick, registerPageView } from "@/lib/nabio/store";

export const Route = createFileRoute("/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Na Bio` },
      {
        name: "description",
        content: `Todos os links de @${params.username} em um só lugar, no Na Bio.`,
      },
      { property: "og:title", content: `@${params.username} — Na Bio` },
      {
        property: "og:description",
        content: `Todos os links de @${params.username} em um só lugar.`,
      },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  const { username } = Route.useParams();
  const { user, links, loading } = usePublicProfile(username);

  useEffect(() => {
    if (user) void registerPageView(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!user || user.status === "banned") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-5 text-center">
        <h1 className="text-2xl font-bold">Página indisponível</h1>
        <p className="text-sm text-muted-foreground">
          O perfil @{username} não existe ou foi removido.
        </p>
        <Link to="/" className="text-sm text-primary underline">
          Criar a minha no Na Bio
        </Link>
      </div>
    );
  }

  if (user.status === "suspended") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-5 text-center">
        <h1 className="text-2xl font-bold">Perfil suspenso</h1>
        <p className="text-sm text-muted-foreground">
          Esta página está temporariamente indisponível.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PublicProfileView
        user={user}
        links={links}
        onLinkClick={(link) => registerClick(link.id)}
        onShare={() => {
          const url = typeof window !== "undefined" ? window.location.href : "";
          void navigator.clipboard?.writeText(url);
          toast.success("Link copiado!", { description: url });
        }}
      />
    </div>
  );
}
