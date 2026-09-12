CREATE TABLE public.landing_preview (
  id text PRIMARY KEY DEFAULT 'default',
  display_name text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  followers_text text NOT NULL DEFAULT '',
  footer_text text NOT NULL DEFAULT 'Feito com Na Bio',
  avatar_url text,
  background_url text,
  background_position text NOT NULL DEFAULT 'center',
  background_fit text NOT NULL DEFAULT 'cover',
  background_color text NOT NULL DEFAULT '#0b0b0d',
  overlay text NOT NULL DEFAULT 'linear-gradient(180deg, rgba(10,8,8,0.55), rgba(8,6,6,0.92))',
  text_color text NOT NULL DEFAULT '#f7c9ae',
  muted_color text NOT NULL DEFAULT 'rgba(247,201,174,0.65)',
  accent_color text NOT NULL DEFAULT '#e88f63',
  button_color text NOT NULL DEFAULT 'rgba(20,16,16,0.55)',
  button_text_color text NOT NULL DEFAULT '#f7c9ae',
  button_icon_color text NOT NULL DEFAULT '#e88f63',
  button_border_color text NOT NULL DEFAULT 'rgba(232,143,99,0.55)',
  button_border_width integer NOT NULL DEFAULT 1,
  button_radius integer NOT NULL DEFAULT 999,
  button_opacity numeric NOT NULL DEFAULT 1,
  button_shadow text NOT NULL DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.landing_preview TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_preview TO authenticated;
GRANT ALL ON public.landing_preview TO service_role;

ALTER TABLE public.landing_preview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_preview_public_read" ON public.landing_preview
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "landing_preview_admin_write" ON public.landing_preview
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.landing_preview_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_id text NOT NULL REFERENCES public.landing_preview(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'url',
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.landing_preview_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_preview_links TO authenticated;
GRANT ALL ON public.landing_preview_links TO service_role;

ALTER TABLE public.landing_preview_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_preview_links_public_read" ON public.landing_preview_links
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "landing_preview_links_admin_write" ON public.landing_preview_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_landing_preview_updated_at BEFORE UPDATE ON public.landing_preview
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_preview_links_updated_at BEFORE UPDATE ON public.landing_preview_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.landing_preview (id, display_name, username, bio, location, followers_text, footer_text)
VALUES ('default', 'João Silva', 'joaosilva', 'Criador de conteúdo', 'São Paulo', '1,8M seguidores', 'Feito com Na Bio');

INSERT INTO public.landing_preview_links (preview_id, title, url, icon, sort_order, is_active) VALUES
  ('default', 'Meu novo single', 'https://open.spotify.com', 'youtube', 0, true),
  ('default', 'Fale comigo no WhatsApp', 'https://wa.me/5511999999999', 'whatsapp', 1, true),
  ('default', 'Instagram', 'https://instagram.com', 'instagram', 2, true),
  ('default', 'Apoie com PIX', 'https://nabio.app', 'pix', 3, true);