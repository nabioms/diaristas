import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PublicProfileView } from "@/components/nabio/PublicProfileView";
import { Button } from "@/components/ui/button";
import { TEMPLATES, getTemplate } from "@/lib/nabio/templates";
import { THEMES } from "@/lib/nabio/themes";
import type { ProfileLink, UserProfile } from "@/lib/nabio/types";

const PREVIEW_WIDTH = 300;
const PREVIEW_HEIGHT = 600;

/** Conteúdo de demonstração usado SOMENTE na miniatura, quando o perfil ainda está vazio. */
function demoFor(themeId: string, user: UserProfile, links: ProfileLink[]) {
  const template = getTemplate(themeId);
  if (links.length > 0 || !template) return { user, links };

  const demoLinks: ProfileLink[] = template.demo.links.map((link, index) => ({
    id: `demo-${themeId}-${index}`,
    userId: user.id,
    title: link.title,
    type: link.type,
    value: link.value ?? "#",
    position: index,
    active: true,
    clicks: 0,
    createdAt: user.createdAt,
  }));

  return {
    user: {
      ...user,
      displayName: user.displayName || template.demo.displayName,
      username: user.username || template.demo.username,
      bio: user.bio || template.demo.bio,
      counterLabel: user.counterLabel || template.demo.counterLabel,
      counterValue: user.counterValue || template.demo.counterValue,
    },
    links: demoLinks,
  };
}

function ThemeMiniPreview({
  themeId,
  user,
  links,
}: {
  themeId: string;
  user: UserProfile;
  links: ProfileLink[];
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const data = useMemo(() => demoFor(themeId, user, links), [themeId, user, links]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => setScale(frame.clientWidth / PREVIEW_WIDTH);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="relative aspect-[1/2] w-full overflow-hidden"
      aria-hidden="true"
      inert
    >
      <div
        className="pointer-events-none absolute left-0 top-0 overflow-hidden"
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <PublicProfileView user={{ ...data.user, themeId }} links={data.links} compact />
      </div>
    </div>
  );
}

function ThemeCard({
  id,
  name,
  description,
  selected,
  onSelect,
  user,
  links,
}: {
  id: string;
  name: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  user: UserProfile;
  links: ProfileLink[];
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card text-left transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/40"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
    >
      <div className="p-2">
        <div className="overflow-hidden rounded-xl">
          <ThemeMiniPreview themeId={id} user={user} links={links} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 px-3 pb-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{name}</p>
          {description && (
            <p className="truncate text-[10px] text-muted-foreground">{description}</p>
          )}
        </div>
        {selected && (
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onSelect}
        aria-label={`Aplicar modelo ${name}`}
        aria-pressed={selected}
        className="absolute inset-0 z-20 h-full w-full rounded-2xl bg-transparent p-0 hover:bg-transparent"
      />
    </div>
  );
}

export function ThemePicker({
  value,
  onChange,
  user,
  links,
}: {
  value: string;
  onChange: (id: string) => void;
  user: UserProfile;
  links: ProfileLink[];
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Modelos profissionais</h3>
          <p className="text-xs text-muted-foreground">
            Páginas completas por tipo de negócio. Seu conteúdo entra automaticamente.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((template) => (
            <ThemeCard
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description}
              selected={value === template.id}
              onSelect={() => onChange(template.id)}
              user={user}
              links={links}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Temas clássicos</h3>
          <p className="text-xs text-muted-foreground">A lista de links tradicional do Na Bio.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              id={theme.id}
              name={theme.name}
              selected={value === theme.id}
              onSelect={() => onChange(theme.id)}
              user={user}
              links={links}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
