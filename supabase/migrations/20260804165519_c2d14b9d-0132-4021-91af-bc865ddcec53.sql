-- =========================
-- 1. Missing tables
-- =========================
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  document text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_own" ON public.suppliers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  material_sold text,
  material_delivered text,
  sale_value numeric NOT NULL DEFAULT 0,
  cost_price numeric NOT NULL DEFAULT 0,
  freight_value numeric NOT NULL DEFAULT 0,
  payment_term text,
  due_date date,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own" ON public.orders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  value numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'issued',
  observations text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_own" ON public.invoices FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

-- =========================
-- 2. Fix: profiles document/whatsapp publicly exposed
-- =========================
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Safe, column-limited public accessor for the vitrine page
CREATE OR REPLACE FUNCTION public.get_public_profile(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'company_name', p.company_name,
    'whatsapp', p.whatsapp,
    'logo_url', p.logo_url,
    'theme_color', p.theme_color,
    'background_color', p.background_color,
    'background_image_url', p.background_image_url,
    'header_texture', p.header_texture,
    'header_type', p.header_type,
    'font_family', p.font_family,
    'item_layout', p.item_layout,
    'instagram_url', p.instagram_url,
    'linkedin_url', p.linkedin_url,
    'website_url', p.website_url,
    'payment_link', p.payment_link,
    'profile_slug', p.profile_slug,
    'vitrine_hero_type', p.vitrine_hero_type,
    'vitrine_hero_url', p.vitrine_hero_url,
    'vitrine_pitch_video_url', p.vitrine_pitch_video_url,
    'vitrine_pitch_text', p.vitrine_pitch_text,
    'vitrine_skin', p.vitrine_skin,
    'vitrine_testimonials', p.vitrine_testimonials,
    'vitrine_marquee_words', p.vitrine_marquee_words
  )
  FROM public.profiles p
  WHERE p.profile_slug = p_slug;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

-- =========================
-- 3. Fix: mutable search_path on remaining functions
-- =========================
ALTER FUNCTION public.handle_proposal_approval() SET search_path = public;
ALTER FUNCTION public.submit_quote_request(text, text, text, text, text, jsonb) SET search_path = public;
