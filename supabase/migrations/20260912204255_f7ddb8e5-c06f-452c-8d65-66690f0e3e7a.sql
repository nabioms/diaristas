ALTER TABLE public.landing_preview
  ADD COLUMN IF NOT EXISTS background_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS background_video_url text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS featured_on_home boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_featured_idx
  ON public.profiles (featured_on_home, featured_order);

CREATE OR REPLACE FUNCTION public.enforce_featured_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.featured_on_home IS DISTINCT FROM false OR NEW.featured_order IS DISTINCT FROM 0)
       AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      NEW.featured_on_home := false;
      NEW.featured_order := 0;
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.featured_on_home IS DISTINCT FROM OLD.featured_on_home
      OR NEW.featured_order IS DISTINCT FROM OLD.featured_order)
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar o destaque na página inicial.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_featured_admin_only ON public.profiles;
CREATE TRIGGER profiles_featured_admin_only
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_featured_admin_only();

REVOKE ALL ON FUNCTION public.enforce_featured_admin_only() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS featured_link_id uuid REFERENCES public.links(id) ON DELETE SET NULL;